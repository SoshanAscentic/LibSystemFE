import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from 'sonner';

// Container and DI
import { ContainerProvider } from './shared/providers/ContainerProvider';
import { getContainer } from './shared/container/containerSetup';
import { configureDependencies } from './infrastructure/container/DependencyConfiguration';

// Layout Components
import { DashboardLayout } from './components/templates/DashboardLayout';
import { Header } from './components/organisms/Header';
import { Sidebar } from './components/organisms/Sidebar';

// Page Components (New Container Pattern)
import { DashboardPage } from './pages/dashboard/DashboardPage';
import { BooksPageContainer } from './presentation/components/BooksPageContainer';
import { BookDetailsPageContainer } from './presentation/components/BookDetailsPageContainer';
import { CreateBookPageContainer } from './presentation/components/CreateBookPageContainer';
import { EditBookPageContainer } from './presentation/components/EditBookPageContainer';

// Auth Components
import { AuthDemo } from './components/AuthDemo';

// Create React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

// Auth utility functions
const getStoredAuthToken = (): string | null => {
  return localStorage.getItem('authToken');
};

const getStoredUser = () => {
  try {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  } catch {
    return null;
  }
};

const setAuthData = (token: string, user: any) => {
  localStorage.setItem('authToken', token);
  localStorage.setItem('user', JSON.stringify(user));
};

const clearAuthData = () => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('user');
};

// Main App Layout Component
function AppLayout({ children }: { children: React.ReactNode }) {
  const [user] = useState(() => getStoredUser() || {
    name: "Soshan Wijayarathne",
    email: "admin@library.com",
    role: "Administrator"
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    clearAuthData();
    // Force page reload to reset authentication state
    window.location.href = '/';
  };

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  const handleSidebarToggle = () => {
    setIsSidebarOpen(prev => !prev);
  };

  const handleSidebarItemClick = () => {
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  };

  const handleSearch = (query: string) => {
    console.log('Search:', query);
  };

  return (
    <DashboardLayout
      isSidebarOpen={isSidebarOpen}
      onSidebarToggle={handleSidebarToggle}
      header={
        <Header
          user={user}
          onSearch={handleSearch}
          onToggleSidebar={handleSidebarToggle}
          isSidebarOpen={isSidebarOpen}
          onLogout={handleLogout}
          notifications={3}
        />
      }
      sidebar={
        <Sidebar
          currentPath={location.pathname}
          onNavigate={handleNavigation}
          userRole={user.role}
          onItemClick={handleSidebarItemClick}
        />
      }
    >
      {children}
    </DashboardLayout>
  );
}

// Container Setup Component with proper dependency injection
function AppWithContainer() {
  const navigate = useNavigate();
  const [containerReady, setContainerReady] = useState(false);
  const container = getContainer();
  
  // Configure dependencies synchronously
  React.useLayoutEffect(() => {
    try {
      configureDependencies(container, (path: string | number) => navigate(String(path)));
      setContainerReady(true);
    } catch (error) {
      console.error('Failed to configure dependencies:', error);
    }
  }, [container, navigate]);

  // Show loading while container is being configured
  if (!containerReady) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Initializing application...</p>
        </div>
      </div>
    );
  }

  return (
    <ContainerProvider container={container}>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        
        {/* All authenticated routes use the same layout */}
        <Route path="/dashboard" element={
          <AppLayout>
            <DashboardPage />
          </AppLayout>
        } />

        <Route path="/books" element={
          <AppLayout>
            <BooksPageContainer />
          </AppLayout>
        } />

        <Route path="/books/add" element={
          <AppLayout>
            <CreateBookPageContainer />
          </AppLayout>
        } />

        <Route path="/books/:id" element={
          <AppLayout>
            <BookDetailsPageContainer />
          </AppLayout>
        } />

        <Route path="/books/:id/edit" element={
          <AppLayout>
            <EditBookPageContainer />
          </AppLayout>
        } />

        {/* Placeholder routes for future phases */}
        <Route path="/members" element={<Navigate to="/dashboard" replace />} />
        <Route path="/borrowing" element={<Navigate to="/dashboard" replace />} />
        <Route path="/analytics" element={<Navigate to="/dashboard" replace />} />
        <Route path="/admin" element={<Navigate to="/dashboard" replace />} />
        <Route path="/profile" element={<Navigate to="/dashboard" replace />} />

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
      

    </ContainerProvider>
  );
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null); // null = loading
  const [isLoading, setIsLoading] = useState(true);

  // Check authentication status on app start
  useEffect(() => {
    const checkAuth = () => {
      const token = getStoredAuthToken();
      const user = getStoredUser();
      
      // Consider user authenticated if both token and user data exist
      setIsAuthenticated(!!(token && user));
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const handleLogin = (loginData: any) => {
    // Mock token for demo - in real app, this would come from your login API
    const mockToken = 'mock-jwt-token-' + Date.now();
    
    const userData = {
      name: "Soshan Wijayarathne",
      email: loginData.email || "admin@library.com",
      role: "Administrator"
    };

    // Store auth data
    setAuthData(mockToken, userData);
    setIsAuthenticated(true);
  };

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show login if not authenticated
  if (!isAuthenticated) {
    return (
      <QueryClientProvider client={queryClient}>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <AuthDemo onLoginSuccess={handleLogin} />
            <Toaster position="top-right" richColors />
          </div>
        </Router>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    );
  }

  // Show main app if authenticated
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <AppWithContainer />
          <Toaster position="top-right" richColors />
        </div>
      </Router>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;