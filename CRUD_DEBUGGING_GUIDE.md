# Book Management System - CRUD Operations & Debugging Guide

## 🔧 Overview: What Was Fixed and Why

The CRUD operations (Create, Read, Update, Delete) weren't working initially. This guide explains the root causes, the fixes applied, and how to debug similar issues in the future.

---

## 🐛 Issues Found & Fixed

### **Issue #1: JSON Property Naming Mismatch** 
**Severity**: 🔴 Critical  
**Impact**: Data not displaying on frontend, search/filter not working

#### Root Cause
```
Backend sends:      Frontend expects:
InStock       ❌    inStock       ✅
PublishedYear ❌    publishedYear ✅
```

The .NET backend was using **PascalCase** (C# convention), but Angular/TypeScript uses **camelCase** (JavaScript convention). This caused property mapping to fail.

#### The Fix
**File**: `BookManagementApi/Program.cs`

```csharp
// BEFORE (❌ Property names not converted)
builder.Services.AddControllers()
    .AddJsonOptions(options =>
        options.JsonSerializerOptions.PropertyNamingPolicy = null);

// AFTER (✅ Converts to camelCase)
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
        options.JsonSerializerOptions.DictionaryKeyPolicy = JsonNamingPolicy.CamelCase;
    });
```

**Added using statement**:
```csharp
using System.Text.Json;
```

**Why it works**: 
- `JsonNamingPolicy.CamelCase` automatically converts `InStock` → `inStock` when sending JSON
- Frontend models now match the API response perfectly
- Data bindings work correctly in Angular templates

---

### **Issue #2: API Route Conflict**
**Severity**: 🟠 High  
**Impact**: Search endpoint not accessible, gets intercepted by GetById route

#### Root Cause
```
Request: GET /api/books/search?title=xyz
Route 1: GET /api/books/{id}  ⬅️ MATCHES FIRST (treats "search" as an ID)
Route 2: GET /api/books/search  ⬅️ Never reached
```

In REST routing, more specific routes must be defined **BEFORE** generic routes that use path parameters.

#### The Fix
**File**: `BookManagementApi/Controllers/BooksController.cs`

```csharp
// BEFORE (❌ Order is wrong)
[HttpGet]
public async Task<ActionResult<List<Book>>> GetAll() { ... }

[HttpGet("{id}")]  // ⬅️ This catches /search too!
public async Task<ActionResult<Book>> GetById(string id) { ... }

[HttpGet("search")]  // ⬅️ Unreachable
public async Task<ActionResult<List<Book>>> Search([FromQuery] string title) { ... }

// AFTER (✅ Correct order)
[HttpGet]
public async Task<ActionResult<List<Book>>> GetAll() { ... }

[HttpGet("search")]  // ⬅️ Defined BEFORE {id}
public async Task<ActionResult<List<Book>>> Search([FromQuery] string title) { ... }

[HttpGet("{id}")]  // ⬅️ Generic routes last
public async Task<ActionResult<Book>> GetById(string id) { ... }
```

**Route matching order** (most to least specific):
1. Exact string matches: `/api/books/search`
2. Path parameters: `/api/books/{id}`
3. Optional parameters: `/api/books[/{id}]`

---

### **Issue #3: Missing Search Method in Frontend**
**Severity**: 🟠 High  
**Impact**: Search feature only worked on client-side, not using backend

#### Root Cause
The Angular `BookService` had no method to call the backend `/search` endpoint. Search was only filtering client-side data, which is inefficient and misses database-level benefits (indexing, sorting at source).

#### The Fix
**File**: `book-management-frontend/src/app/services/book.service.ts`

```typescript
// ADDED this method
searchBooks(searchTerm: string): Observable<Book[]> {
  return this.http.get<Book[]>(`${this.apiUrl}/search`, {
    params: { title: searchTerm }
  });
}
```

**API Call format**:
```
URL: http://localhost:5023/api/books/search?title=xyz
Method: GET
Response: [{ id: "...", title: "xyz", author: "...", ... }]
```

---

### **Issue #4: Frontend Search Logic Not Using Backend API**
**Severity**: 🟠 High  
**Impact**: Search only worked on already-loaded data, slow inefficient

#### Root Cause
The `filterBooks()` method in `book-list.component.ts` was only filtering the in-memory `books` array. It wasn't calling the backend search API.

#### The Fix
**File**: `book-management-frontend/src/app/components/book-list/book-list.component.ts`

```typescript
// BEFORE (❌ Client-side only filter)
filterBooks(): void {
  this.filteredBooks = this.books.filter(book => {
    const matchesSearch = this.searchTerm === '' || 
      book.title.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      book.author.toLowerCase().includes(this.searchTerm.toLowerCase());
    // ... more filters
  });
}

// AFTER (✅ Uses backend API with fallback)
filterBooks(): void {
  if (this.searchTerm.trim() === '') {
    // Empty search: apply other filters to all books
    this.filteredBooks = this.books.filter(book => {
      const matchesGenre = this.selectedGenre === '' || book.genre === this.selectedGenre;
      const matchesStock = !this.showOnlyInStock || book.inStock;
      return matchesGenre && matchesStock;
    });
  } else {
    // Has search term: call backend API
    this.bookService.searchBooks(this.searchTerm).subscribe({
      next: (books) => {
        // Apply additional filters to results
        this.filteredBooks = books.filter(book => {
          const matchesGenre = this.selectedGenre === '' || book.genre === this.selectedGenre;
          const matchesStock = !this.showOnlyInStock || book.inStock;
          return matchesGenre && matchesStock;
        });
      },
      error: (error) => {
        console.error('Error searching books:', error);
        // Fallback to client-side search if API fails
        this.filteredBooks = this.books.filter(book => {
          const matchesSearch = book.title.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
            book.author.toLowerCase().includes(this.searchTerm.toLowerCase());
          // ... more filters
        });
      }
    });
  }
}
```

**Why this is better**:
- ✅ Uses backend search capabilities
- ✅ Combines with client-side filters
- ✅ Has error handling with fallback
- ✅ Works with or without API

---

## 📚 Complete Summary of Changes

| Component | File | Change | Impact |
|-----------|------|--------|--------|
| **Backend Config** | `Program.cs` | Added `JsonNamingPolicy.CamelCase` | Properties now serialize correctly |
| **Backend Config** | `Program.cs` | Added `using System.Text.Json;` | Fixes compiler error |
| **API Controller** | `BooksController.cs` | Moved `[HttpGet("search")]` before `[HttpGet("{id}")]` | Search endpoint now reachable |
| **Service** | `book.service.ts` | Added `searchBooks()` method | Frontend can call search API |
| **Component** | `book-list.component.ts` | Updated `filterBooks()` logic | Uses backend API for search |
| **Component** | `book-list.component.ts` | Added debugging logs | Can track data flow |

---

## 🔍 How to Debug Similar Issues

### **Debug Technique #1: Network Inspection**

**In Browser DevTools (F12)**:

1. **Open Network tab**
   - Press `F12` → Click "Network" tab
   - Keep it open while interacting with the app

2. **Make a request** (e.g., search for a book)
   - Look for the request in the Network tab
   - Click on it to see details

3. **Check Response**
   ```
   Request Headers:
   - URL should be: http://localhost:5023/api/books/search?title=xyz
   - Method: GET
   
   Response:
   - Status: 200 (success) or 404/500 (error)
   - Body: [{"id":"...", "title":"...", ...}]
   ```

4. **Check for naming issues**
   - Look at Response tab
   - If you see `"Title"` instead of `"title"`, it's a naming issue
   - Compare with what Angular model expects

**Example: What to look for**
```json
// ❌ WRONG (PascalCase)
{
  "Id": "123",
  "Title": "Book Name",
  "InStock": true,
  "PublishedYear": 2020
}

// ✅ CORRECT (camelCase)
{
  "id": "123",
  "title": "Book Name",
  "inStock": true,
  "publishedYear": 2020
}
```

---

### **Debug Technique #2: Browser Console Logging**

**In your Angular component**:

```typescript
loadBooks(): void {
  this.bookService.getAllBooks().subscribe({
    next: (books) => {
      // Add this line to see what you received
      console.log('Books from API:', books);
      
      // Check first book structure
      if (books.length > 0) {
        console.log('First book keys:', Object.keys(books[0]));
        console.log('First book:', books[0]);
      }
      
      this.books = books;
      this.loading = false;
    },
    error: (error) => {
      // Log the actual error
      console.error('API Error:', {
        status: error.status,
        statusText: error.statusText,
        message: error.message,
        error: error.error
      });
    }
  });
}
```

**What to check**:
- Does `console.log` output show data?
- Are property names in camelCase?
- Any error messages?

---

### **Debug Technique #3: API Testing with Postman**

**Test backend endpoints directly** (no frontend involved):

1. **Download Postman** or use browser REST client
2. **Test each endpoint**:

```
GET http://localhost:5023/api/books
GET http://localhost:5023/api/books/search?title=xyz
GET http://localhost:5023/api/books/{book_id}
POST http://localhost:5023/api/books
PUT http://localhost:5023/api/books/{book_id}
DELETE http://localhost:5023/api/books/{book_id}
```

3. **Verify response format**:
   - Check status code (200, 201, 404, 500)
   - Check response body
   - Check property naming (camelCase?)

**Example with curl**:
```bash
# Get all books
curl -X GET http://localhost:5023/api/books

# Search books
curl -X GET "http://localhost:5023/api/books/search?title=adventure"

# Check response format
curl -X GET http://localhost:5023/api/books | jq '.[] | keys' # Shows property names
```

---

### **Debug Technique #4: Backend Logging**

**In your .NET backend**, check the console output:

```csharp
public class BooksController : ControllerBase
{
    private readonly ILogger<BooksController> _logger;
    
    public BooksController(IBookService bookService, ILogger<BooksController> logger)
    {
        _bookService = bookService;
        _logger = logger;
    }
    
    [HttpGet("search")]
    public async Task<ActionResult<List<Book>>> Search([FromQuery] string title)
    {
        _logger.LogInformation($"Search called with term: {title}");
        
        if (string.IsNullOrWhiteSpace(title))
        {
            var allBooks = await _bookService.GetAllAsync();
            _logger.LogInformation($"Returning {allBooks.Count} books (no search term)");
            return Ok(allBooks);
        }
        
        var books = await _bookService.SearchByTitleOrAuthorAsync(title);
        _logger.LogInformation($"Found {books.Count} books matching '{title}'");
        return Ok(books);
    }
}
```

**What you'll see in terminal**:
```
info: BookManagementApi.Controllers.BooksController[0]
      Search called with term: adventure
info: BookManagementApi.Controllers.BooksController[0]
      Found 3 books matching 'adventure'
```

---

### **Debug Technique #5: Check API Port**

**Your frontend makes requests to wrong port?**

```csharp
// Backend runs on port 5023 (check launchSettings.json)
// {
//   "applicationUrl": "http://localhost:5023"
// }

// But frontend calls wrong port?
private apiUrl = 'http://localhost:5000/api/books'; // ❌ WRONG!
private apiUrl = 'http://localhost:5023/api/books'; // ✅ CORRECT!
```

**Find the backend port**:
1. Check `BookManagementApi/Properties/launchSettings.json`
2. Look for `"applicationUrl"`
3. Backend says "Now listening on: http://localhost:5023" when starting

---

### **Debug Technique #6: Check CORS Issues**

**Browser blocking requests?**

**Error message**: "Access to XMLHttpRequest at 'http://localhost:5023/api/books' from origin 'http://localhost:4200' has been blocked by CORS policy"

**In Network tab**: Status 0 or 403

**Fix in backend** (`Program.cs`):
```csharp
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngularApp", policy =>
    {
        policy.WithOrigins("http://localhost:4200")  // ← Your frontend URL
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// Then use it:
app.UseCors("AllowAngularApp");
```

---

## 🚨 Common Errors & Solutions

### Error: "404 Not Found" on Search
```
GET /api/books/search → 404 Not Found
```
**Cause**: Route ordering issue (search comes after {id} parameter)  
**Solution**: Move `[HttpGet("search")]` before `[HttpGet("{id}")]`

---

### Error: Properties showing `undefined` in UI
```
{{ book.title }} displays as undefined
```
**Cause**: API returns `"Title"` but template expects `"title"`  
**Solution**: Enable `JsonNamingPolicy.CamelCase` in backend

---

### Error: "Cannot match any routes"
```
Error: Cannot match any routes belonging to component BookDetailComponent
```
**Cause**: Route path mismatch  
**Check**: `app.routes.ts` paths vs router navigation

---

### Error: "No provider for BookService"
```
Error: NullInjectorError: No provider for BookService!
```
**Cause**: Service not provided in component or app config  
**Solution**: Add `BookService` to component `providers` or `app.config.ts`

---

## ✅ Verification Checklist

After making changes, verify everything works:

- [ ] Backend starts without errors
- [ ] Frontend starts without errors
- [ ] Network tab shows 200 status for API calls
- [ ] Book list displays with all data
- [ ] Search filters books correctly
- [ ] Add/Create book works
- [ ] Edit book works
- [ ] Delete book works (with confirmation)
- [ ] View book details works
- [ ] Genre filter works
- [ ] Stock filter works

---

## 📊 Data Flow Diagram

```
User Action (Search "Adventure")
        ↓
Angular Component
book-list.component.ts: filterBooks()
        ↓
BookService.searchBooks("Adventure")
        ↓
HTTP GET Request
/api/books/search?title=Adventure
        ↓
.NET Backend
BooksController.Search()
        ↓
BookService.SearchByTitleOrAuthorAsync()
        ↓
MongoDB Query
Find documents matching title/author
        ↓
Return JSON Response
[{"id": "...", "title": "Adventure...", ...}]
        ↓
JSON Serialization
Converts to camelCase
{"id": "...", "title": "Adventure..."}
        ↓
Angular receives response
        ↓
TypeScript deserializes to Book[]
        ↓
Template renders results
{{ book.title }}, {{ book.author }}, etc.
```

---

## 🔗 Related Files Reference

| Issue Type | Debug File | Line Number |
|------------|-----------|-------------|
| JSON naming | `Program.cs` | Line 26-30 |
| Route conflict | `BooksController.cs` | Line 23-54 |
| Service method | `book.service.ts` | Line 40-44 |
| Component logic | `book-list.component.ts` | Line 49-83 |
| Environment | `appsettings.json` | ConnectionString |
| CORS config | `Program.cs` | Line 39-48 |

---

## 💡 Best Practices to Avoid These Issues

### 1. **Naming Convention Consistency**
- .NET uses PascalCase
- JavaScript/TypeScript uses camelCase
- **Always convert in JSON serialization**

### 2. **Route Ordering**
- Specific routes first (with literals)
- Generic routes last (with parameters)
- Use `[Route("specific")]` before `[Route("{id}")]`

### 3. **Testing at Each Layer**
- Test backend with Postman
- Test frontend Network tab
- Test component with console.log
- Test e2e with actual browser

### 4. **Error Handling**
- Always have `.subscribe({ error: ... })`
- Log errors with context
- Provide user-friendly error messages
- Have fallback mechanisms

### 5. **CORS Setup**
- Allow only needed origins (not `*` in production)
- Check both backend and frontend URLs
- Test from different localhost ports

### 6. **Environment Variables**
- Never hardcode sensitive data
- Use `.env` files
- Match between frontend and backend ports

---

## 📞 Quick Troubleshooting Flow

```
Issue: CRUD not working?

1. Check Backend
   ├─ Is it running? (port 5023)
   ├─ Any startup errors?
   └─ Restart with: dotnet run

2. Check API Response
   ├─ Open DevTools → Network tab
   ├─ Make request
   ├─ Check Status (200?)
   └─ Check Response body format

3. Check Property Names
   ├─ Is it camelCase or PascalCase?
   ├─ Compare with TypeScript model
   └─ Fix in Program.cs if needed

4. Check Routes
   ├─ Is route specific enough?
   ├─ Is it before generic routes?
   └─ Test with Postman

5. Check Frontend
   ├─ Any console errors?
   ├─ Check component logic
   ├─ Verify service method exists
   └─ Check NetworkTab for CORS errors

6. Restart Both
   ├─ Kill backend (Ctrl+C)
   ├─ Kill frontend (Ctrl+C)
   ├─ Start backend: dotnet run
   ├─ Start frontend: npm start
   └─ Hard refresh browser (Ctrl+Shift+R)
```

---

## 🎓 Learning Resources

- **ASP.NET Documentation**: https://docs.microsoft.com/en-us/aspnet/core/
- **Angular Documentation**: https://angular.io/docs
- **REST API Best Practices**: https://restfulapi.net/
- **MongoDB Documentation**: https://docs.mongodb.com/
- **JSON Naming Conventions**: https://google.github.io/styleguide/jsoncstyleguide.xml

---

**Document Version**: 1.0  
**Created**: April 6, 2026  
**Last Updated**: April 6, 2026
