# Book Management System - Project Documentation

## 📋 Project Overview

The **Book Management System** is a full-stack web application built with:
- **Backend**: .NET 9 (C#) REST API with MongoDB
- **Frontend**: Angular 18 with TypeScript
- **Database**: MongoDB

This is a complete CRUD application for managing book inventory with a modern, responsive web interface.

---

## 🏗️ Project Structure

```
BookManagementSystem/
├── BookManagementApi/          # .NET 9 Backend API
│   ├── Controllers/
│   │   └── BooksController.cs
│   ├── Services/
│   │   ├── IBookService.cs
│   │   └── BookService.cs
│   ├── Models/
│   │   ├── Book.cs
│   │   └── DatabaseSettings.cs
│   ├── Program.cs
│   ├── appsettings.json
│   ├── .env                    # Environment variables
│   └── BookManagementApi.csproj
│
└── book-management-frontend/   # Angular 18 Frontend
    ├── src/
    │   ├── app/
    │   │   ├── components/
    │   │   │   ├── book-list/
    │   │   │   ├── book-form/
    │   │   │   ├── book-detail/
    │   │   │   └── navbar/
    │   │   ├── models/
    │   │   │   └── book.ts
    │   │   ├── services/
    │   │   │   └── book.service.ts
    │   │   └── app.routes.ts
    │   └── main.ts
    ├── package.json
    └── angular.json
```

---

## 🔧 Backend Architecture (.NET 9)

### Technology Stack
- **Framework**: ASP.NET Core 9
- **Database**: MongoDB 5.0+
- **Packages**:
  - `MongoDB.Driver` (v2.28.0) - MongoDB .NET driver
  - `Swashbuckle.AspNetCore` (v6.9.0) - Swagger/OpenAPI documentation
  - `DotNetEnv` (v3.1.1) - Environment variable management

### Key Components

#### 1. **BooksController** (`Controllers/BooksController.cs`)
REST API endpoints for CRUD operations:
- `GET /api/books` - Get all books
- `GET /api/books/{id}` - Get book by ID
- `POST /api/books` - Create new book
- `PUT /api/books/{id}` - Update book
- `DELETE /api/books/{id}` - Delete book

#### 2. **IBookService** (`Services/IBookService.cs`)
Service interface defining business logic operations:
```csharp
Task<List<Book>> GetAllAsync();
Task<Book?> GetByIdAsync(string id);
Task<Book> CreateAsync(Book book);
Task UpdateAsync(string id, Book book);
Task DeleteAsync(string id);
Task<List<Book>> SearchByTitleOrAuthorAsync(string searchTerm);
Task<List<Book>> GetByGenreAsync(string genre);
Task<List<Book>> GetAvailableBooksAsync();
```

#### 3. **BookService** (`Services/BookService.cs`)
Implements `IBookService` with MongoDB operations.

#### 4. **Models**
- **Book.cs**: Represents book entity with properties (ID, Title, Author, Genre, etc.)
- **DatabaseSettings.cs**: Holds MongoDB connection configuration

### Configuration

#### appsettings.json
```json
{
  "DatabaseSettings": {
    "ConnectionString": "",  // Loaded from environment
    "DatabaseName": "BookManagementDB",
    "BooksCollectionName": "Books"
  },
  "AllowedHosts": "*",
  "Logging": { ... }
}
```

#### Environment Variables (.env)
```
MONGODB_CONNECTION_STRING=mongodb://admin:admin123@localhost:27017
```

### CORS Configuration
- **Allowed Origin**: `http://localhost:4200` (Angular dev server)
- **Allowed Methods**: All
- **Allowed Headers**: All
- **Credentials**: Allowed

---

## 🎨 Frontend Architecture (Angular 18)

### Technology Stack
- **Framework**: Angular 18
- **Language**: TypeScript 5.5
- **Package Manager**: npm
- **Build Tool**: Vite (via Angular CLI)
- **Testing**: Jasmine & Karma

### Project Configuration
- **Node Version**: Recommended 18+
- **Dev Server Port**: `http://localhost:4200`

### Key Components

#### 1. **book-list** Component
Displays all books in a list/table view with options to:
- View book details
- Edit books
- Delete books

#### 2. **book-form** Component
Form for creating and editing books with validation.

#### 3. **book-detail** Component
Shows detailed information about a single book.

#### 4. **navbar** Component
Navigation bar at the top of the application.

#### 5. **book.service.ts**
Service handling HTTP communication with the backend:
```typescript
- getAllBooks(): Observable<Book[]>
- getBookById(id: string): Observable<Book>
- createBook(book: Book): Observable<Book>
- updateBook(id: string, book: Book): Observable<void>
- deleteBook(id: string): Observable<void>
```

#### 6. **book.ts** Model
```typescript
interface Book {
  id: string;
  title: string;
  author: string;
  genre: string;
  publishedYear: number;
  isbn: string;
  available: boolean;
  // ... other properties
}
```

### App Configuration (app.config.ts)
- Zone change detection optimization
- HTTP client provider for API calls
- Angular animations support
- Router configuration

---

## 🚀 Getting Started

### Prerequisites
- **.NET 9 SDK** (for backend)
- **Node.js 18+** (for frontend)
- **MongoDB** (local or Atlas)
- **npm** or **yarn**

### Backend Setup

1. **Navigate to backend folder**
   ```bash
   cd BookManagementApi
   ```

2. **Create .env file**
   ```bash
   echo "MONGODB_CONNECTION_STRING=mongodb://admin:admin123@localhost:27017" > .env
   ```

3. **Restore dependencies**
   ```bash
   dotnet restore
   ```

4. **Run the API**
   ```bash
   dotnet run
   ```
   - API runs on: `https://localhost:5001` or `http://localhost:5000`
   - Swagger UI: `https://localhost:5001/swagger`

### Frontend Setup

1. **Navigate to frontend folder**
   ```bash
   cd book-management-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start dev server**
   ```bash
   npm start
   ```
   - App runs on: `http://localhost:4200`

---

## 📊 API Endpoints

### Books Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/books` | Get all books |
| GET | `/api/books/{id}` | Get book by ID |
| POST | `/api/books` | Create new book |
| PUT | `/api/books/{id}` | Update book |
| DELETE | `/api/books/{id}` | Delete book |
| GET | `/api/books/search/{term}` | Search by title/author |
| GET | `/api/books/genre/{genre}` | Filter by genre |
| GET | `/api/books/available` | Get available books |

### Response Example
```json
{
  "id": "507f1f77bcf86cd799439011",
  "title": "The Great Gatsby",
  "author": "F. Scott Fitzgerald",
  "genre": "Fiction",
  "publishedYear": 1925,
  "isbn": "978-0-7432-7356-5",
  "available": true
}
```

---

## 🔐 Security Features

- ✅ CORS properly configured for frontend origin
- ✅ Environment variables for sensitive data (.env in .gitignore)
- ✅ MongoDB connection string not hardcoded
- ✅ DotNetEnv for secure configuration management
- ✅ Nullable reference types enabled in C#

---

## 📝 Development Notes

### Git Configuration
Both projects have proper `.gitignore` files configured to exclude:
- `bin/` and `obj/` directories
- `.env` files
- `node_modules/`
- Build artifacts
- IDE files (`.vs/`, `.vscode/`, `.idea/`)

### Build & Run

**Backend (in BookManagementApi directory)**
```bash
dotnet build      # Build
dotnet run        # Run
dotnet test       # Run tests
```

**Frontend (in book-management-frontend directory)**
```bash
npm start         # Start dev server
npm run build     # Build for production
npm test          # Run tests
```

---

## 🐛 Troubleshooting

### Backend Issues

**Error: "DotNetEnv not found"**
- Solution: Run `dotnet add package DotNetEnv`

**Error: MongoDB connection failed**
- Verify MongoDB is running
- Check `.env` file has correct `MONGODB_CONNECTION_STRING`
- Ensure firewall allows port 27017

### Frontend Issues

**Error: Cannot connect to backend**
- Verify backend is running on the correct port
- Check CORS configuration in `Program.cs`
- Verify API endpoint in `book.service.ts`

**Angular not starting**
- Run `npm install` to reinstall dependencies
- Clear cache: `rm -rf node_modules && npm install`

---

## 📚 Data Flow

```
User Browser (Angular)
        ↓
   Angular Components
        ↓
   BookService (HTTP calls)
        ↓
   .NET API Controller
        ↓
   BookService (Business Logic)
        ↓
   MongoDB Database
```

---

## 🎯 Future Enhancements

- [ ] Add user authentication & authorization
- [ ] Implement pagination for book list
- [ ] Add book ratings & reviews
- [ ] Implement book reservations system
- [ ] Add image upload for book covers
- [ ] Create admin dashboard
- [ ] Add export to PDF/Excel
- [ ] Implement notifications system
- [ ] Add unit & integration tests
- [ ] Deploy to cloud (Azure, AWS, etc.)

---

## 📞 Support & Questions

For questions or issues, check:
1. The project's `.gitignore` for proper configuration
2. `appsettings.json` for database settings
3. `Program.cs` for dependency injection and middleware
4. `app.config.ts` for Angular configuration
5. Individual component `*.service.ts` files for API integration

---

**Last Updated**: April 6, 2026  
**Version**: 1.0.0
