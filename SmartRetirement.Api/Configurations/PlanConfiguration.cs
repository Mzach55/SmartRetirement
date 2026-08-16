using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SmartRetirement.Api.Models;

namespace SmartRetirement.Api.Configurations;

public class PlanConfiguration : IEntityTypeConfiguration<Plan>
{
    public void Configure(EntityTypeBuilder<Plan> builder)
    {
        builder.ToTable("Plans");

        builder.HasKey(plan => plan.Id);

        builder.Property(plan => plan.Name)
            .HasMaxLength(200)
            .IsRequired();

        builder.Property(plan => plan.Type)
            .HasConversion<string>()
            .HasMaxLength(32)
            .IsRequired();

        builder.Property(plan => plan.OpenedOn)
            .IsRequired();

        builder.Property(plan => plan.CurrentBalance)
            .HasPrecision(18, 2)
            .IsRequired();

        builder.Property(plan => plan.AnnualContributionLimit)
            .HasPrecision(18, 2)
            .IsRequired();

        builder.Property(plan => plan.IsActive)
            .IsRequired();
    }
}
