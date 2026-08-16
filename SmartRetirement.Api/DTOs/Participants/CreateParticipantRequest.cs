namespace SmartRetirement.Api.DTOs.Participants;

public sealed record CreateParticipantRequest(
    string FirstName,
    string LastName,
    string Email,
    DateOnly DateOfBirth
);