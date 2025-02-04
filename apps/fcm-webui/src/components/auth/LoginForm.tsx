'use client'
import { zodResolver } from '@hookform/resolvers/zod'
import { Alert, Button, TextField } from '@mui/material'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

type LoginFormData = z.infer<typeof loginSchema>

function LoginFormContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams?.get('callbackUrl') || '/'

  const [error, setError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormData) => {
    try {
      const result = await signIn('credentials', {
        username: data.username,
        password: data.password,
        redirect: false,
        callbackUrl: callbackUrl,
      })

      if (result?.error) {
        setError('Invalid username or password')
        return
      }

      if (result?.ok) {
        setError(null)
        router.push(callbackUrl)
        router.refresh()
      }
    } catch (err) {
      console.error('Sign in error:', err)
      setError('An error occurred during sign in')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      <TextField
        {...register('username')}
        label="Username"
        fullWidth
        error={!!errors.username}
        helperText={errors.username?.message}
        sx={{ mb: 2 }}
      />
      <TextField
        {...register('password')}
        type="password"
        label="Password"
        fullWidth
        error={!!errors.password}
        helperText={errors.password?.message}
        sx={{ mb: 2 }}
      />
      <Button
        type="submit"
        fullWidth
        variant="contained"
        disabled={isSubmitting}
        sx={{ mb: 2 }}>
        {isSubmitting ? 'Signing in...' : 'Sign In'}
      </Button>
    </form>
  )
}

export default function LoginForm() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginFormContent />
    </Suspense>
  )
}
