using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SmartRetirement.Api.Models;

namespace SmartRetirement.Api.Configurations;

public class ContributionConfiguration : IEntityTypeConfiguration<Contribution>
{
    public void Configure(EntityTypeBuilder<Contribution> builder)
    {
        // selects the table name
        builder.ToTable("Contributions");

        // primary key
        builder.HasKey(contribution => contribution.Id);

        // Contributions need an amount
        builder.Property(contribution => contribution.Amount)
            .HasPrecision(18, 2)
            .IsRequired();

        // they need a date
        builder.Property(contribution => contribution.ContributionDate)
            .IsRequired();

        // need a tax year
        builder.Property(contribution => contribution.TaxYear)
            .IsRequired();

        // description, however, this isn't really needed atp
        builder.Property(contribution => contribution.Description)
            .HasMaxLength(500);


        // find contributions for a specific plan and tax year
        builder.HasIndex(contribution => new
        {
            contribution.PlanId,
            contribution.TaxYear
        });

        builder.HasOne(contribution => contribution.Plan)
            .WithMany(plan => plan.Contributions)
            .HasForeignKey(contribution => contribution.PlanId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}