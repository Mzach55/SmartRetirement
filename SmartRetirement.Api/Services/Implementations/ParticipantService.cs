using System.Net.Mail;
using SmartRetirement.Api.DTOs.Common;
using SmartRetirement.Api.DTOs.Participants;
using SmartRetirement.Api.Models;
using SmartRetirement.Api.Repositories.Interfaces;
using SmartRetirement.Api.Services.Interfaces;

namespace SmartRetirement.Api.Services.Implementations;

public sealed class ParticipantService : IParticipantService
{
    private readonly IParticipantRepository _participantRepository;

    public ParticipantService(IParticipantRepository participantRepository)
    {
        _participantRepository = participantRepository;
    }

    public async Task<ServiceResult<IReadOnlyList<ParticipantResponse>>> GetAllAsync(
        CancellationToken cancellationToken = default)
    {
        var participants = await _participantRepository.GetAllAsync(
            cancellationToken);

        var response = participants
            .Select(MapToResponse)
            .ToList();

        return ServiceResult<IReadOnlyList<ParticipantResponse>>.Success(response);
    }

    public async Task<ServiceResult<ParticipantResponse>> GetByIdAsync(
        int participantId,
        CancellationToken cancellationToken = default)
    {
        if (participantId <= 0)
        {
            return ServiceResult<ParticipantResponse>.Failure(
                ServiceErrorCode.Validation,
                "Participant ID must be greater than zero.");
        }

        var participant = await _participantRepository.GetByIdAsync(
            participantId,
            cancellationToken);

        if (participant is null)
        {
            return ServiceResult<ParticipantResponse>.Failure(
                ServiceErrorCode.NotFound,
                $"Participant {participantId} was not found.");
        }

        return ServiceResult<ParticipantResponse>.Success(
            MapToResponse(participant));
    }

    public async Task<ServiceResult<ParticipantResponse>> CreateAsync(
        CreateParticipantRequest request,
        CancellationToken cancellationToken = default)
    {
        if (request is null)
        {
            return ServiceResult<ParticipantResponse>.Failure(
                ServiceErrorCode.Validation,
                "A participant request is required.");
        }

        var validationError = ValidateParticipantInput(
            request.FirstName,
            request.LastName,
            request.Email,
            request.DateOfBirth);

        if (validationError is not null)
        {
            return ServiceResult<ParticipantResponse>.Failure(
                validationError.Code,
                validationError.Message);
        }

        var normalizedEmail = NormalizeEmail(request.Email);

        if (await _participantRepository.EmailExistsAsync(
                normalizedEmail,
                cancellationToken: cancellationToken))
        {
            return ServiceResult<ParticipantResponse>.Failure(
                ServiceErrorCode.Conflict,
                "A participant with that email address already exists.");
        }

        var participant = new Participant
        {
            FirstName = request.FirstName.Trim(),
            LastName = request.LastName.Trim(),
            Email = normalizedEmail,
            DateOfBirth = request.DateOfBirth,
            CreatedAtUtc = DateTime.UtcNow
        };

        await _participantRepository.AddAsync(
            participant,
            cancellationToken);
        await _participantRepository.SaveChangesAsync(cancellationToken);

        return ServiceResult<ParticipantResponse>.Success(
            MapToResponse(participant));
    }

    public async Task<ServiceResult<ParticipantResponse>> UpdateAsync(
        int participantId,
        UpdateParticipantRequest request,
        CancellationToken cancellationToken = default)
    {
        if (participantId <= 0)
        {
            return ServiceResult<ParticipantResponse>.Failure(
                ServiceErrorCode.Validation,
                "Participant ID must be greater than zero.");
        }

        if (request is null)
        {
            return ServiceResult<ParticipantResponse>.Failure(
                ServiceErrorCode.Validation,
                "A participant request is required.");
        }

        var validationError = ValidateParticipantInput(
            request.FirstName,
            request.LastName,
            request.Email,
            request.DateOfBirth);

        if (validationError is not null)
        {
            return ServiceResult<ParticipantResponse>.Failure(
                validationError.Code,
                validationError.Message);
        }

        var participant = await _participantRepository.GetByIdAsync(
            participantId,
            cancellationToken);

        if (participant is null)
        {
            return ServiceResult<ParticipantResponse>.Failure(
                ServiceErrorCode.NotFound,
                $"Participant {participantId} was not found.");
        }

        var normalizedEmail = NormalizeEmail(request.Email);

        if (await _participantRepository.EmailExistsAsync(
                normalizedEmail,
                excludedParticipantId: participantId,
                cancellationToken))
        {
            return ServiceResult<ParticipantResponse>.Failure(
                ServiceErrorCode.Conflict,
                "A participant with that email address already exists.");
        }

        participant.FirstName = request.FirstName.Trim();
        participant.LastName = request.LastName.Trim();
        participant.Email = normalizedEmail;
        participant.DateOfBirth = request.DateOfBirth;

        _participantRepository.Update(participant);
        await _participantRepository.SaveChangesAsync(cancellationToken);

        return ServiceResult<ParticipantResponse>.Success(
            MapToResponse(participant));
    }

    public async Task<ServiceResult<bool>> DeleteAsync(
        int participantId,
        CancellationToken cancellationToken = default)
    {
        if (participantId <= 0)
        {
            return ServiceResult<bool>.Failure(
                ServiceErrorCode.Validation,
                "Participant ID must be greater than zero.");
        }

        var participant = await _participantRepository.GetWithPlansAsync(
            participantId,
            cancellationToken);

        if (participant is null)
        {
            return ServiceResult<bool>.Failure(
                ServiceErrorCode.NotFound,
                $"Participant {participantId} was not found.");
        }

        if (participant.Plans.Count > 0)
        {
            return ServiceResult<bool>.Failure(
                ServiceErrorCode.Conflict,
                "A participant who owns plans cannot be deleted.");
        }

        _participantRepository.Remove(participant);
        await _participantRepository.SaveChangesAsync(cancellationToken);

        return ServiceResult<bool>.Success(true);
    }

    private static ServiceError? ValidateParticipantInput(
        string firstName,
        string lastName,
        string email,
        DateOnly dateOfBirth)
    {
        if (string.IsNullOrWhiteSpace(firstName))
        {
            return new ServiceError(
                ServiceErrorCode.Validation,
                "First name is required.");
        }

        if (firstName.Trim().Length > 100)
        {
            return new ServiceError(
                ServiceErrorCode.Validation,
                "First name cannot exceed 100 characters.");
        }

        if (string.IsNullOrWhiteSpace(lastName))
        {
            return new ServiceError(
                ServiceErrorCode.Validation,
                "Last name is required.");
        }

        if (lastName.Trim().Length > 100)
        {
            return new ServiceError(
                ServiceErrorCode.Validation,
                "Last name cannot exceed 100 characters.");
        }

        if (string.IsNullOrWhiteSpace(email))
        {
            return new ServiceError(
                ServiceErrorCode.Validation,
                "Email is required.");
        }

        var trimmedEmail = email.Trim();

        if (trimmedEmail.Length > 256)
        {
            return new ServiceError(
                ServiceErrorCode.Validation,
                "Email cannot exceed 256 characters.");
        }

        if (!MailAddress.TryCreate(trimmedEmail, out var parsedEmail) ||
            !string.Equals(
                parsedEmail.Address,
                trimmedEmail,
                StringComparison.OrdinalIgnoreCase))
        {
            return new ServiceError(
                ServiceErrorCode.Validation,
                "Email must be a valid email address.");
        }

        if (dateOfBirth == default)
        {
            return new ServiceError(
                ServiceErrorCode.Validation,
                "Date of birth is required.");
        }

        if (dateOfBirth > DateOnly.FromDateTime(DateTime.UtcNow))
        {
            return new ServiceError(
                ServiceErrorCode.Validation,
                "Date of birth cannot be in the future.");
        }

        return null;
    }

    private static string NormalizeEmail(string email)
    {
        return email.Trim().ToLowerInvariant();
    }

    private static ParticipantResponse MapToResponse(Participant participant)
    {
        return new ParticipantResponse(
            participant.Id,
            participant.FirstName,
            participant.LastName,
            participant.Email,
            participant.DateOfBirth,
            participant.CreatedAtUtc);
    }
}
