using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace BookManagementApi.Models;

public class Book
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? Id { get; set; }
    
    [BsonElement("title")]
    public string Title { get; set; } = string.Empty;
    
    [BsonElement("author")]
    public string Author { get; set; } = string.Empty;
    
    [BsonElement("isbn")]
    public string ISBN { get; set; } = string.Empty;
    
    [BsonElement("publishedYear")]
    public int PublishedYear { get; set; }
    
    [BsonElement("genre")]
    public string Genre { get; set; } = string.Empty;
    
    [BsonElement("price")]
    public decimal Price { get; set; }
    
    [BsonElement("inStock")]
    public bool InStock { get; set; }
    
    [BsonElement("createdAt")]
    public DateTime CreatedAt { get; set; }
    
    [BsonElement("updatedAt")]
    public DateTime UpdatedAt { get; set; }
}