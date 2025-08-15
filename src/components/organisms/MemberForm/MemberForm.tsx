import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { RegisterMemberDto } from '../../../domain/dtos/MemberDto';
import { Button } from '../../ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../../molecules/Card';
import { Input } from '../../atoms/Input';
import { Label } from '../../atoms/Label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../ui/select';
import { User, Mail, Users, Lock } from 'lucide-react';

// Validation schema
const memberSchema = z.object({
  firstName: z.string()
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name must be less than 50 characters'),
  lastName: z.string()
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name must be less than 50 characters'),
  email: z.string()
    .email('Please enter a valid email address')
    .max(255, 'Email must be less than 255 characters'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password must be less than 100 characters'),
  confirmPassword: z.string()
    .min(8, 'Confirm password must be at least 8 characters'),
  memberType: z.string()
    .refine((val) => ['0', '1', '2'].includes(val), 'Please select a valid member type'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type MemberFormData = z.infer<typeof memberSchema>;

interface MemberFormProps {
  onSubmit: (data: RegisterMemberDto) => void;
  onCancel: () => void;
  isLoading?: boolean;
  title?: string;
  submitText?: string;
  className?: string;
}

// Better descriptions for member types
const memberTypeOptions = [
  { 
    value: '0', 
    label: 'Regular Member', 
    description: 'Standard library member with borrowing privileges' 
  },
  { 
    value: '1', 
    label: 'Minor Staff', 
    description: 'Staff member with limited administrative access' 
  },
  { 
    value: '2', 
    label: 'Management Staff', 
    description: 'Senior staff with full management privileges' 
  }
];

export const MemberForm: React.FC<MemberFormProps> = ({
  onSubmit,
  onCancel,
  isLoading = false,
  title = 'Register New Member',
  submitText = 'Register Member',
  className
}) => {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isValid }
  } = useForm<MemberFormData>({
    resolver: zodResolver(memberSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      memberType: '0'  // Default to Regular Member
    },
    mode: 'onChange'
  });

  const watchedMemberType = watch('memberType');

  // Ensure memberType is properly converted to number
  const handleFormSubmit = (data: MemberFormData) => {
    console.log('MemberForm: Form data before submission:', data);
    
    const submitData: RegisterMemberDto = {
      firstName: data.firstName.trim(),
      lastName: data.lastName.trim(),
      email: data.email.trim().toLowerCase(),
      password: data.password,
      confirmPassword: data.confirmPassword,
      memberType: parseInt(data.memberType, 10)  // Ensure proper conversion to number
    };

    console.log('MemberForm: Final submission data:', {
      ...submitData,
      password: '[HIDDEN]',
      confirmPassword: '[HIDDEN]',
      memberType: submitData.memberType  // Log the actual number
    });

    onSubmit(submitData);
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="w-5 h-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Personal Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName" required>
                  First Name
                </Label>
                <Input
                  id="firstName"
                  {...register('firstName')}
                  error={errors.firstName?.message}
                  leftIcon={<User className="h-4 w-4" />}
                  placeholder="Enter first name"
                  disabled={isLoading}
                />
              </div>
              
              <div>
                <Label htmlFor="lastName" required>
                  Last Name
                </Label>
                <Input
                  id="lastName"
                  {...register('lastName')}
                  error={errors.lastName?.message}
                  leftIcon={<User className="h-4 w-4" />}
                  placeholder="Enter last name"
                  disabled={isLoading}
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="email" required>
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                {...register('email')}
                error={errors.email?.message}
                leftIcon={<Mail className="h-4 w-4" />}
                placeholder="Enter email address"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Password Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Security</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="password" required>
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  {...register('password')}
                  error={errors.password?.message}
                  leftIcon={<Lock className="h-4 w-4" />}
                  placeholder="Enter password"
                  disabled={isLoading}
                />
              </div>
              
              <div>
                <Label htmlFor="confirmPassword" required>
                  Confirm Password
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  {...register('confirmPassword')}
                  error={errors.confirmPassword?.message}
                  leftIcon={<Lock className="h-4 w-4" />}
                  placeholder="Confirm password"
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>

          {/* Member Type - Better handling and descriptions */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Member Type</h3>
            
            <div>
              <Label htmlFor="memberType" required>
                Member Type
              </Label>
              <Select
                value={watchedMemberType}
                onValueChange={(value) => {
                  console.log('MemberForm: Selected member type:', value);
                  setValue('memberType', value, { shouldValidate: true });
                }}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select member type" />
                </SelectTrigger>
                <SelectContent>
                  {memberTypeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-start gap-2 py-1">
                        <Users className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        <div>
                          <div className="font-medium">{option.label}</div>
                          <div className="text-sm text-gray-500">{option.description}</div>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.memberType && (
                <p className="text-sm text-red-600 mt-1">{errors.memberType.message}</p>
              )}
              
              {/* Debug info for development */}
              {process.env.NODE_ENV === 'development' && (
                <p className="text-xs text-gray-400 mt-1">
                  Selected: {watchedMemberType} ({memberTypeOptions.find(opt => opt.value === watchedMemberType)?.label})
                </p>
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={!isValid || isLoading}
              className="flex-1"
            >
              {isLoading ? 'Registering...' : submitText}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};