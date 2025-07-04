import { Button } from "@/components/atoms/Button"
import { BookOpen, Users, BarChart3, Plus, Search, Settings, Bell } from "lucide-react"
import { toast } from "sonner"

export function Demo() {
  const showToast = (type: 'success' | 'error' | 'warning' | 'info') => {
    switch (type) {
      case 'success':
        toast.success('Success!', {
          description: 'Your action was completed successfully.',
        })
        break
      case 'error':
        toast.error('Error occurred', {
          description: 'Something went wrong. Please try again.',
        })
        break
      case 'warning':
        toast.warning('Warning', {
          description: 'Please check your input and try again.',
        })
        break
      case 'info':
        toast.info('Information', {
          description: 'Here is some useful information.',
        })
        break
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-4">
            <BookOpen className="w-8 h-8 text-[var(--color-secondary)]" />
            <h1 className="text-4xl font-bold text-[var(--color-primary)]">
              Library Management System
            </h1>
          </div>
          <p className="text-[var(--color-gray-600)] text-lg max-w-2xl mx-auto">
            A modern, comprehensive library management system built with React, TypeScript, and Tailwind CSS
          </p>
        </header>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-[var(--color-gray-200)] hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-[var(--color-secondary-light)] rounded-lg flex items-center justify-center mb-4">
              <BookOpen className="w-6 h-6 text-[var(--color-secondary)]" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Book Management</h3>
            <p className="text-[var(--color-gray-600)] mb-4">
              Comprehensive book catalog with advanced search, categorization, and availability tracking.
            </p>
            <Button variant="outline" size="sm" onClick={() => showToast('info')}>
              Explore Books
            </Button>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-[var(--color-gray-200)] hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-[var(--color-info-light)] rounded-lg flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-[var(--color-info)]" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Member Management</h3>
            <p className="text-[var(--color-gray-600)] mb-4">
              Manage library members with role-based permissions and borrowing history.
            </p>
            <Button variant="outline" size="sm" onClick={() => showToast('success')}>
              View Members
            </Button>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-[var(--color-gray-200)] hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-[var(--color-success-light)] rounded-lg flex items-center justify-center mb-4">
              <BarChart3 className="w-6 h-6 text-[var(--color-success)]" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Analytics & Reports</h3>
            <p className="text-[var(--color-gray-600)] mb-4">
              Track borrowing patterns, popular books, and generate comprehensive reports.
            </p>
            <Button variant="outline" size="sm" onClick={() => showToast('warning')}>
              View Analytics
            </Button>
          </div>
        </div>

        {/* Action Buttons Demo */}
        <div className="bg-white rounded-xl p-8 shadow-sm border border-[var(--color-gray-200)] mb-8">
          <h2 className="text-2xl font-semibold mb-6">Quick Actions</h2>
          <div className="flex flex-wrap gap-4">
            <Button leftIcon={<Plus />} onClick={() => showToast('success')}>
              Add New Book
            </Button>
            <Button variant="outline" leftIcon={<Search />} onClick={() => showToast('info')}>
              Search Library
            </Button>
            <Button variant="secondary" leftIcon={<Users />} onClick={() => showToast('info')}>
              Manage Members
            </Button>
            <Button variant="ghost" leftIcon={<Settings />} onClick={() => showToast('warning')}>
              Settings
            </Button>
            <Button variant="destructive" onClick={() => showToast('error')}>
              System Admin
            </Button>
          </div>
        </div>

        {/* Button States & Toasts Demo */}
        <div className="bg-white rounded-xl p-8 shadow-sm border border-[var(--color-gray-200)] mb-8">
          <h2 className="text-2xl font-semibold mb-6">Button States & Variants</h2>
          <div className="space-y-4">
            <div className="flex flex-wrap gap-4">
              <Button>Default</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="link">Link</Button>
            </div>
            <div className="flex flex-wrap gap-4">
              <Button size="sm">Small</Button>
              <Button>Default Size</Button>
              <Button size="lg">Large</Button>
              <Button size="icon">
                <Settings />
              </Button>
            </div>
            <div className="flex flex-wrap gap-4">
              <Button loading>Loading...</Button>
              <Button disabled>Disabled</Button>
              <Button variant="outline" loading>
                Processing
              </Button>
            </div>
          </div>
        </div>

        {/* Toast Demo Section */}
        <div className="bg-white rounded-xl p-8 shadow-sm border border-[var(--color-gray-200)]">
          <h2 className="text-2xl font-semibold mb-6">Toast Notifications Demo</h2>
          <p className="text-[var(--color-gray-600)] mb-6">
            Click the buttons below to see different types of toast notifications using Sonner.
          </p>
          <div className="flex flex-wrap gap-4">
            <Button 
              variant="default" 
              leftIcon={<Bell />}
              onClick={() => showToast('success')}
            >
              Success Toast
            </Button>
            <Button 
              variant="destructive" 
              leftIcon={<Bell />}
              onClick={() => showToast('error')}
            >
              Error Toast
            </Button>
            <Button 
              variant="outline" 
              leftIcon={<Bell />}
              onClick={() => showToast('warning')}
              className="border-[var(--color-warning)] text-[var(--color-warning)] hover:bg-[var(--color-warning-light)]"
            >
              Warning Toast
            </Button>
            <Button 
              variant="secondary" 
              leftIcon={<Bell />}
              onClick={() => showToast('info')}
            >
              Info Toast
            </Button>
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center mt-12 pt-8 border-t border-[var(--color-gray-200)]">
          <p className="text-[var(--color-gray-500)]">
            Built with React 18, TypeScript, Tailwind CSS, shadcn/ui, and Sonner
          </p>
        </footer>
      </div>
    </div>
  )
}