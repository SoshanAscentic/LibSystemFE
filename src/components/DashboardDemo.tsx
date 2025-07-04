import * as React from "react"
import { DashboardPage } from "@/pages/dashboard/DashboardPage"
import { AuthDemo } from "@/components/AuthDemo"

type AppState = 'auth' | 'dashboard'

export function DashboardDemo() {
  const [appState, setAppState] = React.useState<AppState>('auth')
  const [user, setUser] = React.useState<any>(null)

  const handleLogin = (loginData: any) => {
    // Simulate successful login
    setUser({
      name: "John Doe",
      email: loginData.email,
      role: "Administrator"
    })
    setAppState('dashboard')
  }

  const handleLogout = () => {
    setUser(null)
    setAppState('auth')
  }

  if (appState === 'auth') {
    return <AuthDemo onLoginSuccess={handleLogin} />
  }

  return (
    <DashboardPage
      user={user}
      onLogout={handleLogout}
    />
  )
}