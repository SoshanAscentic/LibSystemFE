export interface Book {
  readonly bookId: number;
  readonly title: string;
  readonly author: string;
  readonly publicationYear: number;
  readonly category: BookCategory;
  readonly isAvailable: boolean;
}

export enum BookCategory {
  Fiction = 'Fiction',
  History = 'History',
  Child = 'Child'
}