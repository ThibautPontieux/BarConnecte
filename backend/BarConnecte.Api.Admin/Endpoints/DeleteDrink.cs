using BarConnecte.Core.Datas;
using JetBrains.Annotations;
using Microsoft.AspNetCore.Http.HttpResults;

namespace BarConnecte.Api.Admin.Endpoints;

[PublicAPI]
public static class DeleteDrink
{
    public static async Task<Results<NoContent, NotFound>> Map(
        int id,
        BarDbContext db)
    {
        var drink = await db.Drinks.FindAsync(id);
        if (drink == null)
        {
            return TypedResults.NotFound();
        }

        db.Drinks.Remove(drink);
        await db.SaveChangesAsync();

        return TypedResults.NoContent();
    }
}