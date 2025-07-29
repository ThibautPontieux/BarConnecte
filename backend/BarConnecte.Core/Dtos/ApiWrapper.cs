using System.Text.Json.Serialization;
using JetBrains.Annotations;

namespace BarConnecte.Core.Dtos;

[PublicAPI]
public class ApiWrapper<T>
{
    public bool Success { get; set; }
    public T? Data { get; set; }
    public string? ErrorMessage { get; set; }

    [JsonConstructor]
    public ApiWrapper()
    {
        Success = false;
        Data = default(T);
        ErrorMessage = null;
    }
    
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
