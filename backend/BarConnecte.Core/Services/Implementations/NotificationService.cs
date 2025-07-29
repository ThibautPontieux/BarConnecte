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
    
    public async Task NotifyOrderModified(Order order, string reason)
    {
        Console.WriteLine($"✏️ Commande #{order.Id} modifiée par le barman");
        Console.WriteLine($"   └── Client: {order.CustomerName}");
        Console.WriteLine($"   └── Raison: {reason}");
        Console.WriteLine($"   └── Nouveau total: {order.TotalAmount:C}");
        Console.WriteLine($"   └── Modifiée le: {order.LastModifiedAt}");
        
        if (order.Items.Count != 0)
        {
            Console.WriteLine("   └── Articles restants:");
            foreach (var item in order.Items)
            {
                Console.WriteLine($"       • {item.DrinkName} x{item.Quantity} ({item.TotalPrice:C})");
            }
        }
        
        // TODO: Implémenter la notification temps réel avec SignalR
        // - Envoyer notification push au client (email, SMS, web push)
        // - Mettre à jour l'interface client en temps réel
        // - Logger la modification pour l'audit
        
        await Task.CompletedTask;
    }
}
