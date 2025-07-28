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

public record OrderItemResponse(
    string DrinkName,
    int Quantity,
    decimal UnitPrice,
    decimal TotalPrice
);
    