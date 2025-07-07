import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from 'sonner';

// Container and DI
import { ContainerProvider } from './shared/providers/ContainerProvider';
import { getContainer } from './shared/container/containerSetup';
import { configureDependencies } from './infrastructure/container/DependencyConfiguration';
import { SERVICE_KEYS } from './shared/container/ServiceKeys';

// Authentication
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';

// Layout Components
import { DashboardLayout } from './components/templates/DashboardLayout';
import { Header } from './components/organisms/Header';
import { Sidebar } from './components/organisms/Sidebar';

// Page Components
import { DashboardPage } from './pages/dashboard/DashboardPage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';

// Books Page Containers
import { BooksPageContainer } from './presentation/components/BooksPageContainer';
import { BookDetailsPageContainer } from './presentation/components/BookDetailsPageContainer';
import { CreateBookPageContainer } from './presentation/components/CreateBookPageContainer';
import { EditBookPageContainer } from './presentation/components/EditBookPageContainer';

// Loading Component
import { LoadingState } from './components/molecules/LoadingState';

// Create React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

// Main App Layout Component for authenticated users
function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, logout, isLoading } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
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
    // TODO: Implement global search functionality
  };

  if (isLoading) {
    return <LoadingState message="Loading..." />;
  }

  if (!user) {
    return <LoadingState message="Loading user data..." />;
  }

  return (
    <DashboardLayout
      isSidebarOpen={isSidebarOpen}
      onSidebarToggle={handleSidebarToggle}
      header={
        <Header
          user={{
            name: user.fullName,
            email: user.email,
            role: user.role
          }}
          onSearch={handleSearch}
          onToggleSidebar={handleSidebarToggle}
          isSidebarOpen={isSidebarOpen}
          onLogout={handleLogout}
          notifications={0} // TODO: Implement real notifications
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

// Authentication wrapper
function AuthenticatedApp() {
  const navigate = useNavigate();
  const { isAuthenticated, isInitialized, user } = useAuth();

  if (!isInitialized) {
    return <LoadingState message="Initializing application..." />;
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route 
        path="/login" 
        element={
          isAuthenticated ? <Navigate to="/dashboard" replace /> : (
            <LoginPage 
              onNavigateToRegister={() => navigate('/register')}
              onNavigateToForgotPassword={() => console.log('Navigate to forgot password')}
            />
          )
        } 
      />
      <Route 
        path="/register" 
        element={
          isAuthenticated ? <Navigate to="/dashboard" replace /> : (
            <RegisterPage 
              onNavigateToLogin={() => navigate('/login')}
            />
          )
        } 
      />

      {/* Protected Routes */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <AppLayout>
            <DashboardPage 
              user={user ? {
                name: user.fullName,
                email: user.email,
                role: user.role,
              } : undefined}
            />
          </AppLayout>
        </ProtectedRoute>
      } />

      {/* Books Routes - Protected and with role-based access */}
      <Route path="/books" element={
        <ProtectedRoute resource="books" action="read">
          <AppLayout>
            <BooksPageContainer />
          </AppLayout>
        </ProtectedRoute>
      } />

      <Route path="/books/add" element={
        <ProtectedRoute resource="books" action="create">
          <AppLayout>
            <CreateBookPageContainer />
          </AppLayout>
        </ProtectedRoute>
      } />

      <Route path="/books/:id" element={
        <ProtectedRoute resource="books" action="read">
          <AppLayout>
            <BookDetailsPageContainer />
          </AppLayout>
        </ProtectedRoute>
      } />

      <Route path="/books/:id/edit" element={
        <ProtectedRoute resource="books" action="update">
          <AppLayout>
            <EditBookPageContainer />
          </AppLayout>
        </ProtectedRoute>
      } />

      {/* Future routes */}
      <Route path="/members" element={
        <ProtectedRoute resource="members" action="read">
          <AppLayout>
            <div className="p-6">
              <h1 className="text-2xl font-bold">Members Management</h1>
              <p className="text-gray-600 mt-2">Coming soon in the next phase...</p>
            </div>
          </AppLayout>
        </ProtectedRoute>
      } />

      <Route path="/borrowing" element={
        <ProtectedRoute resource="borrowing" action="read">
          <AppLayout>
            <div className="p-6">
              <h1 className="text-2xl font-bold">Borrowing Management</h1>
              <p className="text-gray-600 mt-2">Coming soon in the next phase...</p>
            </div>
          </AppLayout>
        </ProtectedRoute>
      } />

      {/* Catch all - redirect to dashboard if authenticated, login if not */}
      <Route path="*" element={
        isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />
      } />
    </Routes>
  );
}

// Container Setup Component
function AppWithContainer() {
  const navigate = useNavigate();
  const container = getContainer();
  const [isConfigured, setIsConfigured] = React.useState(false);
  const [configError, setConfigError] = React.useState<string | null>(null);

  // Configure dependencies once
  React.useEffect(() => {
    const configureDeps = async () => {
      try {
        console.log('🔧 Configuring dependencies...');
        configureDependencies(container, (path: string | number) => navigate(String(path)));
        
        console.log('✅ Dependencies configured successfully');
        setIsConfigured(true);
      } catch (error: any) {
        console.error('❌ Failed to configure dependencies:', error);
        setConfigError(error.message);
      }
    };

    configureDeps();
  }, [container, navigate]);

  // Get authentication service after configuration
  const authService = React.useMemo(() => {
    if (!isConfigured) {
      return null;
    }

    try {
      console.log('🔍 Resolving AuthenticationService...');
      const service = container.resolve(SERVICE_KEYS.AUTHENTICATION_SERVICE);
      console.log('✅ AuthenticationService resolved successfully');
      return service;
    } catch (error: any) {
      console.error('❌ Failed to resolve AuthenticationService:', error);
      console.error('Available services in container:', Object.keys(container));
      setConfigError(`Failed to resolve AuthenticationService: ${error.message}`);
      return null;
    }
  }, [container, isConfigured]);

  // Make container available globally for debugging in development
  React.useEffect(() => {
    if (import.meta.env.DEV) {
      (window as any).container = container;
    }
  }, [container]);

  // Show loading while configuring
  if (!isConfigured) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Initializing Application</h2>
          <p className="text-gray-600">Setting up services...</p>
        </div>
      </div>
    );
  }

  // Show error if configuration failed
  if (configError || !authService) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <h2 className="text-xl font-bold mb-2">Application Error</h2>
            <p className="text-sm">{configError || 'Failed to initialize authentication service'}</p>
          </div>
          <button 
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <ContainerProvider container={container}>
      <AuthProvider authService={authService}>
        <AuthenticatedApp />
      </AuthProvider>
    </ContainerProvider>
  );
}

// Main App Component
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <AppWithContainer />
          <Toaster 
            position="top-right" 
            richColors 
            toastOptions={{
              duration: 4000,
            }}
          />
        </div>
      </Router>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;