import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from 'sonner';

// Layout Components
import { DashboardLayout } from './components/templates/DashboardLayout';
import { Header } from './components/organisms/Header';
import { Sidebar } from './components/organisms/Sidebar';

// Page Components
import { DashboardPage } from './pages/dashboard/DashboardPage';
import { BooksPage } from './pages/books/BooksPage';
import { BookDetailsPage } from './pages/books/BookDetailsPage';
import { CreateBookPage } from './pages/books/CreateBookPage';
import { EditBookPage } from './pages/books/EditBookPage';

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

// Main App Layout Component
function AppLayout({ children }: { children: React.ReactNode }) {
  const [user] = useState({
    name: "Soshan Wijayarathne",
    email: "admin@library.com",
    role: "Administrator"
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  const handleLogout = () => {
    // Will be implemented when we add proper auth
    console.log('Logout clicked');
  };

  const handleNavigation = (path: string) => {
    // Navigation is handled by React Router
    console.log('Navigate to:', path);
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
    // TODO: Implement global search
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

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleLogin = (loginData: any) => {
    setIsAuthenticated(true);
  };

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

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen bg-gray-50">
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
                <BooksPage />
              </AppLayout>
            } />

            <Route path="/books/add" element={
              <AppLayout>
                <CreateBookPage />
              </AppLayout>
            } />

            <Route path="/books/:id" element={
              <AppLayout>
                <BookDetailsPage />
              </AppLayout>
            } />

            <Route path="/books/:id/edit" element={
              <AppLayout>
                <EditBookPage />
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

          {/* Global Components */}
          <Toaster position="top-right" richColors />
        </div>
      </Router>
      
      {/* React Query Devtools */}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;