using Microsoft.EntityFrameworkCore;
using SmartRetirement.Api.Data;
using SmartRetirement.Api.Models;
using SmartRetirement.Api.Repositories.Interfaces;

namespace SmartRetirement.Api.Repositories.Implementations;

public class ContributionRepository
    : Repository<Contribution>, IContributionRepository
{
    public ContributionRepository(AppDbContext context)
        : base(context)
    {
    }

    public async Task<IReadOnlyList<Contribution>> GetByPlanIdAsync(
        int planId,
        CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .AsNoTracking()
            .Where(contribution => contribution.PlanId == planId)
            .ToListAsync(cancellationToken);
    }

    public async Task<decimal> GetTotalForPlanAndTaxYearAsync(
        int planId,
        int taxYear,
        CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(contribution =>
                contribution.PlanId == planId &&
                contribution.TaxYear == taxYear)
            .SumAsync(
                contribution => contribution.Amount,
                cancellationToken);
    }
}
