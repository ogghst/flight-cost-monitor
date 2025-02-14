import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from './use-auth'
import { Alert } from '@/components/ui/alert'
import { Spinner } from '@/components/ui/spinner'

// This higher-order component wraps protected pages to ensure authentication
export function withAuth<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  options: {
    requireAuth?: boolean
    requireRoles?: string[]
  } = {}
) {
  // Return a new component that includes authentication logic
  return function ProtectedRoute(props: P) {
    const { user, isLoading, error, isAuthenticated } = useAuth()
    const router = useRouter()

    useEffect(() => {
      // Only perform checks after initial loading
      if (!isLoading) {
        // Handle unauthenticated users
        if (options.requireAuth && !isAuthenticated) {
          const currentPath = window.location.pathname
          const encodedPath = encodeURIComponent(currentPath)
          router.push(`/auth/login?callbackUrl=${encodedPath}`)
          return
        }

        // Handle role-based access
        if (options.requireRoles?.length && user?.roles) {
          const hasRequiredRole = options.requireRoles.some(role =>
            user.roles.includes(role)
          )
          
          if (!hasRequiredRole) {
            router.push('/unauthorized')
            return
          }
        }
      }
    }, [isLoading, isAuthenticated, user, router])

    // Show loading state while checking authentication
    if (isLoading) {
      return (
        <div className="flex h-screen items-center justify-center">
          <Spinner size="lg" />
        </div>
      )
    }

    // Show error state if authentication check fails
    if (error) {
      return (
        <div className="p-4">
          <Alert variant="destructive">
            <p>Authentication error: {error.message}</p>
          </Alert>
        </div>
      )
    }

    // If authentication is required and user isn't authenticated, don't render anything
    // (useEffect will handle the redirect)
    if (options.requireAuth && !isAuthenticated) {
      return null
    }

    // If role check fails, don't render anything (useEffect will handle the redirect)
    if (
      options.requireRoles?.length &&
      !options.requireRoles.some(role => user?.roles.includes(role))
    ) {
      return null
    }

    // All checks passed, render the protected component
    return <WrappedComponent {...props} />
  }
}

// This hook can be used in components to check for specific roles
export function useRequireRole(role: string) {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user?.roles.includes(role)) {
      router.push('/unauthorized')
    }
  }, [isLoading, user, role, router])

  return { hasRole: user?.roles.includes(role) ?? false }
}
