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

        [HttpPost]
        public async Task<IActionResult> PostInvestment([FromBody] InvestmentDto dto)
        {
            if (dto == null)
                return BadRequest("Dati mancanti");

            Investment investment = new Investment()
            {
                Amount = dto.Amount,
                Date = dto.Date,
                Type = dto.Type,
                Name = dto.Name

            };

            var userId = _userManager.GetUserId(User);
            if (userId == null)
            {
                return Unauthorized("Utente non trovato nel database.");
            }
            else
            {
                var yearData = await _context.YearsData
                    .Include(y => y.Investments)
                    .Include(y => y.Liquidities)
                    .FirstOrDefaultAsync(y => y.Year == investment.Date.Year && y.ApplicationUserId == userId);

                if (yearData == null)
                    return BadRequest($"YearData not found for year {investment.Date.Year} and user {userId}.");

                var investments = yearData.Investments;

                var usedIds = new HashSet<int>(investments.Select(l => l.Id));
                int nextId = 0;

                while (usedIds.Contains(nextId))
                {
                    nextId++;
                }

                investment.Id = nextId;

                // Aggiunge la nuova voce
                investments.Add(investment);

                yearData.ExitInvestment += investment.Amount;

                // Ordina per data
                investments = investments.OrderBy(l => l.Date).ToList();

                await _context.SaveChangesAsync();
                return Ok(investment);
            }
        }

        [HttpDelete("{year}/{id}")]
        public async Task<IActionResult> DeleteYear(int id, int year)
        {
            var userId = _userManager.GetUserId(User);
            var yearData = await _context.YearsData
                .Include(y => y.Investments)
                .FirstOrDefaultAsync(y => y.Year == year && y.ApplicationUserId == userId);

            if (yearData == null)
                return NotFound();

            var investments = yearData.Investments;

            var item = investments.FirstOrDefault(i => i.Id == id);
            if (item == null) return NotFound();

            investments.Remove(item);
            yearData.ExitInvestment -= item.Amount;
            await _context.SaveChangesAsync();

            return Ok(item);
        }

    }
}
