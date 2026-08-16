using SmartRetirement.Api.Models;

namespace SmartRetirement.Api.Repositories.Interfaces;

public interface IParticipantRepository : IRepository<Participant>
{
    // Returns one participant with their plans, or null when not found.
    Task<Participant?> GetWithPlansAsync(
        int participantId,
        CancellationToken cancellationToken = default);

    // The optional excluded ID supports uniqueness checks during an update.
    Task<bool> EmailExistsAsync(
        string email,
        int? excludedParticipantId = null,
        CancellationToken cancellationToken = default);
}
