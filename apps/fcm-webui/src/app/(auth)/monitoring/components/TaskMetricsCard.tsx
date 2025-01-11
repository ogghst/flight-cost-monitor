'use client'

import type { TaskMetrics } from '@fcm/shared/monitoring'
import CircleIcon from '@mui/icons-material/Circle'
import {
  Box,
  Card,
  CardContent,
  Divider,
  LinearProgress,
  Typography,
} from '@mui/material'
import { useEffect, useState } from 'react'
import { getTaskMetricsAction } from '../../../actions/monitoring'

interface TaskMetricsCardProps {
  taskId: string
}

export function TaskMetricsCard({ taskId }: TaskMetricsCardProps) {
  const [metrics, setMetrics] = useState<TaskMetrics | null>(null)

  useEffect(() => {
    const loadMetrics = async () => {
      try {
        const data = await getTaskMetricsAction(taskId)
        setMetrics(data)
      } catch (error) {
        console.error('Failed to load task metrics:', error)
      }
    }

    loadMetrics()
    // Refresh every 30 seconds
    const interval = setInterval(loadMetrics, 30000)
    return () => clearInterval(interval)
  }, [taskId])

  if (!metrics) {
    return null
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Task Performance
        </Typography>

        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            Success Rate
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ flex: 1 }}>
              <LinearProgress
                variant="determinate"
                value={metrics.stats?.successRate * 100}
                sx={{ height: 8, borderRadius: 1 }}
              />
            </Box>
            <Typography variant="body2">
              {(metrics.stats?.successRate * 100)?.toFixed(1)}%
            </Typography>
          </Box>
        </Box>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 2,
            mb: 3,
          }}>
          <Box>
            <Typography variant="subtitle2" color="textSecondary">
              Total Runs
            </Typography>
            <Typography variant="h4">{metrics.stats?.totalRuns}</Typography>
          </Box>
          <Box>
            <Typography variant="subtitle2" color="textSecondary">
              Avg Duration
            </Typography>
            <Typography variant="h4">
              {metrics.stats?.averageDuration?.toFixed(2)}s
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle2" gutterBottom>
          Recent Executions
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {metrics.recentExecutions.map((execution) => (
            <Box
              key={execution.id}
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CircleIcon
                  sx={{
                    fontSize: 8,
                    color:
                      execution.status === 'COMPLETED'
                        ? 'success.main'
                        : 'error.main',
                  }}
                />
                <Typography variant="body2">
                  {new Date(execution.startTime).toLocaleTimeString()}
                </Typography>
              </Box>
              <Typography variant="body2">
                {execution.duration?.toFixed(2)}s
              </Typography>
            </Box>
          ))}
        </Box>
      </CardContent>
    </Card>
  )
}
