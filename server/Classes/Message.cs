namespace server.Classes;

using DefaultNamespace;

public class Message
{
    public int? id { get; set; }
    public int? case_id { get; set; }
    public string? text { get; set; }
    public DateTime? timestamp { get; set; }
    public bool? is_sender_customer { get; set; }
 
    public Message(
        int? id = null,
        int? case_id = null,
        string? text = "No message",
        DateTime? timestamp = null,
        bool? is_sender_customer = null)
    {
        this.id = id;
        this.case_id = case_id;
        this.text = text;
        this.timestamp = timestamp;
        this.is_sender_customer = is_sender_customer;
    }
}