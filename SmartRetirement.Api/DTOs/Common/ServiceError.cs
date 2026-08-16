namespace SmartRetirement.Api.DTOs.Common;

public sealed record ServiceError(
    ServiceErrorCode Code,
    string Message);
