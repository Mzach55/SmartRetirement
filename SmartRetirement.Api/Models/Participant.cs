namespace SmartRetirement.Api.Models;

public class Participant
{
    public int Id { get; set; }

    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public DateOnly DateOfBirth { get; set; }
    public DateTime CreatedAtUtc { get; set; }

    public ICollection<Plan> Plans { get; set; } = new List<Plan>();
}
