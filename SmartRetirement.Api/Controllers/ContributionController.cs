using Microsoft.AspNetCore.Mvc;
using SmartRetirement.Api.DTOs.Contributions;
using SmartRetirement.Api.Services.Interfaces;

namespace SmartRetirement.Api.Controllers;

[ApiController]
[Route("api/contributions")]
public sealed class ContributionController : ApiControllerBase
{
    private readonly IContributionService _contributionService;

    public ContributionController(IContributionService contributionService)
    {
        _contributionService = contributionService;
    }

    [HttpGet("{contributionId:int}")]
    [ProducesResponseType(
        typeof(ContributionResponse),
        StatusCodes.Status200OK)]
    [ProducesResponseType(
        typeof(ProblemDetails),
        StatusCodes.Status400BadRequest)]
    [ProducesResponseType(
        typeof(ProblemDetails),
        StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ContributionResponse>> GetById(
        int contributionId,
        CancellationToken cancellationToken)
    {
        var result = await _contributionService.GetByIdAsync(
            contributionId,
            cancellationToken);

        if (!result.IsSuccess)
        {
            return FromServiceError(result.Error!);
        }

        return Ok(result.Value);
    }

    [HttpGet("/api/plans/{planId:int}/contributions")]
    [ProducesResponseType(
        typeof(IReadOnlyList<ContributionResponse>),
        StatusCodes.Status200OK)]
    [ProducesResponseType(
        typeof(ProblemDetails),
        StatusCodes.Status400BadRequest)]
    [ProducesResponseType(
        typeof(ProblemDetails),
        StatusCodes.Status404NotFound)]
    public async Task<ActionResult<IReadOnlyList<ContributionResponse>>> GetByPlanId(
        int planId,
        CancellationToken cancellationToken)
    {
        var result = await _contributionService.GetByPlanIdAsync(
            planId,
            cancellationToken);

        if (!result.IsSuccess)
        {
            return FromServiceError(result.Error!);
        }

        return Ok(result.Value);
    }

    [HttpPost]
    [ProducesResponseType(
        typeof(ContributionResponse),
        StatusCodes.Status201Created)]
    [ProducesResponseType(
        typeof(ProblemDetails),
        StatusCodes.Status400BadRequest)]
    [ProducesResponseType(
        typeof(ProblemDetails),
        StatusCodes.Status404NotFound)]
    [ProducesResponseType(
        typeof(ProblemDetails),
        StatusCodes.Status409Conflict)]
    public async Task<ActionResult<ContributionResponse>> Create(
        [FromBody] CreateContributionRequest request,
        CancellationToken cancellationToken)
    {
        var result = await _contributionService.CreateAsync(
            request,
            cancellationToken);

        if (!result.IsSuccess)
        {
            return FromServiceError(result.Error!);
        }

        return CreatedAtAction(
            nameof(GetById),
            new { contributionId = result.Value!.Id },
            result.Value);
    }
}
