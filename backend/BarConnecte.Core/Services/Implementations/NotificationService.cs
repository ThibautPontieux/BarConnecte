using BarConnecte.Core.Models;
using BarConnecte.Core.Services.Interfaces;

namespace BarConnecte.Core.Services.Implementations;

public class NotificationService : INotificationService
{
    // Pour l'instant, implémentation simple avec logging
    // Plus tard, on pourra intégrer SignalR ici
    
    public async Task NotifyNewOrder(Order order)
    {
        Console.WriteLine($"🔔 Nouvelle commande #{order.Id} de {order.CustomerName}");
        // TODO: Envoyer notification SignalR aux barmans
        await Task.CompletedTask;
    }

    public async Task NotifyOrderStatusUpdate(Order order)
    {
        Console.WriteLine($"📊 Commande #{order.Id} mise à jour: {order.Status}");
        // TODO: Notifier le client du changement de statut
        await Task.CompletedTask;
    }

    public async Task NotifyOrderReady(Order order)
    {
        Console.WriteLine($"✅ Commande #{order.Id} prête pour {order.CustomerName}");
        // TODO: Notifier le client que sa commande est prête
        await Task.CompletedTask;
    }

    public async Task NotifyStockUpdate(int drinkId, decimal newQuantity)
    {
        Console.WriteLine($"📦 Stock mis à jour pour boisson #{drinkId}: {newQuantity}");
        // TODO: Notifier les interfaces de la mise à jour du stock
        await Task.CompletedTask;
    }
}
