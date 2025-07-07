import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CreateMemberDto } from '../../../domain/dtos/MemberDto';
import { MemberType } from '../../../domain/entities/Member';
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
import { User, Mail, Users } from 'lucide-react';

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
  memberType: z.string()
    .refine((val) => ['0', '1', '2'].includes(val), 'Please select a valid member type'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .optional()
});

type MemberFormData = z.infer<typeof memberSchema>;

interface MemberFormProps {
  initialData?: Partial<CreateMemberDto>;
  onSubmit: (data: CreateMemberDto) => void;
  onCancel: () => void;
  isLoading?: boolean;
  title?: string;
  submitText?: string;
  showPassword?: boolean;
  className?: string;
}

const memberTypeOptions = [
  { value: '0', label: 'Regular Member', description: 'Can borrow books and view catalog' },
  { value: '1', label: 'Minor Staff', description: 'Can manage books but cannot borrow' },
  { value: '2', label: 'Management Staff', description: 'Can manage books and borrow' }
];

export const MemberForm: React.FC<MemberFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
  title = 'Member Information',
  submitText = 'Save Member',
  showPassword = true,
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
      firstName: initialData?.firstName || '',
      lastName: initialData?.lastName || '',
      email: initialData?.email || '',
      memberType: initialData?.memberType?.toString() || '0',
      password: ''
    },
    mode: 'onChange'
  });

  const watchedMemberType = watch('memberType');

  const handleFormSubmit = (data: MemberFormData) => {
    const submitData: CreateMemberDto = {
      firstName: data.firstName.trim(),
      lastName: data.lastName.trim(),
      email: data.email.trim().toLowerCase(),
      memberType: parseInt(data.memberType, 10),
      password: data.password || undefined
    };

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
              />
            </div>
          </div>

          {/* Member Type */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Member Type</h3>
            
            <div>
              <Label htmlFor="memberType" required>
                Member Type
              </Label>
              <Select
                value={watchedMemberType}
                onValueChange={(value) => setValue('memberType', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select member type" />
                </SelectTrigger>
                <SelectContent>
                  {memberTypeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
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
            </div>
          </div>

          {/* Password (optional for updates) */}
          {showPassword && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">
                Security {!initialData && <span className="text-red-500">*</span>}
              </h3>
              
              <div>
                <Label htmlFor="password" required={!initialData}>
                  {initialData ? 'New Password (leave blank to keep current)' : 'Password'}
                </Label>
                <Input
                  id="password"
                  type="password"
                  {...register('password')}
                  error={errors.password?.message}
                  placeholder={initialData ? 'Enter new password (optional)' : 'Enter password'}
                />
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={!isValid || isLoading}
              loading={isLoading}
              className="flex-1"
            >
              {submitText}
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
