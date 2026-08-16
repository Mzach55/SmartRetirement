namespace SmartRetirement.Api.Models;

public class Plan
{
    public int Id { get; set; }

    public int ParticipantId { get; set; }
    public int? EmployerId { get; set; }

    public string Name { get; set; } = string.Empty;
    public PlanType Type { get; set; }
    public DateOnly OpenedOn { get; set; }
    public decimal CurrentBalance { get; set; }
    public decimal AnnualContributionLimit { get; set; }
    public bool IsActive { get; set; } = true;

    public Participant Participant { get; set; } = null!;
    public Employer? Employer { get; set; }
    public ICollection<Contribution> Contributions { get; set; }
        = new List<Contribution>();
}
