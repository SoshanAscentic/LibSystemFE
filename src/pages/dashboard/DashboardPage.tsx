// src/pages/dashboard/DashboardPage.tsx
import * as React from "react"
import { StatsCard } from "@/components/molecules/StatsCard"
import { RecentActivity, type ActivityItem } from "@/components/molecules/RecentActivity"
import { QuickActions } from "@/components/molecules/QuickActions"
import { BookOpen, Users, RotateCcw, AlertCircle } from "lucide-react"

export interface DashboardPageProps {
  user?: {
    name: string
    email: string
    role: string
    avatar?: string
  }
  onLogout?: () => void
}

export function DashboardPage({ 
  user = {
    name: "Soshan Wijayarathne",
    email: "john@library.com", 
    role: "Administrator"
  }
}: DashboardPageProps) {
  // Sample data - in a real app, this would come from API
  const stats = {
    totalBooks: 2847,
    availableBooks: 2156,
    totalMembers: 1234,
    activeLoans: 691
  }

  const recentActivities: ActivityItem[] = [
    {
      id: '1',
      type: 'book_borrowed',
      title: 'Book Borrowed',
      description: '"The Great Gatsby" was borrowed by Sarah Wilson',
      user: { name: 'Sarah Wilson' },
      timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      metadata: { bookTitle: 'The Great Gatsby' }
    },
    {
      id: '2', 
      type: 'book_returned',
      title: 'Book Returned',
      description: '"To Kill a Mockingbird" was returned by Mike Johnson',
      user: { name: 'Mike Johnson' },
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      metadata: { bookTitle: 'To Kill a Mockingbird' }
    },
    {
      id: '3',
      type: 'book_added',
      title: 'New Book Added',
      description: '"1984" by George Orwell was added to the catalog',
      user: { name: 'Admin User' },
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
      metadata: { bookTitle: '1984' }
    },
    {
      id: '4',
      type: 'member_added',
      title: 'New Member',
      description: 'Emma Davis joined as a new library member',
      user: { name: 'Reception Staff' },
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
      metadata: { memberName: 'Emma Davis' }
    },
    {
      id: '5',
      type: 'book_borrowed',
      title: 'Book Borrowed',
      description: '"Pride and Prejudice" was borrowed by Alex Thompson',
      user: { name: 'Alex Thompson' },
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
      metadata: { bookTitle: 'Pride and Prejudice' }
    }
  ]

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Page Header */}
      <div className="min-w-0">
        <h1 className="text-2xl sm:text-3xl font-bold text-[var(--color-primary)] mb-2 truncate">
          Welcome back, {user.name.split(' ')[0]}! 👋
        </h1>
        <p className="text-[var(--color-gray-600)] text-sm sm:text-base">
          Here's what's happening in your library today.
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
        <StatsCard
          title="Total Books"
          value={stats.totalBooks}
          icon={<BookOpen className="w-5 h-5 sm:w-6 sm:h-6" />}
          change={{ value: 12, period: 'last month' }}
          color="blue"
        />
        <StatsCard
          title="Available Books"
          value={stats.availableBooks}
          icon={<BookOpen className="w-5 h-5 sm:w-6 sm:h-6" />}
          change={{ value: -3, period: 'last week' }}
          color="green"
        />
        <StatsCard
          title="Total Members"
          value={stats.totalMembers}
          icon={<Users className="w-5 h-5 sm:w-6 sm:h-6" />}
          change={{ value: 8, period: 'last month' }}
          color="purple"
        />
        <StatsCard
          title="Active Loans"
          value={stats.activeLoans}
          icon={<RotateCcw className="w-5 h-5 sm:w-6 sm:h-6" />}
          change={{ value: 5, period: 'yesterday' }}
          color="orange"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
        {/* Recent Activity */}
        <div className="xl:col-span-2">
          <RecentActivity activities={recentActivities} maxItems={5} />
        </div>

        {/* Quick Actions */}
        <div className="xl:col-span-1">
          <QuickActions userRole={user.role} />
        </div>
      </div>

      {/* Overdue Books Alert */}
      <div className="bg-[var(--color-warning-light)] border border-[var(--color-warning)] rounded-lg p-4">
        <div className="flex items-start sm:items-center gap-3">
          <AlertCircle className="w-5 h-5 text-[var(--color-warning)] flex-shrink-0 mt-0.5 sm:mt-0" />
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-[var(--color-gray-900)]">
              Overdue Books Alert
            </h3>
            <p className="text-sm text-[var(--color-gray-600)] mt-1">
              There are 23 overdue books that need attention. Click here to view and manage them.
            </p>
          </div>
          <button className="text-sm font-medium text-[var(--color-warning)] hover:text-[var(--color-warning)] flex-shrink-0">
            View Overdue →
          </button>
        </div>
      </div>
    </div>
  )
}