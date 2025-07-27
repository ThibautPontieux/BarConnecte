using BarConnecte.Core.Datas;
using JetBrains.Annotations;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.EntityFrameworkCore;

namespace BarConnecte.Api.Public.Endpoints;

[PublicAPI]
public static class GetMenuEndpoint
{
    // This method is used to retrieve the menu from the database.
    // It returns a list of drinks with their names.
    public static async Task<Ok<GetMenuResponse>> Map(BarDbContext db)
    {
        var drinks = await db.Drinks.ToListAsync();
        return TypedResults.Ok(new GetMenuResponse(drinks.Select(d => d.Name)));
    }
    
    public record GetMenuResponse(IEnumerable<string> Drinks);
}
