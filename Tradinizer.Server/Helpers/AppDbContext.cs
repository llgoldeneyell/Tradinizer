using Microsoft.EntityFrameworkCore;
using Tradinizer.Server.Models;

namespace Tradinizer.Server.Helpers
{
    public class AppDbContext : DbContext
    {
        public DbSet<YearData> Years { get; set; }
        public DbSet<Investment> Investments { get; set; }
        public DbSet<LiquidityData> LiquidityDataEntries { get; set; }

        public AppDbContext(DbContextOptions<AppDbContext> options)
            : base(options) { }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<YearData>()
                .HasMany(y => y.Investments)
                .WithOne(i => i.YearData)
                .HasForeignKey(i => i.YearDataId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<YearData>()
                .HasMany(y => y.Liquidities)
                .WithOne(l => l.YearData)
                .HasForeignKey(l => l.YearDataId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
