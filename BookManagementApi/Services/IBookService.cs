using BookManagementApi.Models;

namespace BookManagementApi.Services;

public interface IBookService
{
    Task<List<Book>> GetAllAsync();
    Task<Book?> GetByIdAsync(string id);
    Task<Book> CreateAsync(Book book);
    Task UpdateAsync(string id, Book book);
    Task DeleteAsync(string id);
    Task<List<Book>> SearchByTitleOrAuthorAsync(string searchTerm);
    Task<List<Book>> GetByGenreAsync(string genre);
    Task<List<Book>> GetAvailableBooksAsync();
}