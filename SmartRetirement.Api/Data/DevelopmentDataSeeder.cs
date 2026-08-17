using Microsoft.EntityFrameworkCore;
using SmartRetirement.Api.Models;

namespace SmartRetirement.Api.Data;

public static class DevelopmentDataSeeder
{
    public static async Task SeedAsync(
        AppDbContext context,
        CancellationToken cancellationToken = default)
    {
        await context.Database.MigrateAsync(cancellationToken);

        var northstar = await GetOrCreateEmployerAsync(
            context,
            "Northstar Analytics",
            "Financial Technology",
            cancellationToken);

        var harborHealth = await GetOrCreateEmployerAsync(
            context,
            "Harbor Health Systems",
            "Healthcare",
            cancellationToken);

        var maya = await GetOrCreateParticipantAsync(
            context,
            "Maya",
            "Chen",
            "maya.chen@example.com",
            new DateOnly(1989, 4, 12),
            new DateTime(2025, 1, 10, 14, 30, 0, DateTimeKind.Utc),
            cancellationToken);

        var jordan = await GetOrCreateParticipantAsync(
            context,
            "Jordan",
            "Brooks",
            "jordan.brooks@example.com",
            new DateOnly(1984, 9, 23),
            new DateTime(2025, 1, 12, 16, 0, 0, DateTimeKind.Utc),
            cancellationToken);

        var alex = await GetOrCreateParticipantAsync(
            context,
            "Alex",
            "Rivera",
            "alex.rivera@example.com",
            new DateOnly(1997, 2, 15),
            new DateTime(2025, 1, 14, 18, 15, 0, DateTimeKind.Utc),
            cancellationToken);

        await context.SaveChangesAsync(cancellationToken);

        var maya401K = await GetOrCreatePlanAsync(
            context,
            maya.Id,
            northstar.Id,
            "Northstar 401(k)",
            PlanType.K401,
            new DateOnly(2021, 6, 1),
            18_000m,
            23_500m,
            cancellationToken);

        var mayaIra = await GetOrCreatePlanAsync(
            context,
            maya.Id,
            employerId: null,
            "Maya Traditional IRA",
            PlanType.IRA,
            new DateOnly(2020, 2, 15),
            4_500m,
            7_000m,
            cancellationToken);

        var jordanHsa = await GetOrCreatePlanAsync(
            context,
            jordan.Id,
            harborHealth.Id,
            "Harbor Health HSA",
            PlanType.HSA,
            new DateOnly(2023, 1, 1),
            3_200m,
            4_300m,
            cancellationToken);

        var jordan529 = await GetOrCreatePlanAsync(
            context,
            jordan.Id,
            employerId: null,
            "Brooks Family 529",
            PlanType.Education529,
            new DateOnly(2022, 8, 10),
            5_000m,
            19_000m,
            cancellationToken);

        var alexAble = await GetOrCreatePlanAsync(
            context,
            alex.Id,
            employerId: null,
            "Alex ABLE Account",
            PlanType.Able,
            new DateOnly(2024, 3, 20),
            6_000m,
            19_000m,
            cancellationToken);

        await context.SaveChangesAsync(cancellationToken);

        await AddContributionIfMissingAsync(
            context,
            maya401K.Id,
            8_500m,
            new DateOnly(2025, 1, 31),
            2025,
            "Employee payroll contributions",
            cancellationToken);

        await AddContributionIfMissingAsync(
            context,
            maya401K.Id,
            9_500m,
            new DateOnly(2025, 7, 31),
            2025,
            "Employee payroll contributions",
            cancellationToken);

        await AddContributionIfMissingAsync(
            context,
            mayaIra.Id,
            4_500m,
            new DateOnly(2025, 4, 10),
            2025,
            "Annual IRA contribution",
            cancellationToken);

        await AddContributionIfMissingAsync(
            context,
            jordanHsa.Id,
            1_200m,
            new DateOnly(2025, 2, 28),
            2025,
            "Payroll HSA contributions",
            cancellationToken);

        await AddContributionIfMissingAsync(
            context,
            jordanHsa.Id,
            2_000m,
            new DateOnly(2025, 8, 31),
            2025,
            "Payroll HSA contributions",
            cancellationToken);

        await AddContributionIfMissingAsync(
            context,
            jordan529.Id,
            5_000m,
            new DateOnly(2025, 5, 15),
            2025,
            "Education savings contribution",
            cancellationToken);

        await AddContributionIfMissingAsync(
            context,
            alexAble.Id,
            2_500m,
            new DateOnly(2025, 3, 20),
            2025,
            "ABLE account contribution",
            cancellationToken);

        await AddContributionIfMissingAsync(
            context,
            alexAble.Id,
            3_500m,
            new DateOnly(2025, 9, 20),
            2025,
            "ABLE account contribution",
            cancellationToken);

        await context.SaveChangesAsync(cancellationToken);
    }

    private static async Task<Employer> GetOrCreateEmployerAsync(
        AppDbContext context,
        string name,
        string? industry,
        CancellationToken cancellationToken)
    {
        var employer = await context.Employers.FirstOrDefaultAsync(
            existingEmployer => existingEmployer.Name == name,
            cancellationToken);

        if (employer is not null)
        {
            return employer;
        }

        employer = new Employer
        {
            Name = name,
            Industry = industry
        };

        await context.Employers.AddAsync(employer, cancellationToken);
        return employer;
    }

    private static async Task<Participant> GetOrCreateParticipantAsync(
        AppDbContext context,
        string firstName,
        string lastName,
        string email,
        DateOnly dateOfBirth,
        DateTime createdAtUtc,
        CancellationToken cancellationToken)
    {
        var participant = await context.Participants.FirstOrDefaultAsync(
            existingParticipant => existingParticipant.Email == email,
            cancellationToken);

        if (participant is not null)
        {
            return participant;
        }

        participant = new Participant
        {
            FirstName = firstName,
            LastName = lastName,
            Email = email,
            DateOfBirth = dateOfBirth,
            CreatedAtUtc = createdAtUtc
        };

        await context.Participants.AddAsync(participant, cancellationToken);
        return participant;
    }

    private static async Task<Plan> GetOrCreatePlanAsync(
        AppDbContext context,
        int participantId,
        int? employerId,
        string name,
        PlanType type,
        DateOnly openedOn,
        decimal currentBalance,
        decimal annualContributionLimit,
        CancellationToken cancellationToken)
    {
        var plan = await context.Plans.FirstOrDefaultAsync(
            existingPlan =>
                existingPlan.ParticipantId == participantId &&
                existingPlan.Name == name,
            cancellationToken);

        if (plan is not null)
        {
            return plan;
        }

        plan = new Plan
        {
            ParticipantId = participantId,
            EmployerId = employerId,
            Name = name,
            Type = type,
            OpenedOn = openedOn,
            CurrentBalance = currentBalance,
            AnnualContributionLimit = annualContributionLimit,
            IsActive = true
        };

        await context.Plans.AddAsync(plan, cancellationToken);
        return plan;
    }

    private static async Task AddContributionIfMissingAsync(
        AppDbContext context,
        int planId,
        decimal amount,
        DateOnly contributionDate,
        int taxYear,
        string description,
        CancellationToken cancellationToken)
    {
        var exists = await context.Contributions.AnyAsync(
            contribution =>
                contribution.PlanId == planId &&
                contribution.Amount == amount &&
                contribution.ContributionDate == contributionDate &&
                contribution.TaxYear == taxYear &&
                contribution.Description == description,
            cancellationToken);

        if (exists)
        {
            return;
        }

        await context.Contributions.AddAsync(
            new Contribution
            {
                PlanId = planId,
                Amount = amount,
                ContributionDate = contributionDate,
                TaxYear = taxYear,
                Description = description
            },
            cancellationToken);
    }
}
