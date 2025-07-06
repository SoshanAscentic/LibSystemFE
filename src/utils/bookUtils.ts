import { Book, CreateBookDto, BookCategory } from '../services/api/types';

/**
 * Convert BookCategory string to number for API submission
 */
export const categoryStringToNumber = (category: string): number => {
  switch (category.toLowerCase()) {
    case 'fiction':
      return 0;
    case 'history':
      return 1;
    case 'child':
      return 2;
    default:
      return 0; // Default to Fiction
  }
};

/**
 * Convert category number to BookCategory string
 */
export const categoryNumberToString = (category: number): BookCategory => {
  switch (category) {
    case 0:
      return BookCategory.Fiction;
    case 1:
      return BookCategory.History;
    case 2:
      return BookCategory.Child;
    default:
      return BookCategory.Fiction;
  }
};

/**
 * Transform Book entity to CreateBookDto format for forms
 */
export const bookToCreateBookDto = (book: Book): CreateBookDto => {
  return {
    title: book.title,
    author: book.author,
    publicationYear: book.publicationYear,
    category: categoryStringToNumber(book.category)
  };
};

/**
 * Get category color for UI display
 */
export const getCategoryColor = (category: string) => {
  switch (category.toLowerCase()) {
    case 'fiction':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'history':
      return 'bg-amber-100 text-amber-800 border-amber-200';
    case 'child':
      return 'bg-pink-100 text-pink-800 border-pink-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};
