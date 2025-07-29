using BarConnecte.Core.Models;

namespace BarConnecte.Core.Services.Interfaces;

public interface INotificationService
{
    /// <summary>
    /// Notifie qu'une nouvelle commande a été créée.
    /// </summary>
    /// <param name="order">Détails de la commande</param>
    Task NotifyNewOrder(Order order);
    
    /// <summary>
    /// Notifie que le statut d'une commande a été mis à jour.
    /// </summary>
    /// <param name="order">Détails de la commande</param>
    Task NotifyOrderStatusUpdate(Order order);
    
    /// <summary>
    /// Notifie que la commande est prête pour le client.
    /// </summary>
    /// <param name="order">Détails de la commande</param>
    Task NotifyOrderReady(Order order);
    
    /// <summary>
    /// Notifie que le stock d'une boisson a été mis à jour a la suite d'une commande ou d'un réapprovisionnement.
    /// </summary>
    /// <param name="drinkId">ID de la boisson concernée</param>
    /// <param name="newQuantity">Nouvelle quantité disponible</param>
    Task NotifyStockUpdate(int drinkId, decimal newQuantity);
    
    /// <summary>
    /// Notifie le client que sa commande a été modifiée par le barman
    /// </summary>
    /// <param name="order">Commande modifiée</param>
    /// <param name="reason">Raison de la modification</param>
    Task NotifyOrderModified(Order order, string reason);
}
