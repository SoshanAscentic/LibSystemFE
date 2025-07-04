import { Spinner } from "@/components/atoms/Spinner"
import { cn } from "@/lib/utils"

export interface LoadingStateProps {
  message?: string
  size?: "sm" | "default" | "lg" | "xl"
  className?: string
  fullScreen?: boolean
}

export function LoadingState({ 
  message = "Loading...", 
  size = "default", 
  className,
  fullScreen = false 
}: LoadingStateProps) {
  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="text-center">
          <Spinner size={size} />
          {message && (
            <p className="mt-4 text-[var(--color-gray-600)] text-sm">{message}</p>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className={cn("flex items-center justify-center p-8", className)}>
      <div className="text-center">
        <Spinner size={size} />
        {message && (
          <p className="mt-4 text-[var(--color-gray-600)] text-sm">{message}</p>
        )}
      </div>
    </div>
  )
}