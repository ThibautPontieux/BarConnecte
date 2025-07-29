using System.ComponentModel.DataAnnotations;

namespace BarConnecte.Core.Models;

public class Order
{
    public int Id { get; set; }
    
    [Required]
    [MaxLength(100)]
    public string CustomerName { get; set; } = string.Empty;
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? AcceptedAt { get; set; }
    public DateTime? ReadyAt { get; set; }
    public DateTime? CompletedAt { get; set; }
    
    public OrderStatus Status { get; set; } = OrderStatus.Pending;
    
    public decimal TotalAmount { get; set; }
    
    public List<OrderItem> Items { get; set; } = new();
    
    /// <summary>
    /// Indique si la commande a été partiellement modifiée par le barman
    /// </summary>
    public bool IsPartiallyModified { get; set; } = false;
    
    /// <summary>
    /// Raison de la modification fournie par le barman
    /// </summary>
    [MaxLength(500)]
    public string? ModificationReason { get; set; }
    
    /// <summary>
    /// Date et heure de la dernière modification
    /// </summary>
    public DateTime? LastModifiedAt { get; set; }
    
    // Méthodes utilitaires
    public void Accept()
    {
        Status = OrderStatus.Accepted;
        AcceptedAt = DateTime.UtcNow;
    }
    
    public void Reject()
    {
        Status = OrderStatus.Rejected;
        AcceptedAt = DateTime.UtcNow;
    }
    
    public void MarkReady()
    {
        Status = OrderStatus.Ready;
        ReadyAt = DateTime.UtcNow;
    }
    
    public void Complete()
    {
        Status = OrderStatus.Completed;
        CompletedAt = DateTime.UtcNow;
    }
    
    /// <summary>
    /// Marque la commande comme modifiée avec une raison
    /// </summary>
    public void MarkAsModified(string reason)
    {
        IsPartiallyModified = true;
        ModificationReason = reason;
        LastModifiedAt = DateTime.UtcNow;
    }
    
    /// <summary>
    /// Recalcule le montant total basé sur les items actuels
    /// </summary>
    public void RecalculateTotal()
    {
        TotalAmount = Items.Sum(item => item.TotalPrice);
    }
    
    /// <summary>
    /// Vérifie si la commande peut être éditée
    /// </summary>
    public bool CanBeEdited => Status == OrderStatus.Pending;
}

public class OrderItem
{
    public int Id { get; set; }
    public int OrderId { get; set; }
    public int DrinkId { get; set; }
    
    [Required]
    [MaxLength(100)]
    public string DrinkName { get; set; } = string.Empty;
    
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal TotalPrice => Quantity * UnitPrice;
    
    // Navigation properties
    public Order Order { get; set; } = null!;
    public Drink Drink { get; set; } = null!;
}

public enum OrderStatus
{
    Pending = 0,      // En attente de validation
    Accepted = 1,     // Acceptée par le barman
    Rejected = 2,     // Refusée par le barman
    Ready = 3,        // Prête à être récupérée
    Completed = 4     // Récupérée et payée
}
