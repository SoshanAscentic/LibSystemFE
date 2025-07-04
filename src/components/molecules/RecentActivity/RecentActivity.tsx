import * as React from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/molecules/Card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { formatDateTime } from "@/lib/utils"
import { BookOpen, Users, RotateCcw, UserPlus } from "lucide-react"

export interface ActivityItem {
  id: string
  type: 'book_borrowed' | 'book_returned' | 'book_added' | 'member_added'
  title: string
  description: string
  user: {
    name: string
    avatar?: string
  }
  timestamp: string
  metadata?: {
    bookTitle?: string
    memberName?: string
  }
}

export interface RecentActivityProps {
  activities: ActivityItem[]
  maxItems?: number
  className?: string
}

const activityIcons = {
  book_borrowed: <RotateCcw className="w-4 h-4 text-blue-600" />,
  book_returned: <RotateCcw className="w-4 h-4 text-green-600" />,
  book_added: <BookOpen className="w-4 h-4 text-purple-600" />,
  member_added: <UserPlus className="w-4 h-4 text-orange-600" />
}

const activityColors = {
  book_borrowed: 'blue',
  book_returned: 'green', 
  book_added: 'purple',
  member_added: 'orange'
}

export function RecentActivity({ 
  activities, 
  maxItems = 5,
  className 
}: RecentActivityProps) {
  const displayActivities = activities.slice(0, maxItems)

  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RotateCcw className="w-5 h-5" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        {displayActivities.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-[var(--color-gray-100)] rounded-full flex items-center justify-center mx-auto mb-3">
              <RotateCcw className="w-6 h-6 text-[var(--color-gray-400)]" />
            </div>
            <p className="text-[var(--color-gray-500)] text-sm">No recent activity</p>
          </div>
        ) : (
          <div className="space-y-4">
            {displayActivities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3">
                <div className="w-8 h-8 bg-[var(--color-gray-100)] rounded-full flex items-center justify-center flex-shrink-0">
                  {activityIcons[activity.type]}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-medium text-[var(--color-gray-900)] truncate">
                      {activity.title}
                    </p>
                    <Badge variant="secondary" className="text-xs">
                      {activity.type.replace('_', ' ')}
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-[var(--color-gray-600)] mb-2">
                    {activity.description}
                  </p>
                  
                  <div className="flex items-center gap-2">
                    <Avatar className="w-4 h-4">
                      <AvatarImage src={activity.user.avatar} alt={activity.user.name} />
                      <AvatarFallback className="text-xs bg-[var(--color-secondary)] text-white">
                        {getUserInitials(activity.user.name)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs text-[var(--color-gray-500)]">
                      {activity.user.name}
                    </span>
                    <span className="text-xs text-[var(--color-gray-400)]">•</span>
                    <span className="text-xs text-[var(--color-gray-500)]">
                      {formatDateTime(activity.timestamp)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
            
            {activities.length > maxItems && (
              <div className="text-center pt-4">
                <button className="text-sm text-[var(--color-secondary)] hover:text-[var(--color-secondary-dark)] font-medium">
                  View all activity ({activities.length - maxItems} more)
                </button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}