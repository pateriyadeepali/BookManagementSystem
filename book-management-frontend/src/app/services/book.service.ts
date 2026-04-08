import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Book } from '../models/book';

@Injectable({
  providedIn: 'root'
})
export class BookService {
  // IMPORTANT: Change this port to match your API port
  private apiUrl = 'http://localhost:5023/api/books';

  constructor(private http: HttpClient) { }

  // GET all books
  getAllBooks(): Observable<Book[]> {
    return this.http.get<Book[]>(this.apiUrl);
  }

  // GET single book by ID
  getBookById(id: string): Observable<Book> {
    return this.http.get<Book>(`${this.apiUrl}/${id}`);
  }

  // GET books by genre
  getBooksByGenre(genre: string): Observable<Book[]> {
    return this.http.get<Book[]>(`${this.apiUrl}/genre/${genre}`);
  }

  // GET available books (in stock)
  getAvailableBooks(): Observable<Book[]> {
    return this.http.get<Book[]>(`${this.apiUrl}/available`);
  }

  // POST create new book
  createBook(book: Book): Observable<Book> {
    return this.http.post<Book>(this.apiUrl, book);
  }

  // PUT update existing book
  updateBook(id: string, book: Book): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, book);
  }

  // DELETE delete book
  deleteBook(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // GET search books by title or author
  searchBooks(searchTerm: string): Observable<Book[]> {
    return this.http.get<Book[]>(`${this.apiUrl}/search`, {
      params: { title: searchTerm }
    });
  }

  // GET total count of books
  getBooksCount(): Observable<{ totalBooks: number }> {
        return this.http.get<{ totalBooks: number }>(`${this.apiUrl}/count`);
  }

  getInStockCount(): Observable<{ inStockBooks: number }> {
        return this.http.get<{ inStockBooks: number }>(`${this.apiUrl}/instock/count`);
  }
}                 