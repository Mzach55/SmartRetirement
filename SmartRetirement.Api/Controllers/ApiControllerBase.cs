using Microsoft.AspNetCore.Mvc;
using SmartRetirement.Api.DTOs.Common;

namespace SmartRetirement.Api.Controllers;

public abstract class ApiControllerBase : ControllerBase
{
    protected ObjectResult FromServiceError(ServiceError error)
    {
        var statusCode = error.Code switch
        {
            ServiceErrorCode.Validation => StatusCodes.Status400BadRequest,
            ServiceErrorCode.NotFound => StatusCodes.Status404NotFound,
            ServiceErrorCode.Conflict => StatusCodes.Status409Conflict,
            ServiceErrorCode.PlanInactive => StatusCodes.Status409Conflict,
            ServiceErrorCode.AnnualLimitExceeded => StatusCodes.Status409Conflict,
            _ => StatusCodes.Status500InternalServerError
        };

        var title = error.Code switch
        {
            ServiceErrorCode.Validation => "Validation failed",
            ServiceErrorCode.NotFound => "Resource not found",
            ServiceErrorCode.Conflict => "Request conflict",
            ServiceErrorCode.PlanInactive => "Plan is inactive",
            ServiceErrorCode.AnnualLimitExceeded => "Annual contribution limit exceeded",
            _ => "Unexpected error"
        };

        return Problem(
            statusCode: statusCode,
            title: title,
            detail: error.Message,
            extensions: new Dictionary<string, object?>
            {
                ["code"] = error.Code.ToString()
            });
    }
}
