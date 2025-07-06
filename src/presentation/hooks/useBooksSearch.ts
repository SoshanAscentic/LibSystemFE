import { useState } from 'react';
import { Book } from '../../domain/entities/Book';
import { BookFilters } from '../../domain/valueObjects/BookFilters';
import { useDebounce } from '../../hooks/ui/useDebounce';
import { useBooksController } from './useBooksController';
import React from 'react';

interface UseBooksSearchResult {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  searchResults: Book[];
  isSearching: boolean;
  hasSearchQuery: boolean;
  clearSearch: () => void;
}

export const useBooksSearch = (initialFilters?: BookFilters): UseBooksSearchResult => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Book[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  
  const debouncedQuery = useDebounce(searchQuery, 300);
  const controller = useBooksController();

  React.useEffect(() => {
    const performSearch = async () => {
      if (debouncedQuery.length >= 2) {
        setIsSearching(true);
        const result = await controller.handleSearchBooks(debouncedQuery, initialFilters);
        setSearchResults(result.books);
        setIsSearching(false);
      } else {
        setSearchResults([]);
        setIsSearching(false);
      }
    };

    performSearch();
  }, [debouncedQuery, initialFilters]);

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
  };

  return {
    searchQuery,
    setSearchQuery,
    searchResults,
    isSearching,
    hasSearchQuery: debouncedQuery.length >= 2,
    clearSearch
  };
};