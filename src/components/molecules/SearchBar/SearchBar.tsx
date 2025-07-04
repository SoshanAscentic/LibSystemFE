import * as React from "react"
import { Input } from "@/components/atoms/Input"
import { Button } from "@/components/atoms/Button"
import { cn } from "@/lib/utils"
import { Search, X, Filter } from "lucide-react"

export interface SearchBarProps {
  value?: string
  onChange?: (value: string) => void
  onSearch?: (value: string) => void
  onClear?: () => void
  placeholder?: string
  className?: string
  showFilterButton?: boolean
  onFilterClick?: () => void
  debounceMs?: number
}

export function SearchBar({
  value = "",
  onChange,
  onSearch,
  onClear,
  placeholder = "Search...",
  className,
  showFilterButton = false,
  onFilterClick,
  debounceMs = 300,
}: SearchBarProps) {
  const [internalValue, setInternalValue] = React.useState(value)
  const debounceTimer = React.useRef<NodeJS.Timeout | undefined>(undefined)

  React.useEffect(() => {
    setInternalValue(value)
  }, [value])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setInternalValue(newValue)
    
    if (onChange) {
      onChange(newValue)
    }

    if (onSearch && debounceMs > 0) {
      clearTimeout(debounceTimer.current)
      debounceTimer.current = setTimeout(() => {
        onSearch(newValue)
      }, debounceMs)
    }
  }

  const handleSearch = () => {
    if (onSearch) {
      onSearch(internalValue)
    }
  }

  const handleClear = () => {
    setInternalValue("")
    if (onChange) {
      onChange("")
    }
    if (onClear) {
      onClear()
    }
    if (onSearch) {
      onSearch("")
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="relative flex-1">
        <Input
          value={internalValue}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          leftIcon={<Search className="h-4 w-4" />}
          rightIcon={
            internalValue && (
              <button
                type="button"
                onClick={handleClear}
                className="text-[var(--color-gray-400)] hover:text-[var(--color-gray-600)] transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            )
          }
        />
      </div>
      
      {showFilterButton && (
        <Button
          variant="outline"
          size="icon"
          onClick={onFilterClick}
          className="shrink-0"
        >
          <Filter className="h-4 w-4" />
        </Button>
      )}
    </div>
  )
}