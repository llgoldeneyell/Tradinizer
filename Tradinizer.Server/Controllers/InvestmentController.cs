using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Tradinizer.Server.Helpers;
using Tradinizer.Server.Models;

namespace Tradinizer.Server.Controllers
{
    [ApiController]
    [Route("[controller]")]
    [Authorize]
    public class InvestmentController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly UserManager<User> _userManager;

        public InvestmentController(ApplicationDbContext context, UserManager<User> userManager)
        {
            _context = context;
            _userManager = userManager;
        }

        [HttpGet("{year}")]
        public async Task<IActionResult> GetInvestment(int year)
        {
            var userId = _userManager.GetUserId(User);

            var yearData = await _context.YearsData
                .Include(y => y.Investments)
                .FirstOrDefaultAsync(y => y.Year == year && y.ApplicationUserId == userId);

            if (yearData == null)
                return NotFound();

            return Ok(yearData.Investments);
        }

    }
}
