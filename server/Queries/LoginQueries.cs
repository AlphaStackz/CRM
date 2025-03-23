namespace server.Queries;

using DefaultNamespace;
using System.Text.Json;
using DotNetEnv;
using Npgsql;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using System.Text.Json.Nodes;
using Microsoft.AspNetCore.Http.Json;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc.DataAnnotations;
using server.Services;
using server.Classes;


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
                // Declare key
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
                    context.Session.Clear(); // clearing session instead of returning error.
                }

                var query = @"SELECT * FROM users WHERE user_name = @username AND password = @password";

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
                                return Results.BadRequest(new
                                    { message = "Registration not completed. Please complete your registration." });
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
        }); // Close POST /login

        // DELETE /login
        app.MapDelete("/login", async (HttpContext context) =>
        {
            await using var connection = database.GetConnection();
            try
            {
                context.Session.Clear(); //clearing session
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
        }); // Close DELETE /login
    }
}
