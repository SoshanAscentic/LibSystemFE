import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { RegisterForm, type RegisterFormData } from '../../components/organisms/RegisterForm';
import { toast } from 'sonner';

export const CreateMemberPage: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/members');
  };

  const handleSubmit = async (data: RegisterFormData) => {
    console.log('CreateMemberPage: Starting member creation...');
    console.log('CreateMemberPage: Form data:', {
      ...data,
      password: '[HIDDEN]',
      confirmPassword: '[HIDDEN]'
    });
    
    setIsSubmitting(true);
    
    try {
      // Get the current admin's token
      const token = localStorage.getItem('library_access_token');
      console.log('CreateMemberPage: Token available:', !!token);
      
      if (!token) {
        toast.error('Session expired', { description: 'Please log in again' });
        navigate('/login');
        return;
      }

      // FIX: Use the correct backend URL
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://localhost:7033';
      const apiUrl = `${API_BASE_URL}/api/auth/register`;
      
      console.log('CreateMemberPage: Making API request to:', apiUrl);
      
      // Direct API call with correct URL
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          firstName: data.firstName.trim(),
          lastName: data.lastName.trim(),
          email: data.email.trim().toLowerCase(),
          password: data.password,
          confirmPassword: data.confirmPassword,
          role: data.role // Same field as signup
        })
      });

      console.log('CreateMemberPage: API response status:', response.status);

      if (response.ok) {
        const result = await response.json();
        console.log('CreateMemberPage: API response:', result);

        if (result.success) {
          console.log('CreateMemberPage: Member created successfully');
          
          // Show success message
          toast.success(
            'Member registered successfully!',
            { 
              description: `${data.firstName} ${data.lastName} has been added to the library with role: ${data.role}`
            }
          );
          
          // Navigate back after a short delay
          setTimeout(() => {
            navigate('/members');
          }, 1500);
          
        } else {
          console.error('CreateMemberPage: API returned error:', result.error);
          toast.error(
            'Registration failed',
            { 
              description: result.error?.message || 'Failed to register member'
            }
          );
        }
      } else {
        console.error('CreateMemberPage: HTTP error:', response.status);
        
        // Handle different error status codes
        if (response.status === 401) {
          toast.error('Session expired', { description: 'Please log in again' });
          navigate('/login');
        } else if (response.status === 403) {
          toast.error('Access denied', { description: 'You do not have permission to create members' });
        } else if (response.status === 409) {
          toast.error('Email already exists', { description: 'A member with this email already exists' });
        } else {
          // Try to get error message from response
          try {
            const errorData = await response.json();
            toast.error(
              'Registration failed',
              { 
                description: errorData.error?.message || `HTTP ${response.status} error`
              }
            );
          } catch (e) {
            toast.error(
              'Registration failed',
              { 
                description: `HTTP ${response.status} error`
              }
            );
          }
        }
      }
    } catch (error: any) {
      console.error('CreateMemberPage: Network error:', error);
      toast.error(
        'Registration failed',
        { 
          description: 'Network error. Please check your connection and try again.'
        }
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={handleBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Members
        </Button>
      </div>

      {/* Form */}
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Register New Member</h1>
            <p className="text-gray-600 mt-1">
              Create a new library member account
            </p>
          </div>
          
          <RegisterForm
            onSubmit={handleSubmit}
            onLogin={() => {}} // Not needed
            isLoading={isSubmitting}
            hideLoginLink={true}
            submitButtonText="Register Member"
          />
        </div>
      </div>
    </div>
  );
};