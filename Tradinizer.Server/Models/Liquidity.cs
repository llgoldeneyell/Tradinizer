using System.Text.Json.Serialization;

namespace Tradinizer.Server.Models
{
    public class Liquidity
    {
        public int Id { get; set; }
        public DateOnly Date { get; set; }
        public decimal Amount { get; set; }

        // FK verso YearData
        public int YearDataId { get; set; }
        [JsonIgnore]
        public YearData YearData { get; set; }
    }

    public class LiquidityDto
    {
        public DateOnly Date { get; set; }
        public decimal Amount { get; set; }
    }
}
