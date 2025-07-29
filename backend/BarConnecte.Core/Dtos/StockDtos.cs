namespace BarConnecte.Core.Dtos;

/// <summary>
/// Réponse détaillée de vérification de stock pour une commande
/// </summary>
/// <param name="IsFullyAvailable">Indique si tous les articles sont disponibles</param>
/// <param name="Issues">Liste des problèmes de stock détectés</param>
/// <param name="CheckedAt">Timestamp de la vérification</param>
public record StockCheckResponse(
    bool IsFullyAvailable,
    List<StockIssueResponse> Issues,
    DateTime CheckedAt
);

/// <summary>
/// Détail d'un problème de stock pour un article
/// </summary>
/// <param name="DrinkId">ID de la boisson</param>
/// <param name="DrinkName">Nom de la boisson</param>
/// <param name="RequestedQuantity">Quantité demandée</param>
/// <param name="AvailableQuantity">Quantité disponible</param>
/// <param name="Type">Type de problème (OutOfStock, InsufficientStock)</param>
/// <param name="MissingQuantity">Quantité manquante</param>
public record StockIssueResponse(
    int DrinkId,
    string DrinkName,
    decimal RequestedQuantity,
    decimal AvailableQuantity,
    string Type,
    int MissingQuantity
);

// === DTOs POUR L'ÉDITION DE COMMANDES ===

/// <summary>
/// Requête pour éditer une commande complètement
/// </summary>
/// <param name="Items">Nouveaux articles pour la commande</param>
/// <param name="Reason">Raison de la modification</param>
public record EditOrderRequest(
    List<EditOrderItemRequest> Items,
    string Reason
);

/// <summary>
/// Article dans une requête d'édition de commande
/// </summary>
/// <param name="DrinkId">ID de la boisson</param>
/// <param name="Quantity">Nouvelle quantité</param>
public record EditOrderItemRequest(
    int DrinkId,
    int Quantity
);

/// <summary>
/// Requête pour accepter une commande partiellement (en retirant certains articles)
/// </summary>
/// <param name="ItemsToRemove">Liste des IDs d'articles à retirer</param>
/// <param name="Reason">Raison des retraits</param>
public record AcceptPartialOrderRequest(
    List<int> ItemsToRemove,
    string Reason
);

/// <summary>
/// Requête pour modifier les quantités d'articles existants
/// </summary>
/// <param name="QuantityChanges">Dictionnaire des changements (ItemId -> NouvelleQuantité)</param>
/// <param name="Reason">Raison des modifications</param>
public record ModifyQuantitiesRequest(
    Dictionary<int, int> QuantityChanges,
    string Reason
);

/// <summary>
/// Réponse de commande étendue avec informations de modification
/// </summary>
/// <param name="Id">ID de la commande</param>
/// <param name="CustomerName">Nom du client</param>
/// <param name="Status">Statut de la commande</param>
/// <param name="TotalAmount">Montant total</param>
/// <param name="CreatedAt">Date de création</param>
/// <param name="Items">Articles de la commande</param>
/// <param name="IsPartiallyModified">Indique si la commande a été modifiée</param>
/// <param name="ModificationReason">Raison de la modification</param>
/// <param name="LastModifiedAt">Date de dernière modification</param>
public record ExtendedOrderResponse(
    int Id,
    string CustomerName,
    string Status,
    decimal TotalAmount,
    DateTime CreatedAt,
    List<OrderItemResponse> Items,
    bool IsPartiallyModified,
    string? ModificationReason,
    DateTime? LastModifiedAt
);
