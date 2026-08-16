using Microsoft.EntityFrameworkCore;
using SmartRetirement.Api.Data;
using SmartRetirement.Api.Models;
using SmartRetirement.Api.Repositories.Interfaces;

namespace SmartRetirement.Api.Repositories.Implementations;

public class ParticipantRepository : Repository<Participant>, IParticipantRepository
{
    public ParticipantRepository(AppDbContext context) : base(context)
    {
    }

    public async Task<Participant?> GetWithPlansAsync(
        int participantId,
        CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .AsNoTracking()
            .Include(participant => participant.Plans)
            .SingleOrDefaultAsync(
                participant => participant.Id == participantId,
                cancellationToken);
    }

    public async Task<bool> EmailExistsAsync(
        string email,
        int? excludedParticipantId = null,
        CancellationToken cancellationToken = default)
    {
        return await _dbSet.AnyAsync(
            participant =>
                participant.Email == email &&
                (!excludedParticipantId.HasValue ||
                 participant.Id != excludedParticipantId.Value),
            cancellationToken);
    }
}
