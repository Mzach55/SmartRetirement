using SmartRetirement.Api.DTOs.Common;
using SmartRetirement.Api.DTOs.Plans;

namespace SmartRetirement.Api.Services.Interfaces;

public interface IPlanService
{
    Task<ServiceResult<IReadOnlyList<PlanResponse>>> GetAllAsync(
        CancellationToken cancellationToken = default);

    Task<ServiceResult<PlanResponse>> GetByIdAsync(
        int planId,
        CancellationToken cancellationToken = default);

    Task<ServiceResult<IReadOnlyList<PlanResponse>>> GetByParticipantIdAsync(
        int participantId,
        CancellationToken cancellationToken = default);

    Task<ServiceResult<IReadOnlyList<PlanResponse>>> GetByEmployerIdAsync(
        int employerId,
        CancellationToken cancellationToken = default);

    Task<ServiceResult<PlanResponse>> CreateAsync(
        CreatePlanRequest request,
        CancellationToken cancellationToken = default);

    Task<ServiceResult<PlanResponse>> UpdateAsync(
        int planId,
        UpdatePlanRequest request,
        CancellationToken cancellationToken = default);

    Task<ServiceResult<bool>> DeleteAsync(
        int planId,
        CancellationToken cancellationToken = default);
}
