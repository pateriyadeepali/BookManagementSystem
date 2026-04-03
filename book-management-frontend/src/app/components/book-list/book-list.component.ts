import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BookService } from '../../services/book.service';
import { Book } from '../../models/book';

@Component({
  selector: 'app-book-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],  // All are used
  templateUrl: './book-list.component.html',
  styleUrl: './book-list.component.css'
})
export class BookListComponent implements OnInit {
  books: Book[] = [];
  filteredBooks: Book[] = [];
  loading = true;
  searchTerm = '';
  selectedGenre = '';
  showOnlyInStock = false;

  constructor(private bookService: BookService) {}

  ngOnInit(): void {
    this.loadBooks();
  }

  loadBooks(): void {
    this.bookService.getAllBooks().subscribe({
      next: (books) => {
        this.books = books;
        this.filteredBooks = [...books];
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading books:', error);
        this.loading = false;
        alert('Failed to load books. Make sure backend API is running on port 5023');
      }
    });
  }

  filterBooks(): void {
    this.filteredBooks = this.books.filter(book => {
      const matchesSearch = this.searchTerm === '' || 
        book.title.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        book.author.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const matchesGenre = this.selectedGenre === '' || 
        book.genre === this.selectedGenre;
      
      const matchesStock = !this.showOnlyInStock || book.inStock;
      
      return matchesSearch && matchesGenre && matchesStock;
    });
  }

  toggleStockFilter(): void {
    this.showOnlyInStock = !this.showOnlyInStock;
    this.filterBooks();
  }

  deleteBook(id: string): void {
    if (confirm('Are you sure you want to delete this book?')) {
      this.bookService.deleteBook(id).subscribe({
        next: () => {
          this.loadBooks();
        },
        error: (error) => {
          console.error('Error deleting book:', error);
          alert('Failed to delete book');
        }
      });
    }
  }
}