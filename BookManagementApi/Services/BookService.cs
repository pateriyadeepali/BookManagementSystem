using BookManagementApi.Models;
using Microsoft.Extensions.Options;
using MongoDB.Driver;

namespace BookManagementApi.Services;

public class BookService : IBookService
{
    private readonly IMongoCollection<Book> _booksCollection;

    public BookService(IOptions<DatabaseSettings> databaseSettings)
    {
        var mongoClient = new MongoClient(databaseSettings.Value.ConnectionString);
        var database = mongoClient.GetDatabase(databaseSettings.Value.DatabaseName);
        _booksCollection = database.GetCollection<Book>(databaseSettings.Value.BooksCollectionName);
    }

    public async Task<List<Book>> GetAllAsync()
    {
        return await _booksCollection.Find(_ => true).ToListAsync();
    }

    public async Task<Book?> GetByIdAsync(string id)
    {
        return await _booksCollection.Find(x => x.Id == id).FirstOrDefaultAsync();
    }

    public async Task<Book> CreateAsync(Book book)
    {
        book.CreatedAt = DateTime.UtcNow;
        book.UpdatedAt = DateTime.UtcNow;
        await _booksCollection.InsertOneAsync(book);
        return book;
    }

    public async Task UpdateAsync(string id, Book book)
    {
        book.Id = id;
        book.UpdatedAt = DateTime.UtcNow;
        await _booksCollection.ReplaceOneAsync(x => x.Id == id, book);
    }

    public async Task DeleteAsync(string id)
    {
        await _booksCollection.DeleteOneAsync(x => x.Id == id);
    }

    public async Task<List<Book>> GetByGenreAsync(string genre)
    {
        return await _booksCollection.Find(x => x.Genre.ToLower() == genre.ToLower()).ToListAsync();
    }

    public async Task<List<Book>> GetAvailableBooksAsync()
    {
        return await _booksCollection.Find(x => x.InStock == true).ToListAsync();
    }
}