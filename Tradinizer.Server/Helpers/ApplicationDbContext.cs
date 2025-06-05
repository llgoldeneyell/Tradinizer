using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Tradinizer.Server.Models;

namespace Tradinizer.Server.Helpers
{
    public class ApplicationDbContext : IdentityDbContext<User>
    {
        public DbSet<YearData> YearsData { get; set; }
        public DbSet<Investment> Investments { get; set; }
        public DbSet<Liquidity> Liquidities { get; set; }

        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {
        }

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            // Configura relazione uno a molti: ApplicationUser -> YearData
            builder.Entity<YearData>()
                .HasOne(y => y.ApplicationUser)
                .WithMany(u => u.YearsData) // Devi aggiungere questa proprietà in ApplicationUser
                .HasForeignKey(y => y.ApplicationUserId);

            // Configura relazione uno a molti: YearData -> Investment
            builder.Entity<Investment>()
                .HasOne(i => i.YearData)
                .WithMany(y => y.Investments)
                .HasForeignKey(i => i.YearDataId);

            // Configura relazione uno a molti: YearData -> Liquidity
            builder.Entity<Liquidity>()
                .HasOne(l => l.YearData)
                .WithMany(y => y.Liquidities)
                .HasForeignKey(l => l.YearDataId);
        }
    }

}
