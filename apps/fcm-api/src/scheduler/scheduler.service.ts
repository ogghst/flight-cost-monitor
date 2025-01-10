import {
  CreateTaskScheduleDto,
  ExecutionState,
  TaskExecutionDto,
  TaskScheduleDto,
  TaskState,
} from '@fcm/shared/scheduler/types'
import {
  taskExecutionRepository,
  taskScheduleRepository,
  taskStatsRepository,
} from '@fcm/storage/repositories'
import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common'
import { AsyncTask, SimpleIntervalJob, ToadScheduler } from 'toad-scheduler'
import { AlertsService } from '../alerts/alerts.service.js'
import { MonitoringService } from '../monitoring/monitoring.service.js'
import { WebsocketGateway } from '../websocket/websocket.gateway.js'

@Injectable()
export class SchedulerService implements OnModuleInit, OnModuleDestroy {
  private scheduler: ToadScheduler
  private activeJobs: Map<string, SimpleIntervalJob> = new Map()

  constructor(
    private readonly websocketGateway: WebsocketGateway,
    private readonly monitoringService: MonitoringService,
    private readonly alertsService: AlertsService
  ) {
    this.scheduler = new ToadScheduler()
  }

  async onModuleInit() {
    await this.initializeScheduledTasks()
  }

  onModuleDestroy() {
    this.scheduler.stop()
  }

  private async initializeScheduledTasks() {
    const tasks = await taskScheduleRepository.findActive()

    for (const task of tasks) {
      await this.scheduleTask(task)
    }
  }

  private async scheduleTask(config: TaskScheduleDto) {
    const task = new AsyncTask(
      config.name,
      async () => {
        const execution = await this.startExecution(config)
        try {
          const result = await this.executeWithTimeout(
            config.searchId,
            config.timeout
          )
          await this.completeExecution(execution.id, result)
          this.websocketGateway.broadcastTaskUpdate({
            taskId: config.id,
            state: ExecutionState.COMPLETED,
            result,
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
        }
      },
      (error) => this.handleTaskError(config.id, error)
    )

    const job = new SimpleIntervalJob(
      { minutes: 15, runImmediately: false },
      task,
      { preventOverrun: true }
    )

    this.scheduler.addSimpleIntervalJob(job)
    this.activeJobs.set(config.id, job)

    await taskScheduleRepository.update({
      id: config.id,
      nextRunAt: this.calculateNextRun(15),
    })
  }

  private async executeWithTimeout(
    searchId: string,
    timeout: number
  ): Promise<any> {
    return Promise.race([
      this.executeSearch(searchId),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Execution timeout')), timeout)
      ),
    ])
  }

  private async executeSearch(searchId: string): Promise<any> {
    // Call your search execution logic here
    // This is a placeholder for the actual search execution
    return { searchId, executed: new Date() }
  }

  private async startExecution(
    config: TaskScheduleDto
  ): Promise<TaskExecutionDto> {
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
      const result = await this.executeWithTimeout(
        config.searchId,
        config.timeout
      )
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

  async pauseTask(taskId: string) {
    const job = this.activeJobs.get(taskId)
    if (job) {
      job.stop()
      this.activeJobs.delete(taskId)
      await taskScheduleRepository.update({
        id: taskId,
        state: TaskState.DISABLED,
      })
    }
  }

  async resumeTask(taskId: string) {
    const config = await taskScheduleRepository.findById(taskId)
    if (config && !this.activeJobs.has(taskId)) {
      await this.scheduleTask(config)
      await taskScheduleRepository.update({
        id: taskId,
        state: TaskState.ENABLED,
      })
    }
  }

  async updateTask(taskId: string, data: Partial<TaskScheduleDto>) {
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

  async deleteTask(taskId: string) {
    await this.pauseTask(taskId)
    await taskScheduleRepository.softDelete(taskId)
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

  async getAllTasks() {
    return taskScheduleRepository.findAll()
  }

  async getTaskExecutions(taskId: string, limit: number = 10) {
    return taskExecutionRepository.findByTask(taskId, limit)
  }
}
