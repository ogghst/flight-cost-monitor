import { CurrentUser } from '@/auth/decorators/user.decorator.js'
import { type AuthUser } from '@fcm/shared'
import type {
  CreateTaskScheduleDto,
  TaskSchedule,
  TaskScheduleDto,
} from '@fcm/shared/scheduler'
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
  UseGuards,
  ValidationPipe,
} from '@nestjs/common'
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger'
import { JwtAuthGuard } from '../auth/guards/jwt.guard.js'
import { SchedulerService } from './scheduler.service.js'

@ApiTags('Scheduler')
@Controller('tasks')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access-token')
export class SchedulerController {
  constructor(private readonly schedulerService: SchedulerService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new scheduled task' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['name', 'searchId', 'cronExpression'],
      properties: {
        name: { type: 'string' },
        description: { type: 'string' },
        searchId: { type: 'string' },
        cronExpression: { type: 'string' },
        timeout: { type: 'number' },
        maxRetries: { type: 'number' },
      },
    },
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
    params: CreateTaskScheduleDto,
    @CurrentUser('id') user: AuthUser
  ): Promise<TaskScheduleDto> {
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
  })
  async getTasks() {
    return this.schedulerService.getAllTasks()
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a task by ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns the task',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Task not found',
  })
  async getTask(@Param('id') id: string) {
    return this.schedulerService.getTaskStatus(id)
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a task' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        description: { type: 'string' },
        cronExpression: { type: 'string' },
        timeout: { type: 'number' },
        maxRetries: { type: 'number' },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Task updated successfully',
  })
  async updateTask(
    @Param('id') id: string,
    @Body() data: Partial<TaskSchedule>
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
  async pauseTask(@Param('id') id: string) {
    await this.schedulerService.pauseTask(id)
    return { status: 'paused' }
  }

  @Post(':id/resume')
  @ApiOperation({ summary: 'Resume a task' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Task resumed successfully',
  })
  async resumeTask(@Param('id') id: string) {
    await this.schedulerService.resumeTask(id)
    return { status: 'resumed' }
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
  async getLastExecution(@Param('id') id: string) {
    const executions = await this.schedulerService.getTaskExecutions(id, 1)
    return executions[0] || null
  }
}
