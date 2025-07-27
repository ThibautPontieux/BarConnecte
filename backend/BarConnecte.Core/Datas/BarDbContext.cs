using BarConnecte.Core.Models;
using Microsoft.EntityFrameworkCore;

namespace BarConnecte.Core.Datas;

public class BarDbContext(DbContextOptions<BarDbContext> options) : DbContext(options)
{
    public DbSet<Drink> Drinks => Set<Drink>();
}