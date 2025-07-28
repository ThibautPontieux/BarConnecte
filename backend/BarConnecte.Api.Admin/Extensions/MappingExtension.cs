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
        
        return group;
    }
}