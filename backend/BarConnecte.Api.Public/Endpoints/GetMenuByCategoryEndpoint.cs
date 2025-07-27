using BarConnecte.Core.Datas;
using BarConnecte.Core.Dtos;
using BarConnecte.Core.Models;
using Microsoft.EntityFrameworkCore;
using JetBrains.Annotations;

namespace BarConnecte.Api.Public.Endpoints;

[PublicAPI]
public class GetMenuByCategoryEndpoint
{
    public static async Task<ApiWrapper<List<Drink>>> Map(
        string category,
        BarDbContext db)
    {
        if (string.IsNullOrEmpty(category))
        {
            return new ApiWrapper<List<Drink>>("Category cannot be null.");
        }
        
        var drinks = await db.Drinks
            .Where(d => d.Category.ToString().Equals(category, StringComparison.OrdinalIgnoreCase))
            .ToListAsync();
        
        return drinks.Count == 0 
            ? new ApiWrapper<List<Drink>>("No drinks found for the specified category.")
            : new ApiWrapper<List<Drink>>(drinks);
    }
}