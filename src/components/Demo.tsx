import { Button } from "@/components/atoms/Button"
import { Input } from "@/components/atoms/Input"
import { FormField } from "@/components/molecules/FormField"
import { SearchBar } from "@/components/molecules/SearchBar"
import { LoadingState } from "@/components/molecules/LoadingState"
import { EmptyState } from "@/components/molecules/EmptyState"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/molecules/Card"
import { BookOpen, Users, BarChart3, Plus, Search, Settings, Bell, Mail, Lock, User, Filter, Database } from "lucide-react"
import { toast } from "sonner"
import React from "react"

export function Demo() {
  const [searchValue, setSearchValue] = React.useState("")
  const [formData, setFormData] = React.useState({
    email: "",
    password: "",
    name: ""
  })
  const [isLoading, setIsLoading] = React.useState(false)

  const showToast = (type: 'success' | 'error' | 'warning' | 'info') => {
    switch (type) {
      case 'success':
        toast.success('Success!', {
          description: 'Your action was completed successfully.',
        })
        break
      case 'error':
        toast.error('Error occurred', {
          description: 'Something went wrong. Please try again.',
        })
        break
      case 'warning':
        toast.warning('Warning', {
          description: 'Please check your input and try again.',
        })
        break
      case 'info':
        toast.info('Information', {
          description: 'Here is some useful information.',
        })
        break
    }
  }

  const handleFormChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }))
  }

  const simulateLoading = () => {
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      showToast('success')
    }, 2000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-gray-50 p-8">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header */}
        <header className="text-center">
          <div className="inline-flex items-center gap-3 mb-4">
            <BookOpen className="w-8 h-8 text-[var(--color-secondary)]" />
            <h1 className="text-4xl font-bold text-[var(--color-primary)]">
              Library Management System
            </h1>
          </div>
          <p className="text-[var(--color-gray-600)] text-lg max-w-2xl mx-auto">
            A modern, comprehensive library management system with enhanced UI components
          </p>
        </header>

        {/* Search Bar Demo */}
        <Card variant="elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              Search Component Demo
            </CardTitle>
            <CardDescription>
              Interactive search bar with debouncing and filter options
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SearchBar
              value={searchValue}
              onChange={setSearchValue}
              onSearch={(value) => showToast('info')}
              placeholder="Search books, authors, or members..."
              showFilterButton
              onFilterClick={() => showToast('info')}
            />
            {searchValue && (
              <p className="mt-2 text-sm text-[var(--color-gray-600)]">
                Current search: "{searchValue}"
              </p>
            )}
          </CardContent>
        </Card>

        {/* Form Components Demo */}
        <Card variant="elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Form Components Demo
            </CardTitle>
            <CardDescription>
              Enhanced form fields with validation states and icons
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-semibold text-[var(--color-gray-800)]">Form Fields</h4>
                <FormField
                  label="Email Address"
                  required
                  type="email"
                  placeholder="Enter your email"
                  leftIcon={<Mail className="w-4 h-4" />}
                  value={formData.email}
                  onChange={handleFormChange('email')}
                  helperText="We'll never share your email"
                />
                
                <FormField
                  label="Password"
                  required
                  type="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleFormChange('password')}
                  error={formData.password && formData.password.length < 6 ? "Password must be at least 6 characters" : undefined}
                />
                
                <FormField
                  label="Full Name"
                  placeholder="Enter your full name"
                  leftIcon={<User className="w-4 h-4" />}
                  value={formData.name}
                  onChange={handleFormChange('name')}
                  success={formData.name.length > 2}
                />
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold text-[var(--color-gray-800)]">Input Variants</h4>
                <Input placeholder="Default input" />
                <Input 
                  placeholder="Input with left icon" 
                  leftIcon={<Search className="w-4 h-4" />} 
                />
                <Input 
                  placeholder="Input with right icon" 
                  rightIcon={<Settings className="w-4 h-4" />} 
                />
                <Input 
                  placeholder="Error state" 
                  error="This field is required"
                />
                <Input 
                  placeholder="Success state" 
                  success
                  helperText="Looks good!"
                />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={simulateLoading} loading={isLoading}>
              {isLoading ? "Processing..." : "Submit Form"}
            </Button>
          </CardFooter>
        </Card>

        {/* Card Variants Demo */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card variant="default" interactive>
            <CardHeader>
              <div className="w-12 h-12 bg-[var(--color-secondary-light)] rounded-lg flex items-center justify-center mb-4">
                <BookOpen className="w-6 h-6 text-[var(--color-secondary)]" />
              </div>
              <CardTitle className="text-lg">Default Card</CardTitle>
              <CardDescription>Standard card with hover effects</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-[var(--color-gray-600)]">
                This is a default card that responds to hover interactions.
              </p>
            </CardContent>
          </Card>

          <Card variant="elevated">
            <CardHeader>
              <div className="w-12 h-12 bg-[var(--color-info-light)] rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-[var(--color-info)]" />
              </div>
              <CardTitle className="text-lg">Elevated Card</CardTitle>
              <CardDescription>Card with enhanced shadow</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-[var(--color-gray-600)]">
                This card has elevated styling with enhanced shadows.
              </p>
            </CardContent>
          </Card>

          <Card variant="outlined" interactive>
            <CardHeader>
              <div className="w-12 h-12 bg-[var(--color-success-light)] rounded-lg flex items-center justify-center mb-4">
                <BarChart3 className="w-6 h-6 text-[var(--color-success)]" />
              </div>
              <CardTitle className="text-lg">Outlined Card</CardTitle>
              <CardDescription>Card with prominent border</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-[var(--color-gray-600)]">
                This card features a prominent outline design.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* State Components Demo */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card variant="elevated">
            <CardHeader>
              <CardTitle>Loading States</CardTitle>
              <CardDescription>Different loading state configurations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <LoadingState message="Loading books..." />
                <div className="border-t pt-4">
                  <Button onClick={() => {
                    // Simulate full screen loading
                    const loadingElement = document.createElement('div')
                    loadingElement.innerHTML = `
                      <div class="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
                        <div class="text-center">
                          <div class="animate-spin h-8 w-8 border-4 border-[var(--color-secondary)] border-t-transparent rounded-full mx-auto"></div>
                          <p class="mt-4 text-[var(--color-gray-600)] text-sm">Full screen loading...</p>
                        </div>
                      </div>
                    `
                    document.body.appendChild(loadingElement)
                    setTimeout(() => {
                      document.body.removeChild(loadingElement)
                      showToast('success')
                    }, 2000)
                  }}>
                    Show Full Screen Loading
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card variant="elevated">
            <CardHeader>
              <CardTitle>Empty States</CardTitle>
              <CardDescription>Empty state with action button</CardDescription>
            </CardHeader>
            <CardContent>
              <EmptyState
                icon={<Database className="w-16 h-16" />}
                title="No books found"
                description="Get started by adding your first book to the library collection."
                action={{
                  label: "Add First Book",
                  onClick: () => showToast('info'),
                  variant: "default"
                }}
              />
            </CardContent>
          </Card>
        </div>

        {/* Button Gallery */}
        <Card variant="elevated">
          <CardHeader>
            <CardTitle>Button Component Gallery</CardTitle>
            <CardDescription>Complete button component with all variants and states</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-semibold mb-3">Variants</h4>
              <div className="flex flex-wrap gap-3">
                <Button>Default</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="link">Link</Button>
                <Button variant="destructive">Destructive</Button>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-3">With Icons</h4>
              <div className="flex flex-wrap gap-3">
                <Button leftIcon={<Plus />}>Add Item</Button>
                <Button variant="outline" rightIcon={<Search />}>Search</Button>
                <Button variant="secondary" leftIcon={<Settings />}>Settings</Button>
                <Button size="icon"><Bell /></Button>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-3">States</h4>
              <div className="flex flex-wrap gap-3">
                <Button loading>Loading</Button>
                <Button disabled>Disabled</Button>
                <Button variant="outline" loading>Processing</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <footer className="text-center pt-8 border-t border-[var(--color-gray-200)]">
          <p className="text-[var(--color-gray-500)]">
            Enhanced UI Components • Built with React 18, TypeScript, Tailwind CSS, and shadcn/ui
          </p>
        </footer>
      </div>
    </div>
  )
}