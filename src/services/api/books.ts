import { apiClient } from '../api/client.ts';
import { ApiResponse, Book, CreateBookDto, BookFilters } from './types';

export const booksApi = {
  // Get all books with optional filters
  getAll: async (filters?: BookFilters): Promise<ApiResponse<Book[]>> => {
    const response = await apiClient.get('/api/books', { params: filters });
    return response.data;
  },

  // Get book by ID
  getById: async (id: number): Promise<ApiResponse<Book>> => {
    const response = await apiClient.get(`/api/books/${id}`);
    return response.data;
  },

  // Get books by category
  getByCategory: async (category: string): Promise<ApiResponse<Book[]>> => {
    const response = await apiClient.get(`/api/books/category/${category}`);
    return response.data;
  },

  // Get books by author
  getByAuthor: async (author: string): Promise<ApiResponse<Book[]>> => {
    const response = await apiClient.get(`/api/books/author/${encodeURIComponent(author)}`);
    return response.data;
  },

  // Create new book (Management+ only)
  create: async (data: CreateBookDto): Promise<ApiResponse<Book>> => {
    const response = await apiClient.post('/api/books', data);
    return response.data;
  },

  // Update book (Management+ only)
  update: async (id: number, data: CreateBookDto): Promise<ApiResponse<Book>> => {
    const response = await apiClient.put(`/api/books/${id}`, data);
    return response.data;
  },

  // Delete book (Management+ only)
  delete: async (id: number): Promise<ApiResponse<void>> => {
    const response = await apiClient.delete(`/api/books/${id}`);
    return response.data;
  },

  // Search books with debouncing support
  search: async (query: string, filters?: Omit<BookFilters, 'search'>): Promise<ApiResponse<Book[]>> => {
    const response = await apiClient.get('/api/books', {
      params: { search: query, ...filters }
    });
    return response.data;
  }
};