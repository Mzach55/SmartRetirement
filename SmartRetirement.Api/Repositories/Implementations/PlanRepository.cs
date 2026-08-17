using Microsoft.EntityFrameworkCore;
using SmartRetirement.Api.Data;
using SmartRetirement.Api.Models;
using SmartRetirement.Api.Repositories.Interfaces;

namespace SmartRetirement.Api.Repositories.Implementations;

public class PlanRepository : Repository<Plan>, IPlanRepository
{
    public PlanRepository(AppDbContext context) : base(context)
    {
    }

    public async Task<IReadOnlyList<Plan>> GetAllWithEmployerAsync(
        CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .AsNoTracking()
            .Include(plan => plan.Employer)
            .ToListAsync(cancellationToken);
    }

    public async Task<Plan?> GetWithDetailsAsync(
        int planId,
        CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .AsNoTracking()
            .Include(plan => plan.Participant)
            .Include(plan => plan.Employer)
            .Include(plan => plan.Contributions)
            .SingleOrDefaultAsync(
                plan => plan.Id == planId,
                cancellationToken);
    }

    public async Task<IReadOnlyList<Plan>> GetByParticipantIdAsync(
        int participantId,
        CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .AsNoTracking()
            .Include(plan => plan.Employer)
            .Where(plan => plan.ParticipantId == participantId)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Plan>> GetByEmployerIdAsync(
        int employerId,
        CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .AsNoTracking()
            .Include(plan => plan.Employer)
            .Where(plan => plan.EmployerId == employerId)
            .ToListAsync(cancellationToken);
    }
}
