using SmartRetirement.Api.DTOs.Common;
using SmartRetirement.Api.DTOs.Contributions;
using SmartRetirement.Api.Models;
using SmartRetirement.Api.Repositories.Interfaces;
using SmartRetirement.Api.Services.Interfaces;

namespace SmartRetirement.Api.Services.Implementations;

public sealed class ContributionService : IContributionService
{
    private readonly IContributionRepository _contributionRepository;
    private readonly IPlanRepository _planRepository;

    public ContributionService(
        IContributionRepository contributionRepository,
        IPlanRepository planRepository)
    {
        _contributionRepository = contributionRepository;
        _planRepository = planRepository;
    }

    public async Task<ServiceResult<ContributionResponse>> GetByIdAsync(
        int contributionId,
        CancellationToken cancellationToken = default)
    {
        if (contributionId <= 0)
        {
            return ServiceResult<ContributionResponse>.Failure(
                ServiceErrorCode.Validation,
                "Contribution ID must be greater than zero.");
        }

        var contribution = await _contributionRepository.GetByIdAsync(
            contributionId,
            cancellationToken);

        if (contribution is null)
        {
            return ServiceResult<ContributionResponse>.Failure(
                ServiceErrorCode.NotFound,
                $"Contribution {contributionId} was not found.");
        }

        return ServiceResult<ContributionResponse>.Success(
            MapToResponse(contribution));
    }

    public async Task<ServiceResult<IReadOnlyList<ContributionResponse>>> GetByPlanIdAsync(
        int planId,
        CancellationToken cancellationToken = default)
    {
        if (planId <= 0)
        {
            return ServiceResult<IReadOnlyList<ContributionResponse>>.Failure(
                ServiceErrorCode.Validation,
                "Plan ID must be greater than zero.");
        }

        var plan = await _planRepository.GetByIdAsync(
            planId,
            cancellationToken);

        if (plan is null)
        {
            return ServiceResult<IReadOnlyList<ContributionResponse>>.Failure(
                ServiceErrorCode.NotFound,
                $"Plan {planId} was not found.");
        }

        var contributions = await _contributionRepository.GetByPlanIdAsync(
            planId,
            cancellationToken);

        var response = contributions
            .Select(MapToResponse)
            .ToList();

        return ServiceResult<IReadOnlyList<ContributionResponse>>.Success(response);
    }

    public async Task<ServiceResult<ContributionResponse>> CreateAsync(
        CreateContributionRequest request,
        CancellationToken cancellationToken = default)
    {
        if (request is null)
        {
            return ServiceResult<ContributionResponse>.Failure(
                ServiceErrorCode.Validation,
                "A contribution request is required.");
        }

        if (request.PlanId <= 0)
        {
            return ServiceResult<ContributionResponse>.Failure(
                ServiceErrorCode.Validation,
                "Plan ID must be greater than zero.");
        }

        if (request.Amount <= 0)
        {
            return ServiceResult<ContributionResponse>.Failure(
                ServiceErrorCode.Validation,
                "Contribution amount must be greater than zero.");
        }

        if (request.ContributionDate == default)
        {
            return ServiceResult<ContributionResponse>.Failure(
                ServiceErrorCode.Validation,
                "A contribution date is required.");
        }

        if (request.TaxYear <= 0)
        {
            return ServiceResult<ContributionResponse>.Failure(
                ServiceErrorCode.Validation,
                "Tax year must be greater than zero.");
        }

        var plan = await _planRepository.GetByIdAsync(
            request.PlanId,
            cancellationToken);

        if (plan is null)
        {
            return ServiceResult<ContributionResponse>.Failure(
                ServiceErrorCode.NotFound,
                $"Plan {request.PlanId} was not found.");
        }

        if (!plan.IsActive)
        {
            return ServiceResult<ContributionResponse>.Failure(
                ServiceErrorCode.PlanInactive,
                $"Plan {request.PlanId} is inactive and cannot accept contributions.");
        }

        if (plan.AnnualContributionLimit <= 0)
        {
            return ServiceResult<ContributionResponse>.Failure(
                ServiceErrorCode.Conflict,
                $"Plan {request.PlanId} does not have a valid annual contribution limit.");
        }

        var existingTotal = await _contributionRepository
            .GetTotalForPlanAndTaxYearAsync(
                request.PlanId,
                request.TaxYear,
                cancellationToken);

        var projectedTotal = existingTotal + request.Amount;

        if (projectedTotal > plan.AnnualContributionLimit)
        {
            return ServiceResult<ContributionResponse>.Failure(
                ServiceErrorCode.AnnualLimitExceeded,
                $"The contribution would raise the {request.TaxYear} total " +
                $"to {projectedTotal}, exceeding the plan limit of " +
                $"{plan.AnnualContributionLimit}.");
        }

        var contribution = new Contribution
        {
            PlanId = request.PlanId,
            Amount = request.Amount,
            ContributionDate = request.ContributionDate,
            TaxYear = request.TaxYear,
            Description = string.IsNullOrWhiteSpace(request.Description)
                ? null
                : request.Description.Trim()
        };

        plan.CurrentBalance += request.Amount;

        await _contributionRepository.AddAsync(
            contribution,
            cancellationToken);

        // GetByIdAsync returns a tracked Plan, but calling Update explicitly
        // also makes the intended balance change clear at the service boundary.
        _planRepository.Update(plan);

        // Both repositories share the same scoped AppDbContext. One save commits
        // the contribution and balance update together.
        await _contributionRepository.SaveChangesAsync(cancellationToken);

        return ServiceResult<ContributionResponse>.Success(
            MapToResponse(contribution));
    }

    private static ContributionResponse MapToResponse(
        Contribution contribution)
    {
        return new ContributionResponse(
            contribution.Id,
            contribution.PlanId,
            contribution.Amount,
            contribution.ContributionDate,
            contribution.TaxYear,
            contribution.Description);
    }
}
