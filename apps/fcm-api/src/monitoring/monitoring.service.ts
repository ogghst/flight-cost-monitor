import { ExecutionState } from '@fcm/shared/scheduler/types'
import {
  taskExecutionRepository,
  taskStatsRepository,
} from '@fcm/storage/repositories'
import { Injectable } from '@nestjs/common'
import { WebsocketGateway } from '../websocket/websocket.gateway.js'

interface ExecutionMetrics {
  executionId: string
  duration: number
  success: boolean
  error?: string
}

@Injectable()
export class MonitoringService {
  constructor(private readonly websocketGateway: WebsocketGateway) {}

  async recordExecution(metrics: ExecutionMetrics) {
    const execution = await taskExecutionRepository.findById(
      metrics.executionId
    )
    const taskId = execution.taskId

    // Update task stats
    const stats = await this.getOrCreateTaskStats(taskId)
    const updatedStats = await taskStatsRepository.update(stats)

    // Broadcast metrics update
    this.websocketGateway.broadcastToAll('metricsUpdate', {
      taskId,
      metrics: updatedStats,
    })

    return updatedStats
  }

  private async getOrCreateTaskStats(taskId: string) {
    const stats = await taskStatsRepository.findLatest(taskId)
    if (stats) return stats

    return taskStatsRepository.create({
      taskId,
      totalRuns: 0,
      successfulRuns: 0,
      failedRuns: 0,
      averageDuration: 0,
      periodStart: new Date(),
      periodEnd: new Date(Date.now() + 24 * 60 * 60 * 1000),
      lastExecutionState: ExecutionState.PENDING,
    })
  }

  private calculateAverageDuration(
    currentAverage: number,
    totalRuns: number,
    newDuration: number
  ): number {
    return (currentAverage * totalRuns + newDuration) / (totalRuns + 1)
  }

  async getTaskMetrics(taskId: string) {
    const stats = await taskStatsRepository.findLatest(taskId)
    const recentExecutions = await taskExecutionRepository.findByTask(
      taskId,
      10
    )

    return {
      stats,
      recentExecutions,
      successRate: stats ? (stats.successfulRuns / stats.totalRuns) * 100 : 0,
    }
  }

  async getSystemMetrics() {
    const tasks = await taskStatsRepository.findAll()
    const totalExecutions = tasks.reduce((sum, t) => sum + t.totalRuns, 0)
    const totalSuccessful = tasks.reduce((sum, t) => sum + t.successfulRuns, 0)
    const totalFailed = tasks.reduce((sum, t) => sum + t.failedRuns, 0)
    const avgDuration =
      tasks.reduce((sum, t) => sum + t.averageDuration, 0) / tasks.length

    return {
      totalExecutions,
      totalSuccessful,
      totalFailed,
      successRate: totalExecutions
        ? (totalSuccessful / totalExecutions) * 100
        : 0,
      averageDuration: avgDuration,
      taskCount: tasks.length,
    }
  }
}
