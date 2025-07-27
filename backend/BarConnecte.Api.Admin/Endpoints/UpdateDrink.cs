using BarConnecte.Core.Datas;
using JetBrains.Annotations;
using Microsoft.AspNetCore.Http.HttpResults;

namespace BarConnecte.Api.Admin.Endpoints;

[PublicAPI]
public static class UpdateDrink
{
    public static async Task<Results<Ok, NotFound>> Map(
        int id,
        UpdateDrinkRequest request,
        BarDbContext db)
    {
        var drink = await db.Drinks.FindAsync(id);
        if (drink == null)
        {
            return TypedResults.NotFound();
        }

        drink.Name = request.Name;
        drink.Quantity = request.Quantity;

        await db.SaveChangesAsync();

        return TypedResults.Ok();
    }

    public record UpdateDrinkRequest(string Name, decimal Quantity);
}