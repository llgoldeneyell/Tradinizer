﻿using System.Text.Json.Serialization;

namespace Tradinizer.Server.Models
{
    public class LiquidityData
    {
        [JsonPropertyName("id")]
        public int Id { get; set; }
        public DateOnly Date { get; set; }
        public decimal Amount { get; set; }

        public int YearDataId { get; set; }
        public YearData YearData { get; set; } = null!;
    }

}
