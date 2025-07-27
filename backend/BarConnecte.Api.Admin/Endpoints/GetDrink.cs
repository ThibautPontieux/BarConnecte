using BarConnecte.Core.Datas;
using BarConnecte.Core.Dtos;
using JetBrains.Annotations;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.EntityFrameworkCore;

namespace BarConnecte.Api.Admin.Endpoints;

[PublicAPI]
public static class GetDrink
{
    public static async Task<Results<Ok<ApiWrapper<GetDrinkResponse>>, NotFound>> Map(
        BarDbContext db, string drinkName)
    {
        var drink = await db.Drinks
            .Where(d => d.Name.Equals(drinkName, StringComparison.OrdinalIgnoreCase))
            .Select(d => d.Name)
            .FirstOrDefaultAsync();

        if (drink == null)
        {
            return TypedResults.NotFound();
        }

        return TypedResults.Ok(new ApiWrapper<GetDrinkResponse>(new GetDrinkResponse(drink)));
    }
    public record GetDrinkResponse(string Drink);
}