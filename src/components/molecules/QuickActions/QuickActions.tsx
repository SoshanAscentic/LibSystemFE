// src/components/molecules/QuickActions.tsx - Fixed with proper navigation
import * as React from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { BookOpen, Users, RotateCcw, Plus, Search, BarChart3, UserPlus, ArrowLeft, ArrowRight } from "lucide-react"
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
    console.log('QuickActions: Navigating to add book page');
    navigate('/books/add')
  }

  const handleSearchBooks = () => {
    console.log('QuickActions: Navigating to books page');
    navigate('/books')
  }

  const handleBorrowBook = () => {
    console.log('QuickActions: Navigating to borrow book page');
    navigate('/borrowing/borrow')
  }

  const handleReturnBook = () => {
    console.log('QuickActions: Navigating to return book page');
    navigate('/borrowing/return')
  }

  const handleAddMember = () => {
    console.log('QuickActions: Navigating to add member page');
    navigate('/members/add')
  }

  const handleViewMembers = () => {
    console.log('QuickActions: Navigating to members page');
    navigate('/members')
  }

  const handleViewAnalytics = () => {
    // TODO: Navigate to analytics page when implemented
    toast.info('Analytics Dashboard', { 
      description: 'Analytics feature coming soon in Phase 8!'
    })
  }
  
  const actions: QuickAction[] = [
    {
      id: 'search-books',
      label: 'Browse Books',
      description: 'Search and explore our book collection',
      icon: <BookOpen className="w-5 h-5 flex-shrink-0" />,
      variant: 'default',
      onClick: handleSearchBooks
    },
    {
      id: 'add-book',
      label: 'Add Book',
      description: 'Add a new book to the library',
      icon: <Plus className="w-5 h-5 flex-shrink-0" />,
      variant: 'outline',
      onClick: handleAddBook,
      roles: ['ManagementStaff', 'Administrator']
    },
    {
      id: 'borrow-book',
      label: 'Borrow Book',
      description: 'Borrow a book from the library',
      icon: <ArrowRight className="w-5 h-5 flex-shrink-0" />,
      variant: 'secondary',
      onClick: handleBorrowBook
    },
    {
      id: 'return-book', 
      label: 'Return Book',
      description: 'Return a borrowed book',
      icon: <ArrowLeft className="w-5 h-5 flex-shrink-0" />,
      variant: 'outline',
      onClick: handleReturnBook
    },
    {
      id: 'view-members',
      label: 'View Members',
      description: 'Browse library members',
      icon: <Users className="w-5 h-5 flex-shrink-0" />,
      variant: 'secondary',
      onClick: handleViewMembers,
      roles: ['MinorStaff', 'ManagementStaff', 'Administrator']
    },
    {
      id: 'add-member',
      label: 'Add Member',
      description: 'Register a new library member',
      icon: <UserPlus className="w-5 h-5 flex-shrink-0" />,
      variant: 'outline',
      onClick: handleAddMember,
      roles: ['Administrator']
    },
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
          <RotateCcw className="w-5 h-5 flex-shrink-0" />
          <span className="truncate">Quick Actions</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2 gap-3">
          {availableActions.map((action) => (
            <Button
              key={action.id}
              variant={action.variant}
              className="h-auto p-4 flex flex-col items-start text-left gap-2 min-w-0 hover:scale-105 transition-transform"
              onClick={action.onClick}
              disabled={action.disabled}
            >
              <div className="flex items-center gap-2 w-full min-w-0">
                {action.icon}
                <span className="font-medium truncate">{action.label}</span>
              </div>
              {action.description && (
                <span className="text-xs text-muted-foreground text-left leading-relaxed">
                  {action.description}
                </span>
              )}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}