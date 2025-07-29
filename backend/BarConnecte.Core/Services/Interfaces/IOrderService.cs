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
    /// <summary>
    /// Vérifie le stock de manière détaillée pour une commande spécifique
    /// Retourne les détails des articles en rupture ou en stock insuffisant
    /// </summary>
    /// <param name="orderId">ID de la commande à vérifier</param>
    /// <returns>Résultat détaillé de la vérification avec les problèmes identifiés</returns>
    Task<StockCheckResult> CheckOrderStockDetailedAsync(int orderId);
    
    /// <summary>
    /// Édite une commande existante en remplaçant ses articles
    /// </summary>
    /// <param name="orderId">ID de la commande à éditer</param>
    /// <param name="newItems">Nouveaux articles pour la commande</param>
    /// <param name="reason">Raison de la modification</param>
    /// <returns>Commande mise à jour</returns>
    Task<Order> EditOrderAsync(int orderId, List<OrderItemRequest> newItems, string reason);
    
    /// <summary>
    /// Accepte une commande en retirant certains articles problématiques
    /// </summary>
    /// <param name="orderId">ID de la commande</param>
    /// <param name="itemsToRemove">Liste des IDs d'articles à retirer</param>
    /// <param name="reason">Raison des retraits</param>
    /// <returns>Commande mise à jour et acceptée</returns>
    Task<Order> AcceptPartialOrderAsync(int orderId, List<int> itemsToRemove, string reason);
    
    /// <summary>
    /// Modifie les quantités d'articles spécifiques dans une commande
    /// </summary>
    /// <param name="orderId">ID de la commande</param>
    /// <param name="quantityChanges">Dictionnaire des changements de quantité (ItemId -> NouvelleQuantité)</param>
    /// <param name="reason">Raison des modifications</param>
    /// <returns>Commande mise à jour</returns>
    Task<Order> ModifyOrderQuantitiesAsync(int orderId, Dictionary<int, int> quantityChanges, string reason);
}

public record OrderItemRequest(int DrinkId, int Quantity);