using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Tradinizer.Server.Models;
using Tradinizer.Server.Helpers;

namespace Tradinizer.Server.Controllers
{
    [ApiController]
    [Route("[controller]")]
    [Authorize]
    public class YearController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly UserManager<User> _userManager;

        public YearController(ApplicationDbContext context, UserManager<User> userManager)
        {
            _context = context;
            _userManager = userManager;
        }

        // GET: api/year
        [HttpGet]
        public async Task<IActionResult> GetAllYears()
        {
            var userId = _userManager.GetUserId(User);
            var years = await _context.YearsData
                .Where(y => y.ApplicationUserId == userId) // 👈 Filtra per utente
                .OrderBy(y => y.Year)
                .Select(y => y.Year.ToString())
                .ToListAsync();

            return Ok(years);
        }

        // POST: api/year
        [HttpPost]
        public async Task<IActionResult> AddYear([FromBody] YearDataDto dto)
        {
            if (dto == null)
                return BadRequest("Dati mancanti");

            var userId = _userManager.GetUserId(User);
            if (userId == null)
            {
                return Unauthorized("Utente non trovato nel database.");
            }
            else
            {
                var exists = await _context.YearsData.AnyAsync(y => y.Year == dto.Year && y.ApplicationUserId == userId);
                if (exists)
                    return BadRequest("L'anno esiste già per questo utente.");

                var yearData = new YearData
                {
                    Year = dto.Year,
                    ExitInvestment = dto.ExitInvestment,
                    ExitLiquidity = dto.ExitLiquidity,
                    ApplicationUserId = userId, // COLLEGA L'UTENTE!
                    Investments = dto.Investments?.Select(i => new Investment
                    {
                        Date = i.Date,
                        Amount = i.Amount,
                        Type = i.Type,
                        Name = i.Name
                    }).ToList() ?? new List<Investment>(), // Se null, assegna lista vuota
                    Liquidities = dto.Liquidities?.Select(l => new Liquidity
                    {
                        Date = l.Date,
                        Amount = l.Amount
                    }).ToList() ?? new List<Liquidity>() // Se null, assegna lista vuota
                };

                _context.YearsData.Add(yearData);
                await _context.SaveChangesAsync();

                return CreatedAtAction(nameof(GetYear), new { id = yearData.Id }, yearData);
            }

           
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetYear(int id)
        {
            var userId = _userManager.GetUserId(User);
            var yearData = await _context.YearsData
                .Include(y => y.Investments)
                .Include(y => y.Liquidities)
                .FirstOrDefaultAsync(y => y.Id == id && y.ApplicationUserId == userId);

            if (yearData == null)
                return NotFound();

            return Ok(yearData);
        }

        // DELETE: api/year/{id}
        [HttpDelete("{year}")]
        public async Task<IActionResult> DeleteYear(int year)
        {
            var userId = _userManager.GetUserId(User);
            var yearData = await _context.YearsData
                .FirstOrDefaultAsync(y => y.Year == year && y.ApplicationUserId == userId);

            if (yearData == null)
                return NotFound();

            _context.YearsData.Remove(yearData);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
