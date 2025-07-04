import * as React from "react"
import { AuthLayout } from "@/components/templates/AuthLayout"
import { RegisterForm, type RegisterFormData } from "@/components/organisms/RegisterForm"
import { toast } from "sonner"

export interface RegisterPageProps {
  onRegister?: (data: RegisterFormData) => void
  onNavigateToLogin?: () => void
}

export function RegisterPage({ onRegister, onNavigateToLogin }: RegisterPageProps) {
  const [isLoading, setIsLoading] = React.useState(false)

  const handleRegister = async (data: RegisterFormData) => {
    setIsLoading(true)
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      toast.success("Account created successfully!", {
        description: "Welcome to LibraryMS. You can now sign in with your credentials."
      })
      
      onRegister?.(data)
      
      // Auto-redirect to login after successful registration
      setTimeout(() => {
        onNavigateToLogin?.()
      }, 1500)
      
    } catch (error) {
      toast.error("Registration failed", {
        description: "An unexpected error occurred. Please try again."
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogin = () => {
    onNavigateToLogin?.()
  }

  return (
    <AuthLayout
      title="Create Account"
      subtitle="Join LibraryMS to get started"
    >
      <RegisterForm
        onSubmit={handleRegister}
        onLogin={handleLogin}
        isLoading={isLoading}
      />
    </AuthLayout>
  )
}