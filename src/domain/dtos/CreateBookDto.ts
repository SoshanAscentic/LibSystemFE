export interface CreateBookDto {
  readonly title: string;
  readonly author: string;
  readonly publicationYear: number;
  readonly category: number; // API expects number
}

export interface UpdateBookDto extends CreateBookDto {
  readonly bookId: number;
}