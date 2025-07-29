using BarConnecte.Core.Datas;
using BarConnecte.Core.Models;
using BarConnecte.Core.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace BarConnecte.Core.Services.Implementations;

public class OrderService : IOrderService
{
    private readonly BarDbContext _context;
    private readonly INotificationService _notificationService;

    public OrderService(BarDbContext context, INotificationService notificationService)
    {
        _context = context;
        _notificationService = notificationService;
    }

    public async Task<Order> CreateOrderAsync(string customerName, List<OrderItemRequest> items)
    {
        // Vérifier la disponibilité du stock
        if (!await CheckStockAvailabilityAsync(items))
        {
            throw new InvalidOperationException("Stock insuffisant pour certains articles");
        }

        // Créer la commande
        var order = new Order
        {
            CustomerName = customerName,
            Status = OrderStatus.Pending,
            Items = new List<OrderItem>()
        };

        decimal totalAmount = 0;

        foreach (var itemRequest in items)
        {
            var drink = await _context.Drinks.FindAsync(itemRequest.DrinkId);
            if (drink == null) continue;

            var orderItem = new OrderItem
            {
                DrinkId = drink.Id,
                DrinkName = drink.Name,
                Quantity = itemRequest.Quantity,
                UnitPrice = drink.Price
            };

            order.Items.Add(orderItem);
            totalAmount += orderItem.TotalPrice;
        }

        order.TotalAmount = totalAmount;

        _context.Orders.Add(order);
        await _context.SaveChangesAsync();

        // Notifier les barmans
        await _notificationService.NotifyNewOrder(order);

        return order;
    }

    public async Task<Order?> GetOrderAsync(int orderId)
    {
        return await _context.Orders
            .Include(o => o.Items)
            .ThenInclude(i => i.Drink)
            .FirstOrDefaultAsync(o => o.Id == orderId);
    }

    public async Task<List<Order>> GetOrdersByStatusAsync(string status)
    {
        return await _context.Orders
            .Include(o => o.Items)
            .Where(o => o.Status == Enum.Parse<OrderStatus>(status, true))
            .OrderBy(o => o.CreatedAt)
            .ToListAsync();
    }

    public async Task<Order> AcceptOrderAsync(int orderId)
    {
        var order = await GetOrderAsync(orderId);
        if (order == null)
            throw new InvalidOperationException("Commande introuvable");

        if (order.Status != OrderStatus.Pending)
            throw new InvalidOperationException("Seules les commandes en attente peuvent être acceptées");

        // Vérifier à nouveau le stock avant acceptation
        var itemRequests = order.Items.Select(i => new OrderItemRequest(i.DrinkId, i.Quantity)).ToList();
        if (!await CheckStockAvailabilityAsync(itemRequests))
        {
            throw new InvalidOperationException("Stock insuffisant pour accepter cette commande");
        }

        // Accepter la commande
        order.Accept();

        // Mettre à jour les stocks
        foreach (var item in order.Items)
        {
            var drink = await _context.Drinks.FindAsync(item.DrinkId);
            if (drink != null)
            {
                drink.Quantity -= item.Quantity;
                await _notificationService.NotifyStockUpdate(drink.Id, drink.Quantity);
            }
        }

        await _context.SaveChangesAsync();
        await _notificationService.NotifyOrderStatusUpdate(order);

        return order;
    }

    public async Task<Order> RejectOrderAsync(int orderId)
    {
        var order = await GetOrderAsync(orderId);
        if (order == null)
            throw new InvalidOperationException("Commande introuvable");

        if (order.Status != OrderStatus.Pending)
            throw new InvalidOperationException("Seules les commandes en attente peuvent être refusées");

        order.Reject();
        await _context.SaveChangesAsync();
        await _notificationService.NotifyOrderStatusUpdate(order);

        return order;
    }

    public async Task<Order> MarkOrderReadyAsync(int orderId)
    {
        var order = await GetOrderAsync(orderId);
        if (order == null)
            throw new InvalidOperationException("Commande introuvable");

        if (order.Status != OrderStatus.Accepted)
            throw new InvalidOperationException("Seules les commandes acceptées peuvent être marquées comme prêtes");

        order.MarkReady();
        await _context.SaveChangesAsync();
        await _notificationService.NotifyOrderReady(order);

        return order;
    }

    public async Task<Order> CompleteOrderAsync(int orderId)
    {
        var order = await GetOrderAsync(orderId);
        if (order == null)
            throw new InvalidOperationException("Commande introuvable");

        if (order.Status != OrderStatus.Ready)
            throw new InvalidOperationException("Seules les commandes prêtes peuvent être complétées");

        order.Complete();
        await _context.SaveChangesAsync();

        return order;
    }

    public async Task<bool> CheckStockAvailabilityAsync(List<OrderItemRequest> items)
    {
        foreach (var item in items)
        {
            var drink = await _context.Drinks.FindAsync(item.DrinkId);
            if (drink == null || drink.Quantity < item.Quantity)
            {
                return false;
            }
        }
        return true;
    }
    
    public async Task<StockCheckResult> CheckOrderStockDetailedAsync(int orderId)
    {
        var order = await GetOrderAsync(orderId);
        if (order == null)
            throw new InvalidOperationException("Commande introuvable");

        var result = new StockCheckResult { IsFullyAvailable = true };

        foreach (var item in order.Items)
        {
            var drink = await _context.Drinks.FindAsync(item.DrinkId);
            if (drink == null)
            {
                // Boisson supprimée du catalogue
                result.Issues.Add(new StockIssue
                {
                    DrinkId = item.DrinkId,
                    DrinkName = item.DrinkName,
                    RequestedQuantity = item.Quantity,
                    AvailableQuantity = 0,
                    Type = StockIssueType.OutOfStock
                });
                result.IsFullyAvailable = false;
                continue;
            }

            if (drink.Quantity == 0)
            {
                // Complètement en rupture
                result.Issues.Add(new StockIssue
                {
                    DrinkId = item.DrinkId,
                    DrinkName = item.DrinkName,
                    RequestedQuantity = item.Quantity,
                    AvailableQuantity = 0,
                    Type = StockIssueType.OutOfStock
                });
                result.IsFullyAvailable = false;
            }
            else if (drink.Quantity < item.Quantity)
            {
                // Stock insuffisant
                result.Issues.Add(new StockIssue
                {
                    DrinkId = item.DrinkId,
                    DrinkName = item.DrinkName,
                    RequestedQuantity = item.Quantity,
                    AvailableQuantity = drink.Quantity,
                    Type = StockIssueType.InsufficientStock
                });
                result.IsFullyAvailable = false;
            }
        }

        return result;
    }

    public async Task<Order> EditOrderAsync(int orderId, List<OrderItemRequest> newItems, string reason)
    {
        var order = await GetOrderAsync(orderId);
        if (order == null)
            throw new InvalidOperationException("Commande introuvable");

        if (!order.CanBeEdited)
            throw new InvalidOperationException("Cette commande ne peut plus être éditée");

        if (string.IsNullOrWhiteSpace(reason))
            throw new ArgumentException("Une raison doit être fournie pour la modification");

        // Vérifier que les nouveaux articles sont disponibles
        if (!await CheckStockAvailabilityAsync(newItems))
        {
            throw new InvalidOperationException("Stock insuffisant pour les nouveaux articles");
        }

        // Supprimer les anciens items
        _context.OrderItems.RemoveRange(order.Items);
        order.Items.Clear();

        // Ajouter les nouveaux items
        foreach (var itemRequest in newItems)
        {
            var drink = await _context.Drinks.FindAsync(itemRequest.DrinkId);
            if (drink == null) continue;

            var orderItem = new OrderItem
            {
                OrderId = order.Id,
                DrinkId = drink.Id,
                DrinkName = drink.Name,
                Quantity = itemRequest.Quantity,
                UnitPrice = drink.Price,
                Order = order
            };

            order.Items.Add(orderItem);
        }

        // Recalculer le total et marquer comme modifié
        order.RecalculateTotal();
        order.MarkAsModified(reason);

        await _context.SaveChangesAsync();

        // Notifier le client de la modification
        await _notificationService.NotifyOrderModified(order, reason);

        return order;
    }

    public async Task<Order> AcceptPartialOrderAsync(int orderId, List<int> itemsToRemove, string reason)
    {
        var order = await GetOrderAsync(orderId);
        if (order == null)
            throw new InvalidOperationException("Commande introuvable");

        if (!order.CanBeEdited)
            throw new InvalidOperationException("Cette commande ne peut plus être éditée");

        if (string.IsNullOrWhiteSpace(reason))
            throw new ArgumentException("Une raison doit être fournie pour la modification");

        // Retirer les articles problématiques
        var itemsToRemoveFromDb = order.Items.Where(item => itemsToRemove.Contains(item.Id)).ToList();
        
        foreach (var item in itemsToRemoveFromDb)
        {
            order.Items.Remove(item);
            _context.OrderItems.Remove(item);
        }

        if (!order.Items.Any())
            throw new InvalidOperationException("Impossible de retirer tous les articles de la commande");

        // Vérifier que les articles restants sont disponibles
        var remainingItemRequests = order.Items.Select(i => new OrderItemRequest(i.DrinkId, i.Quantity)).ToList();
        if (!await CheckStockAvailabilityAsync(remainingItemRequests))
        {
            throw new InvalidOperationException("Stock insuffisant même après retrait des articles problématiques");
        }

        // Recalculer le total et marquer comme modifié
        order.RecalculateTotal();
        order.MarkAsModified(reason);

        // Accepter la commande et mettre à jour les stocks
        order.Accept();
        
        foreach (var item in order.Items)
        {
            var drink = await _context.Drinks.FindAsync(item.DrinkId);
            if (drink != null)
            {
                drink.Quantity -= item.Quantity;
                await _notificationService.NotifyStockUpdate(drink.Id, drink.Quantity);
            }
        }

        await _context.SaveChangesAsync();

        // Notifier le client et mettre à jour le statut
        await _notificationService.NotifyOrderModified(order, reason);
        await _notificationService.NotifyOrderStatusUpdate(order);

        return order;
    }

    public async Task<Order> ModifyOrderQuantitiesAsync(int orderId, Dictionary<int, int> quantityChanges, string reason)
    {
        var order = await GetOrderAsync(orderId);
        if (order == null)
            throw new InvalidOperationException("Commande introuvable");

        if (!order.CanBeEdited)
            throw new InvalidOperationException("Cette commande ne peut plus être éditée");

        if (string.IsNullOrWhiteSpace(reason))
            throw new ArgumentException("Une raison doit être fournie pour la modification");

        // Appliquer les changements de quantité
        bool hasChanges = false;
        var itemsToRemove = new List<OrderItem>();

        foreach (var item in order.Items)
        {
            if (quantityChanges.TryGetValue(item.Id, out int newQuantity))
            {
                if (newQuantity <= 0)
                {
                    // Marquer pour suppression
                    itemsToRemove.Add(item);
                    hasChanges = true;
                }
                else if (newQuantity != item.Quantity)
                {
                    // Modifier la quantité
                    item.Quantity = newQuantity;
                    hasChanges = true;
                }
            }
        }

        if (!hasChanges)
            throw new InvalidOperationException("Aucun changement détecté");

        // Supprimer les articles avec quantité 0
        foreach (var itemToRemove in itemsToRemove)
        {
            order.Items.Remove(itemToRemove);
            _context.OrderItems.Remove(itemToRemove);
        }

        if (!order.Items.Any())
            throw new InvalidOperationException("Impossible de retirer tous les articles de la commande");

        // Vérifier la disponibilité des nouvelles quantités
        var updatedItemRequests = order.Items.Select(i => new OrderItemRequest(i.DrinkId, i.Quantity)).ToList();
        if (!await CheckStockAvailabilityAsync(updatedItemRequests))
        {
            throw new InvalidOperationException("Stock insuffisant pour les nouvelles quantités");
        }

        // Recalculer le total et marquer comme modifié
        order.RecalculateTotal();
        order.MarkAsModified(reason);

        await _context.SaveChangesAsync();

        // Notifier le client
        await _notificationService.NotifyOrderModified(order, reason);

        return order;
    }
}