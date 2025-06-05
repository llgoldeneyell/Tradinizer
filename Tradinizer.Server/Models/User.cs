using Microsoft.AspNetCore.Identity;

namespace Tradinizer.Server.Models
{
    public class User : IdentityUser
    {
        public List<YearData> YearsData { get; set; } = new();
    }

}
