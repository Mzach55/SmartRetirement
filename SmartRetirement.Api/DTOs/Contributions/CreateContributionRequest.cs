namespace SmartRetirement.Api.DTOs.Contributions;

public sealed record CreateContributionRequest(
    int PlanId,
    decimal Amount,
    DateOnly ContributionDate,
    int TaxYear,
    string? Description);
