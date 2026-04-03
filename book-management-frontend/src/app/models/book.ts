export interface Book {
  id?: string;
  title: string;
  author: string;
  isbn: string;
  publishedYear: number;
  genre: string;
  price: number;
  inStock: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}