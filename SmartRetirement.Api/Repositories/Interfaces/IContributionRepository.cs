using SmartRetirement.Api.Models;

namespace SmartRetirement.Api.Repositories.Interfaces;

public interface IContributionRepository : IRepository<Contribution>
{
    // Returns an empty collection when the plan has no contributions.
    Task<IReadOnlyList<Contribution>> GetByPlanIdAsync(
        int planId,
        CancellationToken cancellationToken = default);

    // Supports the service layer's annual contribution-limit calculation.
    Task<decimal> GetTotalForPlanAndTaxYearAsync(
        int planId,
        int taxYear,
        CancellationToken cancellationToken = default);
}
