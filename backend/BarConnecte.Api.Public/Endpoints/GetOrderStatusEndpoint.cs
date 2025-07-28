using BarConnecte.Core.Services.Interfaces;
using JetBrains.Annotations;
using Microsoft.AspNetCore.Http.HttpResults;

namespace BarConnecte.Api.Public.Endpoints;

[PublicAPI]
public static class GetOrderStatusEndpoint
{
    public static async Task<Results<Ok<CreateOrderEndpoint.OrderResponse>, NotFound>> Map(
        int orderId,
        IOrderService orderService)
    {
        var order = await orderService.GetOrderAsync(orderId);
        
        if (order == null)
        {
            return TypedResults.NotFound();
        }

        var response = new CreateOrderEndpoint.OrderResponse(
            order.Id,
            order.CustomerName,
            order.Status.ToString(),
            order.TotalAmount,
            order.CreatedAt,
            order.Items.Select(i => new CreateOrderEndpoint.OrderItemResponse(
                i.DrinkName,
                i.Quantity,
                i.UnitPrice,
                i.TotalPrice
            )).ToList()
        );

        return TypedResults.Ok(response);
    }
}
