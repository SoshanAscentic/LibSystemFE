import * as React from "react"
import { Card, CardContent } from "@/components/molecules/Card"
import { cn } from "@/lib/utils"
import { TrendingUp, TrendingDown } from "lucide-react"

export interface StatsCardProps {
  title: string
  value: string | number
  icon: React.ReactNode
  change?: {
    value: number
    period: string
  }
  color?: 'blue' | 'green' | 'orange' | 'red' | 'purple'
  className?: string
}

const colorVariants = {
  blue: {
    bg: 'bg-blue-50',
    icon: 'text-blue-600',
    ring: 'ring-blue-100'
  },
  green: {
    bg: 'bg-green-50',
    icon: 'text-green-600', 
    ring: 'ring-green-100'
  },
  orange: {
    bg: 'bg-orange-50',
    icon: 'text-orange-600',
    ring: 'ring-orange-100'
  },
  red: {
    bg: 'bg-red-50',
    icon: 'text-red-600',
    ring: 'ring-red-100'
  },
  purple: {
    bg: 'bg-purple-50',
    icon: 'text-purple-600',
    ring: 'ring-purple-100'
  }
}

export function StatsCard({
  title,
  value,
  icon,
  change,
  color = 'blue',
  className
}: StatsCardProps) {
  const colors = colorVariants[color]
  const isPositiveChange = change && change.value > 0
  const isNegativeChange = change && change.value < 0

  return (
    <Card className={cn("hover:shadow-md transition-shadow", className)}>
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-[var(--color-gray-600)] mb-1 truncate">
              {title}
            </p>
            <p className="text-2xl sm:text-3xl font-bold text-[var(--color-gray-900)] mb-2 truncate">
              {typeof value === 'number' ? value.toLocaleString() : value}
            </p>
            
            {change && (
              <div className="flex items-center gap-1 min-w-0">
                {isPositiveChange && (
                  <>
                    <TrendingUp className="w-4 h-4 text-green-600 flex-shrink-0" />
                    <span className="text-sm text-green-600 font-medium">
                      +{Math.abs(change.value)}%
                    </span>
                  </>
                )}
                {isNegativeChange && (
                  <>
                    <TrendingDown className="w-4 h-4 text-red-600 flex-shrink-0" />
                    <span className="text-sm text-red-600 font-medium">
                      -{Math.abs(change.value)}%
                    </span>
                  </>
                )}
                {change.value === 0 && (
                  <span className="text-sm text-[var(--color-gray-500)] font-medium">
                    0%
                  </span>
                )}
                <span className="text-sm text-[var(--color-gray-500)] truncate">
                  vs {change.period}
                </span>
              </div>
            )}
          </div>
          
          <div className={cn(
            "w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center ring-4 flex-shrink-0",
            colors.bg,
            colors.ring
          )}>
            <div className={colors.icon}>
              {icon}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}