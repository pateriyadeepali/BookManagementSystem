using BookManagementApi.Models;
using BookManagementApi.Services;
using Microsoft.AspNetCore.Mvc;

namespace BookManagementApi.Controllers;

[Route("api/[controller]")]
[ApiController]
public class BooksController : ControllerBase
{
    private readonly IBookService _bookService;

    public BooksController(IBookService bookService)
    {
        _bookService = bookService;
    }

    [HttpGet]
    public async Task<ActionResult<List<Book>>> GetAll()
    {
        var books = await _bookService.GetAllAsync();
        return Ok(books);
    }

    [HttpGet("search")]
    public async Task<ActionResult<List<Book>>> Search([FromQuery] string title)
    {
        // If no search term, return all books
        if (string.IsNullOrWhiteSpace(title))
        {
            var allBooks = await _bookService.GetAllAsync();
            return Ok(allBooks);
        }
        
        // Search by title OR author
        var books = await _bookService.SearchByTitleOrAuthorAsync(title);
        return Ok(books);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Book>> GetById(string id)
    {
        var book = await _bookService.GetByIdAsync(id);
        if (book == null)
            return NotFound();
        return Ok(book);
    }

    [HttpPost]
    public async Task<ActionResult<Book>> Create(Book book)
    {
        var created = await _bookService.CreateAsync(book);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(string id, Book book)
    {
        await _bookService.UpdateAsync(id, book);
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(string id)
    {
        await _bookService.DeleteAsync(id);
        return NoContent();
    }
}


