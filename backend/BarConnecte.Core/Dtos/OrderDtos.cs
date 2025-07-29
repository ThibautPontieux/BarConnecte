namespace BarConnecte.Core.Dtos;

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

/// <summary>
/// Réponse d'article de commande
/// </summary>
/// <param name="DrinkName">Nom de la boisson</param>
/// <param name="Quantity">Quantité</param>
/// <param name="UnitPrice">Prix unitaire</param>
/// <param name="TotalPrice">Prix total</param>
public record OrderItemResponse(
    string DrinkName,
    int Quantity,
    decimal UnitPrice,
    decimal TotalPrice
);
    