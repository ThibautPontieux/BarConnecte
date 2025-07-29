using BarConnecte.Core.Datas;
using BarConnecte.Core.Dtos;
using BarConnecte.Core.Models;
using JetBrains.Annotations;
using Microsoft.AspNetCore.Http.HttpResults;

namespace BarConnecte.Api.Admin.Endpoints;

[PublicAPI]
public static class CreateDrink
{
    public static async Task<Results<Created<Drink>, BadRequest<string>>> Map(
        BarDbContext db, ApiWrapper<CreateDrinkRequest> drink)
    {
        if (drink.Data == null)
        {
            return TypedResults.BadRequest("Drink data is required.");
        }
        var newDrink = new Drink
        {
            Name = drink.Data.Name,
            Quantity = drink.Data.Quantity,
            Category = drink.Data.Category,
            Description = drink.Data.Description,
            Price = drink.Data.Price
        };
        
        if (string.IsNullOrWhiteSpace(newDrink.Name) || newDrink.Quantity <= 0)
        {
            return TypedResults.BadRequest("Invalid drink data.");
        }

        var result = db.Drinks.Add(newDrink);
        await db.SaveChangesAsync();
        return TypedResults.Created($"/drinks/{result.Entity.Id}", result.Entity);
    }
}

[PublicAPI]
public record CreateDrinkRequest
{
    public string Name { get; init; } = string.Empty;
    public decimal Quantity { get; init; }
    public DrinkCategory Category { get; init; }
    public string Description { get; init; } = string.Empty;
    public decimal Price { get; init; }
}