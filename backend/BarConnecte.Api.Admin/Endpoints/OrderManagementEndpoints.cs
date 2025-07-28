using BarConnecte.Core.Dtos;
using BarConnecte.Core.Services.Interfaces;
using JetBrains.Annotations;
using Microsoft.AspNetCore.Http.HttpResults;

namespace BarConnecte.Api.Admin.Endpoints;

[PublicAPI]
public static class OrderManagementEndpoints
{
    // GET /admin/orders/{status} - Récupérer les commandes par statut
    public static async Task<Ok<List<OrderResponse>>> GetOrdersByStatus(
        string status,
        IOrderService orderService)
    {
        var orders = await orderService.GetOrdersByStatusAsync(status);

        var response = orders.Select(order => new OrderResponse(
            order.Id,
            order.CustomerName,
            order.Status.ToString(),
            order.TotalAmount,
            order.CreatedAt,
            [.. order.Items.Select(i => new OrderItemResponse(
                i.DrinkName,
                i.Quantity,
                i.UnitPrice,
                i.TotalPrice
            ))]
        )).ToList();

        return TypedResults.Ok(response);
    }

    // POST /admin/orders/{id}/accept - Accepter une commande
    public static async Task<Results<Ok<OrderResponse>, NotFound, BadRequest<string>>> AcceptOrder(
        int id,
        IOrderService orderService)
    {
        try
        {
            var order = await orderService.AcceptOrderAsync(id);
            
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

            return TypedResults.Ok(response);
        }
        catch (InvalidOperationException ex)
        {
            return TypedResults.BadRequest(ex.Message);
        }
    }

    // POST /admin/orders/{id}/reject - Refuser une commande
    public static async Task<Results<Ok<OrderResponse>, NotFound, BadRequest<string>>> RejectOrder(
        int id,
        IOrderService orderService)
    {
        try
        {
            var order = await orderService.RejectOrderAsync(id);
            
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

            return TypedResults.Ok(response);
        }
        catch (InvalidOperationException ex)
        {
            return TypedResults.BadRequest(ex.Message);
        }
    }

    // POST /admin/orders/{id}/ready - Marquer une commande comme prête
    public static async Task<Results<Ok<OrderResponse>, NotFound, BadRequest<string>>> MarkOrderReady(
        int id,
        IOrderService orderService)
    {
        try
        {
            var order = await orderService.MarkOrderReadyAsync(id);
            
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

            return TypedResults.Ok(response);
        }
        catch (InvalidOperationException ex)
        {
            return TypedResults.BadRequest(ex.Message);
        }
    }

    // POST /admin/orders/{id}/complete - Marquer une commande comme terminée
    public static async Task<Results<Ok<OrderResponse>, NotFound, BadRequest<string>>> CompleteOrder(
        int id,
        IOrderService orderService)
    {
        try
        {
            var order = await orderService.CompleteOrderAsync(id);
            
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

            return TypedResults.Ok(response);
        }
        catch (InvalidOperationException ex)
        {
            return TypedResults.BadRequest(ex.Message);
        }
    }
}