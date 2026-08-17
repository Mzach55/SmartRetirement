using Microsoft.AspNetCore.Mvc;
using SmartRetirement.Api.DTOs.Plans;
using SmartRetirement.Api.Services.Interfaces;

namespace SmartRetirement.Api.Controllers;

[ApiController]
[Route("api/plans")]
public sealed class PlanController : ApiControllerBase
{
    private readonly IPlanService _planService;

    public PlanController(IPlanService planService)
    {
        _planService = planService;
    }

    [HttpGet]
    [ProducesResponseType(
        typeof(IReadOnlyList<PlanResponse>),
        StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyList<PlanResponse>>> GetAll(
        CancellationToken cancellationToken)
    {
        var result = await _planService.GetAllAsync(cancellationToken);

        if (!result.IsSuccess)
        {
            return FromServiceError(result.Error!);
        }

        return Ok(result.Value);
    }

    [HttpGet("{planId:int}")]
    [ProducesResponseType(
        typeof(PlanResponse),
        StatusCodes.Status200OK)]
    [ProducesResponseType(
        typeof(ProblemDetails),
        StatusCodes.Status400BadRequest)]
    [ProducesResponseType(
        typeof(ProblemDetails),
        StatusCodes.Status404NotFound)]
    public async Task<ActionResult<PlanResponse>> GetById(
        int planId,
        CancellationToken cancellationToken)
    {
        var result = await _planService.GetByIdAsync(
            planId,
            cancellationToken);

        if (!result.IsSuccess)
        {
            return FromServiceError(result.Error!);
        }

        return Ok(result.Value);
    }

    [HttpGet("/api/participants/{participantId:int}/plans")]
    [ProducesResponseType(
        typeof(IReadOnlyList<PlanResponse>),
        StatusCodes.Status200OK)]
    [ProducesResponseType(
        typeof(ProblemDetails),
        StatusCodes.Status400BadRequest)]
    [ProducesResponseType(
        typeof(ProblemDetails),
        StatusCodes.Status404NotFound)]
    public async Task<ActionResult<IReadOnlyList<PlanResponse>>> GetByParticipantId(
        int participantId,
        CancellationToken cancellationToken)
    {
        var result = await _planService.GetByParticipantIdAsync(
            participantId,
            cancellationToken);

        if (!result.IsSuccess)
        {
            return FromServiceError(result.Error!);
        }

        return Ok(result.Value);
    }

    [HttpGet("/api/employers/{employerId:int}/plans")]
    [ProducesResponseType(
        typeof(IReadOnlyList<PlanResponse>),
        StatusCodes.Status200OK)]
    [ProducesResponseType(
        typeof(ProblemDetails),
        StatusCodes.Status400BadRequest)]
    [ProducesResponseType(
        typeof(ProblemDetails),
        StatusCodes.Status404NotFound)]
    public async Task<ActionResult<IReadOnlyList<PlanResponse>>> GetByEmployerId(
        int employerId,
        CancellationToken cancellationToken)
    {
        var result = await _planService.GetByEmployerIdAsync(
            employerId,
            cancellationToken);

        if (!result.IsSuccess)
        {
            return FromServiceError(result.Error!);
        }

        return Ok(result.Value);
    }

    [HttpPost]
    [ProducesResponseType(
        typeof(PlanResponse),
        StatusCodes.Status201Created)]
    [ProducesResponseType(
        typeof(ProblemDetails),
        StatusCodes.Status400BadRequest)]
    [ProducesResponseType(
        typeof(ProblemDetails),
        StatusCodes.Status404NotFound)]
    public async Task<ActionResult<PlanResponse>> Create(
        [FromBody] CreatePlanRequest request,
        CancellationToken cancellationToken)
    {
        var result = await _planService.CreateAsync(
            request,
            cancellationToken);

        if (!result.IsSuccess)
        {
            return FromServiceError(result.Error!);
        }

        return CreatedAtAction(
            nameof(GetById),
            new { planId = result.Value!.Id },
            result.Value);
    }

    [HttpPut("{planId:int}")]
    [ProducesResponseType(
        typeof(PlanResponse),
        StatusCodes.Status200OK)]
    [ProducesResponseType(
        typeof(ProblemDetails),
        StatusCodes.Status400BadRequest)]
    [ProducesResponseType(
        typeof(ProblemDetails),
        StatusCodes.Status404NotFound)]
    public async Task<ActionResult<PlanResponse>> Update(
        int planId,
        [FromBody] UpdatePlanRequest request,
        CancellationToken cancellationToken)
    {
        var result = await _planService.UpdateAsync(
            planId,
            request,
            cancellationToken);

        if (!result.IsSuccess)
        {
            return FromServiceError(result.Error!);
        }

        return Ok(result.Value);
    }

    [HttpDelete("{planId:int}")]
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
        int planId,
        CancellationToken cancellationToken)
    {
        var result = await _planService.DeleteAsync(
            planId,
            cancellationToken);

        if (!result.IsSuccess)
        {
            return FromServiceError(result.Error!);
        }

        return NoContent();
    }
}
