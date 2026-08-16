namespace SmartRetirement.Api.DTOs.Contributions;

public sealed record ContributionResponse(
    int Id,
    int PlanId,
    decimal Amount,
    DateOnly ContributionDate,
    int TaxYear,
    string? Description);
