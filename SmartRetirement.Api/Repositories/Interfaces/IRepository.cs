namespace SmartRetirement.Api.Repositories.Interfaces;

public interface IRepository<T> where T : class
{
    // A singular lookup may return null when the key does not exist.
    Task<T?> GetByIdAsync(
        int id,
        CancellationToken cancellationToken = default);

    // Collection queries return an empty collection when no records exist.
    Task<IReadOnlyList<T>> GetAllAsync(
        CancellationToken cancellationToken = default);

    // These methods change EF Core's tracked state but do not persist it.
    Task AddAsync(
        T entity,
        CancellationToken cancellationToken = default);

    void Update(T entity);

    void Remove(T entity);

    // Commits all pending changes tracked by the shared AppDbContext.
    Task<int> SaveChangesAsync(
        CancellationToken cancellationToken = default);
}
