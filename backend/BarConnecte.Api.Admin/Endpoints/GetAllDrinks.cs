using BarConnecte.Core.Datas;
using BarConnecte.Core.Dtos;
using BarConnecte.Core.Models;
using JetBrains.Annotations;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.EntityFrameworkCore;

namespace BarConnecte.Api.Admin.Endpoints;

[PublicAPI]
public class GetAllDrinks
{
    public static async Task<Ok<ApiWrapper<GetMenuResponse>>> Map(BarDbContext db)
    {
        var drinks = await db.Drinks.ToListAsync();
        var response = drinks.Select(d => new DrinkResponse(
            d.Name,
            d.Quantity,
            d.Description,
            d.Category,
            d.Price)).ToArray();
        
        return TypedResults.Ok(new ApiWrapper<GetMenuResponse>(new GetMenuResponse(response)));
    }
    
    public record GetMenuResponse(DrinkResponse[] Drinks);
    public record DrinkResponse(
        string Name,
        decimal Quantity,
        string Description,
        DrinkCategory Category,
        decimal Price);
}