import * as React from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { Button } from "@/components/atoms/Button"
import { cn } from "@/lib/utils"
import {
  Home,
  BookOpen,
  Users,
  RotateCcw,
  BarChart3,
  Settings,
  UserCog,
  ChevronDown,
  ChevronRight
} from "lucide-react"
import { toast } from "sonner"

export interface SidebarProps {
  currentPath?: string
  onNavigate?: (path: string) => void
  userRole?: string
  className?: string
  onItemClick?: () => void
}

interface MenuItem {
  id: string
  label: string
  icon: React.ReactNode
  path: string
  roles?: string[]
  children?: MenuItem[]
  implemented?: boolean
}

const menuItems: MenuItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: <Home className="w-5 h-5 flex-shrink-0 text-black" />,
    path: '/dashboard',
    implemented: true
  },
  {
    id: 'books',
    label: 'Books',
    icon: <BookOpen className="w-5 h-5 flex-shrink-0 text-black" />,
    path: '/books',
    implemented: true,
    children: [
      { 
        id: 'all-books', 
        label: 'All Books', 
        icon: <BookOpen className="w-4 h-4 flex-shrink-0 text-black" />, 
        path: '/books',
        implemented: true
      },
      { 
        id: 'add-book', 
        label: 'Add Book', 
        icon: <BookOpen className="w-4 h-4 flex-shrink-0 text-black" />, 
        path: '/books/add', 
        roles: ['ManagementStaff', 'Administrator'],
        implemented: true
      }
    ]
  },
  {
    id: 'members',
    label: 'Members',
    icon: <Users className="w-5 h-5 flex-shrink-0 text-black" />,
    path: '/members',
    roles: ['MinorStaff', 'ManagementStaff', 'Administrator'],
    implemented: true, // NOW IMPLEMENTED!
    children: [
      { 
        id: 'all-members', 
        label: 'All Members', 
        icon: <Users className="w-4 h-4 flex-shrink-0 text-black" />, 
        path: '/members',
        implemented: true // NOW IMPLEMENTED!
      },
      { 
        id: 'add-member', 
        label: 'Add Member', 
        icon: <Users className="w-4 h-4 flex-shrink-0 text-black" />, 
        path: '/members/add', 
        roles: ['Administrator'],
        implemented: true // NOW IMPLEMENTED!
      }
    ]
  },
  {
    id: 'borrowing',
    label: 'Borrowing',
    icon: <RotateCcw className="w-5 h-5 flex-shrink-0 text-black" />,
    path: '/borrowing',
    implemented: false,
    children: [
      { 
        id: 'active-loans', 
        label: 'Active Loans', 
        icon: <RotateCcw className="w-4 h-4 flex-shrink-0 text-black" />, 
        path: '/borrowing/active',
        implemented: false
      },
      { 
        id: 'borrow-book', 
        label: 'Borrow Book', 
        icon: <RotateCcw className="w-4 h-4 flex-shrink-0 text-black" />, 
        path: '/borrowing/borrow',
        implemented: false
      },
      { 
        id: 'return-book', 
        label: 'Return Book', 
        icon: <RotateCcw className="w-4 h-4 flex-shrink-0 text-black" />, 
        path: '/borrowing/return',
        implemented: false
      },
      { 
        id: 'history', 
        label: 'History', 
        icon: <RotateCcw className="w-4 h-4 flex-shrink-0 text-black" />, 
        path: '/borrowing/history',
        implemented: false
      }
    ]
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: <BarChart3 className="w-5 h-5 flex-shrink-0 text-black" />,
    path: '/analytics',
    roles: ['MinorStaff', 'ManagementStaff', 'Administrator'],
    implemented: false
  },
  {
    id: 'admin',
    label: 'Administration',
    icon: <UserCog className="w-5 h-5 flex-shrink-0 text-black" />,
    path: '/admin',
    roles: ['Administrator'],
    implemented: false,
    children: [
      { 
        id: 'users', 
        label: 'User Management', 
        icon: <UserCog className="w-4 h-4 flex-shrink-0 text-black" />, 
        path: '/admin/users',
        implemented: false
      },
      { 
        id: 'system', 
        label: 'System Settings', 
        icon: <Settings className="w-4 h-4 flex-shrink-0 text-black" />, 
        path: '/admin/settings',
        implemented: false
      }
    ]
  }
]

export function Sidebar({
  userRole = 'Member',
  className,
  onItemClick
}: SidebarProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const [expandedItems, setExpandedItems] = React.useState<string[]>(['books', 'members', 'borrowing'])

  const hasPermission = (roles?: string[]) => {
    if (!roles || roles.length === 0) return true
    return roles.includes(userRole)
  }

  const toggleExpanded = (itemId: string) => {
    setExpandedItems(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    )
  }

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/')
  }

  const handleNavigation = (path: string, implemented?: boolean, label?: string) => {
    if (implemented) {
      navigate(path)
      onItemClick?.()
    } else {
      const featurePhase = getFeaturePhase(path)
      toast.info(`${label} feature coming in ${featurePhase}!`)
    }
  }

  const getFeaturePhase = (path: string): string => {
    if (path.startsWith('/borrowing')) return 'Phase 6'
    if (path.startsWith('/analytics')) return 'Phase 8'
    if (path.startsWith('/admin')) return 'Phase 7'
    return 'a future update'
  }

  const renderMenuItem = (item: MenuItem, level = 0) => {
    if (!hasPermission(item.roles)) return null

    const isExpanded = expandedItems.includes(item.id)
    const hasChildren = item.children && item.children.length > 0
    const isItemActive = isActive(item.path)

    return (
      <div key={item.id}>
        <Button
          variant={isItemActive ? "secondary" : "ghost"}
          className={cn(
            "w-full justify-start gap-3 text-left h-10 px-3",
            level > 0 && "ml-6 w-auto",
            !isItemActive && "text-black",
            isItemActive && "bg-[var(--color-secondary-light)] text-[var(--color-secondary)] border-r-2 border-[var(--color-secondary)]"
          )}
          onClick={() => {
            if (hasChildren) {
              toggleExpanded(item.id)
            } else {
              handleNavigation(item.path, item.implemented, item.label)
            }
          }}
        >
          <div className="flex items-center gap-3 min-w-0 flex-1">
            {item.icon}
            <span className="truncate">{item.label}</span>
            {!item.implemented && level === 0 && (
              <span className="text-xs bg-orange-100 text-orange-600 px-1 rounded">
                Soon
              </span>
            )}
          </div>
          {hasChildren && (
            <div className="flex-shrink-0">
              {isExpanded ?
                <ChevronDown className="w-4 h-4 text-black" /> :
                <ChevronRight className="w-4 h-4 text-black" />
              }
            </div>
          )}
        </Button>

        {hasChildren && isExpanded && (
          <div className="mt-1 space-y-1">
            {item.children!.map(child => renderMenuItem(child, level + 1))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={cn("p-4 space-y-2 h-full", className)}>
      <div className="space-y-1">
        {menuItems.map(item => renderMenuItem(item))}
      </div>

      <div className="pt-4 mt-6 border-t border-[var(--color-gray-200)]">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 px-3 text-black"
          onClick={() => handleNavigation('/profile', false, 'Profile & Settings')}
        >
          <Settings className="w-5 h-5 flex-shrink-0 text-black" />
          <span className="truncate">Profile & Settings</span>
          <span className="text-xs bg-orange-100 text-orange-600 px-1 rounded">
            Soon
          </span>
        </Button>
      </div>
    </div>
  )
}