import * as React from "react"
import { BookOpen } from "lucide-react"
import { cn } from "@/lib/utils"

export interface AuthLayoutProps {
  children: React.ReactNode
  title: string
  subtitle?: string
  className?: string
}

export function AuthLayout({ children, title, subtitle, className }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[var(--color-secondary)] to-[var(--color-secondary-dark)] p-12 items-center justify-center">
        <div className="max-w-md text-white">
          <div className="flex items-center gap-3 mb-8">
            <BookOpen className="w-12 h-12" />
            <h1 className="text-3xl font-bold">LibraryMS</h1>
          </div>
          
          <h2 className="text-4xl font-bold mb-6 leading-tight">
            Welcome to the Future of Library Management
          </h2>
          
          <p className="text-xl text-white/90 mb-8">
            Streamline your library operations with our comprehensive management system. 
            Track books, manage members, and handle borrowing with ease.
          </p>
          
          <div className="space-y-4 text-white/80">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-white rounded-full"></div>
              <span>Advanced book catalog management</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-white rounded-full"></div>
              <span>Member management with role-based access</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-white rounded-full"></div>
              <span>Real-time borrowing and return tracking</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-white rounded-full"></div>
              <span>Comprehensive analytics and reporting</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gradient-to-br from-white to-gray-50">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center gap-2 mb-4">
              <BookOpen className="w-8 h-8 text-[var(--color-secondary)]" />
              <h1 className="text-2xl font-bold text-[var(--color-primary)]">LibraryMS</h1>
            </div>
          </div>

          {/* Form Header */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-[var(--color-primary)] mb-2">
              {title}
            </h2>
            {subtitle && (
              <p className="text-[var(--color-gray-600)]">{subtitle}</p>
            )}
          </div>

          {/* Form Content */}
          <div className={cn("space-y-6", className)}>
            {children}
          </div>

          {/* Footer */}
          <div className="mt-8 text-center text-sm text-[var(--color-gray-500)]">
            <p>© 2024 LibraryMS. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  )
}