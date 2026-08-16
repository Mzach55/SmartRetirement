using SmartRetirement.Api.Models;

namespace SmartRetirement.Api.DTOs.Plans;

public sealed record CreatePlanRequest(
    int ParticipantId,
    int? EmployerId,
    string Name,
    PlanType Type,
    DateOnly OpenedOn,
    decimal AnnualContributionLimit
);
