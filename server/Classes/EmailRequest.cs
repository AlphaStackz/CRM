namespace server.Classes;

using DefaultNamespace;

public record EmailRequest (string To, string Subject, string Body);