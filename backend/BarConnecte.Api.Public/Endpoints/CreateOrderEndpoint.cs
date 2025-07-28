using BarConnecte.Core.Services.Interfaces;
using JetBrains.Annotations;
using Microsoft.AspNetCore.Http.HttpResults;

namespace BarConnecte.Api.Public.Endpoints;

[PublicAPI]
public static class CreateOrderEndpoint
{
    public static async Task<Results<Created<OrderResponse>, BadRequest<string>>> Map(
        CreateOrderRequest request,
        IOrderService orderService)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(request.CustomerName))
                return TypedResults.BadRequest("Le nom du client est requis");

            if (request.Items.Count == 0)
                return TypedResults.BadRequest("La commande doit contenir au moins un article");

            var items = request.Items.Select(i => new OrderItemRequest(i.DrinkId, i.Quantity)).ToList();
            
            var order = await orderService.CreateOrderAsync(request.CustomerName, items);
            
            var response = new OrderResponse(
                order.Id,
                order.CustomerName,
                order.Status.ToString(),
                order.TotalAmount,
                order.CreatedAt,
                order.Items.Select(i => new OrderItemResponse(
                    i.DrinkName,
                    i.Quantity,
                    i.UnitPrice,
                    i.TotalPrice
                )).ToList()
            );

            return TypedResults.Created($"/orders/{order.Id}", response);
        }
        catch (InvalidOperationException ex)
        {
            return TypedResults.BadRequest(ex.Message);
        }
    }

    public record CreateOrderRequest(
        string CustomerName,
        List<CreateOrderItemRequest> Items
    );

    public record CreateOrderItemRequest(
        int DrinkId,
        int Quantity
    );

    public record OrderResponse(
        int Id,
        string CustomerName,
        string Status,
        decimal TotalAmount,
        DateTime CreatedAt,
        List<OrderItemResponse> Items
    );

    public record OrderItemResponse(
        string DrinkName,
        int Quantity,
        decimal UnitPrice,
        decimal TotalPrice
    );
}
