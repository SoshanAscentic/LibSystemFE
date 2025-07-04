import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CreateBookDto, BookCategory } from '../../../services/api/types';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import { FormField } from '../../molecules/FormField';
import { Label } from '../../atoms/Label';
import { Save, X } from 'lucide-react';

const bookFormSchema = z.object({
  title: z.string()
    .min(1, 'Title is required')
    .max(200, 'Title must be less than 200 characters'),
  author: z.string()
    .min(1, 'Author is required')
    .max(100, 'Author must be less than 100 characters'),
  publicationYear: z.number()
    .min(1450, 'Publication year must be 1450 or later')
    .max(new Date().getFullYear(), 'Publication year cannot be in the future'),
  category: z.number()
    .min(0, 'Category is required')
    .max(2, 'Invalid category')
});

type BookFormData = z.infer<typeof bookFormSchema>;

interface BookFormProps {
  initialData?: Partial<CreateBookDto>;
  onSubmit: (data: CreateBookDto) => void;
  onCancel?: () => void;
  isLoading?: boolean;
  title?: string;
  submitText?: string;
  className?: string;
}

const categoryOptions = [
  { value: 0, label: 'Fiction' },
  { value: 1, label: 'History' },
  { value: 2, label: 'Child' }
];

export const BookForm: React.FC<BookFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
  title = 'Add New Book',
  submitText = 'Save Book',
  className
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    setValue,
    watch
  } = useForm<BookFormData>({
    resolver: zodResolver(bookFormSchema),
    defaultValues: {
      title: initialData?.title || '',
      author: initialData?.author || '',
      publicationYear: initialData?.publicationYear || new Date().getFullYear(),
      category: initialData?.category || 0
    },
    mode: 'onChange'
  });

  const handleFormSubmit = (data: BookFormData) => {
    onSubmit(data);
  };

  return (
    <Card className={className}>
      <div className="p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
          <p className="text-sm text-gray-600 mt-1">
            Fill in the details below to {initialData ? 'update' : 'add'} the book.
          </p>
        </div>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          {/* Title Field */}
          <FormField
            label="Title"
            required
            error={errors.title?.message}
          >
            <input
              {...register('title')}
              type="text"
              placeholder="Enter book title"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isLoading}
            />
          </FormField>

          {/* Author Field */}
          <FormField
            label="Author"
            required
            error={errors.author?.message}
          >
            <input
              {...register('author')}
              type="text"
              placeholder="Enter author name"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isLoading}
            />
          </FormField>

          {/* Publication Year Field */}
          <FormField
            label="Publication Year"
            required
            error={errors.publicationYear?.message}
          >
            <input
              {...register('publicationYear', { valueAsNumber: true })}
              type="number"
              min="1450"
              max={new Date().getFullYear()}
              placeholder="Enter publication year"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isLoading}
            />
          </FormField>

          {/* Category Field */}
          <FormField
            label="Category"
            required
            error={errors.category?.message}
          >
            <select
              {...register('category', { valueAsNumber: true })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isLoading}
            >
              <option value="">Select a category</option>
              {categoryOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </FormField>

          {/* Form Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={!isValid || isLoading}
              className="flex-1"
            >
              <Save className="mr-2 h-4 w-4" />
              {isLoading ? 'Saving...' : submitText}
            </Button>
            
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isLoading}
                className="flex-1"
              >
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
            )}
          </div>
        </form>
      </div>
    </Card>
  );
};
