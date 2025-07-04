import * as React from "react"
import { Button } from "@/components/atoms/Button"
import { SearchBar } from "@/components/molecules/SearchBar"
import { 
  BookOpen, 
  Search, 
  Bell, 
  User, 
  Settings, 
  LogOut,
  Menu,
  X
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

export interface HeaderProps {
  onSearch?: (query: string) => void
  onToggleSidebar?: () => void
  isSidebarOpen?: boolean
  user?: {
    name: string
    email: string
    role: string
    avatar?: string
  }
  notifications?: number
  onProfileClick?: () => void
  onSettingsClick?: () => void
  onLogout?: () => void
}

export function Header({
  onSearch,
  onToggleSidebar,
  isSidebarOpen = false,
  user = {
    name: "John Doe",
    email: "john@library.com",
    role: "Administrator"
  },
  notifications = 3,
  onProfileClick,
  onSettingsClick,
  onLogout
}: HeaderProps) {
  const [searchQuery, setSearchQuery] = React.useState("")
  const [showMobileSearch, setShowMobileSearch] = React.useState(false)

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    onSearch?.(query)
  }

  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="flex items-center justify-between px-4 sm:px-6 py-4">
      {/* Left Section */}
      <div className="flex items-center gap-3 sm:gap-4 min-w-0">
        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden flex-shrink-0"
          onClick={onToggleSidebar}
        >
          {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>

        {/* Logo */}
        <div className="flex items-center gap-2 min-w-0">
          <BookOpen className="w-6 h-6 sm:w-8 sm:h-8 text-[var(--color-secondary)] flex-shrink-0" />
          <h1 className="text-lg sm:text-xl font-bold text-[var(--color-primary)] hidden sm:block truncate">
            LibraryMS
          </h1>
        </div>
      </div>

      {/* Center Section - Desktop Search */}
      {!showMobileSearch && (
        <div className="flex-1 max-w-md mx-4 sm:mx-8 hidden md:block">
          <SearchBar
            value={searchQuery}
            onChange={handleSearch}
            placeholder="Search books, members, or records..."
            className="w-full"
          />
        </div>
      )}

      {/* Mobile Search Overlay */}
      {showMobileSearch && (
        <div className="absolute top-0 left-0 right-0 bg-white border-b border-[var(--color-gray-200)] p-4 md:hidden z-10">
          <div className="flex items-center gap-3">
            <SearchBar
              value={searchQuery}
              onChange={handleSearch}
              placeholder="Search books, members..."
              className="flex-1"
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowMobileSearch(false)}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>
      )}

      {/* Right Section */}
      <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
        {/* Mobile Search Button */}
        {!showMobileSearch && (
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setShowMobileSearch(true)}
          >
            <Search className="w-5 h-5" />
          </Button>
        )}

        {/* Notifications */}
        <div className="relative">
          <Button variant="ghost" size="icon">
            <Bell className="w-5 h-5" />
          </Button>
          {notifications > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 px-1 min-w-[1.25rem] h-5 text-xs flex items-center justify-center"
            >
              {notifications > 9 ? "9+" : notifications}
            </Badge>
          )}
        </div>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 sm:h-10 sm:w-10 rounded-full">
              <Avatar className="h-8 w-8 sm:h-10 sm:w-10">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="bg-[var(--color-secondary)] text-white text-xs sm:text-sm">
                  {getUserInitials(user.name)}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none truncate">{user.name}</p>
                <p className="text-xs leading-none text-muted-foreground truncate">
                  {user.email}
                </p>
                <Badge variant="secondary" className="w-fit text-xs mt-1">
                  {user.role}
                </Badge>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onProfileClick}>
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onSettingsClick}>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}