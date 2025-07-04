import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { Eye, EyeOff, AlertCircle, CheckCircle } from "lucide-react"

const inputVariants = cva(
  "flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200",
  {
    variants: {
      variant: {
        default: "border-[var(--color-gray-300)] focus-visible:ring-[var(--color-secondary)] focus-visible:border-[var(--color-secondary)]",
        error: "border-[var(--color-error)] focus-visible:ring-[var(--color-error)] bg-[var(--color-error-light)]",
        success: "border-[var(--color-success)] focus-visible:ring-[var(--color-success)] bg-[var(--color-success-light)]",
      },
      inputSize: {
        default: "h-10",
        sm: "h-9",
        lg: "h-11",
      },
    },
    defaultVariants: {
      variant: "default",
      inputSize: "default",
    },
  }
)

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  error?: string
  success?: boolean
  helperText?: string
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, variant, inputSize, type, leftIcon, rightIcon, error, success, helperText, ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false)
    
    const isPassword = type === "password"
    const inputType = isPassword && showPassword ? "text" : type
    
    // Determine variant based on props
    const currentVariant = error ? "error" : success ? "success" : variant

    return (
      <div className="w-full">
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--color-gray-400)]">
              {leftIcon}
            </div>
          )}
          
          <input
            type={inputType}
            className={cn(
              inputVariants({ variant: currentVariant, inputSize }),
              leftIcon && "pl-10",
              (rightIcon || isPassword) && "pr-10",
              className
            )}
            ref={ref}
            {...props}
          />
          
          {isPassword && (
            <button
              type="button"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[var(--color-gray-400)] hover:text-[var(--color-gray-600)] transition-colors"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          )}
          
          {!isPassword && rightIcon && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[var(--color-gray-400)]">
              {rightIcon}
            </div>
          )}
          
          {error && !isPassword && !rightIcon && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[var(--color-error)]">
              <AlertCircle className="h-4 w-4" />
            </div>
          )}
          
          {success && !isPassword && !rightIcon && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[var(--color-success)]">
              <CheckCircle className="h-4 w-4" />
            </div>
          )}
        </div>
        
        {(error || helperText) && (
          <div className="mt-1 text-sm">
            {error && (
              <p className="text-[var(--color-error)] flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {error}
              </p>
            )}
            {!error && helperText && (
              <p className="text-[var(--color-gray-500)]">{helperText}</p>
            )}
          </div>
        )}
      </div>
    )
  }
)
Input.displayName = "Input"

export { Input, inputVariants }