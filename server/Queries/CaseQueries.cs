namespace server.Queries;

using DefaultNamespace;
using server.Classes;
using server.Services;
using Npgsql;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using System.Text.Json;

public static class CaseQueries
{
    public static void MapCaseEndpoints(this WebApplication app, Database database, IEmailService emailService)
    {
        // Get Cases
        app.MapGet("/cases", async () =>
        {
            var cases = new List<Case>();
            using var connection = database.GetConnection();
            await connection.OpenAsync();

            var query = @"
                SELECT id, status, category, title,
                       customer_first_name, customer_last_name,
                       customer_email, case_opened, case_closed,
                       case_handler
                FROM cases";

            using var cmd = new NpgsqlCommand(query, connection);
            using var reader = await cmd.ExecuteReaderAsync();

            while (await reader.ReadAsync())
            {
                var get_case = new Case
                {
                    id = reader.GetInt32(0),
                    status = reader.GetFieldValue<CaseStatus>(1),
                    category = reader.GetFieldValue<CaseCategory>(2),
                    title = reader.GetString(3),
                    customer_first_name = reader.GetString(4),
                    customer_last_name = reader.GetString(5),
                    customer_email = reader.GetString(6),
                    case_opened = reader.IsDBNull(7) ? (DateTime?)null : reader.GetDateTime(7),
                    case_closed = reader.IsDBNull(8) ? (DateTime?)null : reader.GetDateTime(8),
                    case_handler = reader.IsDBNull(9) ? (int?)null : reader.GetInt32(9)
                };
                cases.Add(get_case);
            }

            return cases;
        });

        // POST "/cases"
        app.MapPost("/cases", async (HttpContext context) =>
        {
            try
            {
                // Reading JSON from frontend.
                var requestData = await context.Request.ReadFromJsonAsync<JsonElement>();

                var caseData = requestData.TryGetProperty("caseData", out var caseElement)
                    ? caseElement.Deserialize<Case>()
                    : null;

                var messageData = requestData.TryGetProperty("messageData", out var messageElement)
                    ? messageElement.Deserialize<Message>()
                    : new Message { text = "Default message" };

                if (caseData == null)
                {
                    Console.WriteLine("caseData is null");
                    return Results.BadRequest("Invalid case data.");
                }

                await using var connection = database.GetConnection(); // New connection every time
                try
                {
                    await connection.OpenAsync(); // Open only for this time
                    int? newId = await PostCase(connection, caseData, messageData); // Use connection

                    if (newId != null)
                    {
                        // Sending email (copy of the case) to customer.
                        try
                        {
                            // Log attempt to send email..
                            Console.WriteLine($"Attempting to send email to: {caseData.customer_email}");
                            var emailBody = $@"
Hello {caseData.customer_first_name},
Thank you for contacting us about: {caseData.title}.
We have received your message:
------------------------------------------------
{messageData.text}
------------------------------------------------

We will review your case and respond as soon as possible.

Best regards,
Your Support Team
";
                            await emailService.SendEmailAsync(
                                to: caseData.customer_email,
                                subject: $"Case Created: {caseData.title}",
                                body: emailBody
                            );
                            Console.WriteLine("Email sent successfully.");
                        }
                        catch (Exception ex)
                        {
                            Console.WriteLine($"[ERROR] Failed to send email: {ex.Message}");
                            // Optionally, handle the error or notify that email sending failed
                        }

                        return Results.Created($"/cases/{newId}", new { id = newId });
                    }
                    else
                    {
                        return Results.Problem("Failed to insert case");
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Unexpected error: {ex.Message}");
                    return Results.Problem("An unexpected error occurred.");
                }
                finally
                {
                    await connection.CloseAsync(); // close connection
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Unexpected error: {ex.Message}");
                return Results.Problem("An unexpected error occurred.");
            }
        });
    }

    // Helper method for inserting a case and its first message
    // Eventuellt lyfta ut InsertCase och InsertMessage som separata funktioner för återanvändning?
    private static async Task<int?> PostCase(NpgsqlConnection db, Case caseData, Message messageData)
    {
        try
        {
            if (caseData == null)
            {
                Console.WriteLine("Received null case data");
                return null;
            }

            if (!Enum.TryParse<CaseStatus>(caseData.status?.ToString(), true, out var statusEnum))
            {
                Console.WriteLine("Invalid status value. Defaulting to 'Unopened'.");
                statusEnum = CaseStatus.Unopened;
            }
            Console.WriteLine($"Received category: {caseData.category}"); //Debugging shipping

            if (!Enum.TryParse<CaseCategory>(caseData.category?.ToString(), true, out var categoryEnum))
            {
                Console.WriteLine("Invalid category value. Defaulting to 'Other'.");
                categoryEnum = CaseCategory.Other;
            }
            Console.WriteLine($"Parsed category: {categoryEnum}"); //debugging shipping

            // Insert the new case
            await using var caseCmd = db.CreateCommand();
            caseCmd.CommandText = @"
                INSERT INTO cases (
                    status, 
                    category, 
                    title, 
                    customer_first_name, 
                    customer_last_name, 
                    customer_email, 
                    case_opened, 
                    case_closed, 
                    case_handler
                ) 
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                RETURNING id";

            caseCmd.Parameters.AddWithValue(statusEnum);
            caseCmd.Parameters.AddWithValue(categoryEnum);
            caseCmd.Parameters.AddWithValue(caseData.title ?? (object)DBNull.Value);
            caseCmd.Parameters.AddWithValue(caseData.customer_first_name ?? (object)DBNull.Value);
            caseCmd.Parameters.AddWithValue(caseData.customer_last_name ?? (object)DBNull.Value);
            caseCmd.Parameters.AddWithValue(caseData.customer_email ?? (object)DBNull.Value);
            caseCmd.Parameters.AddWithValue(caseData.case_opened ?? (object)DBNull.Value);
            caseCmd.Parameters.AddWithValue(caseData.case_closed ?? (object)DBNull.Value);
            caseCmd.Parameters.AddWithValue(caseData.case_handler ?? (object)DBNull.Value);

            object? caseResult = await caseCmd.ExecuteScalarAsync();
            int? caseId = caseResult as int?;

            if (caseId != null)
            {
                // Insert the first message for this new case
                await using var messageCmd = db.CreateCommand();
                messageCmd.CommandText = @"
                    INSERT INTO messages (
                        case_id, 
                        message, 
                        is_sender_customer
                    ) 
                    VALUES ($1, $2, $3)
                    RETURNING id";

                messageCmd.Parameters.AddWithValue(caseId);
                messageCmd.Parameters.AddWithValue(messageData.text);
                messageCmd.Parameters.AddWithValue(messageData.is_sender_customer);

                object? messageResult = await messageCmd.ExecuteScalarAsync();
                int? messageId = messageResult as int?;
                return messageId;
            }
            else
            {
                Console.WriteLine("No id for inserted case returned.");
                return null;
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Unexpected error: {ex.Message}");
            return null;
        }
    }
}
