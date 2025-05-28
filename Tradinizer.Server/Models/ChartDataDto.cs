namespace Tradinizer.Server.Models
{
    public class ChartDataDto
    {
        public List<string> Labels { get; set; } = new(); // Giorni del mese
        public List<decimal> Differences { get; set; } = new(); // Liquidità - investimenti cumulati
        public List<decimal> Percentage { get; set; } = new();
        public decimal DailyGrowthRate { get; set; }
        public decimal ProjectedWeek { get; set; }
        public decimal ProjectedMonth { get; set; }
        public decimal ProjectedYear { get; set; }
    }
}
