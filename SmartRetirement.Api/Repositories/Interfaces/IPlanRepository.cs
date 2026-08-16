using SmartRetirement.Api.Models;

namespace SmartRetirement.Api.Repositories.Interfaces;

public interface IPlanRepository : IRepository<Plan>
{
    // Returns one plan together with its participant, optional employer,
    // and contribution history. Returns null when the plan does not exist.
    Task<Plan?> GetWithDetailsAsync(
        int planId,
        CancellationToken cancellationToken = default);

    // Returns an empty collection when the participant has no plans.
    Task<IReadOnlyList<Plan>> GetByParticipantIdAsync(
        int participantId,
        CancellationToken cancellationToken = default);

    // Returns an empty collection when the employer has no associated plans.
    Task<IReadOnlyList<Plan>> GetByEmployerIdAsync(
        int employerId,
        CancellationToken cancellationToken = default);
}
