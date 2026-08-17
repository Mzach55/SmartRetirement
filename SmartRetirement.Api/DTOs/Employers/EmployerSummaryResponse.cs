namespace SmartRetirement.Api.DTOs.Employers;

public sealed record EmployerSummaryResponse(
    int Id,
    string Name,
    string? Industry);
