using BarConnecte.Api.Admin.Endpoints;
using JetBrains.Annotations;

namespace BarConnecte.Api.Admin.Extensions;

[PublicAPI]
public static class MappingExtension
{
    public static RouteGroupBuilder MapDrinks(this RouteGroupBuilder group)
    {
        group.MapGet("/{drinkName}", GetDrink.Map);
        group.MapGet("/all", GetAllDrinks.Map);
        group.MapPost("/", CreateDrink.Map);
        group.MapDelete("/{id:int}", DeleteDrink.Map);
        group.MapPut("/{id:int}", UpdateDrink.Map);
        
        return group;
    }
}