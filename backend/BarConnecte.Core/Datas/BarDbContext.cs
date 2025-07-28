using BarConnecte.Core.Models;
using Microsoft.EntityFrameworkCore;

namespace BarConnecte.Core.Datas;

public class BarDbContext(DbContextOptions<BarDbContext> options) : DbContext(options)
{
    public DbSet<Drink> Drinks => Set<Drink>();
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<OrderItem> OrderItems => Set<OrderItem>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Configuration Drink
        modelBuilder.Entity<Drink>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Description).HasMaxLength(500);
            entity.Property(e => e.Price).HasPrecision(10, 2);
            entity.Property(e => e.Quantity).HasPrecision(10, 2);
        });

        // Configuration Order
        modelBuilder.Entity<Order>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.CustomerName).IsRequired().HasMaxLength(100);
            entity.Property(e => e.TotalAmount).HasPrecision(10, 2);
            entity.Property(e => e.Status).HasConversion<int>();
            
            entity.HasMany(e => e.Items)
                .WithOne(e => e.Order)
                .HasForeignKey(e => e.OrderId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // Configuration OrderItem
        modelBuilder.Entity<OrderItem>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.DrinkName).IsRequired().HasMaxLength(100);
            entity.Property(e => e.UnitPrice).HasPrecision(10, 2);
            
            entity.HasOne(e => e.Order)
                .WithMany(e => e.Items)
                .HasForeignKey(e => e.OrderId);
                  
            entity.HasOne(e => e.Drink)
                .WithMany()
                .HasForeignKey(e => e.DrinkId);
        });
    }
}
