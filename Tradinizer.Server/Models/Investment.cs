using System.Text.Json.Serialization;

namespace Tradinizer.Server.Models
{
    public class Investment
    {
        public int Id { get; set; }
        public DateOnly Date { get; set; }
        public decimal Amount { get; set; }
        public string Type { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;

        // FK verso YearData
        public int YearDataId { get; set; }

        [JsonIgnore]
        public YearData YearData { get; set; }
    }

    public class InvestmentDto
    {
        public DateOnly Date { get; set; }
        public decimal Amount { get; set; }
        public string Type { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
    }
}
