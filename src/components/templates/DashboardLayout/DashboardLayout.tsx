import * as React from "react"
import { cn } from "@/lib/utils"
import { X } from "lucide-react"
import { Button } from "@/components/atoms/Button"

export interface DashboardLayoutProps {
  children: React.ReactNode
  header?: React.ReactNode
  sidebar?: React.ReactNode
  className?: string
  isSidebarOpen?: boolean
  onSidebarToggle?: () => void
}

export function DashboardLayout({ 
  children, 
  header, 
  sidebar, 
  className,
  isSidebarOpen = false,
  onSidebarToggle
}: DashboardLayoutProps) {
  // Close sidebar when clicking outside on mobile
  const sidebarRef = React.useRef<HTMLDivElement>(null)
  
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isSidebarOpen && 
        sidebarRef.current && 
        !sidebarRef.current.contains(event.target as Node) &&
        window.innerWidth < 1024 // Only on mobile/tablet
      ) {
        onSidebarToggle?.()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isSidebarOpen, onSidebarToggle])

  // Prevent body scroll when mobile sidebar is open
  React.useEffect(() => {
    if (isSidebarOpen && window.innerWidth < 1024) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isSidebarOpen])

  return (
    <div className="min-h-screen bg-[var(--color-gray-50)]">
      {/* Header */}
      {header && (
        <header className="bg-white border-b border-[var(--color-gray-200)] sticky top-0 z-50">
          {header}
        </header>
      )}

      <div className="flex relative">
        {/* Mobile Overlay */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={onSidebarToggle}
          />
        )}

        {/* Sidebar */}
        {sidebar && (
          <aside 
            ref={sidebarRef}
            className={cn(
              "bg-white border-r border-[var(--color-gray-200)] transition-transform duration-300 ease-in-out z-50",
              // Mobile: fixed positioning, slide in/out
              "fixed top-0 left-0 h-full w-64 transform lg:transform-none",
              // Desktop: always visible, static positioning  
              "lg:sticky lg:top-16 lg:h-[calc(100vh-4rem)] lg:translate-x-0",
              // Mobile transform based on state
              isSidebarOpen ? "translate-x-0" : "-translate-x-full"
            )}
          >
            {/* Mobile sidebar header with close button */}
            <div className="lg:hidden flex items-center justify-between p-4 border-b border-[var(--color-gray-200)]">
              <h2 className="font-semibold text-[var(--color-primary)]">Menu</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={onSidebarToggle}
                className="h-8 w-8"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            {/* Sidebar content */}
            <div className="overflow-y-auto h-full lg:h-auto">
              {sidebar}
            </div>
          </aside>
        )}

        {/* Main Content */}
        <main className={cn(
          "flex-1 min-w-0", // min-w-0 prevents flex items from overflowing
          "p-4 sm:p-6", // Responsive padding
          className
        )}>
          {children}
        </main>
      </div>
    </div>
  )
}