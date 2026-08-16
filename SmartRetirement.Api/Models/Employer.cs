namespace SmartRetirement.Api.Models;


public class Employer
{
    public int Id { get; set; }

    public string Name { get; set; } = string.Empty;
    public string? Industry { get; set; }

    public ICollection<Plan> Plans { get; set; } = new List<Plan>();
}
