import * as React from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/atoms/Button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/molecules/Card"
import { BookOpen, Users, RotateCcw, Plus, Search, BarChart3, UserPlus } from "lucide-react"
import { toast } from "sonner"

export interface QuickAction {
  id: string
  label: string
  description: string
  icon: React.ReactNode
  variant?: 'default' | 'outline' | 'secondary'
  onClick: () => void
  disabled?: boolean
  roles?: string[]
}

export interface QuickActionsProps {
  userRole?: string
  onAddBook?: () => void
  onBorrowBook?: () => void
  onReturnBook?: () => void
  onAddMember?: () => void
  onSearchBooks?: () => void
  onViewAnalytics?: () => void
  className?: string
}

export function QuickActions({
  userRole = 'Member',
  className
}: QuickActionsProps) {
  const navigate = useNavigate()

  const handleAddBook = () => {
    navigate('/books/add')
  }

  const handleSearchBooks = () => {
    navigate('/books')
  }

  const handleBorrowBook = () => {
    // TODO: Navigate to borrowing page when implemented
    toast.info('Borrow Book feature coming in Phase 6!')
  }

  const handleReturnBook = () => {
    // TODO: Navigate to return page when implemented  
    toast.info('Return Book feature coming in Phase 6!')
  }

  const handleAddMember = () => {
    // TODO: Navigate to add member page when implemented
    toast.info('Add Member feature coming in Phase 5!')
  }

  const handleViewAnalytics = () => {
    // TODO: Navigate to analytics page when implemented
    toast.info('Analytics feature coming in Phase 8!')
  }
  
  const actions: QuickAction[] = [
    {
      id: 'search-books',
      label: 'Browse Books',
      description: '',
      icon: <Search className="w-5 h-5 flex-shrink-0" />,
      variant: 'default',
      onClick: handleSearchBooks
    },
    {
      id: 'add-book',
      label: 'Add Book',
      description: '',
      icon: <Plus className="w-5 h-5 flex-shrink-0" />,
      variant: 'outline',
      onClick: handleAddBook,
      roles: ['ManagementStaff', 'Administrator']
    },
    {
      id: 'borrow-book',
      label: 'Borrow Book',
      description: '',
      icon: <RotateCcw className="w-5 h-5 flex-shrink-0" />,
      variant: 'secondary',
      onClick: handleBorrowBook
    },
    {
      id: 'return-book', 
      label: 'Return Book',
      description: '',
      icon: <RotateCcw className="w-5 h-5 flex-shrink-0" />,
      variant: 'outline',
      onClick: handleReturnBook
    },
    {
      id: 'add-member',
      label: 'Add Member',
      description: '',
      icon: <UserPlus className="w-5 h-5 flex-shrink-0" />,
      variant: 'secondary',
      onClick: handleAddMember,
      roles: ['Administrator']
    },
    {
      id: 'view-analytics',
      label: 'View Analytics',
      description: '',
      icon: <BarChart3 className="w-5 h-5 flex-shrink-0" />,
      variant: 'outline',
      onClick: handleViewAnalytics,
      roles: ['MinorStaff', 'ManagementStaff', 'Administrator']
    }
  ]

  const hasPermission = (roles?: string[]) => {
    if (!roles || roles.length === 0) return true
    return roles.includes(userRole)
  }

  const availableActions = actions.filter(action => hasPermission(action.roles))

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="w-5 h-5 flex-shrink-0" />
          <span className="truncate">Quick Actions</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2 gap-3">
          {availableActions.map((action) => (
            <Button
              key={action.id}
              variant={action.variant}
              className="h-auto p-4 flex flex-col items-start text-left gap-2 min-w-0"
              onClick={action.onClick}
              disabled={action.disabled}
            >
              <div className="flex items-center gap-2 w-full min-w-0">
                {action.icon}
                <span className="font-medium truncate">{action.label}</span>
              </div>
              <span className="text-xs text-muted-foreground text-left leading-relaxed">
                {action.description}
              </span>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}