using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Formats.Tar;
using System.Text.Json;
using System.Threading.Tasks;
using Tradinizer.Server.Helpers;
using Tradinizer.Server.Models;

namespace Tradinizer.Server.Controllers
{
    [ApiController]
    [Route("[controller]")]
    [Authorize]
    public class ChartDataController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly UserManager<User> _userManager;

        public ChartDataController(ApplicationDbContext context, UserManager<User> userManager)
        {
            _context = context;
            _userManager = userManager;
        }

        [HttpGet("{year}/{month}")]
        public async Task<IActionResult> GetChartData(int year, int month)
        {
            var userId = _userManager.GetUserId(User);
            var userExists = await _context.Users.AnyAsync(u => u.Id == userId);
            if (userId == null)
                return Unauthorized("Utente non trovato nel database.");
            else
            {
                var yearTrading = await GetYearDataForUser(year, userId);
                var investments = yearTrading.Investments;
                var liquidities = yearTrading.Liquidities;

                DateOnly rangeStart;
                DateOnly rangeEnd;

                decimal cumulativeInvestment = 0;
                if (month == 0)
                {
                    cumulativeInvestment = await LoadAllYearExitInvestment(year, userId);
                    rangeStart = new DateOnly(year, 1, 1);
                    rangeEnd = new DateOnly(year, 12, 31);
                }
                else
                {
                    rangeStart = new DateOnly(year, month, 1);
                    rangeEnd = rangeStart.AddMonths(1).AddDays(-1);
                }

                var labels = new List<string>();
                var differences = new List<decimal>();


                if (month != 0)
                {
                    cumulativeInvestment = investments
                        .Where(i => i.Date <= rangeStart)
                        .Sum(i => i.Amount);
                }


                // Ordina i dati
                var liquiditiesInMonth = liquidities
                    .Where(l => l.Date >= rangeStart && l.Date <= rangeEnd)
                    .OrderBy(l => l.Date)
                    .ToList();

                var investmentMap = investments
                    .GroupBy(i => i.Date)
                    .ToDictionary(g => g.Key, g => g.Sum(i => i.Amount));

                decimal firstValue = 0;
                List<decimal> percentageList = new List<decimal>();
                foreach (var liq in liquiditiesInMonth)
                {
                    if (investmentMap.ContainsKey(liq.Date))
                        cumulativeInvestment += investmentMap[liq.Date];

                    labels.Add(liq.Date.ToString("yyyy-MM-dd"));
                    differences.Add(liq.Amount - cumulativeInvestment);

                    var index = liquiditiesInMonth.IndexOf(liq);
                    if (index != 0)
                    {
                        if (investmentMap.ContainsKey(liq.Date))
                            percentageList.Add((liq.Amount - (firstValue + investmentMap[liq.Date])) / firstValue * 100);
                        else
                            percentageList.Add((liq.Amount - firstValue) / firstValue * 100);
                    }
                    else percentageList.Add(0);
                    firstValue = liq.Amount;
                }

                // Calcolo media giornaliera
                decimal dailyGrowthRate = 0;
                if (percentageList.Count != 0)
                {
                    decimal totalPercentageValue = 0;
                    foreach (var percentage in percentageList)
                    {
                        totalPercentageValue += percentage;
                    }

                    dailyGrowthRate = Math.Round(totalPercentageValue / percentageList.Count, 2);
                }

                var lastValue = differences.LastOrDefault();

                ChartData dto = new ChartData();
                if (liquiditiesInMonth.Count != 0)
                {
                    dto = new ChartData
                    {
                        Labels = labels,
                        Differences = differences,
                        Percentage = percentageList,
                        DailyGrowthRate = dailyGrowthRate,
                        ProjectedWeek = liquiditiesInMonth.Last().Amount + dailyGrowthRate * 7,
                        ProjectedMonth = liquiditiesInMonth.Last().Amount + dailyGrowthRate * 30,
                        ProjectedYear = liquiditiesInMonth.Last().Amount + dailyGrowthRate * 365
                    };
                }

                return Ok(dto);
            }

            
        }

        // --- FUNZIONI DI SUPPORTO ---

        public async Task<YearData> GetYearDataForUser(int year, string userId)
        {
            var yearData = await _context.YearsData
                .Include(y => y.Investments)
                .Include(y => y.Liquidities)
                .FirstOrDefaultAsync(y => y.Year == year && y.ApplicationUserId == userId);

            if (yearData == null)
                throw new KeyNotFoundException($"YearData not found for year {year} and user {userId}.");

            return yearData;
        }

        public async Task<decimal> LoadAllYearExitInvestment(int year, string userId)
        {
            var yearDatas = await _context.YearsData
                .Include(y => y.Investments)
                .Include(y => y.Liquidities)
                .Where(y => y.ApplicationUserId == userId && y.Year < year)
                .ToListAsync();

            decimal exitInvestment = 0;
            foreach (var yearData in yearDatas)
            {
                exitInvestment += yearData.ExitInvestment;
            }

            return exitInvestment;
        }
    }
}
