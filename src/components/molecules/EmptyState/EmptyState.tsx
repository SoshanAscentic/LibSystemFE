import * as React from "react"
import { Button } from "@/components/atoms/Button"
import { cn } from "@/lib/utils"

export interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
    variant?: "default" | "outline" | "secondary"
  }
  className?: string
}

export function EmptyState({ 
  icon, 
  title, 
  description, 
  action, 
  className 
}: EmptyStateProps) {
  return (
    <div className={cn("text-center py-12 px-6", className)}>
      {icon && (
        <div className="flex justify-center mb-4">
          <div className="text-[var(--color-gray-400)]">
            {icon}
          </div>
        </div>
      )}
      
      <h3 className="text-lg font-semibold text-[var(--color-gray-900)] mb-2">
        {title}
      </h3>
      
      {description && (
        <p className="text-[var(--color-gray-600)] mb-6 max-w-sm mx-auto">
          {description}
        </p>
      )}
      
      {action && (
        <Button 
          variant={action.variant || "default"}
          onClick={action.onClick}
        >
          {action.label}
        </Button>
      )}
    </div>
  )
}