import { apiClient } from '../api/client.ts';
import { ApiResponse, Book, CreateBookDto, BookFilters } from './types';

export const booksApi = {
  // Get all books with proper filtering endpoints
  getAll: async (filters?: BookFilters): Promise<ApiResponse<Book[]>> => {
    // Priority 1: If category filter is specified, use category endpoint
    if (filters?.category) {
      const response = await apiClient.get(`/api/books/category/${filters.category}`, {
        params: {
          // Include sorting and pagination for category endpoint
          sortBy: filters.sortBy,
          sortDirection: filters.sortDirection,
          pageNumber: filters.pageNumber,
          pageSize: filters.pageSize
        }
      });
      return response.data;
    }
    
    // Priority 2: If author filter is specified, use author endpoint  
    if (filters?.author) {
      const response = await apiClient.get(`/api/books/author/${encodeURIComponent(filters.author)}`, {
        params: {
          // Include sorting and pagination for author endpoint
          sortBy: filters.sortBy,
          sortDirection: filters.sortDirection,
          pageNumber: filters.pageNumber,
          pageSize: filters.pageSize
        }
      });
      return response.data;
    }
    
    // Priority 3: No specific filters, get all books
    const response = await apiClient.get('/api/books', { 
      params: {
        sortBy: filters?.sortBy,
        sortDirection: filters?.sortDirection,
        pageNumber: filters?.pageNumber,
        pageSize: filters?.pageSize
      }
    });
    return response.data;
  },

  // Get book by ID
  getById: async (id: number): Promise<ApiResponse<Book>> => {
    const response = await apiClient.get(`/api/books/${id}`);
    return response.data;
  },

  // Get books by category (direct endpoint call)
  getByCategory: async (category: string, params?: { sortBy?: string; sortDirection?: string; pageNumber?: number; pageSize?: number }): Promise<ApiResponse<Book[]>> => {
    const response = await apiClient.get(`/api/books/category/${category}`, { params });
    return response.data;
  },

  // Get books by author (direct endpoint call)
  getByAuthor: async (author: string, params?: { sortBy?: string; sortDirection?: string; pageNumber?: number; pageSize?: number }): Promise<ApiResponse<Book[]>> => {
    const response = await apiClient.get(`/api/books/author/${encodeURIComponent(author)}`, { params });
    return response.data;
  },

  // Create new book (Management+ only)
  create: async (data: CreateBookDto): Promise<ApiResponse<Book>> => {
    const response = await apiClient.post('/api/books', data);
    return response.data;
  },

  // Delete book (Management+ only)
  delete: async (id: number): Promise<ApiResponse<void>> => {
    const response = await apiClient.delete(`/api/books/${id}`);
    return response.data;
  }
};