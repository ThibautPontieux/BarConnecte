using System.ComponentModel.DataAnnotations;

namespace BarConnecte.Core.Models;

/// <summary>
/// Résultat détaillé d'une vérification de stock pour une commande
/// </summary>
public class StockCheckResult
{
    /// <summary>
    /// Indique si tous les articles sont disponibles en quantité suffisante
    /// </summary>
    public bool IsFullyAvailable { get; set; }
    
    /// <summary>
    /// Liste des problèmes de stock détectés
    /// </summary>
    public List<StockIssue> Issues { get; set; } = new();
    
    /// <summary>
    /// Timestamp de la vérification
    /// </summary>
    public DateTime CheckedAt { get; set; } = DateTime.UtcNow;
}

/// <summary>
/// Représente un problème de stock pour un article spécifique
/// </summary>
public class StockIssue
{
    /// <summary>
    /// ID de la boisson concernée
    /// </summary>
    public int DrinkId { get; set; }
    
    /// <summary>
    /// Nom de la boisson concernée
    /// </summary>
    [Required]
    [MaxLength(100)]
    public string DrinkName { get; set; } = string.Empty;

    /// <summary>
    /// Quantité demandée dans la commande
    /// </summary>
    public decimal RequestedQuantity { get; set; }

    /// <summary>
    /// Quantité réellement disponible en stock
    /// </summary>
    public decimal AvailableQuantity { get; set; }
    
    /// <summary>
    /// Type de problème de stock
    /// </summary>
    public StockIssueType Type { get; set; }
    
    /// <summary>
    /// Calcule la quantité manquante
    /// </summary>
    public int MissingQuantity => (int)Math.Max(0, RequestedQuantity - AvailableQuantity);
}

/// <summary>
/// Types de problèmes de stock possibles
/// </summary>
public enum StockIssueType
{
    /// <summary>
    /// Article complètement en rupture de stock (quantité = 0)
    /// </summary>
    OutOfStock = 0,
    
    /// <summary>
    /// Stock insuffisant (quantité partielle disponible)
    /// </summary>
    InsufficientStock = 1
}
