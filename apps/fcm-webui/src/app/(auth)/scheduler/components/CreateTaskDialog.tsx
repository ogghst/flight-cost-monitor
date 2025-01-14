'use client'

import {
  createTaskScheduleSchema,
  type CreateTaskScheduleDto,
  TaskType,
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  CircularProgress,
  Typography,
} from '@mui/material'
import { useState, useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { createScheduledTaskAction } from '../../../actions/scheduler'
import { useUserSearches } from '@/hooks/useUserSearches'
import { useSession } from 'next-auth/react'

interface CreateTaskDialogProps {
  onTaskCreated: () => void
}

export function CreateTaskDialog({ onTaskCreated }: CreateTaskDialogProps) {
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedTaskType, setSelectedTaskType] = useState<TaskType>(TaskType.SIMPLE_SEARCH)
  
  const { data: session } = useSession()
  const { data: userSearches, isLoading: isLoadingSearches, error: searchError } = useUserSearches(selectedTaskType)
  
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
    watch,
    setValue,
  } = useForm<CreateTaskScheduleDto>({
    resolver: zodResolver(createTaskScheduleSchema),
    defaultValues: {
      taskType: TaskType.SIMPLE_SEARCH,
      timeout: 30000,
      maxRetries: 3,
      userEmail: session?.user?.email || '',
    }
  })

  // Set user email when session is loaded
  useEffect(() => {
    if (session?.user?.email) {
      setValue('userEmail', session.user.email)
      console.log('Set user email:', session.user.email)
    }
  }, [session?.user?.email, setValue])

  // Watch taskType to update search config when it changes
  const watchTaskType = watch('taskType')
  if (watchTaskType !== selectedTaskType) {
    setSelectedTaskType(watchTaskType)
  }

  const onSubmit = async (data: CreateTaskScheduleDto) => {
    console.log('Form submitted with data:', data)
    
    try {
      setIsSubmitting(true)
      setError(null)
      
      const response = await createScheduledTaskAction(data)
      console.log('Server response:', response)
      
      setOpen(false)
      reset()
      onTaskCreated()
    } catch (error) {
      console.error('Create task error:', error)
      setError(error instanceof Error ? error.message : 'Failed to create task')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setOpen(false)
    reset()
    setError(null)
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
        onClose={handleClose}
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

              <FormControl fullWidth error={!!errors.taskType}>
                <InputLabel>Search Type</InputLabel>
                <Controller
                  name="taskType"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      onChange={(e) => {
                        field.onChange(e)
                        setSelectedTaskType(e.target.value as TaskType)
                      }}>
                      <MenuItem value={TaskType.SIMPLE_SEARCH}>Simple Search</MenuItem>
                      <MenuItem value={TaskType.ADVANCED_SEARCH}>Advanced Search</MenuItem>
                    </Select>
                  )}
                />
                {errors.taskType && (
                  <FormHelperText>{errors.taskType.message}</FormHelperText>
                )}
              </FormControl>

              <FormControl fullWidth error={!!errors.payload}>
                <InputLabel>Search Configuration</InputLabel>
                <Controller
                  name="payload"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      value={field.value || ''}
                      disabled={isLoadingSearches}
                      error={!!errors.payload || !!searchError}>
                      {isLoadingSearches ? (
                        <MenuItem disabled>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <CircularProgress size={20} />
                            <Typography>Loading searches...</Typography>
                          </Box>
                        </MenuItem>
                      ) : searchError ? (
                        <MenuItem disabled>Error loading searches</MenuItem>
                      ) : !userSearches?.length ? (
                        <MenuItem disabled>No saved searches found</MenuItem>
                      ) : (
                        userSearches.map((search) => (
                          <MenuItem key={search.id} value={search.id}>
                            {search.name || `Search ${search.id}`}
                          </MenuItem>
                        ))
                      )}
                    </Select>
                  )}
                />
                {errors.payload && (
                  <FormHelperText>{errors.payload.message}</FormHelperText>
                )}
                {searchError && (
                  <FormHelperText error>Failed to load searches</FormHelperText>
                )}
              </FormControl>

              <TextField
                label="Cron Expression"
                {...register('cronExpression')}
                error={!!errors.cronExpression}
                helperText={errors.cronExpression?.message || 'e.g. */15 * * * * (every 15 minutes)'}
                placeholder="*/15 * * * *"
                fullWidth
              />

              <TextField
                label="Timeout (ms)"
                type="number"
                {...register('timeout', { valueAsNumber: true })}
                error={!!errors.timeout}
                helperText={errors.timeout?.message}
                fullWidth
              />

              <TextField
                label="Max Retries"
                type="number"
                {...register('maxRetries', { valueAsNumber: true })}
                error={!!errors.maxRetries}
                helperText={errors.maxRetries?.message}
                fullWidth
              />
            </Box>
            
            {error && (
              <Box sx={{ mt: 2, color: 'error.main' }}>
                {error}
              </Box>
            )}
          </DialogContent>

          <DialogActions>
            <Button onClick={handleClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="contained"
              disabled={isSubmitting || isLoadingSearches}
            >
              {isSubmitting ? 'Creating...' : 'Create'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </>
  )
}