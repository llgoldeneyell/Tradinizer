using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Tradinizer.Server.Models;

namespace Tradinizer.Server.Helpers
{
    public class AppDbContext : IdentityDbContext<ApplicationUser>
    {
        public DbSet<YearData> Years { get; set; }
        public DbSet<Investment> Investments { get; set; }
        public DbSet<LiquidityData> LiquidityDataEntries { get; set; }

        public AppDbContext(DbContextOptions<AppDbContext> options)
            : base(options) { }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);  // **IMPORTANTISSIMO!**

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

            modelBuilder.Entity<YearData>()
                .HasOne(y => y.ApplicationUser)
                .WithMany(u => u.Years)  // o con una collezione se la definisci in ApplicationUser
                .HasForeignKey(y => y.ApplicationUserId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
