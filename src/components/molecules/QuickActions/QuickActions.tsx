import * as React from "react"
import { Button } from "@/components/atoms/Button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/molecules/Card"
import { BookOpen, Users, RotateCcw, Plus, Search, BarChart3, UserPlus } from "lucide-react"

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
  onAddBook,
  onBorrowBook,
  onReturnBook,
  onAddMember,
  onSearchBooks,
  onViewAnalytics,
  className
}: QuickActionsProps) {
  
  const actions: QuickAction[] = [
    {
      id: 'borrow-book',
      label: 'Borrow Book',
      description: 'Check out a book from the library',
      icon: <RotateCcw className="w-5 h-5 flex-shrink-0" />,
      variant: 'default',
      onClick: () => onBorrowBook?.()
    },
    {
      id: 'return-book', 
      label: 'Return Book',
      description: 'Return a borrowed book',
      icon: <RotateCcw className="w-5 h-5 flex-shrink-0" />,
      variant: 'outline',
      onClick: () => onReturnBook?.()
    },
    {
      id: 'search-books',
      label: 'Search Books',
      description: 'Find books in the catalog',
      icon: <Search className="w-5 h-5 flex-shrink-0" />,
      variant: 'secondary',
      onClick: () => onSearchBooks?.()
    },
    {
      id: 'add-book',
      label: 'Add Book',
      description: 'Add a new book to the catalog',
      icon: <Plus className="w-5 h-5 flex-shrink-0" />,
      variant: 'default',
      onClick: () => onAddBook?.(),
      roles: ['ManagementStaff', 'Administrator']
    },
    {
      id: 'add-member',
      label: 'Add Member',
      description: 'Register a new library member',
      icon: <UserPlus className="w-5 h-5 flex-shrink-0" />,
      variant: 'outline',
      onClick: () => onAddMember?.(),
      roles: ['Administrator']
    },
    {
      id: 'view-analytics',
      label: 'View Analytics',
      description: 'Check library statistics and reports',
      icon: <BarChart3 className="w-5 h-5 flex-shrink-0" />,
      variant: 'secondary',
      onClick: () => onViewAnalytics?.(),
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