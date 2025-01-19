import { Controller, Get, Param } from '@nestjs/common'
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger'
import { MonitoringService } from './monitoring.service.js'

@ApiTags('Monitoring')
@Controller('monitoring')
@ApiBearerAuth('access-token')
export class MonitoringController {
  constructor(private readonly monitoringService: MonitoringService) {}

  @Get('tasks/:id/metrics')
  @ApiOperation({ summary: 'Get metrics for a specific task' })
  @ApiResponse({
    status: 200,
    description: 'Returns task metrics',
    schema: {
      type: 'object',
      properties: {
        stats: {
          type: 'object',
          properties: {
            totalRuns: { type: 'number' },
            successfulRuns: { type: 'number' },
            failedRuns: { type: 'number' },
            averageDuration: { type: 'number' },
            successRate: { type: 'number' },
          },
        },
        recentExecutions: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              status: { type: 'string' },
              startTime: { type: 'string' },
              duration: { type: 'number' },
            },
          },
        },
      },
    },
  })
  async getTaskMetrics(@Param('id') taskId: string) {
    return this.monitoringService.getTaskMetrics(taskId)
  }

  @Get('system')
  @ApiOperation({ summary: 'Get system-wide metrics' })
  @ApiResponse({
    status: 200,
    description: 'Returns system metrics',
    schema: {
      type: 'object',
      properties: {
        totalExecutions: { type: 'number' },
        totalSuccessful: { type: 'number' },
        totalFailed: { type: 'number' },
        successRate: { type: 'number' },
        averageDuration: { type: 'number' },
        taskCount: { type: 'number' },
      },
    },
  })
  async getSystemMetrics() {
    return this.monitoringService.getSystemMetrics()
  }
}
