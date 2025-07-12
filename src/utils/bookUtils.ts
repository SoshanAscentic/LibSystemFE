import { Book } from '../domain/entities/Book';
import { CreateBookDto } from '../domain/dtos/CreateBookDto';

/**
 * Convert Book entity to CreateBookDto format
 */
export function bookToCreateBookDto(book: Book): CreateBookDto {
  return {
    title: book.title,
    author: book.author,
    publicationYear: book.publicationYear,
    category: getCategoryNumber(book.category)
  };
}

/**
 * Get category number from string
 */
export function getCategoryNumber(category: string): number {
  const categoryMap = {
    'Fiction': 0,
    'History': 1,
    'Child': 2
  };
  return categoryMap[category as keyof typeof categoryMap] ?? 0;
}

/**
 * Calculate book statistics from array
 */
export function calculateBookStats(books: Book[]) {
  const total = books.length;
  const available = books.filter(book => book.isAvailable).length;
  const borrowed = books.filter(book => !book.isAvailable).length;
  const availabilityRate = total > 0 ? Math.round((available / total) * 100) : 0;
  const borrowRate = total > 0 ? Math.round((borrowed / total) * 100) : 0;

  return {
    total,
    available,
    borrowed,
    availabilityRate,
    borrowRate
  };
}

/**
 * Group books by category
 */
export function groupBooksByCategory(books: Book[]) {
  return books.reduce((groups, book) => {
    const category = book.category;
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(book);
    return groups;
  }, {} as Record<string, Book[]>);
}

/**
 * Group books by availability
 */
export function groupBooksByAvailability(books: Book[]) {
  return {
    available: books.filter(book => book.isAvailable),
    borrowed: books.filter(book => !book.isAvailable)
  };
}

/**
 * Get books published in a specific year range
 */
export function getBooksByYearRange(books: Book[], startYear: number, endYear: number) {
  return books.filter(book => 
    book.publicationYear >= startYear && book.publicationYear <= endYear
  );
}

/**
 * Get most recent books (by publication year)
 */
export function getMostRecentBooks(books: Book[], count: number = 10) {
  return [...books]
    .sort((a, b) => b.publicationYear - a.publicationYear)
    .slice(0, count);
}

/**
 * Search books by title or author
 */
export function searchBooks(books: Book[], query: string) {
  const searchTerm = query.toLowerCase().trim();
  if (!searchTerm) return books;

  return books.filter(book =>
    book.title.toLowerCase().includes(searchTerm) ||
    book.author.toLowerCase().includes(searchTerm)
  );
}

/**
 * Format book display name
 */
export function formatBookDisplayName(book: Book): string {
  return `${book.title} by ${book.author}`;
}

/**
 * Get book status badge props
 */
export function getBookStatusBadge(book: Book) {
  return book.isAvailable 
    ? { text: 'Available', variant: 'success' as const }
    : { text: 'Borrowed', variant: 'warning' as const };
}