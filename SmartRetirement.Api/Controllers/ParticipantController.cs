using Microsoft.AspNetCore.Mvc;
using SmartRetirement.Api.DTOs.Participants;
using SmartRetirement.Api.Services.Interfaces;

namespace SmartRetirement.Api.Controllers;

[ApiController]
[Route("api/participants")]
public sealed class ParticipantController : ApiControllerBase
{
    private readonly IParticipantService _participantService;

    public ParticipantController(IParticipantService participantService)
    {
        _participantService = participantService;
    }

    // Get All
    [HttpGet]
    [ProducesResponseType(
        typeof(IReadOnlyList<ParticipantResponse>),
        StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyList<ParticipantResponse>>> GetAll(
        CancellationToken cancellationToken)
    {
        var result = await _participantService.GetAllAsync(cancellationToken);

        if (!result.IsSuccess)
        {
            return FromServiceError(result.Error!);
        }

        return Ok(result.Value);
    }


    // Get One
    [HttpGet("{participantId:int}")]
    [ProducesResponseType(
        typeof(ParticipantResponse),
        StatusCodes.Status200OK)]
    [ProducesResponseType(
        typeof(ProblemDetails),
        StatusCodes.Status400BadRequest)]
    [ProducesResponseType(
        typeof(ProblemDetails),
        StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ParticipantResponse>> GetById(
        int participantId,
        CancellationToken cancellationToken)
    {
        var result = await _participantService.GetByIdAsync(
            participantId,
            cancellationToken);

        if (!result.IsSuccess)
        {
            return FromServiceError(result.Error!);
        }

        return Ok(result.Value);
    }


    // Create
    [HttpPost]
    [ProducesResponseType(
        typeof(ParticipantResponse),
        StatusCodes.Status201Created)]
    [ProducesResponseType(
        typeof(ProblemDetails),
        StatusCodes.Status400BadRequest)]
    [ProducesResponseType(
        typeof(ProblemDetails),
        StatusCodes.Status409Conflict)]
    public async Task<ActionResult<ParticipantResponse>> Create(
        [FromBody] CreateParticipantRequest request,
        CancellationToken cancellationToken)
    {
        var result = await _participantService.CreateAsync(
            request,
            cancellationToken);

        if (!result.IsSuccess)
        {
            return FromServiceError(result.Error!);
        }

        return CreatedAtAction(
            nameof(GetById),
            new { participantId = result.Value!.Id },
            result.Value);
    }



    // Updates
    [HttpPut("{participantId:int}")]
    [ProducesResponseType(
        typeof(ParticipantResponse),
        StatusCodes.Status200OK)]
    [ProducesResponseType(
        typeof(ProblemDetails),
        StatusCodes.Status400BadRequest)]
    [ProducesResponseType(
        typeof(ProblemDetails),
        StatusCodes.Status404NotFound)]
    [ProducesResponseType(
        typeof(ProblemDetails),
        StatusCodes.Status409Conflict)]

    public async Task<ActionResult<ParticipantResponse>> Update(
        int participantId,
        [FromBody] UpdateParticipantRequest request,
        CancellationToken cancellationToken)
    {
        var result = await _participantService.UpdateAsync(
            participantId,
            request,
            cancellationToken);

        if (!result.IsSuccess)
        {
            return FromServiceError(result.Error!);
        }

        return Ok(result.Value);
    }

    // Delete,
    [HttpDelete("{participantId:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(
        typeof(ProblemDetails),
        StatusCodes.Status400BadRequest)]
    [ProducesResponseType(
        typeof(ProblemDetails),
        StatusCodes.Status404NotFound)]
    [ProducesResponseType(
        typeof(ProblemDetails),
        StatusCodes.Status409Conflict)]
    public async Task<IActionResult> Delete(
        int participantId,
        CancellationToken cancellationToken)
    {
        var result = await _participantService.DeleteAsync(
            participantId,
            cancellationToken);

        if (!result.IsSuccess)
        {
            return FromServiceError(result.Error!);
        }

        return NoContent();
    }
}
