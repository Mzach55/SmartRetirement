using SmartRetirement.Api.DTOs.Employers;
using SmartRetirement.Api.Models;

namespace SmartRetirement.Api.DTOs.Plans;

public sealed record PlanResponse(
    int Id,
    int ParticipantId,
    int? EmployerId,
    string Name,
    PlanType Type,
    DateOnly OpenedOn,
    decimal CurrentBalance,
    decimal AnnualContributionLimit,
    bool IsActive,
    EmployerSummaryResponse? Employer
);
