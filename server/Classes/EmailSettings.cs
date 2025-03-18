namespace server.Classes;

using DefaultNamespace;

public record EmailSettings(string SmtpServer, int SmtpPort, string FromEmail, string Password);