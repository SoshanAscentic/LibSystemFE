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

// SECURE Authentication
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SecureProtectedRoute } from './components/SecureProtectedRoute'; // CHANGED

// Layout Components
import { DashboardLayout } from './components/templates/DashboardLayout';
import { Header } from './components/organisms/Header';
import { Sidebar } from './components/organisms/Sidebar';

// Page Components
import { DashboardPage } from './pages/dashboard/DashboardPage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';

// Books Page Containers
import { BooksPageContainer } from './presentation/components/Book/BooksPageContainer';
import { BookDetailsPageContainer } from './presentation/components/Book/BookDetailsPageContainer';
import { CreateBookPageContainer } from './presentation/components/Book/CreateBookPageContainer';

// Members Page Containers
import { MembersPageContainer } from './presentation/components/Member/MembersPageContainer';
import { MemberDetailsPageContainer } from './presentation/components/Member/MemberDetailsPageContainer';
import { CreateMemberPageContainer } from './presentation/components/Member/CreateMemberPageContainer';

// Borrowing Page Containers
import { BorrowBookPageContainer } from './presentation/components/Borrow/BorrowBookPageContainer';
import { ReturnBookPageContainer } from './presentation/components/Borrow/ReturnBookPageContainer';

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
      console.log('App: Starting secure logout...');
      await logout();
      console.log('App: Secure logout completed, redirecting to login');
      navigate('/login');
    } catch (error) {
      console.error('App: Logout error:', error);
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
    // TODO: Implement global search functionality if needed
  };

  if (isLoading) {
    return <LoadingState message="Loading user session..." />;
  }

  if (!user) {
    return <LoadingState message="Verifying authentication..." />;
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
    return <LoadingState message="Initializing secure authentication..." />;
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

      {/* SECURE Protected Routes */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      
      <Route path="/dashboard" element={
        <SecureProtectedRoute>
          <AppLayout>
            <DashboardPage 
              user={user ? {
                name: user.fullName,
                email: user.email,
                role: user.role,
              } : undefined}
            />
          </AppLayout>
        </SecureProtectedRoute>
      } />

      {/* SECURE Books Routes - Server-verified permissions */}
      <Route path="/books" element={
        <SecureProtectedRoute resource="books" action="read">
          <AppLayout>
            <BooksPageContainer />
          </AppLayout>
        </SecureProtectedRoute>
      } />

      <Route path="/books/add" element={
        <SecureProtectedRoute resource="books" action="create">
          <AppLayout>
            <CreateBookPageContainer />
          </AppLayout>
        </SecureProtectedRoute>
      } />

      <Route path="/books/:id" element={
        <SecureProtectedRoute resource="books" action="read">
          <AppLayout>
            <BookDetailsPageContainer />
          </AppLayout>
        </SecureProtectedRoute>
      } />

      {/* SECURE Members Routes - Server-verified permissions */}
      <Route path="/members" element={
        <SecureProtectedRoute resource="members" action="read">
          <AppLayout>
            <MembersPageContainer />
          </AppLayout>
        </SecureProtectedRoute>
      } />

      <Route path="/members/add" element={
        <SecureProtectedRoute resource="members" action="create">
          <AppLayout>
            <CreateMemberPageContainer />
          </AppLayout>
        </SecureProtectedRoute>
      } />

      <Route path="/members/:id" element={
        <SecureProtectedRoute resource="members" action="read">
          <AppLayout>
            <MemberDetailsPageContainer />
          </AppLayout>
        </SecureProtectedRoute>
      } />

      {/* SECURE Borrowing Routes */}
      <Route path="/borrowing" element={<Navigate to="/borrowing/borrow" replace />} />

      <Route path="/borrowing/borrow" element={
        <SecureProtectedRoute resource="borrowing" action="create">
          <AppLayout>
            <BorrowBookPageContainer />
          </AppLayout>
        </SecureProtectedRoute>
      } />

      <Route path="/borrowing/return" element={
        <SecureProtectedRoute resource="borrowing" action="create">
          <AppLayout>
            <ReturnBookPageContainer />
          </AppLayout>
        </SecureProtectedRoute>
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
        console.log('Configuring dependencies...');
        configureDependencies(container, (path: string | number, options?: { state?: any }) => {
          if (typeof path === 'string' && options?.state) {
            navigate(path, options);
          } else {
            navigate(String(path));
          }
        });
        
        console.log('Dependencies configured successfully');
        setIsConfigured(true);
      } catch (error: any) {
        console.error('Failed to configure dependencies:', error);
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
      console.log('Resolving SECURE AuthenticationService...');
      const service = container.resolve(SERVICE_KEYS.AUTHENTICATION_SERVICE);
      console.log('SECURE AuthenticationService resolved successfully');
      return service;
    } catch (error: any) {
      console.error('Failed to resolve AuthenticationService:', error);
      setConfigError(`Failed to resolve AuthenticationService: ${error.message}`);
      return null;
    }
  }, [container, isConfigured]);

  // Make container available globally for debugging in development
  React.useEffect(() => {
    if (import.meta.env.DEV) {
      (window as any).container = container;
      console.log('Container available at window.container for debugging');
    }
  }, [container]);

  // Show loading while configuring
  if (!isConfigured) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Initializing Secure Application</h2>
          <p className="text-gray-600">Setting up secure services...</p>
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
            <h2 className="text-xl font-bold mb-2">Secure Application Error</h2>
            <p className="text-sm">{configError || 'Failed to initialize secure authentication service'}</p>
          </div>
          <button 
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Retry Initialization
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