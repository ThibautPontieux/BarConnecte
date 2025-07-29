using BarConnecte.Api.Admin.Endpoints;
using JetBrains.Annotations;

namespace BarConnecte.Api.Admin.Extensions;

[PublicAPI]
public static class MappingExtension
{
    public static RouteGroupBuilder MapDrinks(this RouteGroupBuilder group)
    {
        group.MapGet("/{drinkName}", GetDrink.Map);
        group.MapGet("/", GetAllDrinks.Map);
        group.MapPost("/", CreateDrink.Map);
        group.MapDelete("/{id:int}", DeleteDrink.Map);
        group.MapPut("/{id:int}", UpdateDrink.Map);
        
        return group;
    }
    
    public static RouteGroupBuilder MapOrders(this RouteGroupBuilder group)
    {
        group.MapGet("/{status}", OrderManagementEndpoints.GetOrdersByStatus);
        group.MapPost("/{id:int}/accept", OrderManagementEndpoints.AcceptOrder);
        group.MapPost("/{id:int}/reject", OrderManagementEndpoints.RejectOrder);
        group.MapPost("/{id:int}/ready", OrderManagementEndpoints.MarkOrderReady);
        group.MapGet("/{id:int}/complete", OrderManagementEndpoints.CompleteOrder);
        // GET /admin/orders/{id} - Récupérer une commande spécifique
        group.MapGet("/{id:int}", OrderManagementEndpoints.GetOrderDetails)
            .WithName("GetOrderDetails")
            .WithSummary("Récupérer les détails d'une commande")
            .WithDescription("Récupère une commande avec tous ses détails y compris les modifications")
            .WithOpenApi();

        // GET /admin/orders/{id}/stock-check - Vérifier le stock détaillé
        group.MapGet("/{id:int}/stock-check", OrderManagementEndpoints.CheckOrderStock)
            .WithName("CheckOrderStock")
            .WithSummary("Vérifier le stock détaillé d'une commande")
            .WithDescription("Analyse le stock disponible pour chaque article de la commande")
            .WithOpenApi();

        // GET /admin/orders/{id}/suggestions - Obtenir des suggestions d'édition
        group.MapGet("/{id:int}/suggestions", OrderManagementEndpoints.GetOrderEditSuggestions)
            .WithName("GetOrderEditSuggestions")
            .WithSummary("Obtenir des suggestions d'édition")
            .WithDescription("Fournit des suggestions automatiques pour résoudre les problèmes de stock")
            .WithOpenApi();

        // PUT /admin/orders/{id}/edit - Éditer une commande complètement
        group.MapPut("/{id:int}/edit", OrderManagementEndpoints.EditOrder)
            .WithName("EditOrder")
            .WithSummary("Éditer une commande complètement")
            .WithDescription("Remplace complètement les articles d'une commande en attente")
            .WithOpenApi();

        // POST /admin/orders/{id}/accept-partial - Accepter partiellement
        group.MapPost("/{id:int}/accept-partial", OrderManagementEndpoints.AcceptPartialOrder)
            .WithName("AcceptPartialOrder")
            .WithSummary("Accepter une commande partiellement")
            .WithDescription("Accepte une commande en retirant les articles problématiques")
            .WithOpenApi();

        // PUT /admin/orders/{id}/modify-quantities - Modifier les quantités
        group.MapPut("/{id:int}/modify-quantities", OrderManagementEndpoints.ModifyOrderQuantities)
            .WithName("ModifyOrderQuantities")
            .WithSummary("Modifier les quantités d'articles")
            .WithDescription("Modifie les quantités d'articles existants dans une commande")
            .WithOpenApi();
        
        return group;
    }
}