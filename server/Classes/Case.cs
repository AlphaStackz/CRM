namespace server.Classes;

using DefaultNamespace;
using System.Text.Json.Serialization;

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum CaseStatus
{
    Unopened, 
    Open, 
    Closed
}

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum CaseCategory
{
    Shipping,
    Payment,
    Product,
    Other
}
public class Case
{
    public int? id { get; set; }
    public CaseStatus? status { get; set; } 
    public CaseCategory? category { get; set; } 
    public string? title { get; set; }
    public string? customer_first_name { get; set; }
    public string? customer_last_name { get; set; }
    public string? customer_email { get; set; }
    public DateTime? case_opened { get; set; }
    public DateTime? case_closed { get; set; }
    public int? case_handler { get; set; }
    public Guid? ChatToken { get; set; }
    
    public Case() { }
    
    public Case(
        int? id = null,
        CaseStatus? status = CaseStatus.Unopened,
        CaseCategory? category = null,
        string title = "No Title",
        string customerFirstName = "",
        string customerLastName = "",
        string customerEmail = "",
        DateTime? caseOpened = null,
        DateTime? caseClosed = null,
        int? caseHandler = null,
        Guid? chatToken = null)
    {
        this.id = id;
        this.status = status;
        this.category = category;
        this.title = title;
        this.customer_first_name = customerFirstName;
        this.customer_last_name = customerLastName;
        this.customer_email = customerEmail;
        this.case_opened = caseOpened;
        this.case_closed = caseClosed;
        this.case_handler = caseHandler;
        this.ChatToken = chatToken;
    }
    //convert Enum to lowercase
   /*  public string GetDbStatus() => status?.ToString().ToLower() ?? "unopened";
    public string GetDbCategory() => category?.ToString().ToLower() ?? "";

    //convert DB lowercase to C# enum
    public void SetStatusFromDB(string dbStatus) => status = Enum.Parse<CaseStatus>(dbStatus, true);
    public void SetCategoryFromDB(string dbCategory) => category = Enum.Parse<CaseCategory>(dbCategory, true); */
}