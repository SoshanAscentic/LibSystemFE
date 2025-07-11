import * as React from "react"
import { AuthLayout } from "@/components/templates/AuthLayout"
import { LoginForm, type LoginFormData } from "@/components/organisms/LoginForm"
import { useAuth } from "../../contexts/AuthContext"
import { Navigate } from "react-router-dom"

export interface LoginPageProps {
  onNavigateToRegister?: () => void;
  onNavigateToForgotPassword?: () => void;
}

export function LoginPage({ 
  onNavigateToRegister, 
  onNavigateToForgotPassword 
}: LoginPageProps) {
  const { login, isLoading, isAuthenticated, clearError, error } = useAuth();

  // Clear error when component mounts
  React.useEffect(() => {
    clearError();
  }, [clearError]);

  // Redirect if already authenticated
  if (isAuthenticated) {
    console.log('LoginPage: User already authenticated, redirecting to dashboard');
    return <Navigate to="/dashboard" replace />;
  }

  const handleLogin = async (data: LoginFormData) => {
    console.log('LoginPage: Handling login for:', data.email);
    clearError();
    
    const result = await login({
      email: data.email,
      password: data.password,
      rememberMe: data.rememberMe
    });

    console.log('LoginPage: Login result:', result);
    
    // Navigation will be handled by the App component when isAuthenticated changes
  };

  const handleForgotPassword = () => {
    onNavigateToForgotPassword?.();
  };

  const handleRegister = () => {
    onNavigateToRegister?.();
  };

  return (
    <AuthLayout
      title="Welcome Back"
      subtitle="Sign in to your account to continue"
    >
      <LoginForm
        onSubmit={handleLogin}
        onForgotPassword={handleForgotPassword}
        onRegister={handleRegister}
        isLoading={isLoading}
      />
      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
    </AuthLayout>
  );
}