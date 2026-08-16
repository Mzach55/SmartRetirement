using SmartRetirement.Api.DTOs.Common;
using SmartRetirement.Api.DTOs.Participants;

namespace SmartRetirement.Api.Services.Interfaces;

public interface IParticipantService
{
    Task<ServiceResult<IReadOnlyList<ParticipantResponse>>> GetAllAsync(
        CancellationToken cancellationToken = default);

    Task<ServiceResult<ParticipantResponse>> GetByIdAsync(
        int participantId,
        CancellationToken cancellationToken = default);

    Task<ServiceResult<ParticipantResponse>> CreateAsync(
        CreateParticipantRequest request,
        CancellationToken cancellationToken = default);

    Task<ServiceResult<ParticipantResponse>> UpdateAsync(
        int participantId,
        UpdateParticipantRequest request,
        CancellationToken cancellationToken = default);

    Task<ServiceResult<bool>> DeleteAsync(
        int participantId,
        CancellationToken cancellationToken = default);
}
