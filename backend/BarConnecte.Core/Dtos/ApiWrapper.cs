using JetBrains.Annotations;

namespace BarConnecte.Core.Dtos;

[PublicAPI]
public class ApiWrapper<T>
{
    public bool Success { get; set; }
    public T? Data { get; set; }
    public string? ErrorMessage { get; set; }

    public ApiWrapper(T data)
    {
        Success = true;
        Data = data;
    }

    public ApiWrapper(string errorMessage)
    {
        Success = false;
        ErrorMessage = errorMessage;
    }
}
