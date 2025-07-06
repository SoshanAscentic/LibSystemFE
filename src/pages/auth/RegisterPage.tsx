import * as React from "react"
import { AuthLayout } from "@/components/templates/AuthLayout"
import { RegisterForm, type RegisterFormData } from "@/components/organisms/RegisterForm"
import { useAuth } from "../../contexts/AuthContext"
import { Navigate, useLocation } from "react-router-dom"

export interface RegisterPageProps {
  onNavigateToLogin?: () => void;
}

export function RegisterPage({ onNavigateToLogin }: RegisterPageProps) {
  const { register, isLoading, isAuthenticated, clearError } = useAuth();
  const location = useLocation();

  // Redirect if already authenticated
  if (isAuthenticated) {
    const from = (location.state as any)?.from?.pathname || '/dashboard';
    return <Navigate to={from} replace />;
  }

  const handleRegister = async (data: RegisterFormData) => {
    clearError();
    await register(data);
  };

  const handleLogin = () => {
    onNavigateToLogin?.();
  };

  return (
    <AuthLayout
      title="Create Account"
      subtitle="Join LibraryMS to get started"
    >
      <RegisterForm
        onSubmit={handleRegister}
        onLogin={handleLogin}
        isLoading={isLoading}
      />
    </AuthLayout>
  );
}