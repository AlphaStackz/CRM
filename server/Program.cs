using DefaultNamespace;

using System.Text.Json;
using DotNetEnv;
using Npgsql;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.Hosting;
using Microsoft.AspNetCore.Http;
using System.Text.Json.Nodes;
using Microsoft.AspNetCore.Http.Json;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc.DataAnnotations;
using server.Services;
using server.Classes;
using server.Queries;

var builder = WebApplication.CreateBuilder(args);

// Loading environment variables from ../.env
Env.Load("../.env");

// Constructing EmailSettings & EmailService
var emailSettings = new EmailSettings(
    Env.GetString("SMTP_SERVER"),
    int.Parse(Env.GetString("SMTP_PORT")),
    Env.GetString("FROM_EMAIL"),
    Env.GetString("EMAIL_PASSWORD")
);

// Instantiating the EmailService using the email settings
var emailService = new EmailService(emailSettings);

// Configuring session options
builder.Services.AddDistributedMemoryCache();
builder.Services.AddSession(options =>
{
    options.IdleTimeout = TimeSpan.FromMinutes(20);
    options.Cookie.HttpOnly = true;
    options.Cookie.IsEssential = true;
});

// Building the WebApplication
var app = builder.Build();
app.UseSession();

// Mapping PostgreSQL enums
NpgsqlConnection.GlobalTypeMapper.MapEnum<CaseStatus>();
NpgsqlConnection.GlobalTypeMapper.MapEnum<CaseCategory>();

// Initializing and testing DB connection
var database = new Database();
database.TestConnection();

// **update: Provide `emailService` to MapUserEndpoints
app.MapUserEndpoints(database, emailService);
// **update: End

app.MapCaseEndpoints(database, emailService); 
app.MapChatEndpoints(database, emailService);
app.MapLoginEndpoints(database);

app.MapGet("/", () => "Hello World!");

app.Run();
