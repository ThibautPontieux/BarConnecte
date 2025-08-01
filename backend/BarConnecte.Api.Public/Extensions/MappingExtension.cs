using BarConnecte.Api.Public.Endpoints;
using JetBrains.Annotations;

namespace BarConnecte.Api.Public.Extensions;

[PublicAPI]
public static class MappingExtension
{
    public static RouteGroupBuilder MapMenus(this RouteGroupBuilder group)
    {
        group.MapGet("/", GetMenuEndpoint.Map);
        group.MapGet("/{category}", GetMenuByCategoryEndpoint.Map);
        group.MapPost("/order", OrderEndpoint.Map);
        
        return group;
    }
    
    public static RouteGroupBuilder MapOrders(this RouteGroupBuilder group)
    {
        group.MapGet("/{orderId:int}", GetOrderStatusEndpoint.Map);
        group.MapPost("/", CreateOrderEndpoint.Map);
        
        return group;
    }
}