import { FlightOffersService } from '@/flight-offers/flight-offers.service.js'
import { UserSearchesService } from '@/user-searches/user-searches.service.js'
import { FcmWinstonLogger, SearchType } from '@fcm/shared'
import {
  FlightOfferSimpleSearchRequest,
  FlightOfferSimpleSearchResponse,
} from '@fcm/shared/amadeus/clients/flight-offer'
import {
  FlightOfferAdvancedSearchRequest,
  FlightOffersAdvancedResponse,
} from '@fcm/shared/amadeus/clients/flight-offer-advanced'
import {
  CreateTaskScheduleDto,
  ExecutionState,
  TaskExecutionDto,
  TaskScheduleDto,
  TaskState,
  TaskType,
} from '@fcm/shared/scheduler'
import {
  taskExecutionRepository,
  taskScheduleRepository,
  taskStatsRepository,
} from '@fcm/storage/repositories'
import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common'
import { AsyncTask, CronJob, Job, ToadScheduler } from 'toad-scheduler'
import { AlertsService } from '../alerts/alerts.service.js'
import { MonitoringService } from '../monitoring/monitoring.service.js'
import { WebsocketGateway } from '../websocket/websocket.gateway.js'

@Injectable()
export class SchedulerService implements OnModuleInit, OnModuleDestroy {
  private scheduler: ToadScheduler
  private activeJobs: Map<string, Job> = new Map()
  private logger = FcmWinstonLogger.getInstance()

  constructor(
    private readonly websocketGateway: WebsocketGateway,
    private readonly monitoringService: MonitoringService,
    private readonly alertsService: AlertsService,
    private readonly searchService: UserSearchesService, // We need to inject the search service
    private readonly flightOffersService: FlightOffersService
  ) {
    this.scheduler = new ToadScheduler()
  }

  async onModuleInit() {
    this.logger.debug('Initializing Scheduler..')
    this.scheduler.stop() // Ensure clean state
    this.scheduler = new ToadScheduler()
    await this.initializeScheduledTasks()
  }

  onModuleDestroy() {
    // Clean stop on module destroy
    this.logger.debug('Closing and stopping Scheduler..')
    this.activeJobs.clear()
    this.scheduler.stop()
  }

  private async initializeScheduledTasks() {
    this.logger.debug('Initializing Scheduler..')
    const tasks = await taskScheduleRepository.findActive()

    for (const task of tasks) {
      await this.scheduleTask(task)
    }
  }

  private async scheduleTask(config: TaskScheduleDto) {
    this.logger.debug(
      'Scheduling task: ' + config.name + ' (' + config.id + ') '
    )
    const task = new AsyncTask(
      config.name,
      async () => {
        const execution = await this.startExecution(config)
        try {
          const result = await this.executeWithTimeout(config)

          await this.completeExecution(execution.id, result)

          this.websocketGateway.broadcastTaskUpdate({
            taskId: config.id,
            state: ExecutionState.COMPLETED,
            result,
          })

          await this.alertsService.sendAlert({
            executionId: execution.id,
            message: 'Execution completed',
            type: 'INFO',
            taskId: config.id,
          })
        } catch (error) {
          let errMsg = new Error()
          if (error instanceof Error) {
            errMsg = error
          } else {
            errMsg.name = 'scheduleTask failed'
            errMsg.message = String(error)
          }
          await this.handleExecutionError(execution.id, errMsg, config)
          this.websocketGateway.broadcastTaskUpdate({
            taskId: config.id,
            state: ExecutionState.FAILED,
            error: errMsg.message,
          })
          await this.alertsService.sendAlert({
            executionId: execution.id,
            message: 'Execution failed',
            type: 'INFO',
            taskId: config.id,
            error: errMsg.message,
          })
        }
      },
      (error) => this.handleTaskError(config.id, error)
    )

    /*
    const job = new SimpleIntervalJob(
      { minutes: 1, runImmediately: false },
      task,
      { preventOverrun: true }
    )

    this.scheduler.addSimpleIntervalJob(job)
    */

    const job = new CronJob(
      {
        cronExpression: config.cronExpression,
      },
      task,
      {
        preventOverrun: true,
      }
    )
    this.scheduler.addCronJob(job)

    this.activeJobs.set(config.id, job)

    await taskScheduleRepository.update({
      id: config.id,
      nextRunAt: this.calculateNextRun(1),
    })
  }

  private async executeWithTimeout(config: TaskScheduleDto): Promise<any> {
    this.logger.debug(
      'Executing with timeout payload: ' +
        config.payload +
        ' (' +
        config.timeout +
        ') '
    )
    return Promise.race([
      this.executeSearch(config),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Execution timeout')), config.timeout)
      ),
    ])
  }

  private async executeSearch(
    config: TaskScheduleDto
  ): Promise<FlightOfferSimpleSearchResponse | FlightOffersAdvancedResponse> {
    if (
      config.taskType != TaskType.SIMPLE_SEARCH &&
      config.taskType != TaskType.ADVANCED_SEARCH
    )
      throw new Error('Task type not compliant with search')

    // First get the search configuration
    const savedSearch = await this.searchService.findById(config.payload)
    if (!savedSearch) {
      throw new Error(`Search not found: ${config.payload}`)
    }

    // Execute the search based on type
    if (savedSearch.searchType === SearchType.SIMPLE) {
      this.logger.debug('Executing simple search: ' + savedSearch.name)
      return this.flightOffersService.searchFlightOffers(
        JSON.parse(savedSearch.parameters) as FlightOfferSimpleSearchRequest,
        config.userEmail,
        config.payload
      )
    } else if (savedSearch.searchType === SearchType.ADVANCED) {
      this.logger.debug('Executing advanced search: ' + savedSearch.name)
      return this.flightOffersService.searchFlightOffersAdvanced(
        JSON.parse(savedSearch.parameters) as FlightOfferAdvancedSearchRequest,
        config.userEmail,
        config.payload
      )
    }

    throw new Error(`Invalid search type for search ${config.payload}`)
  }

  private async startExecution(
    config: TaskScheduleDto
  ): Promise<TaskExecutionDto> {
    this.logger.debug(
      `Start Execution of task: ${config.name} (id: ${config.id})"`
    )

    const execution = await taskExecutionRepository.create({
      taskId: config.id,
      state: ExecutionState.RUNNING,
      startTime: new Date(),
      attempt: 1,
    })

    this.websocketGateway.broadcastTaskUpdate({
      taskId: config.id,
      state: ExecutionState.RUNNING,
      executionId: execution.id,
    })

    return execution
  }

  private async completeExecution(executionId: string, result: any) {
    this.logger.debug('Complete execution: ' + executionId)

    const endTime = new Date()
    const execution = await taskExecutionRepository.findById(executionId)

    const duration = endTime.getTime() - execution.startTime.getTime()

    await taskExecutionRepository.update({
      id: executionId,
      state: ExecutionState.COMPLETED,
      endTime,
      duration,
      result: JSON.stringify(result),
    })

    await this.monitoringService.recordExecution({
      executionId,
      duration,
      success: true,
    })
  }

  private async handleExecutionError(
    executionId: string,
    error: Error,
    config: TaskScheduleDto
  ) {
    const execution = await taskExecutionRepository.findById(executionId)

    if (execution.attempt < config.maxRetries) {
      await taskExecutionRepository.update({
        id: executionId,
        state: ExecutionState.PENDING,
        attempt: execution.attempt + 1,
      })

      // Retry with exponential backoff
      setTimeout(
        () => this.retryExecution(executionId),
        Math.pow(2, execution.attempt) * 1000
      )
    } else {
      await this.failExecution(executionId, error)
      await this.alertsService.sendAlert({
        type: 'ERROR',
        message: `Task ${config.name} failed after ${config.maxRetries} retries`,
        error: error.message,
        taskId: config.id,
        executionId,
      })
    }
  }

  private async failExecution(executionId: string, error: Error) {
    const endTime = new Date()
    const execution = await taskExecutionRepository.findById(executionId)

    const duration = endTime.getTime() - execution.startTime.getTime()

    await taskExecutionRepository.update({
      id: executionId,
      state: ExecutionState.FAILED,
      endTime,
      duration,
      error: JSON.stringify({
        message: error.message,
        code: error.name,
        stack: error.stack,
      }),
    })

    await this.monitoringService.recordExecution({
      executionId,
      duration,
      success: false,
      error: error.message,
    })
  }

  private async retryExecution(executionId: string) {
    const execution = await taskExecutionRepository.findById(executionId)
    const config = await taskScheduleRepository.findById(execution.taskId)

    try {
      const result = await this.executeWithTimeout(config)
      await this.completeExecution(executionId, result)
    } catch (error) {
      if (error instanceof Error) {
        await this.handleExecutionError(executionId, error, config)
      } else {
        // Handle the case where the error is not an Error object
        await this.handleExecutionError(
          executionId,
          {
            message: String(error) || 'Unexpected error type',
            name: 'retryExecution failed',
          },
          config
        )
      }
    }
  }

  private calculateNextRun(intervalMinutes: number): Date {
    const now = new Date()
    return new Date(now.getTime() + intervalMinutes * 60000)
  }

  private handleTaskError(taskId: string, error: Error) {
    this.alertsService.sendAlert({
      type: 'ERROR',
      message: `Task scheduler error for task ${taskId}`,
      error: error.message,
      taskId,
    })
  }

  // Public API
  async createTask(data: CreateTaskScheduleDto): Promise<TaskScheduleDto> {
    const task = await taskScheduleRepository.create(data)
    if (task.state === TaskState.ENABLED) {
      await this.scheduleTask(task)
    }
    return task
  }

  async pauseTask(taskId: string): Promise<TaskScheduleDto> {
    const job = this.activeJobs.get(taskId)
    if (job) {
      job.stop()
      this.activeJobs.delete(taskId)
      await taskScheduleRepository.update({
        id: taskId,
        state: TaskState.DISABLED,
      })
    } else return null
  }

  async resumeTask(taskId: string): Promise<TaskScheduleDto> {
    const config = await taskScheduleRepository.findById(taskId)
    if (config && !this.activeJobs.has(taskId)) {
      await this.scheduleTask(config)
      await taskScheduleRepository.update({
        id: taskId,
        state: TaskState.ENABLED,
      })
    } else return null
  }

  async updateTask(
    taskId: string,
    data: Partial<TaskScheduleDto>
  ): Promise<void | TaskScheduleDto> {
    const task = await taskScheduleRepository.findById(taskId)

    // If task was enabled and now disabled, stop it
    if (task.state === TaskState.ENABLED && data.state === TaskState.DISABLED) {
      await this.pauseTask(taskId)
    }

    // Update task
    const updatedTask = await taskScheduleRepository.update({
      id: taskId,
      ...data,
    })

    // If task was disabled and now enabled, start it
    if (task.state === TaskState.DISABLED && data.state === TaskState.ENABLED) {
      await this.scheduleTask(updatedTask)
    }

    return updatedTask
  }

  async deleteTask(taskId: string): Promise<TaskScheduleDto> {
    await this.pauseTask(taskId)
    return await taskScheduleRepository.softDelete(taskId)
  }

  async getTaskStatus(taskId: string) {
    const task = await taskScheduleRepository.findById(taskId)
    const stats = await taskStatsRepository.findLatest(taskId)
    const isActive = this.activeJobs.has(taskId)

    return {
      task,
      stats,
      isActive,
      nextRun: task.nextRunAt,
    }
  }

  async getAllTasks(): Promise<TaskScheduleDto[]> {
    return taskScheduleRepository.findAll()
  }

  async getTaskExecutions(
    taskId: string,
    limit: number = 10
  ): Promise<TaskExecutionDto[]> {
    return taskExecutionRepository.findByTask(taskId, limit)
  }
}
