using Microsoft.EntityFrameworkCore;
using SmartRetirement.Api.Models;

namespace SmartRetirement.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<Contribution> Contributions => Set<Contribution>();
    public DbSet<Employer> Employers => Set<Employer>();
    public DbSet<Participant> Participants => Set<Participant>();
    public DbSet<Plan> Plans => Set<Plan>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);
    }
}
