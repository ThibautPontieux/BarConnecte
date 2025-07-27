namespace BarConnecte.Core.Models;

public class Drink
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public decimal Quantity { get; set; }
    public DrinkCategory Category { get; set; }
    public string Description { get; set; } = string.Empty;
    public decimal Price { get; set; }
}

public enum DrinkCategory
{
    Bieres,
    Spiritueux,
    Cocktails,
    Vins,
    Champagnes,
    Cafe,
    Sodas,
    Eaux,
    Jus,
}