using System.Text.Json.Serialization;
using Tradinizer.Server.Models;

public class Investment
{
    [JsonPropertyName("id")]
    public int Id { get; set; }

    public DateOnly Date { get; set; }

    public decimal Amount { get; set; }

    public string Type { get; set; } = string.Empty;

    public string Name { get; set; } = string.Empty;

    public int YearDataId { get; set; }
    public YearData YearData { get; set; } = null!;
}
