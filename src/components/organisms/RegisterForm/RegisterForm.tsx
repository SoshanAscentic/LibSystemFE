import * as React from "react"
import { Button } from "@/components/atoms/Button"
import { FormField } from "@/components/molecules/FormField"
import { Card, CardContent, CardFooter } from "@/components/molecules/Card"
import { User, Mail, Lock, Eye, EyeOff, Users } from "lucide-react"
import { toast } from "sonner"

export interface RegisterFormProps {
  onSubmit?: (data: RegisterFormData) => void
  onLogin?: () => void
  isLoading?: boolean
}

export interface RegisterFormData {
  firstName: string
  lastName: string
  email: string
  password: string
  confirmPassword: string
  role: string
}

const roleOptions = [
  { value: "Member", label: "Member", description: "Regular library member with borrowing privileges" },
  { value: "MinorStaff", label: "Minor Staff", description: "Staff member with limited administrative capabilities" },
  { value: "ManagementStaff", label: "Management Staff", description: "Staff member with management capabilities" },
]

export function RegisterForm({ onSubmit, onLogin, isLoading = false }: RegisterFormProps) {
  const [formData, setFormData] = React.useState<RegisterFormData>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "Member"
  })
  
  const [errors, setErrors] = React.useState<Partial<RegisterFormData>>({})
  const [showPassword, setShowPassword] = React.useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false)

  const validateForm = (): boolean => {
    const newErrors: Partial<RegisterFormData> = {}
    
    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required"
    } else if (formData.firstName.trim().length < 2) {
      newErrors.firstName = "First name must be at least 2 characters"
    }
    
    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required"
    } else if (formData.lastName.trim().length < 2) {
      newErrors.lastName = "Last name must be at least 2 characters"
    }
    
    if (!formData.email) {
      newErrors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address"
    }
    
    if (!formData.password) {
      newErrors.password = "Password is required"
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters"
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = "Password must contain at least one uppercase letter, lowercase letter, and number"
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password"
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match"
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (validateForm()) {
      onSubmit?.(formData)
    } else {
      toast.error("Please fix the errors below")
    }
  }

  const handleChange = (field: keyof RegisterFormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }))
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const getPasswordStrength = (password: string): { strength: number; text: string; color: string } => {
    if (!password) return { strength: 0, text: "Enter a password", color: "text-[var(--color-gray-400)]" }
    
    let strength = 0
    if (password.length >= 8) strength++
    if (/[a-z]/.test(password)) strength++
    if (/[A-Z]/.test(password)) strength++
    if (/\d/.test(password)) strength++
    if (/[^a-zA-Z\d]/.test(password)) strength++
    
    const levels = [
      { text: "Very Weak", color: "text-[var(--color-error)]" },
      { text: "Weak", color: "text-[var(--color-warning)]" },
      { text: "Fair", color: "text-[var(--color-warning)]" },
      { text: "Good", color: "text-[var(--color-info)]" },
      { text: "Strong", color: "text-[var(--color-success)]" },
    ]
    
    return { strength, ...levels[Math.min(strength, 4)] }
  }

  const passwordStrength = getPasswordStrength(formData.password)

  return (
    <Card>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <FormField
              label="First Name"
              required
              placeholder="Enter first name"
              leftIcon={<User className="w-4 h-4" />}
              value={formData.firstName}
              onChange={handleChange('firstName')}
              error={errors.firstName}
              disabled={isLoading}
            />

            <FormField
              label="Last Name"
              required
              placeholder="Enter last name"
              leftIcon={<User className="w-4 h-4" />}
              value={formData.lastName}
              onChange={handleChange('lastName')}
              error={errors.lastName}
              disabled={isLoading}
            />
          </div>

          <FormField
            label="Email Address"
            required
            type="email"
            placeholder="Enter your email"
            leftIcon={<Mail className="w-4 h-4" />}
            value={formData.email}
            onChange={handleChange('email')}
            error={errors.email}
            disabled={isLoading}
          />

          <FormField
            label="Role"
            required
          >
            <div className="space-y-3">
              <select
                value={formData.role}
                onChange={handleChange('role')}
                disabled={isLoading}
                className="flex h-10 w-full rounded-md border border-[var(--color-gray-300)] bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-secondary)] focus-visible:border-[var(--color-secondary)] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {roleOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <p className="text-xs text-[var(--color-gray-500)]">
                {roleOptions.find(r => r.value === formData.role)?.description}
              </p>
            </div>
          </FormField>

          <FormField
            label="Password"
            required
            type={showPassword ? "text" : "password"}
            placeholder="Create a strong password"
            leftIcon={<Lock className="w-4 h-4" />}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-[var(--color-gray-400)] hover:text-[var(--color-gray-600)] transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            }
            value={formData.password}
            onChange={handleChange('password')}
            error={errors.password}
            disabled={isLoading}
          />

          {formData.password && (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-[var(--color-gray-500)]">Password strength:</span>
                <span className={`text-xs font-medium ${passwordStrength.color}`}>
                  {passwordStrength.text}
                </span>
              </div>
              <div className="w-full bg-[var(--color-gray-200)] rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-[var(--color-error)] via-[var(--color-warning)] to-[var(--color-success)] h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(passwordStrength.strength / 5) * 100}%` }}
                ></div>
              </div>
            </div>
          )}

          <FormField
            label="Confirm Password"
            required
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Confirm your password"
            leftIcon={<Lock className="w-4 h-4" />}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="text-[var(--color-gray-400)] hover:text-[var(--color-gray-600)] transition-colors"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            }
            value={formData.confirmPassword}
            onChange={handleChange('confirmPassword')}
            error={errors.confirmPassword}
            disabled={isLoading}
          />
        </CardContent>

        <CardFooter className="flex flex-col space-y-4">
          <Button
            type="submit"
            className="w-full"
            loading={isLoading}
            disabled={isLoading}
          >
            {isLoading ? "Creating Account..." : "Create Account"}
          </Button>

          <div className="text-center">
            <p className="text-sm text-[var(--color-gray-600)]">
              Already have an account?{" "}
              <button
                type="button"
                onClick={onLogin}
                disabled={isLoading}
                className="text-[var(--color-secondary)] hover:text-[var(--color-secondary-dark)] font-medium transition-colors"
              >
                Sign in
              </button>
            </p>
          </div>
        </CardFooter>
      </form>
    </Card>
  )
}