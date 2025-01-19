import { CurrentUser } from '@/auth/decorators/user.decorator.js'
import { type AuthUser } from '@fcm/shared/auth'
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  ValidationPipe,
} from '@nestjs/common'
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger'
import {
  CreateTaskScheduleDtoSwagger,
  TaskExecutionDtoSwagger,
  TaskScheduleDtoSwagger,
  TaskStatsDtoSwagger,
} from './dto/index.js'
import { SchedulerService } from './scheduler.service.js'

@ApiTags('Scheduler')
@Controller('tasks')
@ApiBearerAuth('access-token')
export class SchedulerController {
  constructor(private readonly schedulerService: SchedulerService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new scheduled task' })
  @ApiBody({
    type: TaskScheduleDtoSwagger,
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Task created successfully',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized',
  })
  async createTask(
    @Body(new ValidationPipe({ transform: true }))
    params: CreateTaskScheduleDtoSwagger,
    @CurrentUser('id') user: AuthUser
  ): Promise<TaskScheduleDtoSwagger> {
    params.userEmail = user.email
    return this.schedulerService.createTask(params)
  }

  @Get()
  @ApiOperation({ summary: 'Get all tasks' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns all tasks',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized',
    type: TaskScheduleDtoSwagger,
    isArray: true,
  })
  async getTasks(): Promise<TaskScheduleDtoSwagger[]> {
    return this.schedulerService.getAllTasks()
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a task by ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns the task',
    schema: {
      type: 'object',
      properties: {
        task: { $ref: getSchemaPath(TaskScheduleDtoSwagger) },
        stats: { $ref: getSchemaPath(TaskStatsDtoSwagger) },
        isActive: { type: 'boolean' },
        nextRun: { type: 'string', format: 'date-time' },
      },
      required: ['task', 'stats', 'isActive', 'nextRun'],
    },
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Task not found',
  })
  async getTask(@Param('id') id: string): Promise<{
    task: TaskScheduleDtoSwagger
    stats: TaskStatsDtoSwagger
    isActive: boolean
    nextRun: Date
  }> {
    return this.schedulerService.getTaskStatus(id)
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a task' })
  @ApiBody({
    type: TaskScheduleDtoSwagger,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Task updated successfully',
  })
  async updateTask(
    @Param('id') id: string,
    @Body() data: Partial<TaskScheduleDtoSwagger>
  ) {
    return this.schedulerService.updateTask(id, data)
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a task' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Task deleted successfully',
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteTask(@Param('id') id: string) {
    await this.schedulerService.deleteTask(id)
  }

  @Post(':id/pause')
  @ApiOperation({ summary: 'Pause a task' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Task paused successfully',
  })
  @ApiBody({
    type: TaskScheduleDtoSwagger,
  })
  async pauseTask(@Param('id') id: string) {
    return await this.schedulerService.pauseTask(id)
  }

  @Post(':id/resume')
  @ApiOperation({ summary: 'Resume a task' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Task resumed successfully',
  })
  @ApiBody({
    type: TaskScheduleDtoSwagger,
  })
  async resumeTask(@Param('id') id: string) {
    return await this.schedulerService.resumeTask(id)
  }

  @Get(':id/executions')
  @ApiOperation({ summary: 'Get task executions' })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: 'number',
    description: 'Number of executions to return',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns task executions',
  })
  @ApiBody({
    type: TaskExecutionDtoSwagger,
    isArray: true,
  })
  async getTaskExecutions(
    @Param('id') id: string,
    @Query('limit') limit?: number
  ) {
    return this.schedulerService.getTaskExecutions(id, limit)
  }

  @Get(':id/last-execution')
  @ApiOperation({ summary: 'Get last task execution' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns last task execution',
  })
  @ApiBody({
    type: TaskExecutionDtoSwagger,
  })
  async getLastExecution(@Param('id') id: string) {
    const executions = await this.schedulerService.getTaskExecutions(id, 1)
    return executions[0] || null
  }
}
