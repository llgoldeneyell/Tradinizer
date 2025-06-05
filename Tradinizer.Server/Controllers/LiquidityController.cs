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
    public class LiquidityController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly UserManager<User> _userManager;

        public LiquidityController(ApplicationDbContext context, UserManager<User> userManager)
        {
            _context = context;
            _userManager = userManager;
        }

        [HttpGet("{year}")]
        public async Task<IActionResult> GetLiquidity(int year)
        {
            var userId = _userManager.GetUserId(User);

            var yearData = await _context.YearsData
            .Include(y => y.Liquidities)
            .FirstOrDefaultAsync(y => y.Year == year && y.ApplicationUserId == userId);

            if (yearData == null)
                return NotFound();

            return Ok(yearData.Liquidities);
        }

        [HttpPost]
        public async Task<IActionResult> AddYear([FromBody] LiquidityDto dto)
        {
            if (dto == null)
                return BadRequest("Dati mancanti");

            Liquidity liq = new Liquidity()
            {
                Amount = dto.Amount,
                Date = dto.Date,
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
                .FirstOrDefaultAsync(y => y.Year == liq.Date.Year && y.ApplicationUserId == userId);

                if (yearData == null)
                    return BadRequest($"YearData not found for year {liq.Date.Year} and user {userId}.");

                var liquidities = yearData.Liquidities;

                if (liquidities.Exists(x => x.Date == liq.Date))
                {
                    var tempLiquidity = liquidities.FirstOrDefault(x => x.Date == liq.Date);
                    if (tempLiquidity != null)
                    {
                        yearData.ExitLiquidity -= tempLiquidity.Amount;
                        liquidities.Remove(tempLiquidity);
                    }
                }

                var usedIds = new HashSet<int>(liquidities.Select(l => l.Id));
                int nextId = 0;

                while (usedIds.Contains(nextId))
                {
                    nextId++;
                }

                liq.Id = nextId;

                // Aggiunge la nuova voce
                liquidities.Add(liq);

                yearData.ExitLiquidity += liq.Amount;

                // Ordina per data
                liquidities = liquidities.OrderBy(l => l.Date).ToList();

                await _context.SaveChangesAsync();
                return Ok(liq);
            }
        }
    }
}
