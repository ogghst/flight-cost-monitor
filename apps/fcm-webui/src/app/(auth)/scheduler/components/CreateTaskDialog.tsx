'use client'

import {
  createTaskScheduleSchema,
  type CreateTaskSchedule,
} from '@fcm/shared/scheduler'
import { zodResolver } from '@hookform/resolvers/zod'
import AddIcon from '@mui/icons-material/Add'
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from '@mui/material'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { createScheduledTaskAction } from '../../../actions/scheduler'

interface CreateTaskDialogProps {
  onTaskCreated: () => void
}

export function CreateTaskDialog({ onTaskCreated }: CreateTaskDialogProps) {
  const [open, setOpen] = useState(false)
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateTaskSchedule>({
    resolver: zodResolver(createTaskScheduleSchema),
  })

  const onSubmit = async (data: CreateTaskSchedule) => {
    try {
      await createScheduledTaskAction(data)
      setOpen(false)
      reset()
      onTaskCreated()
    } catch (error) {
      console.error('Failed to create task:', error)
    }
  }

  return (
    <>
      <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={() => setOpen(true)}>
        Create Task
      </Button>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="sm"
        fullWidth>
        <DialogTitle>Create New Scheduled Task</DialogTitle>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="Task Name"
                {...register('name')}
                error={!!errors.name}
                helperText={errors.name?.message}
                fullWidth
              />

              <TextField
                label="Description"
                {...register('description')}
                error={!!errors.description}
                helperText={errors.description?.message}
                fullWidth
                multiline
                rows={2}
              />

              <TextField
                label="Search ID"
                {...register('searchId')}
                error={!!errors.searchId}
                helperText={errors.searchId?.message}
                fullWidth
              />

              <TextField
                label="Cron Expression"
                {...register('cronExpression')}
                error={!!errors.cronExpression}
                helperText={errors.cronExpression?.message}
                placeholder="*/15 * * * *"
                fullWidth
              />

              <TextField
                label="Timeout (ms)"
                type="number"
                {...register('timeout', { valueAsNumber: true })}
                error={!!errors.timeout}
                helperText={errors.timeout?.message}
                defaultValue={30000}
                fullWidth
              />

              <TextField
                label="Max Retries"
                type="number"
                {...register('maxRetries', { valueAsNumber: true })}
                error={!!errors.maxRetries}
                helperText={errors.maxRetries?.message}
                defaultValue={3}
                fullWidth
              />
            </Box>
          </DialogContent>

          <DialogActions>
            <Button onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained">
              Create
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </>
  )
}
