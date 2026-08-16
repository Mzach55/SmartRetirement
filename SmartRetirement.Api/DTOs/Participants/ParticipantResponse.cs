namespace SmartRetirement.Api.DTOs.Participants;

public sealed record ParticipantResponse(
    int Id,
    string FirstName,
    string LastName,
    string Email,
    DateOnly DateOfBirth,
    DateTime CreatedAtUtc
);