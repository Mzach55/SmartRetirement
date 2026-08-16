namespace SmartRetirement.Api.DTOs.Participants;

public sealed record UpdateParticipantRequest(
    string FirstName,
    string LastName,
    string Email,
    DateOnly DateOfBirth
);