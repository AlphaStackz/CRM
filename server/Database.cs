namespace DefaultNamespace;

using Npgsql;
using DotNetEnv;
using System;

public class Database
{
    private readonly string _host;
    private readonly string _port;
    private readonly string _user;
    private readonly string _password;
    private readonly string _database;
    private readonly string _connectionString;

    public Database()
    {
        // Read environment variables loaded by Env.Load(...)
        _host = Env.GetString("DB_HOST");
        _port = Env.GetString("DB_PORT");
        _user = Env.GetString("DB_USER");
        _password = Env.GetString("DB_PASSWORD");
        _database = Env.GetString("DB_NAME");

        // Build the PostgreSQL connection string
        _connectionString = 
            $"Host={_host};Port={_port};Username={_user};Password={_password};Database={_database}";
    }

    public NpgsqlConnection GetConnection()
    {
        // Create and return a fresh connection
        return new NpgsqlConnection(_connectionString);
    }

    public void TestConnection()
    {
        using var connection = GetConnection();
        try
        {
            connection.Open();
            Console.WriteLine("Database Connection success");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Database connection failed: {ex.Message}");
        }
    }
}