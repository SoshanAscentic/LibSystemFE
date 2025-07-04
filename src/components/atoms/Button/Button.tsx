import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-[var(--color-secondary)] text-white hover:bg-[var(--color-secondary-dark)] focus-visible:ring-[var(--color-secondary)]",
        destructive: "bg-[var(--color-error)] text-white hover:bg-red-600 focus-visible:ring-red-500",
        outline: "border border-[var(--color-secondary)] text-[var(--color-secondary)] bg-transparent hover:bg-[var(--color-secondary-light)]",
        secondary: "bg-[var(--color-gray-100)] text-[var(--color-gray-900)] hover:bg-[var(--color-gray-200)]",
        ghost: "text-[var(--color-secondary)] hover:bg-[var(--color-secondary-light)]",
        link: "text-[var(--color-secondary)] underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading, leftIcon, rightIcon, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading && <Loader2 className="animate-spin" />}
        {!loading && leftIcon}
        {children}
        {!loading && rightIcon}
      </Comp>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }