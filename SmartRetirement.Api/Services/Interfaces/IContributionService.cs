using SmartRetirement.Api.DTOs.Common;
using SmartRetirement.Api.DTOs.Contributions;

namespace SmartRetirement.Api.Services.Interfaces;

public interface IContributionService
{
    Task<ServiceResult<ContributionResponse>> GetByIdAsync(
        int contributionId,
        CancellationToken cancellationToken = default);

    Task<ServiceResult<IReadOnlyList<ContributionResponse>>> GetByPlanIdAsync(
        int planId,
        CancellationToken cancellationToken = default);

    Task<ServiceResult<ContributionResponse>> CreateAsync(
        CreateContributionRequest request,
        CancellationToken cancellationToken = default);
}
