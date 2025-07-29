using BarConnecte.Core.Dtos;
using BarConnecte.Core.Models;

namespace BarConnecte.Api.Admin.Extensions;

public static class StockCheckExtensions
{
    /// <summary>
    /// Convertit un StockCheckResult en StockCheckResponse
    /// </summary>
    public static StockCheckResponse ToResponse(this StockCheckResult result)
    {
        return new StockCheckResponse(
            result.IsFullyAvailable,
            
            // Mapping complexe de la liste
            result.Issues.Select(issue => new StockIssueResponse(
                issue.DrinkId,
                issue.DrinkName,
                issue.RequestedQuantity,
                issue.AvailableQuantity,
                issue.Type.ToString(),          // ← Enum vers String
                issue.MissingQuantity           // ← Propriété calculée
            )).ToList(),
            
            result.CheckedAt
        );
    }
}