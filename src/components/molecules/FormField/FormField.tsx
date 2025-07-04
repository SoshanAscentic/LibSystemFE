import * as React from "react"
import { Label } from "@/components/atoms/Label"
import { Input } from "@/components/atoms/Input"
import { cn } from "@/lib/utils"

export interface FormFieldProps {
  label?: string
  required?: boolean
  error?: string
  helperText?: string
  success?: boolean
  className?: string
  children?: React.ReactNode
  // Input props
  id?: string
  name?: string
  type?: string
  placeholder?: string
  value?: string
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  disabled?: boolean
}

export function FormField({
  label,
  required,
  error,
  helperText,
  success,
  className,
  children,
  id,
  name,
  type = "text",
  placeholder,
  value,
  onChange,
  leftIcon,
  rightIcon,
  disabled,
  ...props
}: FormFieldProps) {
  const fieldId = id || name || label?.toLowerCase().replace(/\s+/g, '-')
  
  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <Label 
          htmlFor={fieldId} 
          required={required}
          variant={error ? "error" : success ? "success" : "default"}
        >
          {label}
        </Label>
      )}
      
      {children || (
        <Input
          id={fieldId}
          name={name}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          leftIcon={leftIcon}
          rightIcon={rightIcon}
          error={error}
          success={success}
          helperText={helperText}
          disabled={disabled}
          {...props}
        />
      )}
    </div>
  )
}