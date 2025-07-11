import * as React from "react"
import { Button } from "@/components/atoms/Button"
import { FormField } from "@/components/molecules/FormField"
import { Card, CardContent, CardFooter } from "@/components/molecules/Card"
import { Mail, Lock, Eye, EyeOff } from "lucide-react"
import { toast } from "sonner"

export interface LoginFormProps {
  onSubmit?: (data: LoginFormData) => void
  onForgotPassword?: () => void
  onRegister?: () => void
  isLoading?: boolean
}

export interface LoginFormData {
  email: string
  password: string
  rememberMe: boolean
}

export function LoginForm({ 
  onSubmit, 
  onForgotPassword, 
  onRegister, 
  isLoading = false 
}: LoginFormProps) {
  const [formData, setFormData] = React.useState<LoginFormData>({
    email: "",
    password: "",
    rememberMe: false
  })
  
  const [errors, setErrors] = React.useState<Partial<LoginFormData>>({})
  const [showPassword, setShowPassword] = React.useState(false)

  const validateForm = (): boolean => {
    const newErrors: Partial<LoginFormData> = {}
    
    if (!formData.email) {
      newErrors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address"
    }
    
    if (!formData.password) {
      newErrors.password = "Password is required"
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters"
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

  const handleChange = (field: keyof LoginFormData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = field === 'rememberMe' ? e.target.checked : e.target.value
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const handleDemoLogin = () => {
    setFormData({
      email: "admin@library.com",
      password: "Admin@5077",
      rememberMe: false
    })
    toast.info("Demo credentials filled", {
      description: "Click Login to continue with demo account"
    })
  }

  return (
    <Card>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
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
            label="Password"
            required
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
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

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.rememberMe}
                onChange={handleChange('rememberMe')}
                disabled={isLoading}
                className="rounded border-[var(--color-gray-300)] text-[var(--color-secondary)] focus:ring-[var(--color-secondary)] focus:ring-offset-0"
              />
              <span className="text-sm text-[var(--color-gray-600)]">Remember me</span>
            </label>

            <button
              type="button"
              onClick={onForgotPassword}
              disabled={isLoading}
              className="text-sm text-[var(--color-secondary)] hover:text-[var(--color-secondary-dark)] transition-colors"
            >
              Forgot password?
            </button>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col space-y-4">
          <Button
            type="submit"
            className="w-full"
            loading={isLoading}
            disabled={isLoading}
          >
            {isLoading ? "Signing in..." : "Sign In"}
          </Button>

          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleDemoLogin}
            disabled={isLoading}
          >
            Try Demo Account
          </Button>

          <div className="text-center space-y-2">
            <p className="text-sm text-[var(--color-gray-600)]">
              Don't have an account?{" "}
              <button
                type="button"
                onClick={onRegister}
                disabled={isLoading}
                className="text-[var(--color-secondary)] hover:text-[var(--color-secondary-dark)] font-medium transition-colors"
              >
                Sign up
              </button>
            </p>
          </div>
        </CardFooter>
      </form>
    </Card>
  )
}