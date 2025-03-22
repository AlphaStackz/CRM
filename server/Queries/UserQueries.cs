namespace server.Queries;
using System.Text.Json;
using server.Classes;
using Npgsql;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using System.Text.Json.Serialization;
using DefaultNamespace;
using server.Services;

public static class UserQueries
{
    // Add EmailService as a parameter so we can send emails
    public static void MapUserEndpoints(this WebApplication app, Database database, EmailService emailService)
    {
        // Get request endpoint to fetch user
        app.MapGet("/users", async () =>
        {
            // Return a list of User objects
            var users = new List<User>();
            // Retrieve a connection from your Database class
            using var connection = database.GetConnection();
            await connection.OpenAsync();
            // Build the SQL command
            var query = "SELECT id, user_name, password, role, email, active FROM users";
            using var cmd = new NpgsqlCommand(query, connection);
            // Execute and read the results
            using var reader = await cmd.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                var user = new User
                {
                    Id = reader.GetInt32(0),
                    User_name = reader.GetString(1),
                    Password = reader.GetString(2),
                    Role = reader.GetString(3),
                    Email = reader.GetString(4),
                    Active = reader.GetBoolean(5)
                };
                users.Add(user);
            }
            return users;
        });

        // Using same logic for Cases endpoint:
        app.MapGet("/user-cases/{id}", async (int id) =>
        {
            try
            {
                var cases = new List<Case>();
                using var connection = database.GetConnection();
                await connection.OpenAsync();
                var query = @"SELECT cases.id, cases.status, cases.category, cases.title, cases.customer_first_name, cases.customer_last_name, cases.customer_email, cases.case_opened, cases.case_closed, cases.case_handler 
                              FROM cases 
                              JOIN users ON cases.case_handler = users.id 
                              WHERE users.id = @id";
                using var cmd = new NpgsqlCommand(query, connection);
                cmd.Parameters.AddWithValue("@id", id);

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
                return Results.Ok(cases);
            }
            catch (Exception ex)
            {
                return Results.Problem($"Database error: {ex.Message}");
            }
        });

        // **update: GET /register/{token:guid} to retrieve username by register_token
        app.MapGet("/register/{token:guid}", async (Guid token) =>
        {
            using var connection = database.GetConnection();
            await connection.OpenAsync();

            var query = @"
                SELECT user_name
                FROM users
                WHERE register_token = @token
                  AND status = 'pending'
            ";

            using var cmd = new NpgsqlCommand(query, connection);
            cmd.Parameters.AddWithValue("@token", token);

            using var reader = await cmd.ExecuteReaderAsync();
            if (await reader.ReadAsync())
            {
                string userName = reader.GetString(reader.GetOrdinal("user_name"));
                return Results.Ok(new { userName });
            }

            // If no matching user found, return 404
            return Results.NotFound(new { message = "No pending user found for this token." });
        });
        // **update: End GET /register/{token:guid}

        // POST /new-user
        app.MapPost("/new-user", async (HttpContext context) =>
        {
            try
            {
                // Check if user is logged in and is admin
                var currentUserJson = context.Session.GetString("User");
                if (string.IsNullOrEmpty(currentUserJson))
                {
                    return Results.Json(new { message = "You must be logged in." }, statusCode: 401);
                }
                var currentUser = JsonSerializer.Deserialize<User>(currentUserJson!);
                if (currentUser == null || string.IsNullOrEmpty(currentUser.Role) || currentUser.Role.ToLower() != "admin")
                {
                    return Results.Json(new { message = "Only admin can add new users." }, statusCode: 401);
                }

                var newUser = await context.Request.ReadFromJsonAsync<User>();
                if (newUser == null)
                {
                    return Results.BadRequest("Invalid JSON body.");
                }

                // **update: Validate mandatory fields so we can safely use !
                if (string.IsNullOrEmpty(newUser.User_name))
                {
                    return Results.BadRequest("User_name is required.");
                }
                if (string.IsNullOrEmpty(newUser.Password))
                {
                    return Results.BadRequest("Password is required.");
                }
                if (string.IsNullOrEmpty(newUser.Role))
                {
                    return Results.BadRequest("Role is required.");
                }
                // **update: End

                var role = newUser.Role!.ToLower();
                if (role != "admin" && role != "customer_support")
                {
                    return Results.BadRequest("Invalid role. Allowed values: 'admin', 'customer_support'.");
                }

                using var connection = database.GetConnection();
                await connection.OpenAsync();

                // Generate a unique token for registration
                var token = Guid.NewGuid();

                // Insert user with status "pending" and register_token
                var query = @"
                    INSERT INTO users (user_name, password, role, email, active, status, register_token)
                    VALUES (@UserName, @Password, CAST(@Role AS user_role), @Email, @Active, 'pending', @RegisterToken)
                    RETURNING id";

                using var cmd = new NpgsqlCommand(query, connection);

                // **update: Use ! for fields we validated, pass DBNull for optional
                cmd.Parameters.AddWithValue("@UserName", newUser.User_name!);
                cmd.Parameters.AddWithValue("@Password", newUser.Password!);
                cmd.Parameters.AddWithValue("@Role", role);
                cmd.Parameters.AddWithValue("@Email", newUser.Email ?? (object)DBNull.Value);
                cmd.Parameters.AddWithValue("@Active", newUser!.Active);  // newUser can't be null after check
                cmd.Parameters.AddWithValue("@RegisterToken", token);

                var id = await cmd.ExecuteScalarAsync();

                // Send an email with the registration link
                var registrationLink = $"http://localhost:5173/register/{token}";
                var mailBody = $@"
Hello {newUser.User_name},
<br><br>
Welcome to our platform! To complete your registration, click the link below:
<br>
<a href=""http://localhost:5173/register/{token}"">{registrationLink}</a>
<br><br>
Regards,
<br>
Your Support Team
";
                if (!string.IsNullOrEmpty(newUser.Email))
                {
                    await emailService.SendEmail(new EmailRequest(
                        To: newUser.Email,
                        Subject: "Complete Your Registration",
                        Body: mailBody
                    ));
                    Console.WriteLine("Message sent to new user email successfully");
                }

                return Results.Created($"/users/{id}",
                    new { id, newUser.User_name, newUser.Role, newUser.Email, newUser.Active, token });
            }
            catch (Exception ex)
            {
                return Results.Problem($"Database error: {ex.Message}");
            }
        });

        // DELETE /users/{id}
        app.MapDelete("/users/{id}", async (int id) =>
        {
            using var connection = database.GetConnection();
            await connection.OpenAsync();

            var query = @"DELETE FROM users WHERE id = @Id RETURNING id";
            using var cmd = new NpgsqlCommand(query, connection);
            cmd.Parameters.AddWithValue("@Id", id);

            var results = await cmd.ExecuteScalarAsync();
            if (results == null)
            {
                return Results.NotFound($"User with ID {id} not found.");
            }
            return Results.Ok($"User with ID {id} deleted successfully.");
        });

        // PATCH /users/{id}
        app.MapPatch("/users/{id}", async (int id, HttpContext patchContext) =>
        {
            try
            {
                var updatedUser = await patchContext.Request.ReadFromJsonAsync<User>();
                if (updatedUser == null)
                {
                    return Results.BadRequest("Invalid request body");
                }

                using var connection = database.GetConnection();
                await connection.OpenAsync();

                var updatedUserFields = new List<string>();
                var userParameters = new List<NpgsqlParameter>();

                if (!string.IsNullOrEmpty(updatedUser.User_name))
                {
                    updatedUserFields.Add("user_name = @User_name");
                    userParameters.Add(new NpgsqlParameter("@User_name", updatedUser.User_name));
                }
                if (!string.IsNullOrEmpty(updatedUser.Email))
                {
                    updatedUserFields.Add("email = @Email");
                    userParameters.Add(new NpgsqlParameter("@Email", updatedUser.Email));
                }
                if (!string.IsNullOrEmpty(updatedUser.Password))
                {
                    updatedUserFields.Add("password = @Password");
                    userParameters.Add(new NpgsqlParameter("@Password", updatedUser.Password));
                }
                if (!string.IsNullOrEmpty(updatedUser.Role))
                {
                    updatedUserFields.Add("role = @Role::user_role");
                    userParameters.Add(new NpgsqlParameter("@Role", updatedUser.Role));
                }
                // Allow updating status (for registration completion)
                if (!string.IsNullOrEmpty(updatedUser.Status))
                {
                    updatedUserFields.Add("status = @Status");
                    userParameters.Add(new NpgsqlParameter("@Status", updatedUser.Status));
                }

                // Always update "active" (boolean)
                updatedUserFields.Add("active = @Active");
                // updatedUser.Active is a bool, so we can do updatedUser!.Active
                userParameters.Add(new NpgsqlParameter("@Active", updatedUser!.Active));

                var query = $@"
                    UPDATE users 
                    SET {string.Join(", ", updatedUserFields)} 
                    WHERE id = @Id 
                    RETURNING id";

                using var cmd = new NpgsqlCommand(query, connection);
                cmd.Parameters.AddRange(userParameters.ToArray());
                cmd.Parameters.AddWithValue("@Id", id);

                var result = await cmd.ExecuteScalarAsync();
                if (result == null)
                {
                    return Results.NotFound($"User with ID {id} not found.");
                }
                return Results.Ok($"User with ID {id} updated successfully.");
            }
            catch (Exception ex)
            {
                return Results.Problem($"Database error: {ex.Message}");
            }
        });
        // POST /register
        app.MapPost("/register", async (HttpContext ctx, User userRequest) =>
        {
            await using var connection = database.GetConnection();
            try
            {
                await connection.OpenAsync();

                var updateQuery = @"UPDATE users SET password = @newPassword, status = 'complete' WHERE LOWER(user_name) = LOWER(@username) AND status = 'pending'";
                await using var cmd = new NpgsqlCommand(updateQuery, connection);
                cmd.Parameters.AddWithValue("@username", userRequest.User_name ?? (object)DBNull.Value);
                cmd.Parameters.AddWithValue("@newPassword", userRequest.Password ?? (object)DBNull.Value);

                int rowsAffected = await cmd.ExecuteNonQueryAsync();
                if (rowsAffected > 0)
                {
                    return Results.Ok(new { message = "Registration completed successfully." });
                }
                else
                {
                    return Results.BadRequest(new { message = "User not found or already registered." });
                }
            }
            catch (Exception exception)
            {
                Console.WriteLine(exception);
                return Results.Problem("An unexpected error occurred.");
            }
            finally
            {
                await connection.CloseAsync();
            }
        });
    }
}
