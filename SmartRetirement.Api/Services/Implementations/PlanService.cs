using SmartRetirement.Api.DTOs.Common;
using SmartRetirement.Api.DTOs.Employers;
using SmartRetirement.Api.DTOs.Plans;
using SmartRetirement.Api.Models;
using SmartRetirement.Api.Repositories.Interfaces;
using SmartRetirement.Api.Services.Interfaces;

namespace SmartRetirement.Api.Services.Implementations;

public sealed class PlanService : IPlanService
{
    private readonly IPlanRepository _planRepository;
    private readonly IParticipantRepository _participantRepository;
    private readonly IEmployerRepository _employerRepository;

    public PlanService(
        IPlanRepository planRepository,
        IParticipantRepository participantRepository,
        IEmployerRepository employerRepository)
    {
        _planRepository = planRepository;
        _participantRepository = participantRepository;
        _employerRepository = employerRepository;
    }

    public async Task<ServiceResult<IReadOnlyList<PlanResponse>>> GetAllAsync(
        CancellationToken cancellationToken = default)
    {
        var plans = await _planRepository.GetAllWithEmployerAsync(
            cancellationToken);

        var response = plans
            .Select(MapToResponse)
            .ToList();

        return ServiceResult<IReadOnlyList<PlanResponse>>.Success(response);
    }

    public async Task<ServiceResult<PlanResponse>> GetByIdAsync(
        int planId,
        CancellationToken cancellationToken = default)
    {
        if (planId <= 0)
        {
            return ServiceResult<PlanResponse>.Failure(
                ServiceErrorCode.Validation,
                "Plan ID must be greater than zero.");
        }

        var plan = await _planRepository.GetWithDetailsAsync(
            planId,
            cancellationToken);

        if (plan is null)
        {
            return ServiceResult<PlanResponse>.Failure(
                ServiceErrorCode.NotFound,
                $"Plan {planId} was not found.");
        }

        return ServiceResult<PlanResponse>.Success(
            MapToResponse(plan));
    }

    public async Task<ServiceResult<IReadOnlyList<PlanResponse>>> GetByParticipantIdAsync(
        int participantId,
        CancellationToken cancellationToken = default)
    {
        if (participantId <= 0)
        {
            return ServiceResult<IReadOnlyList<PlanResponse>>.Failure(
                ServiceErrorCode.Validation,
                "Participant ID must be greater than zero.");
        }

        var participant = await _participantRepository.GetByIdAsync(
            participantId,
            cancellationToken);

        if (participant is null)
        {
            return ServiceResult<IReadOnlyList<PlanResponse>>.Failure(
                ServiceErrorCode.NotFound,
                $"Participant {participantId} was not found.");
        }

        var plans = await _planRepository.GetByParticipantIdAsync(
            participantId,
            cancellationToken);

        var response = plans
            .Select(MapToResponse)
            .ToList();

        return ServiceResult<IReadOnlyList<PlanResponse>>.Success(response);
    }

    public async Task<ServiceResult<IReadOnlyList<PlanResponse>>> GetByEmployerIdAsync(
        int employerId,
        CancellationToken cancellationToken = default)
    {
        if (employerId <= 0)
        {
            return ServiceResult<IReadOnlyList<PlanResponse>>.Failure(
                ServiceErrorCode.Validation,
                "Employer ID must be greater than zero.");
        }

        var employer = await _employerRepository.GetByIdAsync(
            employerId,
            cancellationToken);

        if (employer is null)
        {
            return ServiceResult<IReadOnlyList<PlanResponse>>.Failure(
                ServiceErrorCode.NotFound,
                $"Employer {employerId} was not found.");
        }

        var plans = await _planRepository.GetByEmployerIdAsync(
            employerId,
            cancellationToken);

        var response = plans
            .Select(MapToResponse)
            .ToList();

        return ServiceResult<IReadOnlyList<PlanResponse>>.Success(response);
    }

    public async Task<ServiceResult<PlanResponse>> CreateAsync(
        CreatePlanRequest request,
        CancellationToken cancellationToken = default)
    {
        if (request is null)
        {
            return ServiceResult<PlanResponse>.Failure(
                ServiceErrorCode.Validation,
                "A plan request is required.");
        }

        if (request.ParticipantId <= 0)
        {
            return ServiceResult<PlanResponse>.Failure(
                ServiceErrorCode.Validation,
                "Participant ID must be greater than zero.");
        }

        var validationError = ValidatePlanInput(
            request.EmployerId,
            request.Name,
            request.Type,
            request.OpenedOn,
            request.AnnualContributionLimit);

        if (validationError is not null)
        {
            return ServiceResult<PlanResponse>.Failure(
                validationError.Code,
                validationError.Message);
        }

        var participant = await _participantRepository.GetByIdAsync(
            request.ParticipantId,
            cancellationToken);

        if (participant is null)
        {
            return ServiceResult<PlanResponse>.Failure(
                ServiceErrorCode.NotFound,
                $"Participant {request.ParticipantId} was not found.");
        }

        Employer? employer = null;

        if (request.EmployerId is int employerId)
        {
            employer = await _employerRepository.GetByIdAsync(
                employerId,
                cancellationToken);

            if (employer is null)
            {
                return ServiceResult<PlanResponse>.Failure(
                    ServiceErrorCode.NotFound,
                    $"Employer {employerId} was not found.");
            }
        }

        var plan = new Plan
        {
            ParticipantId = request.ParticipantId,
            EmployerId = request.EmployerId,
            Name = request.Name.Trim(),
            Type = request.Type,
            OpenedOn = request.OpenedOn,
            CurrentBalance = 0,
            AnnualContributionLimit = request.AnnualContributionLimit,
            IsActive = true,
            Employer = employer
        };

        await _planRepository.AddAsync(plan, cancellationToken);
        await _planRepository.SaveChangesAsync(cancellationToken);

        return ServiceResult<PlanResponse>.Success(
            MapToResponse(plan));
    }

    public async Task<ServiceResult<PlanResponse>> UpdateAsync(
        int planId,
        UpdatePlanRequest request,
        CancellationToken cancellationToken = default)
    {
        if (planId <= 0)
        {
            return ServiceResult<PlanResponse>.Failure(
                ServiceErrorCode.Validation,
                "Plan ID must be greater than zero.");
        }

        if (request is null)
        {
            return ServiceResult<PlanResponse>.Failure(
                ServiceErrorCode.Validation,
                "A plan request is required.");
        }

        var validationError = ValidatePlanInput(
            request.EmployerId,
            request.Name,
            request.Type,
            request.OpenedOn,
            request.AnnualContributionLimit);

        if (validationError is not null)
        {
            return ServiceResult<PlanResponse>.Failure(
                validationError.Code,
                validationError.Message);
        }

        var plan = await _planRepository.GetByIdAsync(
            planId,
            cancellationToken);

        if (plan is null)
        {
            return ServiceResult<PlanResponse>.Failure(
                ServiceErrorCode.NotFound,
                $"Plan {planId} was not found.");
        }

        Employer? employer = null;

        if (request.EmployerId is int employerId)
        {
            employer = await _employerRepository.GetByIdAsync(
                employerId,
                cancellationToken);

            if (employer is null)
            {
                return ServiceResult<PlanResponse>.Failure(
                    ServiceErrorCode.NotFound,
                    $"Employer {employerId} was not found.");
            }
        }

        plan.EmployerId = request.EmployerId;
        plan.Name = request.Name.Trim();
        plan.Type = request.Type;
        plan.OpenedOn = request.OpenedOn;
        plan.AnnualContributionLimit = request.AnnualContributionLimit;
        plan.IsActive = request.IsActive;
        plan.Employer = employer;

        _planRepository.Update(plan);
        await _planRepository.SaveChangesAsync(cancellationToken);

        return ServiceResult<PlanResponse>.Success(
            MapToResponse(plan));
    }

    public async Task<ServiceResult<bool>> DeleteAsync(
        int planId,
        CancellationToken cancellationToken = default)
    {
        if (planId <= 0)
        {
            return ServiceResult<bool>.Failure(
                ServiceErrorCode.Validation,
                "Plan ID must be greater than zero.");
        }

        var plan = await _planRepository.GetWithDetailsAsync(
            planId,
            cancellationToken);

        if (plan is null)
        {
            return ServiceResult<bool>.Failure(
                ServiceErrorCode.NotFound,
                $"Plan {planId} was not found.");
        }

        if (plan.Contributions.Count > 0)
        {
            return ServiceResult<bool>.Failure(
                ServiceErrorCode.Conflict,
                "A plan with contribution history cannot be deleted. Deactivate it instead.");
        }

        _planRepository.Remove(plan);
        await _planRepository.SaveChangesAsync(cancellationToken);

        return ServiceResult<bool>.Success(true);
    }

    private static ServiceError? ValidatePlanInput(
        int? employerId,
        string name,
        PlanType type,
        DateOnly openedOn,
        decimal annualContributionLimit)
    {
        if (employerId <= 0)
        {
            return new ServiceError(
                ServiceErrorCode.Validation,
                "Employer ID must be greater than zero when supplied.");
        }

        if (string.IsNullOrWhiteSpace(name))
        {
            return new ServiceError(
                ServiceErrorCode.Validation,
                "Plan name is required.");
        }

        if (name.Trim().Length > 200)
        {
            return new ServiceError(
                ServiceErrorCode.Validation,
                "Plan name cannot exceed 200 characters.");
        }

        if (type == PlanType.Unknown || !Enum.IsDefined(typeof(PlanType), type))
        {
            return new ServiceError(
                ServiceErrorCode.Validation,
                "A valid plan type is required.");
        }

        if (openedOn == default)
        {
            return new ServiceError(
                ServiceErrorCode.Validation,
                "An opened date is required.");
        }

        if (annualContributionLimit <= 0)
        {
            return new ServiceError(
                ServiceErrorCode.Validation,
                "Annual contribution limit must be greater than zero.");
        }

        return null;
    }

    private static PlanResponse MapToResponse(Plan plan)
    {
        return new PlanResponse(
            plan.Id,
            plan.ParticipantId,
            plan.EmployerId,
            plan.Name,
            plan.Type,
            plan.OpenedOn,
            plan.CurrentBalance,
            plan.AnnualContributionLimit,
            plan.IsActive,
            plan.Employer is null
                ? null
                : new EmployerSummaryResponse(
                    plan.Employer.Id,
                    plan.Employer.Name,
                    plan.Employer.Industry));
    }
}
