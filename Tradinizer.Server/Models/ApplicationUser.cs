using Microsoft.AspNetCore.Identity;

namespace Tradinizer.Server.Models
{
    public class ApplicationUser : IdentityUser
    {
        public ICollection<YearData> Years { get; set; }
    }
}
