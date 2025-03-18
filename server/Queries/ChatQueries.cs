namespace server.Queries;

using DefaultNamespace;
using server.Classes;
using server.Services;
using Npgsql;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using System.Text.Json;

public static class ChatQueries
{
    public static void MapChatEndpoints(this WebApplication app, Database database, IEmailService emailService)
    {
        // Get data to chat: case, messages and user
        app.MapGet("/chat/case/{chatToken}", async (Guid chatToken, HttpContext _) =>
        {
            await using var connection = database.GetConnection();
            Console.WriteLine($"Chat Token: {chatToken}");
            try
            {
                await connection.OpenAsync();
                var query = @"
                    SELECT m.id AS message_id,
                           m.case_id AS case_id_on_message, 
                           m.message, 
                           m.timestamp, 
                           m.is_sender_customer, 
                           c.id AS case_id, 
                           c.status, 
                           c.category, 
                           c.title, 
                           c.customer_first_name, 
                           c.customer_last_name, 
                           c.customer_email, 
                           c.case_opened, 
                           c.case_closed, 
                           c.case_handler, 
                           c.chat_token,
                           u.user_name 
                    FROM messages m
                    JOIN cases c ON m.case_id = c.id
                    LEFT JOIN users u ON c.case_handler = u.id
                    WHERE c.chat_token = @chatToken";

                await using var caseCmd = new NpgsqlCommand(query, connection);
                caseCmd.Parameters.AddWithValue("@chatToken", chatToken);

                using var reader = await caseCmd.ExecuteReaderAsync();

                Case caseDetails = null;
                var messages = new List<Message>();
                User user = null;

                while (await reader.ReadAsync())
                {
                    if (caseDetails == null)
                    {
                        caseDetails = new Case
                        {
                            id = reader.GetInt32(5),
                            status = reader.GetFieldValue<CaseStatus>(6),
                            category = reader.GetFieldValue<CaseCategory>(7),
                            title = reader.GetString(8),
                            customer_first_name = reader.GetString(9),
                            customer_last_name = reader.GetString(10),
                            customer_email = reader.GetString(11),
                            case_opened = reader.IsDBNull(12) ? (DateTime?)null : reader.GetDateTime(12),
                            case_closed = reader.IsDBNull(13) ? (DateTime?)null : reader.GetDateTime(13),
                            case_handler = reader.IsDBNull(14) ? (int?)null : reader.GetInt32(14),
                            ChatToken = reader.IsDBNull(15) ? (Guid?)null : reader.GetGuid(15)
                        };
                    }

                    var message = new Message
                    {
                        id = reader.GetInt32(0),
                        case_id = reader.GetInt32(1),
                        text = reader.GetString(2),
                        timestamp = reader.GetDateTime(3),
                        is_sender_customer = reader.IsDBNull(4) ? (bool?)null : reader.GetBoolean(4),
                    };
                    messages.Add(message);

                    user = new User
                    {
                        User_name = reader.IsDBNull(16) ? null : reader.GetString(16)
                    };
                }

                if (caseDetails != null)
                {
                    var messagesWithCaseDetails = new
                    {
                        caseDetails,
                        messages,
                        user
                    }; 
                    /* messagesWithCaseDetails.Add(caseDetails);
                     messagesWithCaseDetails.AddRange(messages); */
                    return Results.Ok(messagesWithCaseDetails);
                }
                return Results.NotFound("No results found!");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Unexpected error: {ex.Message}");
                return Results.Problem("An unexpected error occured.");
            }
            finally
            {
                await connection.CloseAsync();
            }
        });

        // Insert new message from chat - (POST "/chat/new-message")
        app.MapPost("/chat/new-message", async (HttpContext ctx) =>
        {
            try
            {
                var newMessage = await ctx.Request.ReadFromJsonAsync<Message>();
                if (newMessage == null)
                {
                    return Results.BadRequest("Invalid JSON body.");
                }

                using var connection = database.GetConnection();
                await connection.OpenAsync();

                var query = @"
                    INSERT INTO messages (case_id, message, is_sender_customer)
                    VALUES ($1, $2, $3)
                    RETURNING id";

                using var cmd = new NpgsqlCommand(query, connection);
                cmd.Parameters.AddWithValue(newMessage.case_id);
                cmd.Parameters.AddWithValue(newMessage.text);
                cmd.Parameters.AddWithValue(newMessage.is_sender_customer);

                var id = await cmd.ExecuteScalarAsync();
                return Results.Created($"/chat/new-message/{id}",
                    new { id, newMessage.case_id, newMessage.text, newMessage.is_sender_customer });
            }
            catch (Exception ex)
            {
                return Results.Problem($"Database error: {ex.Message}");
            }
        });

        // Update a case with status closed and timestamp"
        app.MapPatch("/chat/close-case/{id}", async (int id, HttpContext _) =>
        {
            try
            {
                /*Om endpoint ska hantera json:
                 var caseToClose = await context.Request.ReadFromJsonAsync<Case>();
                 if (caseToClose == null) { return Results.BadRequest("Invalid request body");} */

                using var connection = database.GetConnection();
                await connection.OpenAsync();

                var query = @"
                    UPDATE cases
                    SET status = 'closed',
                        case_closed = NOW()
                    WHERE id = $1
                    RETURNING id, status, case_closed";

                await using var cmd = new NpgsqlCommand(query, connection);
                cmd.Parameters.AddWithValue(id);

                using var reader = await cmd.ExecuteReaderAsync();
                if (await reader.ReadAsync())
                {
                    return Results.Ok($"Case with ID {id} closed successfully.");
                }
                return Results.NotFound($"Case with ID: {id} not found.");
            }
            catch (Exception ex)
            {
                return Results.Problem($"Database error: {ex.Message}");
            }
        });

        // GET chat data when in back office. Eventuellt ta bort user table.
        app.MapGet("/chat/backoffice/{id}", async (int id, HttpContext _) =>
        {
            await using var connection = database.GetConnection();
            Console.WriteLine($"Trying to get messages and case handler for case ID: {id}");
            try
            {
                await connection.OpenAsync();
                var query = $@"
                    SELECT m.id AS message_id,
                           m.case_id,
                           m.message,
                           m.timestamp,
                           m.is_sender_customer,
                           u.user_name
                    FROM messages m
                    JOIN cases c ON m.case_id = c.id
                    LEFT JOIN users u ON c.case_handler = u.id
                    WHERE c.id = {id}";

                await using var cmd = new NpgsqlCommand(query, connection);
                using var reader = await cmd.ExecuteReaderAsync();

                var messages = new List<Message>();
                User user = null;

                while (await reader.ReadAsync())
                {
                    var message = new Message
                    {
                        id = reader.GetInt32(0),
                        case_id = reader.GetInt32(1),
                        text = reader.GetString(2),
                        timestamp = reader.GetDateTime(3),
                        is_sender_customer = reader.IsDBNull(4) ? (bool?)null : reader.GetBoolean(4),
                    };
                    messages.Add(message);

                    if (user == null)
                    {
                        user = new User
                        {
                            User_name = reader.IsDBNull(5) ? null : reader.GetString(5)
                        };
                    }
                }

                if (user != null)
                {
                    var messagesWithUserDetails = new
                    {
                        messages,
                        user
                    };
                    return Results.Ok(messagesWithUserDetails);
                }
                return Results.NotFound("No results found!");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Unexpected error: {ex.Message}");
                return Results.Problem("An unexpected error occurred.");
            }
        });
    }
}
