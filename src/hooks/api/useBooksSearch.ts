import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { booksApi } from '../../services/api/books';
import { BookFilters } from '../../services/api/types';
import { useDebounce } from '../ui/useDebounce';

export const useBooksSearch = (initialFilters?: BookFilters) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<BookFilters>(initialFilters || {});
  
  const debouncedQuery = useDebounce(searchQuery, 300);

  const searchResults = useQuery({
    queryKey: ['books', 'search', debouncedQuery, filters],
    queryFn: () => booksApi.search(debouncedQuery, filters),
    select: (response) => response.data,
    enabled: debouncedQuery.length >= 2, // Only search when at least 2 characters
    staleTime: 30 * 1000, // 30 seconds
  });

  const updateFilters = (newFilters: Partial<BookFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const clearFilters = () => {
    setFilters({});
    setSearchQuery('');
  };

  return {
    searchQuery,
    setSearchQuery,
    filters,
    updateFilters,
    clearFilters,
    searchResults: searchResults.data || [],
    isSearching: searchResults.isLoading,
    searchError: searchResults.error,
    hasSearchQuery: debouncedQuery.length >= 2,
  };
};