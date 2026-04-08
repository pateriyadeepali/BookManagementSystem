import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { BookService } from '../../services/book.service';
import { Book } from '../../models/book';

@Component({
  selector: 'app-book-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],  // All are used
  templateUrl: './book-form.component.html',
  styleUrl: './book-form.component.css'
})
export class BookFormComponent implements OnInit {
  book: Book = {
    title: '',
    author: '',
    publishedYear: new Date().getFullYear(),
    genre: '',
    price: 0,
    inStock: true
  };
  isEditMode = false;
  bookId?: string;

  constructor(
    private bookService: BookService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.bookId = this.route.snapshot.params['id'];
    if (this.bookId) {
      this.isEditMode = true;
      this.loadBook();
    }
  }

  loadBook(): void {
    this.bookService.getBookById(this.bookId!).subscribe({
      next: (book) => {
        this.book = book;
      },
      error: (error) => {
        console.error('Error loading book:', error);
        alert('Failed to load book');
        this.router.navigate(['/books']);
      }
    });
  }

  onSubmit(): void {
    if (this.isEditMode) {
      this.bookService.updateBook(this.bookId!, this.book).subscribe({
        next: () => {
          this.router.navigate(['/books']);
        },
        error: (error) => {
          console.error('Error updating book:', error);
          alert('Failed to update book');
        }
      });
    } else {
      this.bookService.createBook(this.book).subscribe({
        next: () => {
          this.router.navigate(['/books']);
        },
        error: (error) => {
          console.error('Error creating book:', error);
          alert('Failed to create book');
        }
      });
    }
  }
}