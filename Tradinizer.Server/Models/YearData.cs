namespace Tradinizer.Server.Models
{
    public class YearData
    {
        public int Id { get; set; }
        public int Year { get; set; }
        public string ApplicationUserId { get; set; }  // FK all’utente
        public User ApplicationUser { get; set; }
        public List<Investment> Investments { get; set; } = new();
        public List<Liquidity> Liquidities { get; set; } = new();
        public decimal ExitInvestment { get; set; }
        public decimal ExitLiquidity { get; set; }
    }

    public class YearDataDto
    {
        public int Year { get; set; }
        public decimal ExitInvestment { get; set; }
        public decimal ExitLiquidity { get; set; }
        public List<InvestmentDto> Investments { get; set; } = new();
        public List<LiquidityDto> Liquidities { get; set; } = new();
    }
}
