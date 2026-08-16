namespace SmartRetirement.Api.Models;

public class Contribution
{
    // Primary Key
    public int Id { get; set; }

    // Foreign key
    public int PlanId { get; set; }

    public decimal Amount { get; set; }
    public DateOnly ContributionDate { get; set; }
    public int TaxYear { get; set; }
    public string? Description { get; set; }

    public Plan Plan { get; set; } = null!;
}