namespace Tradinizer.Server.Models
{
    public class YearTrading
    {
        public int Year { get; set; }
        public List<Investment> Investments { get; set; } = new();
        public List<LiquidityData> Liquidities { get; set; } = new();
        public decimal ExitInvestment { get; set; }
        public decimal ExitLiquidity { get; set; }

    }
}
