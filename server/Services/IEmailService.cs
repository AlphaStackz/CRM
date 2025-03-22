namespace server.Services;

using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;
using DefaultNamespace;
using server.Classes;

public interface IEmailService
{
    Task SendEmail(EmailRequest request);
    Task SendEmailAsync(string to, string subject, string body);
}

public class EmailService : IEmailService
{
    private readonly EmailSettings _settings;

    public EmailService(EmailSettings settings) => _settings = settings;

    public async Task SendEmailAsync(string to, string subject, string body)
    {
        // Ensure no null/empty strings for 'to', 'subject', or 'body'.
        if (string.IsNullOrEmpty(to))
        {
            throw new ArgumentException("Recipient email address is required.", nameof(to));
        }
        if (string.IsNullOrEmpty(_settings.FromEmail))
        {
            throw new InvalidOperationException("FromEmail is not configured in EmailSettings.");
        }
        if (string.IsNullOrEmpty(_settings.SmtpServer))
        {
            throw new InvalidOperationException("SmtpServer is not configured in EmailSettings.");
        }
        // Setting default subject/body if null or empty:
        subject ??= "";
        body ??= "";

        var email = new MimeMessage
        {
            // Use null-forgiving operator for _settings.FromEmail
            From = { MailboxAddress.Parse(_settings.FromEmail!) },
            // 'to' is guaranteed non-null from the check above.
            To = { MailboxAddress.Parse(to) },
            Subject = subject,
            Body = new TextPart("html") { Text = body }
        };

        using var smtp = new SmtpClient();
        // Verify SmtpPort > 0 if needed:
        if (_settings.SmtpPort <= 0)
        {
            throw new InvalidOperationException("SmtpPort must be a positive integer.");
        }

        await smtp.ConnectAsync(_settings.SmtpServer, _settings.SmtpPort, SecureSocketOptions.StartTls);
        await smtp.AuthenticateAsync(_settings.FromEmail, _settings.Password);
        await smtp.SendAsync(email);
        await smtp.DisconnectAsync(true);
    }
    
    
    public async Task SendEmail(EmailRequest request)
    {
        await SendEmailAsync(request.To, request.Subject, request.Body);
    }
}