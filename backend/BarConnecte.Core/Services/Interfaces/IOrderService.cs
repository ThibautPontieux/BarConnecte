using BarConnecte.Core.Models;

namespace BarConnecte.Core.Services.Interfaces;

public interface IOrderService
{
    Task<Order> CreateOrderAsync(string customerName, List<OrderItemRequest> items);
    Task<Order?> GetOrderAsync(int orderId);
    Task<List<Order>> GetOrdersByStatusAsync(string status);
    Task<Order> AcceptOrderAsync(int orderId);
    Task<Order> RejectOrderAsync(int orderId);
    Task<Order> MarkOrderReadyAsync(int orderId);
    Task<Order> CompleteOrderAsync(int orderId);
    Task<bool> CheckStockAvailabilityAsync(List<OrderItemRequest> items);
}

public record OrderItemRequest(int DrinkId, int Quantity);