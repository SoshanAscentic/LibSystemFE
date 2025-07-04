import * as React from "react"
import { AuthLayout } from "@/components/templates/AuthLayout"
import { LoginForm, type LoginFormData } from "@/components/organisms/LoginForm"
import { toast } from "sonner"

export interface LoginPageProps {
  onLogin?: (data: LoginFormData) => void
  onNavigateToRegister?: () => void
  onNavigateToForgotPassword?: () => void
}

export function LoginPage({ 
  onLogin, 
  onNavigateToRegister, 
  onNavigateToForgotPassword 
}: LoginPageProps) {
  const [isLoading, setIsLoading] = React.useState(false)

  const handleLogin = async (data: LoginFormData) => {
    setIsLoading(true)
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Demo login logic
      if (data.email === "admin@library.com" && data.password === "admin123") {
        toast.success("Welcome back!", {
          description: "You have successfully signed in to your account."
        })
        onLogin?.(data)
      } else {
        toast.error("Invalid credentials", {
          description: "Please check your email and password and try again."
        })
      }
    } catch (error) {
      toast.error("Login failed", {
        description: "An unexpected error occurred. Please try again."
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleForgotPassword = () => {
    toast.info("Forgot Password", {
      description: "Password reset functionality will be available soon."
    })
    onNavigateToForgotPassword?.()
  }

  const handleRegister = () => {
    onNavigateToRegister?.()
  }

  return (
    <AuthLayout
      title="Welcome Back"
      subtitle="Sign in to your account to continue"
    >
      <LoginForm
        onSubmit={handleLogin}
        onForgotPassword={handleForgotPassword}
        onRegister={handleRegister}
        isLoading={isLoading}
      />
    </AuthLayout>
  )
}