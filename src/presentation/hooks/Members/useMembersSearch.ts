import { useState } from 'react';
import { Member } from '../../../domain/entities/Member';
import { MemberFilters } from '../../../domain/valueObjects/MemberFilters';
import { useDebounce } from '../../../hooks/ui/useDebounce';
import { useMembersController } from './useMembersController';
import React from 'react';

interface UseMembersSearchResult {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  searchResults: Member[];
  isSearching: boolean;
  hasSearchQuery: boolean;
  clearSearch: () => void;
}

export const useMembersSearch = (initialFilters?: MemberFilters): UseMembersSearchResult => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Member[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  
  const debouncedQuery = useDebounce(searchQuery, 300);
  const controller = useMembersController();

  React.useEffect(() => {
    const performSearch = async () => {
      if (debouncedQuery.length >= 2) {
        setIsSearching(true);
        const result = await controller.handleSearchMembers(debouncedQuery, initialFilters);
        setSearchResults(result.members);
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