using BarConnecte.Core.Models;

namespace BarConnecte.Core.Services.Interfaces;

public interface INotificationService
{
    Task NotifyNewOrder(Order order);
    Task NotifyOrderStatusUpdate(Order order);
    Task NotifyOrderReady(Order order);
    Task NotifyStockUpdate(int drinkId, decimal newQuantity);
}
