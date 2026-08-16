namespace SmartRetirement.Api.DTOs.Common;

public sealed class ServiceResult<T>
{
    public bool IsSuccess { get; }
    public T? Value { get; }
    public ServiceError? Error { get; }

    private ServiceResult(
        bool isSuccess,
        T? value,
        ServiceError? error)
    {
        IsSuccess = isSuccess;
        Value = value;
        Error = error;
    }

    public static ServiceResult<T> Success(T value)
    {
        ArgumentNullException.ThrowIfNull(value);

        return new ServiceResult<T>(
            isSuccess: true,
            value: value,
            error: null);
    }

    public static ServiceResult<T> Failure(
        ServiceErrorCode code,
        string message)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(message);

        return new ServiceResult<T>(
            isSuccess: false,
            value: default,
            error: new ServiceError(code, message));
    }
}
