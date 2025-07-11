import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CreateBookDto } from '../../../domain/dtos/CreateBookDto';
import { BookCategory } from '../../../domain/entities/Book';
import { Button } from '../../ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../../molecules/Card';
import { Input } from '../../atoms/Input';
import { Label } from '../../atoms/Label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { BookOpen, User, Calendar, Tag } from 'lucide-react';

// Validation schema
const bookSchema = z.object({
  title: z.string()
    .min(2, 'Title must be at least 2 characters')
    .max(200, 'Title must be less than 200 characters'),
  author: z.string()
    .min(2, 'Author must be at least 2 characters')
    .max(100, 'Author must be less than 100 characters'),
  publicationYear: z.number()
    .min(1450, 'Publication year must be 1450 or later')
    .max(new Date().getFullYear(), 'Publication year cannot be in the future'),
  category: z.number()
    .min(0, 'Please select a valid category')
    .max(2, 'Please select a valid category'),
});

type BookFormData = z.infer<typeof bookSchema>;

interface BookFormProps {
  initialData?: CreateBookDto;
  onSubmit: (data: CreateBookDto) => void;
  onCancel: () => void;
  isLoading?: boolean;
  title?: string;
  submitText?: string;
  className?: string;
}

const categoryOptions = [
  { value: 0, label: 'Fiction', description: '', icon: '📚' },
  { value: 1, label: 'History', description: '', icon: '📜' },
  { value: 2, label: 'Child', description: '', icon: '🧸' }
];

export const BookForm: React.FC<BookFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
  title = 'Add New Book',
  submitText = 'Add Book',
  className
}) => {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isValid }
  } = useForm<BookFormData>({
    resolver: zodResolver(bookSchema),
    defaultValues: initialData || {
      title: '',
      author: '',
      publicationYear: new Date().getFullYear(),
      category: 0
    },
    mode: 'onChange'
  });

  const watchedCategory = watch('category');

  const handleFormSubmit = (data: BookFormData) => {
    const submitData: CreateBookDto = {
      title: data.title.trim(),
      author: data.author.trim(),
      publicationYear: data.publicationYear,
      category: data.category
    };

    onSubmit(submitData);
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="w-5 h-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          {/* Book Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Book Information</h3>
            
            <div>
              <Label htmlFor="title" required>
                Book Title
              </Label>
              <Input
                id="title"
                {...register('title')}
                error={errors.title?.message}
                leftIcon={<BookOpen className="h-4 w-4" />}
                placeholder="Enter book title"
                disabled={isLoading}
              />
            </div>
            
            <div>
              <Label htmlFor="author" required>
                Author
              </Label>
              <Input
                id="author"
                {...register('author')}
                error={errors.author?.message}
                leftIcon={<User className="h-4 w-4" />}
                placeholder="Enter author name"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Publication Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Publication Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="publicationYear" required>
                  Publication Year
                </Label>
                <Input
                  id="publicationYear"
                  type="number"
                  {...register('publicationYear', { valueAsNumber: true })}
                  error={errors.publicationYear?.message}
                  leftIcon={<Calendar className="h-4 w-4" />}
                  placeholder="e.g., 2023"
                  min="1450"
                  max={new Date().getFullYear()}
                  disabled={isLoading}
                />
              </div>
              
              <div>
                <Label htmlFor="category" required>
                  Category
                </Label>
                <Select
                  value={watchedCategory?.toString() || '0'}
                  onValueChange={(value) => setValue('category', parseInt(value, 10))}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categoryOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value.toString()}>
                        <div className="flex items-center gap-2">
                          <Tag className="h-4 w-4" />
                          <div>
                            <div className="font-medium flex items-center gap-1">
                              <span>{option.icon}</span>
                              {option.label}
                            </div>
                            <div className="text-sm text-gray-500">{option.description}</div>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.category && (
                  <p className="text-sm text-red-600 mt-1">{errors.category.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={!isValid || isLoading}
              className="flex-1"
            >
              {isLoading ? 'Adding Book...' : submitText}
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