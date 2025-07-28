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
}