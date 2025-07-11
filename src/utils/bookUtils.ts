import { Book } from '../domain/entities/Book';
import { CreateBookDto } from '../domain/dtos/CreateBookDto';

export function bookToCreateBookDto(book: Book): CreateBookDto {
  return {
    title: book.title,
    author: book.author,
    publicationYear: book.publicationYear,
    category: getCategoryNumber(book.category)
  };
}

function getCategoryNumber(category: string): number {
  const categoryMap: Record<string, number> = {
    'Fiction': 0,
    'History': 1,
    'Child': 2
  };
  
  return categoryMap[category] ?? 0;
}