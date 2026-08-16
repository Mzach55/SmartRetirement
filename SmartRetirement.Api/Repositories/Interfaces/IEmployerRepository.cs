using SmartRetirement.Api.Models;

namespace SmartRetirement.Api.Repositories.Interfaces;

public interface IEmployerRepository : IRepository<Employer>
{
    // Returns one employer with its associated participant-owned plans.
    Task<Employer?> GetWithPlansAsync(
        int employerId,
        CancellationToken cancellationToken = default);
}
