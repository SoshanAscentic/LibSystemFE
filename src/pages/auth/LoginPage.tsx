import * as React from "react"
import { AuthLayout } from "@/components/templates/AuthLayout"
import { LoginForm, type LoginFormData } from "@/components/organisms/LoginForm"
import { useAuth } from "../../contexts/AuthContext"
import { Navigate, useLocation } from "react-router-dom"

export interface LoginPageProps {
  onNavigateToRegister?: () => void;
  onNavigateToForgotPassword?: () => void;
}

export function LoginPage({ 
  onNavigateToRegister, 
  onNavigateToForgotPassword 
}: LoginPageProps) {
  const { login, isLoading, isAuthenticated, clearError } = useAuth();
  const location = useLocation();

  // Redirect if already authenticated
  if (isAuthenticated) {
    const from = (location.state as any)?.from?.pathname || '/dashboard';
    return <Navigate to={from} replace />;
  }

  const handleLogin = async (data: LoginFormData) => {
    clearError();
    await login({
      email: data.email,
      password: data.password,
      rememberMe: data.rememberMe
    });
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
    </AuthLayout>
  );
}
