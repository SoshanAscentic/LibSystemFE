import * as React from "react"
import { StatsCard } from "@/components/molecules/StatsCard"
import { RecentActivity, type ActivityItem } from "@/components/molecules/RecentActivity"
import { QuickActions } from "@/components/molecules/QuickActions"
import { BookOpen, Users, RotateCcw, AlertCircle, Clock } from "lucide-react"
import { useDashboardStats } from "../../hooks/useDashboardStats"
import { useUserPermissions } from "../../hooks/useUserPermissions"

export interface DashboardPageProps {
  user?: {
    name: string
    email: string
    role: string
    avatar?: string
  }
  onLogout?: () => void
}

export function DashboardPage({ user }: DashboardPageProps) {
  const stats = useDashboardStats();
  const permissions = useUserPermissions();

  // Use actual user data instead of hardcoded values
  const displayName = user?.name || 'User';
  const userEmail = user?.email || '';
  const userRole = user?.role || 'Member';
  
  // Extract first name for welcome message
  const firstName = displayName.split(' ')[0];

  // Mock recent activities (since no backend endpoint exists)
  const recentActivities: ActivityItem[] = [
    {
      id: '1',
      type: 'book_borrowed',
      title: 'Recent Activity',
      description: 'Activity tracking is coming soon...',
      user: { name: 'System' },
      timestamp: new Date().toISOString(),
      metadata: { bookTitle: 'Feature in development' }
    }
  ];

  // Show loading state while stats are loading
  if (stats.isLoading || permissions.isLoading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--color-primary)] mb-2 truncate">
            Welcome back, {firstName}! 👋
          </h1>
          <p className="text-[var(--color-gray-600)] text-sm sm:text-base">
            Loading your library dashboard...
          </p>
        </div>

        {/* Loading skeleton for stats cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-lg border p-6 animate-pulse">
              <div className="flex items-center justify-between">
                <div>
                  <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-16"></div>
                </div>
                <div className="h-12 w-12 bg-gray-200 rounded-lg"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Show error state if stats failed to load
  if (stats.error) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--color-primary)] mb-2 truncate">
            Welcome back, {firstName}! 👋
          </h1>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-red-900">Failed to Load Dashboard Data</h3>
              <p className="text-sm text-red-700 mt-1">{stats.error}</p>
              <button 
                onClick={() => window.location.reload()}
                className="text-sm font-medium text-red-700 hover:text-red-800 mt-2"
              >
                Try Again →
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Page Header */}
      <div className="min-w-0">
        <h1 className="text-2xl sm:text-3xl font-bold text-[var(--color-primary)] mb-2 truncate">
          Welcome back, {firstName}! 👋
        </h1>
        <p className="text-[var(--color-gray-600)] text-sm sm:text-base">
          Here's what's happening in your library today.
        </p>
      </div>

      {/* Statistics Cards - Now Dynamic! */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
        <StatsCard
          title="Total Books"
          value={stats.totalBooks}
          icon={<BookOpen className="w-5 h-5 sm:w-6 sm:h-6" />}
          change={{ 
            value: stats.totalBooks > 0 ? stats.totalBooks : 0, 
            period: 'in catalog' 
          }}
          color="blue"
        />
        <StatsCard
          title="Available Books"
          value={stats.availableBooks}
          icon={<BookOpen className="w-5 h-5 sm:w-6 sm:h-6" />}
          change={{ 
            value: stats.totalBooks > 0 ? Math.round((stats.availableBooks / stats.totalBooks) * 100) : 0, 
            period: 'available' 
          }}
          color="green"
        />
        {permissions.canViewBorrowing ? (
          <StatsCard
            title="Total Members"
            value={stats.totalMembers}
            icon={<Users className="w-5 h-5 sm:w-6 sm:h-6" />}
            change={{ 
              value: stats.totalMembers > 0 ? stats.totalMembers : 0, 
              period: 'registered' 
            }}
            color="purple"
          />
        ) : (
          <div className="bg-white rounded-lg border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Members</p>
                <p className="text-2xl font-bold text-gray-400">•••</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-gray-400">•••</span>
              <span className="text-gray-500 ml-1">restricted</span>
            </div>
          </div>
        )}
        <StatsCard
          title="Borrowed Books"
          value={stats.borrowedBooks}
          icon={<RotateCcw className="w-5 h-5 sm:w-6 sm:h-6" />}
          change={{ 
            value: stats.totalBooks > 0 ? Math.round((stats.borrowedBooks / stats.totalBooks) * 100) : 0, 
            period: 'of total' 
          }}
          color="orange"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
        {/* Recent Activity - Coming Soon */}
        <div className="xl:col-span-2">
          <div className="bg-white rounded-lg border">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Recent Activity
                <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                  Coming Soon
                </span>
              </h3>
            </div>
            <div className="p-6">
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <Clock className="w-8 h-8 text-gray-400" />
                </div>
                <h4 className="text-lg font-medium text-gray-900 mb-2">Activity Feed Coming Soon</h4>
                <p className="text-gray-500 text-sm max-w-sm mx-auto">
                  We're working on bringing you real-time updates about book borrowing, 
                  returns, and member activities. Stay tuned!
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="xl:col-span-1">
          <QuickActions userRole={userRole} />
        </div>
      </div>

      {/* Overdue Books Alert - Only show for staff */}
      {permissions.canViewBorrowing && (
        <div className="bg-[var(--color-warning-light)] border border-[var(--color-warning)] rounded-lg p-4">
          <div className="flex items-start sm:items-center gap-3">
            <AlertCircle className="w-5 h-5 text-[var(--color-warning)] flex-shrink-0 mt-0.5 sm:mt-0" />
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-[var(--color-gray-900)]">
                Overdue Books Management
                <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-1 rounded-full ml-2">
                  Coming Soon
                </span>
              </h3>
              <p className="text-sm text-[var(--color-gray-600)] mt-1">
                Overdue book tracking and management features are in development.
              </p>
            </div>
            <button 
              className="text-sm font-medium text-[var(--color-warning)] hover:text-[var(--color-warning)] flex-shrink-0"
              disabled
            >
              View Overdue →
            </button>
          </div>
        </div>
      )}
    </div>
  )
}