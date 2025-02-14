'use client'

import type { SystemMetrics } from '@fcm/shared/monitoring'
import {
  Box,
  Card,
  CardContent,
  Grid,
  LinearProgress,
  Typography,
} from '@mui/material'
import { useEffect, useState } from 'react'
import { getSystemMetricsAction } from '../../actions/monitoring'

export default function MonitoringPage() {
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadSystemMetrics()
  }, [])

  const loadSystemMetrics = async () => {
    try {
      const metrics = await getSystemMetricsAction()
      setSystemMetrics(metrics)
    } catch (error) {
      console.error('Failed to load system metrics:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div>Loading...</div>
  }

  if (!systemMetrics) {
    return <div>No metrics available</div>
  }

  return (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={2}>
        {/* Total Tasks Card */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Total Tasks
              </Typography>
              <Typography variant="h3">{systemMetrics.taskCount}</Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Success Rate Card */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Success Rate
              </Typography>
              <Box sx={{ mb: 1 }}>
                <Typography variant="h3">
                  {(systemMetrics.successRate * 100).toFixed(1)}%
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={systemMetrics.successRate * 100}
                sx={{ height: 8, borderRadius: 1 }}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Average Duration Card */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Average Duration
              </Typography>
              <Typography variant="h3">
                {systemMetrics.averageDuration.toFixed(2)}s
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Execution Stats Card */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Execution Statistics
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <Typography color="textSecondary" variant="subtitle2">
                    Total Executions
                  </Typography>
                  <Typography variant="h4">
                    {systemMetrics.totalExecutions}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography color="textSecondary" variant="subtitle2">
                    Successful
                  </Typography>
                  <Typography variant="h4" sx={{ color: 'success.main' }}>
                    {systemMetrics.totalSuccessful}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography color="textSecondary" variant="subtitle2">
                    Failed
                  </Typography>
                  <Typography variant="h4" sx={{ color: 'error.main' }}>
                    {systemMetrics.totalFailed}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}
