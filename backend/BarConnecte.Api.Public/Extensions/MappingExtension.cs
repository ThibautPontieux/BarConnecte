using BarConnecte.Api.Public.Endpoints;

namespace BarConnecte.Api.Public.Extensions;

public static class MappingExtension
{
    public static RouteGroupBuilder MapMenus(this RouteGroupBuilder group)
    {
        group.MapGet("/", GetMenuEndpoint.Map);
        
        return group;
    }
}