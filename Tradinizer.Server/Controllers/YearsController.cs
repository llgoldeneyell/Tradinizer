using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using Tradinizer.Server.Helpers;
using Tradinizer.Server.Models;

namespace Tradinizer.Server.Controllers
{
    [ApiController]
    [Route("[controller]")]
    [Authorize] // Tutte le azioni richiedono autenticazione
    public class YearsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public YearsController(AppDbContext context)
        {
            _context = context;
        }

        private string GetUserId()
        {
            var claims = User.Claims.Select(c => new { c.Type, c.Value }).ToList();
            return User.FindFirst(ClaimTypes.NameIdentifier)?.Value!;
        }

        // DTO (puoi metterlo in un file separato se vuoi)
        public class YearDataDto
        {
            public int Year { get; set; }
            public decimal ExitInvestment { get; set; }
            public decimal ExitLiquidity { get; set; }
            public List<InvestmentDto> Investments { get; set; } = new();
            public List<LiquidityDto> Liquidities { get; set; } = new();
        }

        public class InvestmentDto
        {
            public DateOnly Date { get; set; }
            public decimal Amount { get; set; }
            public string Type { get; set; } = string.Empty;
            public string Name { get; set; } = string.Empty;
        }

        public class LiquidityDto
        {
            public DateOnly Date { get; set; }
            public decimal Amount { get; set; }
        }

        [HttpPost]
        public async Task<IActionResult> AddYear([FromBody] YearDataDto dto)
        {
            if (dto == null)
                return BadRequest("Dati mancanti");

            var userId = GetUserId(); 
            var userExists = await _context.Users.AnyAsync(u => u.Id == userId);
            if (!userExists)
                return Unauthorized("Utente non trovato nel database.");

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
                Liquidities = dto.Liquidities?.Select(l => new LiquidityData
                {
                    Date = l.Date,
                    Amount = l.Amount
                }).ToList() ?? new List<LiquidityData>() // Se null, assegna lista vuota
            };

            _context.Years.Add(yearData);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetYear), new { id = yearData.Id }, yearData);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetYear(int id)
        {
            var userId = GetUserId();
            var yearData = await _context.Years
                .Include(y => y.Investments)
                .Include(y => y.Liquidities)
                .FirstOrDefaultAsync(y => y.Id == id && y.ApplicationUserId == userId);

            if (yearData == null)
                return NotFound();

            return Ok(yearData);
        }

        // Metodo di supporto per GET (opzionale)
        [HttpGet]
        public async Task<IActionResult> GetAllYears()
        {
            var userId = GetUserId();
            var years = await _context.Years
                .Where(y => y.ApplicationUserId == userId) // 👈 Filtra per utente
                .OrderBy(y => y.Year)
                .Select(y => y.Year.ToString())
                .ToListAsync();

            return Ok(years);
        }

    }
}
