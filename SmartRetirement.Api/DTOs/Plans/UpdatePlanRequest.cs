using SmartRetirement.Api.Models;

namespace SmartRetirement.Api.DTOs.Plans;

public sealed record UpdatePlanRequest(
    int? EmployerId,
    string Name,
    PlanType Type,
    DateOnly OpenedOn,
    decimal AnnualContributionLimit,
    bool IsActive
);
