using BarConnecte.Core.Datas;
using JetBrains.Annotations;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.EntityFrameworkCore;

namespace BarConnecte.Api.Admin.Endpoints;

[PublicAPI]
public class GetAllDrinks
{
    public static async Task<Ok<GetMenuResponse>> Map(BarDbContext db)
    {
        var drinks = await db.Drinks.ToListAsync();
        return TypedResults.Ok(new GetMenuResponse(drinks.Select(d => d.Name)));
    }
    
    public record GetMenuResponse(IEnumerable<string> Drinks);
}