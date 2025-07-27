using BarConnecte.Core.Datas;
using BarConnecte.Core.Dtos;
using Microsoft.AspNetCore.Mvc;

namespace BarConnecte.Api.Public.Endpoints;
using JetBrains.Annotations;

[PublicAPI]
public class OrderEndpoint
{
    public static Task<ApiWrapper<string>> Map(
        [FromBody] OrderDto order,
        BarDbContext db)
    {
        return Task.FromResult(order.Drinks.Count == 0 ? 
            new ApiWrapper<string>("Order cannot be empty.") :
            // Process the order logic here, e.g., save to database, etc.
            // For now, we will just return a success message.
            new ApiWrapper<string>("Order placed successfully."));
    }
}

[PublicAPI]
public record OrderDto(List<OrderDrinkDto> Drinks);

[PublicAPI]
public record OrderDrinkDto(string Name, int Quantity)
{
    public string Name { get; set; } = Name;
    public int Quantity { get; set; } = Quantity;
}