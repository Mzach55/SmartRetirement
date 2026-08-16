using Microsoft.EntityFrameworkCore;
using SmartRetirement.Api.Data;
using SmartRetirement.Api.Models;
using SmartRetirement.Api.Repositories.Interfaces;

namespace SmartRetirement.Api.Repositories.Implementations;

public class EmployerRepository : Repository<Employer>, IEmployerRepository
{
    public EmployerRepository(AppDbContext context) : base(context)
    {
    }

    public async Task<Employer?> GetWithPlansAsync(
        int employerId,
        CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .AsNoTracking()
            .Include(employer => employer.Plans)
            .SingleOrDefaultAsync(employer => employer.Id == employerId, cancellationToken);
    }
}
