using BarConnecte.Core.Dtos;
using BarConnecte.Core.Models;

namespace BarConnecte.Api.Admin.Extensions;

public static class OrderExtensions
{
    /// <summary>
    /// Convertit un Order en ExtendedOrderResponse
    /// </summary>
    public static ExtendedOrderResponse ToExtendedResponse(this Order order)
    {
        return new ExtendedOrderResponse(
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
            )).ToList(),
            order.IsPartiallyModified,      // ← NOUVELLES PROPRIÉTÉS
            order.ModificationReason,       // ← pour l'édition
            order.LastModifiedAt            // ← de commandes
        );
    }
}