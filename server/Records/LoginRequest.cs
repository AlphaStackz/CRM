namespace server.Records;
using DefaultNamespace;
public record LoginRequest()
{
    public string Username { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
};