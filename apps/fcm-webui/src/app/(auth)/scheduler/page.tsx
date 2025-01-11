'use client'

import { SchedulerSocket } from '@/lib/websocket/scheduler'
import type { TaskSchedule } from '@fcm/shared/scheduler'
import DeleteIcon from '@mui/icons-material/Delete'
import PauseIcon from '@mui/icons-material/Pause'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import {
  Box,
  Card,
  CardContent,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'
import { useEffect, useState } from 'react'
import {
  deleteScheduledTaskAction,
  getScheduledTasksAction,
  pauseScheduledTaskAction,
  resumeScheduledTaskAction,
} from '../../actions/scheduler'
import { TaskMetricsCard } from '../monitoring/components/TaskMetricsCard'
import { CreateTaskDialog } from './components/CreateTaskDialog'

export default function SchedulerPage() {
  const [tasks, setTasks] = useState<TaskSchedule[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)

  useEffect(() => {
    loadTasks()

    // Setup WebSocket connection
    const socket = SchedulerSocket.getInstance()
    socket.connect()

    const unsubCreated = socket.on('task:created', () => loadTasks())
    const unsubUpdated = socket.on('task:updated', () => loadTasks())
    const unsubDeleted = socket.on('task:deleted', () => loadTasks())
    const unsubExecution = socket.on('task:execution', () => loadTasks())

    return () => {
      unsubCreated()
      unsubUpdated()
      unsubDeleted()
      unsubExecution()
      socket.disconnect()
    }
  }, [])

  const loadTasks = async () => {
    try {
      const tasksData = await getScheduledTasksAction()
      setTasks(tasksData)
    } catch (error) {
      console.error('Failed to load tasks:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePauseResume = async (taskId: string, currentState: string) => {
    try {
      if (currentState === 'ENABLED') {
        await pauseScheduledTaskAction(taskId)
      } else {
        await resumeScheduledTaskAction(taskId)
      }
      await loadTasks()
    } catch (error) {
      console.error('Failed to pause/resume task:', error)
    }
  }

  const handleDelete = async (taskId: string) => {
    try {
      await deleteScheduledTaskAction(taskId)
      await loadTasks()
    } catch (error) {
      console.error('Failed to delete task:', error)
    }
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { md: '2fr 1fr' },
          gap: 3,
        }}>
        {/* Tasks List */}
        <Card>
          <CardContent>
            <Box
              sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6">Scheduled Tasks</Typography>
              <CreateTaskDialog onTaskCreated={loadTasks} />
            </Box>

            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Schedule</TableCell>
                    <TableCell>Last Run</TableCell>
                    <TableCell>Next Run</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {tasks.map((task) => (
                    <TableRow
                      key={task.id}
                      hover
                      onClick={() => setSelectedTaskId(task.id)}
                      sx={{ cursor: 'pointer' }}>
                      <TableCell>{task.name}</TableCell>
                      <TableCell>{task.state}</TableCell>
                      <TableCell>{task.cronExpression}</TableCell>
                      <TableCell>
                        {task.lastRunAt
                          ? new Date(task.lastRunAt).toLocaleString()
                          : 'Never'}
                      </TableCell>
                      <TableCell>
                        {task.nextRunAt
                          ? new Date(task.nextRunAt).toLocaleString()
                          : 'Not scheduled'}
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation()
                              handlePauseResume(task.id, task.state)
                            }}>
                            {task.state === 'ENABLED' ? (
                              <PauseIcon />
                            ) : (
                              <PlayArrowIcon />
                            )}
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDelete(task.id)
                            }}>
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>

        {/* Task Metrics */}
        <Box>
          {selectedTaskId ? (
            <TaskMetricsCard taskId={selectedTaskId} />
          ) : (
            <Card>
              <CardContent>
                <Typography color="textSecondary" align="center">
                  Select a task to view its metrics
                </Typography>
              </CardContent>
            </Card>
          )}
        </Box>
      </Box>
    </Box>
  )
}
