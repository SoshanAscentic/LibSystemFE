import * as React from "react"
import { LoginPage } from "@/pages/auth/LoginPage"
import { RegisterPage } from "@/pages/auth/RegisterPage"
import type { LoginFormData } from "@/components/organisms/LoginForm"
import type { RegisterFormData } from "@/components/organisms/RegisterForm"

type AuthView = 'login' | 'register'

export interface AuthDemoProps {
  onLoginSuccess?: (data: LoginFormData) => void
}

export function AuthDemo({ onLoginSuccess }: AuthDemoProps) {
  const [currentView, setCurrentView] = React.useState<AuthView>('login')

  const handleLogin = (data: LoginFormData) => {
    console.log('Login attempt:', data)
    onLoginSuccess?.(data)
  }

  const handleRegister = (data: RegisterFormData) => {
    console.log('Registration attempt:', data)
    // In a real app, this would create the account and redirect
  }

  const navigateToRegister = () => setCurrentView('register')
  const navigateToLogin = () => setCurrentView('login')

  if (currentView === 'register') {
    return (
      <RegisterPage
        onRegister={handleRegister}
        onNavigateToLogin={navigateToLogin}
      />
    )
  }

  return (
    <LoginPage
      onLogin={handleLogin}
      onNavigateToRegister={navigateToRegister}
    />
  )
}