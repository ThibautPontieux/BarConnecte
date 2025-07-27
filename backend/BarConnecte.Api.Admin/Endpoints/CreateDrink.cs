using BarConnecte.Core.Datas;
using BarConnecte.Core.Models;
using JetBrains.Annotations;
using Microsoft.AspNetCore.Http.HttpResults;

namespace BarConnecte.Api.Admin.Endpoints;

[PublicAPI]
public static class CreateDrink
{
    public static async Task<Results<Created<Drink>, BadRequest<string>>> Map(BarDbContext db, Drink drink)
    {
        if (string.IsNullOrWhiteSpace(drink.Name) || drink.Quantity <= 0)
        {
            return TypedResults.BadRequest("Invalid drink data.");
        }

        db.Drinks.Add(drink);
        await db.SaveChangesAsync();

        return TypedResults.Created($"/drinks/{drink.Id}", drink);
    }
}