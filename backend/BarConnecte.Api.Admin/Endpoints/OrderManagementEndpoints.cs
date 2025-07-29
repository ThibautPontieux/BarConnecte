using BarConnecte.Api.Admin.Extensions;
using BarConnecte.Core.Dtos;
using BarConnecte.Core.Models;
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
    
    // GET /admin/orders/{id}/stock-check - Vérifier le stock détaillé d'une commande
    public static async Task<Results<Ok<StockCheckResponse>, NotFound, BadRequest<string>>> CheckOrderStock(
        int id,
        IOrderService orderService)
    {
        try
        {
            var stockCheck = await orderService.CheckOrderStockDetailedAsync(id);
            
            var response = stockCheck.ToResponse();
            
            return TypedResults.Ok(response);
        }
        catch (InvalidOperationException ex)
        {
            return TypedResults.BadRequest(ex.Message);
        }
    }

    // PUT /admin/orders/{id}/edit - Éditer une commande complètement
    public static async Task<Results<Ok<ExtendedOrderResponse>, NotFound, BadRequest<string>>> EditOrder(
        int id,
        EditOrderRequest request,
        IOrderService orderService)
    {
        try
        {
            // Validation des données d'entrée
            if (string.IsNullOrWhiteSpace(request.Reason))
                return TypedResults.BadRequest("Une raison doit être fournie pour la modification");

            if (!request.Items.Any())
                return TypedResults.BadRequest("Au moins un article doit être présent dans la commande modifiée");

            if (request.Items.Any(item => item.Quantity <= 0))
                return TypedResults.BadRequest("Toutes les quantités doivent être supérieures à 0");

            // Convertir en format interne
            var itemRequests = request.Items.Select(item => 
                new OrderItemRequest(item.DrinkId, item.Quantity)).ToList();

            // Éditer la commande
            var order = await orderService.EditOrderAsync(id, itemRequests, request.Reason);
            
            var response = order.ToExtendedResponse();
            
            return TypedResults.Ok(response);
        }
        catch (InvalidOperationException ex)
        {
            return TypedResults.BadRequest(ex.Message);
        }
        catch (ArgumentException ex)
        {
            return TypedResults.BadRequest(ex.Message);
        }
    }

    // POST /admin/orders/{id}/accept-partial - Accepter une commande en retirant certains articles
    public static async Task<Results<Ok<ExtendedOrderResponse>, NotFound, BadRequest<string>>> AcceptPartialOrder(
        int id,
        AcceptPartialOrderRequest request,
        IOrderService orderService)
    {
        try
        {
            // Validation des données d'entrée
            if (string.IsNullOrWhiteSpace(request.Reason))
                return TypedResults.BadRequest("Une raison doit être fournie pour les retraits");

            if (!request.ItemsToRemove.Any())
                return TypedResults.BadRequest("Au moins un article doit être spécifié pour le retrait");

            // Accepter partiellement la commande
            var order = await orderService.AcceptPartialOrderAsync(id, request.ItemsToRemove, request.Reason);
            
            var response = order.ToExtendedResponse();
            
            return TypedResults.Ok(response);
        }
        catch (InvalidOperationException ex)
        {
            return TypedResults.BadRequest(ex.Message);
        }
        catch (ArgumentException ex)
        {
            return TypedResults.BadRequest(ex.Message);
        }
    }

    // PUT /admin/orders/{id}/modify-quantities - Modifier les quantités d'articles existants
    public static async Task<Results<Ok<ExtendedOrderResponse>, NotFound, BadRequest<string>>> ModifyOrderQuantities(
        int id,
        ModifyQuantitiesRequest request,
        IOrderService orderService)
    {
        try
        {
            // Validation des données d'entrée
            if (string.IsNullOrWhiteSpace(request.Reason))
                return TypedResults.BadRequest("Une raison doit être fournie pour les modifications");

            if (!request.QuantityChanges.Any())
                return TypedResults.BadRequest("Au moins une modification de quantité doit être spécifiée");

            if (request.QuantityChanges.Any(kvp => kvp.Value < 0))
                return TypedResults.BadRequest("Les quantités ne peuvent pas être négatives");

            // Modifier les quantités
            var order = await orderService.ModifyOrderQuantitiesAsync(id, request.QuantityChanges, request.Reason);
            
            var response = order.ToExtendedResponse();
            
            return TypedResults.Ok(response);
        }
        catch (InvalidOperationException ex)
        {
            return TypedResults.BadRequest(ex.Message);
        }
        catch (ArgumentException ex)
        {
            return TypedResults.BadRequest(ex.Message);
        }
    }

    // GET /admin/orders/{id} - Récupérer une commande spécifique avec détails étendus
    public static async Task<Results<Ok<ExtendedOrderResponse>, NotFound>> GetOrderDetails(
        int id,
        IOrderService orderService)
    {
        var order = await orderService.GetOrderAsync(id);
        
        if (order == null)
            return TypedResults.NotFound();
        
        var response = order.ToExtendedResponse();
        
        return TypedResults.Ok(response);
    }
    
    // GET /admin/orders/{id}/suggestions - Obtenir des suggestions d'édition basées sur le stock
    public static async Task<Results<Ok<OrderEditSuggestionsResponse>, NotFound, BadRequest<string>>> GetOrderEditSuggestions(
        int id,
        IOrderService orderService)
    {
        try
        {
            var stockCheck = await orderService.CheckOrderStockDetailedAsync(id);
            var order = await orderService.GetOrderAsync(id);
            
            if (order == null)
                return TypedResults.NotFound();

            var suggestions = new List<EditSuggestion>();

            foreach (var issue in stockCheck.Issues)
            {
                switch (issue.Type)
                {
                    
                    case StockIssueType.OutOfStock:
                        suggestions.Add(new EditSuggestion(
                            $"Retirer complètement {issue.DrinkName} (en rupture)",
                            $"remove-item-{issue.DrinkId}",
                            "remove"
                        ));
                        break;
                        
                    case StockIssueType.InsufficientStock:
                        suggestions.Add(new EditSuggestion(
                            $"Réduire {issue.DrinkName} de {issue.RequestedQuantity} à {issue.AvailableQuantity}",
                            $"reduce-quantity-{issue.DrinkId}-{issue.AvailableQuantity}",
                            "reduce"
                        ));
                        suggestions.Add(new EditSuggestion(
                            $"Retirer complètement {issue.DrinkName}",
                            $"remove-item-{issue.DrinkId}",
                            "remove"
                        ));
                        break;
                }
            }

            var response = new OrderEditSuggestionsResponse(
                stockCheck.IsFullyAvailable,
                suggestions,
                order.TotalAmount,
                CalculateNewTotal(order, stockCheck.Issues)
            );

            return TypedResults.Ok(response);
        }
        catch (InvalidOperationException ex)
        {
            return TypedResults.BadRequest(ex.Message);
        }
    }
    
    private static decimal CalculateNewTotal(Order order, List<StockIssue> issues)
    {
        decimal newTotal = 0;
        
        foreach (var item in order.Items)
        {
            var issue = issues.FirstOrDefault(i => i.DrinkId == item.DrinkId);
            if (issue != null)
            {
                // Si stock insuffisant, prendre la quantité disponible
                // Si en rupture, ne pas compter cet article
                if (issue.Type == StockIssueType.InsufficientStock)
                {
                    newTotal += item.UnitPrice * issue.AvailableQuantity;
                }
                // OutOfStock: on n'ajoute rien (article retiré)
            }
            else
            {
                // Pas de problème, garder l'article tel quel
                newTotal += item.TotalPrice;
            }
        }
        
        return newTotal;
    }
}

[PublicAPI]
public record OrderEditSuggestionsResponse(
    bool IsFullyAvailable,
    List<EditSuggestion> Suggestions,
    decimal CurrentTotal,
    decimal EstimatedNewTotal
);

[PublicAPI]
public record EditSuggestion(
    string Description,
    string ActionId,
    string Type // "remove", "reduce", "replace"
);
