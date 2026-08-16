using Microsoft.EntityFrameworkCore;
using SmartRetirement.Api.Data;
using SmartRetirement.Api.Repositories.Interfaces;

namespace SmartRetirement.Api.Repositories.Implementations;

public class Repository<T> : IRepository<T> where T : class
{
    // The scoped EF Core session/unit of work. It tracks changes across every
    // entity type and commits all pending changes through SaveChangesAsync.
    protected readonly AppDbContext _context;

    // The entity-specific query and persistence entry point obtained from the
    // context. For Repository<Plan>, this is the context's DbSet<Plan>.
    protected readonly DbSet<T> _dbSet;

    // Constructor injection: the DI container supplies the already-configured,
    // scoped AppDbContext instead of this repository constructing one itself.
    public Repository(AppDbContext context)
    {
        _context = context;

        // Set<T>() returns the DbSet for this repository's generic entity type.
        // It uses the same context, connection, and change tracker as _context.
        _dbSet = context.Set<T>();
    }

    public async Task<T?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        // FindAsync checks the context's change tracker before querying SQLite.
        return await _dbSet.FindAsync(new object[] { id }, cancellationToken);
    }

    public async Task<IReadOnlyList<T>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .AsNoTracking()
            .ToListAsync(cancellationToken);
    }

    public async Task AddAsync(T entity, CancellationToken cancellationToken = default)
    {
        await _dbSet.AddAsync(entity, cancellationToken);
    }

    public void Update(T entity)
    {
        _dbSet.Update(entity);
    }

    public void Remove(T entity)
    {
        _dbSet.Remove(entity);
    }

    public async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        return await _context.SaveChangesAsync(cancellationToken);
    }
}
