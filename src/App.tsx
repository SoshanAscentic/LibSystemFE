import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from 'sonner';

// Container and DI
import { ContainerProvider } from './shared/providers/ContainerProvider';
import { getContainer } from './shared/container/containerSetup';
import { configureDependencies } from './infrastructure/container/DependencyConfiguration';

// Authentication
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { useAuthService } from './hooks/useAuthService';
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
import { AuthenticationService } from './domain/services/AuthenticationService';

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
  const { user, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
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

  return (
    <Routes>
      {/* Public Routes */}
      <Route 
        path="/login" 
        element={
          <LoginPage 
            onNavigateToRegister={() => navigate('/register')}
            onNavigateToForgotPassword={() => console.log('Navigate to forgot password')}
          />
        } 
      />
      <Route 
        path="/register" 
        element={
          <RegisterPage 
            onNavigateToLogin={() => navigate('/login')}
          />
        } 
      />

      {/* Protected Routes */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <AppLayout>
            <DashboardPage />
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

      {/* Future routes - redirect to dashboard for now */}
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

      <Route path="/analytics" element={
        <ProtectedRoute roles={['Administrator', 'ManagementStaff']}>
          <AppLayout>
            <div className="p-6">
              <h1 className="text-2xl font-bold">Analytics</h1>
              <p className="text-gray-600 mt-2">Coming soon...</p>
            </div>
          </AppLayout>
        </ProtectedRoute>
      } />

      <Route path="/admin" element={
        <ProtectedRoute roles={['Administrator']}>
          <AppLayout>
            <div className="p-6">
              <h1 className="text-2xl font-bold">Administration</h1>
              <p className="text-gray-600 mt-2">Coming soon...</p>
            </div>
          </AppLayout>
        </ProtectedRoute>
      } />

      <Route path="/profile" element={
        <ProtectedRoute>
          <AppLayout>
            <div className="p-6">
              <h1 className="text-2xl font-bold">Profile</h1>
              <p className="text-gray-600 mt-2">Coming soon...</p>
            </div>
          </AppLayout>
        </ProtectedRoute>
      } />

      {/* 404 Route */}
      <Route path="*" element={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
            <p className="text-gray-600 mb-4">Page not found</p>
            <button 
              onClick={() => navigate('/dashboard')}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      } />
    </Routes>
  );
}

// Container Setup Component
function AppWithContainer() {
  const navigate = useNavigate();
  const container = getContainer();
  const authService = React.useMemo(() => {
    // Configure dependencies
    configureDependencies(container, (path: string | number) => navigate(String(path)));
    return container.resolve('AuthenticationService') as AuthenticationService;
  }, [container, navigate]);

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
