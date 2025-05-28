using System.Text.Json.Serialization;

public class Investment
{
    [JsonPropertyName("id")]
    public int Id { get; set; }

    public DateOnly Date { get; set; }

    public decimal Amount { get; set; }

    public string Type { get; set; } = string.Empty;

    public string Name { get; set; } = string.Empty;
}
