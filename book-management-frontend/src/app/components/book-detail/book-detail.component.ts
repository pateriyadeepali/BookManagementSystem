import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { BookService } from '../../services/book.service';
import { Book } from '../../models/book';

@Component({
  selector: 'app-book-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],  // RouterLink IS used in HTML template
  templateUrl: './book-detail.component.html',
  styleUrl: './book-detail.component.css'
})
export class BookDetailComponent implements OnInit {
  book?: Book;
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private bookService: BookService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];
    this.loadBook(id);
  }

  loadBook(id: string): void {
    this.bookService.getBookById(id).subscribe({
      next: (book) => {
        this.book = book;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading book:', error);
        this.loading = false;
        alert('Book not found');
        this.router.navigate(['/books']);
      }
    });
  }

  deleteBook(): void {
    if (confirm('Are you sure you want to delete this book?')) {
      this.bookService.deleteBook(this.book!.id!).subscribe({
        next: () => {
          this.router.navigate(['/books']);
        },
        error: (error) => {
          console.error('Error deleting book:', error);
          alert('Failed to delete book');
        }
      });
    }
  }
}