using BarConnecte.Core.Datas;
using BarConnecte.Core.Dtos;
using BarConnecte.Core.Models;
using JetBrains.Annotations;
using Microsoft.AspNetCore.Http.HttpResults;

namespace BarConnecte.Api.Admin.Endpoints;

[PublicAPI]
public static class UpdateDrink
{
    public static async Task<Results<Ok, NotFound, BadRequest<string>>> Map(
        int id,
        ApiWrapper<UpdateDrinkRequest> request,
        BarDbContext db)
    {
        if (request.Data == null)
        {
            return TypedResults.BadRequest("Drink data is required.");
        }
        if (string.IsNullOrWhiteSpace(request.Data.Name) || request.Data.Quantity <= 0)
        {
            return TypedResults.BadRequest("Invalid drink data.");
        }
        if (id <= 0)
        {
            return TypedResults.BadRequest("Invalid drink ID.");
        }
        // Find the drink by ID
        var drink = await db.Drinks.FindAsync(id);
        if (drink == null)
        {
            return TypedResults.NotFound();
        }
        
        // Update the drink properties
        drink.Name = request.Data.Name;
        drink.Quantity = request.Data.Quantity;
        drink.Description = request.Data.Description;
        drink.Category = request.Data.Category;
        drink.Price = request.Data.Price;

        await db.SaveChangesAsync();

        return TypedResults.Ok();
    }

    public record UpdateDrinkRequest(
        string Name,
        decimal Quantity,
        string Description,
        DrinkCategory Category,
        decimal Price);
}