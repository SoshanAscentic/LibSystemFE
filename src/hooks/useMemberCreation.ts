import { useState } from 'react';
import { toast } from 'sonner';

interface CreateMemberData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: string;
}

interface CreateMemberResult {
  success: boolean;
  error?: string;
  data?: any;
}

export const useMemberCreation = () => {
  const [isLoading, setIsLoading] = useState(false);

  const createMember = async (data: CreateMemberData): Promise<CreateMemberResult> => {
    setIsLoading(true);
    
    try {
      console.log('useMemberCreation: Creating member with role:', data.role);
      
      const token = localStorage.getItem('library_access_token');
      console.log('useMemberCreation: Token available:', !!token);
      
      // FIX: Use the correct backend URL
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://localhost:7033';
      const apiUrl = `${API_BASE_URL}/api/auth/register`;
      
      console.log('useMemberCreation: Making request to:', apiUrl);
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify(data)
      });

      console.log('useMemberCreation: Response status:', response.status);

      if (response.ok) {
        const result = await response.json();
        console.log('useMemberCreation: Response data:', result);
        
        if (result.success) {
          toast.success(
            'Member registered successfully!',
            { 
              description: `${data.firstName} ${data.lastName} has been added to the library.`
            }
          );
          
          return { success: true, data: result.data };
        } else {
          const errorMessage = result.error?.message || 'Registration failed';
          toast.error('Registration failed', { description: errorMessage });
          return { success: false, error: errorMessage };
        }
      } else {
        let errorMessage = `HTTP ${response.status} error`;
        
        if (response.status === 401) {
          errorMessage = 'Session expired. Please log in again.';
        } else if (response.status === 403) {
          errorMessage = 'You do not have permission to create members';
        } else if (response.status === 409) {
          errorMessage = 'A member with this email already exists';
        } else {
          try {
            const errorData = await response.json();
            errorMessage = errorData.error?.message || errorMessage;
          } catch (e) {
            // Response not JSON, use default message
          }
        }
        
        toast.error('Registration failed', { description: errorMessage });
        return { success: false, error: errorMessage };
      }
    } catch (error: any) {
      console.error('useMemberCreation: Error:', error);
      const errorMessage = 'Network error. Please check your connection and try again.';
      toast.error('Registration failed', { description: errorMessage });
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    createMember,
    isLoading
  };
};