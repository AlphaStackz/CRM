namespace server.Queries;

using DefaultNamespace;
using server.Classes;
using Npgsql;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using System.Text.Json;

public static class LoginQueries
{
    public static void MapLoginEndpoints(this WebApplication app, Database database)
    {
        // GET /login
        app.MapGet("/login", async (HttpContext context) =>
        {
            await using var connection = database.GetConnection();
            try
            {
                var key = context.Session.GetString("User");
                if (key == null)
                {
                    return Results.NotFound(new { message = "No one is logged in." });
                }
                var user = JsonSerializer.Deserialize<User>(key);

                await connection.OpenAsync();
                return Results.Ok(user);
            }
            catch (Exception exception)
            {
                Console.WriteLine($"Unexpected error: {exception.Message}");
                return Results.Problem("An unexpected error occured.");
            }
            finally
            {
                await connection.CloseAsync();
            }
        });

        // POST /login
        app.MapPost("/login", async (HttpContext context, User userRequest) =>
        {
            await using var connection = database.GetConnection();
            try
            {
                await connection.OpenAsync();
                if (context.Session.GetString("User") != null)
                {
                    return Results.BadRequest(new { message = "Someone is already logged in." });
                }

                var query = @"
                    SELECT * 
                    FROM users 
                    WHERE user_name = @username 
                      AND password = @password";

                await using var cmd = new NpgsqlCommand(query, connection);
                cmd.Parameters.AddWithValue("@username", userRequest.User_name);
                cmd.Parameters.AddWithValue("@password", userRequest.Password);

                await using (var reader = await cmd.ExecuteReaderAsync())
                {
                    if (reader.HasRows)
                    {
                        while (await reader.ReadAsync())
                        {
                            string status = reader.GetString(reader.GetOrdinal("status"));
                            if (status == "pending")
                            {
                                return Results.BadRequest(new { message = "Registration not completed. Please complete your registration." });
                            }

                            User user = new User(
                                reader.GetInt32(reader.GetOrdinal("id")),
                                reader.GetString(reader.GetOrdinal("role")),
                                reader.GetString(reader.GetOrdinal("user_name")),
                                reader.GetString(reader.GetOrdinal("password")),
                                reader.GetString(reader.GetOrdinal("email")),
                                reader.GetBoolean(reader.GetOrdinal("active")),
                                reader.GetString(reader.GetOrdinal("status"))
                            );
                            context.Session.SetString("User", JsonSerializer.Serialize(user));
                            return Results.Ok(user);
                        }
                    }
                }
                return Results.NotFound(new { message = "No user found." });
            }
            catch (Exception exception)
            {
                Console.WriteLine(exception);
                throw;
            }
            finally
            {
                await connection.CloseAsync();
            }
        });

        // DELETE /login
        app.MapDelete("/login", async (HttpContext context) =>
        {
            await using var connection = database.GetConnection();
            try
            {
                if (context.Session.GetString("User") == null)
                {
                    return Results.Conflict(new { message = "No login found." });
                }
                context.Session.Clear();
                return Results.Ok(new { message = "Logged out." });
            }
            catch (Exception exception)
            {
                Console.WriteLine(exception);
                throw;
            }
            finally
            {
                await connection.CloseAsync();
            }
        });
    }
}

/*
        // Login and register
        
        app.MapPut("/register", async (HttpContext context, User userRequest) =>
        {
            await using var connection = database.GetConnection();
            try
            {
                await connection.OpenAsync();

                var updateQuery = $"UPDATE users SET password = @newPassword, status = 'complete' WHERE user_name = @username AND status = 'pending'";
                await using var cmd = new NpgsqlCommand(updateQuery, connection);

                cmd.Parameters.AddWithValue("@username", userRequest.User_name);
                cmd.Parameters.AddWithValue("@newPassword", userRequest.Password);

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

        
        app.MapGet("/login", async (HttpContext context) =>
        {
            await using var connection = database.GetConnection();
            try
            {
                var key = await Task.Run(() => context.Session.GetString("User"));
                if (key == null)
                {
                    return Results.NotFound(new { message = "No one is logged in." });
                }
                var user = JsonSerializer.Deserialize<User>(key);

                await connection.OpenAsync();
                return Results.Ok(user);
            }
            catch (Exception exception)
            {
                Console.WriteLine($"Unexpected error: {exception.Message}");
                return Results.Problem("An unexpected error occured.");
            }
            finally
            {
                await connection.CloseAsync(); 
            }
        });

        app.MapPost("/login", async (HttpContext context, User userRequest) =>
        {
            await using var connection = database.GetConnection(); 
            try
            {
                await connection.OpenAsync();
                if (context.Session.GetString("User") != null)
                {
                    return Results.BadRequest(new { message = "Someone is already logged in." });
                }
                var query = $"SELECT * FROM users WHERE user_name = @username AND password = @password";
                await using var cmd = new NpgsqlCommand(query, connection);

                
                cmd.Parameters.AddWithValue("@username", userRequest.User_name);
                cmd.Parameters.AddWithValue("@password", userRequest.Password);

                await using (var reader = await cmd.ExecuteReaderAsync())
                {
                    if (reader.HasRows)
                    {
                        while (await reader.ReadAsync())
                        {
                            string status = reader.GetString(reader.GetOrdinal("status"));

                            // If user has a "pending" status, inform them they need to register
                            if (status == "pending")
                            {
                                return Results.BadRequest(new { message = "Registration not completed. Please complete your registration." });
                            }
                            User user = new User(
                                reader.GetInt32(reader.GetOrdinal("id")),
                                reader.GetString(reader.GetOrdinal("role")),
                                reader.GetString(reader.GetOrdinal("user_name")),
                                reader.GetString(reader.GetOrdinal("password")),
                                reader.GetString(reader.GetOrdinal("email")),
                                reader.GetBoolean(reader.GetOrdinal("active")),
                                reader.GetString(reader.GetOrdinal("status"))
                                );
                            await Task.Run(() => context.Session.SetString("User", JsonSerializer.Serialize(user)));
                        
                            return Results.Ok(user);
                        }
                    }
                }
                return Results.NotFound(new { message = "No user found." });
            }
            catch (Exception exception)
            {
                Console.WriteLine(exception);
                throw;
            }
            finally
            {
                await connection.CloseAsync();
            }
            
        });
        app.MapDelete("/login", async (HttpContext context) =>
        {
            await using var connection = database.GetConnection(); //new connection every time
            try
            {
                if (context.Session.GetString("User") == null)
                {
                    return Results.Conflict(new { message = "No login found." });
                }
                await Task.Run(context.Session.Clear);
                return Results.Ok(new { message = "Logged out." });
            }
            catch (Exception exception)
            {
                Console.WriteLine(exception);
                throw;
            }
            finally
            {
                await connection.CloseAsync();
            }
            
        });

*/