'use client'

import { Progress } from '@/components/ui/progress'

interface PasswordStrengthIndicatorProps {
  strength: number // Value from 0 to 5
}

export function PasswordStrengthIndicator({ strength }: PasswordStrengthIndicatorProps) {
  // Calculate percentage (0-100)
  const percentage = (strength / 5) * 100

  // Determine color based on strength
  const getColor = () => {
    if (percentage <= 20) return 'bg-red-500'
    if (percentage <= 40) return 'bg-orange-500'
    if (percentage <= 60) return 'bg-yellow-500'
    if (percentage <= 80) return 'bg-lime-500'
    return 'bg-green-500'
  }

  // Get descriptive text
  const getStrengthText = () => {
    if (percentage <= 20) return 'Very Weak'
    if (percentage <= 40) return 'Weak'
    if (percentage <= 60) return 'Fair'
    if (percentage <= 80) return 'Strong'
    return 'Very Strong'
  }

  return (
    <div className="space-y-2">
      <Progress
        value={percentage}
        className="h-2 w-full"
        indicatorClassName={getColor()}
      />
      <p className="text-xs text-muted-foreground">
        Password strength: {getStrengthText()}
      </p>
    </div>
  )
}
