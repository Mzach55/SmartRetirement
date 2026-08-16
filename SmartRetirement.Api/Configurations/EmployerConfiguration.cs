using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SmartRetirement.Api.Models;


namespace SmartRetirement.Api.Configurations;

public class EmployerConfiguration : IEntityTypeConfiguration<Employer>

{
    public void Configure(EntityTypeBuilder<Employer> builder)
    
    {
        builder.ToTable("Employers");

        // primary key
        builder.HasKey(employer => employer.Id);

        // mandated value for Company Name
        builder.Property(employer => employer.Name)
            .HasMaxLength(200)
            .IsRequired();

        builder.Property(employer => employer.Industry)
            .HasMaxLength(100);

        builder.HasMany(employer => employer.Plans)
            .WithOne(plan => plan.Employer)
            .HasForeignKey(plan => plan.EmployerId)
            .OnDelete(DeleteBehavior.SetNull);
    }

}