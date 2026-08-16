using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SmartRetirement.Api.Models;

namespace SmartRetirement.Api.Configurations;

public class ParticipantConfiguration : IEntityTypeConfiguration<Participant>
{
    public void Configure(EntityTypeBuilder<Participant> builder)
    {
        builder.ToTable("Participants");

        builder.HasKey(participant => participant.Id);

        builder.Property(participant => participant.FirstName)
            .HasMaxLength(100)
            .IsRequired();

        builder.Property(participant => participant.LastName)
            .HasMaxLength(100)
            .IsRequired();

        builder.Property(participant => participant.Email)
            .HasMaxLength(256)
            .IsRequired();

        builder.Property(participant => participant.DateOfBirth)
            .IsRequired();

        builder.Property(participant => participant.CreatedAtUtc)
            .IsRequired();

        builder.HasIndex(participant => participant.Email)
            .IsUnique();

        builder.HasMany(participant => participant.Plans)
            .WithOne(plan => plan.Participant)
            .HasForeignKey(plan => plan.ParticipantId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
