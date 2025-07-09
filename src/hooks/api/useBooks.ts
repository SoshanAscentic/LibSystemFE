import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { booksApi } from '../../services/api/books';
import { BookFilters, CreateBookDto } from '../../services/api/types';
import { toast } from 'sonner';

// Query keys for consistent cache management
export const booksQueryKeys = {
  all: ['books'] as const,
  lists: () => [...booksQueryKeys.all, 'list'] as const,
  list: (filters: BookFilters) => [...booksQueryKeys.lists(), filters] as const,
  details: () => [...booksQueryKeys.all, 'detail'] as const,
  detail: (id: number) => [...booksQueryKeys.details(), id] as const,
  category: (category: string) => [...booksQueryKeys.all, 'category', category] as const,
  author: (author: string) => [...booksQueryKeys.all, 'author', author] as const,
};

// Get all books with filters
export const useBooks = (filters?: BookFilters) => {
  return useQuery({
    queryKey: booksQueryKeys.list(filters || {}),
    queryFn: () => booksApi.getAll(filters),
    select: (response) => response.data,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get book by ID
export const useBook = (id: number) => {
  return useQuery({
    queryKey: booksQueryKeys.detail(id),
    queryFn: () => booksApi.getById(id),
    select: (response) => response.data,
    enabled: !!id,
  });
};

// Get books by category
export const useBooksByCategory = (category: string) => {
  return useQuery({
    queryKey: booksQueryKeys.category(category),
    queryFn: () => booksApi.getByCategory(category),
    select: (response) => response.data,
    enabled: !!category,
  });
};

// Get books by author
export const useBooksByAuthor = (author: string) => {
  return useQuery({
    queryKey: booksQueryKeys.author(author),
    queryFn: () => booksApi.getByAuthor(author),
    select: (response) => response.data,
    enabled: !!author,
  });
};

// Create book mutation
export const useCreateBook = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: booksApi.create,
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: booksQueryKeys.lists() });
      toast.success(response.message || 'Book created successfully');
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message || 'Failed to create book';
      toast.error(message);
    },
  });
};
// Delete book mutation
export const useDeleteBook = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: booksApi.delete,
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: booksQueryKeys.lists() });
      toast.success(response.message || 'Book deleted successfully');
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message || 'Failed to delete book';
      toast.error(message);
    },
  });
};