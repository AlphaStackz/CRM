namespace server.Classes;

public class User
{
    public int? Id { get; set; }
    public string Role { get; set; }
    public string User_name { get; set; }
    public string Password { get; set; }
    public string Email { get; set; }
    public bool Active { get; set; }
    public string Status { get; set; }

    // Parameterless constructor (required for deserialization)
    public User() { }

    public User(
        int? Id = null,
        string role = "",
        string User_name = "",
        string password = "",
        string email = "",
        bool active = false,
        string status = "")
    {
        this.Id = Id; 
        this.Role = role;
        this.User_name = User_name;
        this.Password = password;
        this.Email = email;
        this.Active = active;
        this.Status = status;
    }
}