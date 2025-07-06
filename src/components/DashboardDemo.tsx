import * as React from "react"
import { DashboardLayout } from "@/components/templates/DashboardLayout"
import { Header } from "@/components/organisms/Header"
import { Sidebar } from "@/components/organisms/Sidebar"
import { DashboardPage } from "@/pages/dashboard/DashboardPage"
import { AuthDemo } from "@/components/AuthDemo"

type AppState = 'auth' | 'dashboard'

export function DashboardDemo() {
  const [appState, setAppState] = React.useState<AppState>('auth')
  const [user, setUser] = React.useState<any>(null)
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false)
  const [currentPath, setCurrentPath] = React.useState('/dashboard')

  const handleLogin = (loginData: any) => {
    // Simulate successful login
    setUser({
      name: "Soshan Wijayarathne",
      email: loginData.email,
      role: "Administrator"
    })
    setAppState('dashboard')
  }

  const handleLogout = () => {
    setUser(null)
    setAppState('auth')
  }

  const handleNavigation = (path: string) => {
    setCurrentPath(path)
  }

  const handleSidebarToggle = () => {
    setIsSidebarOpen(prev => !prev)
  }

  const handleSidebarItemClick = () => {
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false)
    }
  }

  const handleSearch = (query: string) => {
    console.log('Search:', query)
  }

  if (appState === 'auth') {
    return <AuthDemo onLoginSuccess={handleLogin} />
  }

  return (
    <DashboardLayout
      isSidebarOpen={isSidebarOpen}
      onSidebarToggle={handleSidebarToggle}
      header={
        <Header
          user={user}
          onSearch={handleSearch}
          onToggleSidebar={handleSidebarToggle}
          isSidebarOpen={isSidebarOpen}
          onLogout={handleLogout}
          notifications={3}
        />
      }
      sidebar={
        <Sidebar
          currentPath={currentPath}
          onNavigate={handleNavigation}
          userRole={user.role}
          onItemClick={handleSidebarItemClick}
        />
      }
    >
      <DashboardPage user={user} onLogout={handleLogout} />
    </DashboardLayout>
  )
}