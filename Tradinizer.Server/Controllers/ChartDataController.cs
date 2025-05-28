using System.Text.Json;
using Microsoft.AspNetCore.Mvc;
using Tradinizer.Server.Models;

namespace Tradinizer.Server.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class ChartDataController : ControllerBase
    {
        [HttpGet("{year}/{month}")]
        public IActionResult GetChartData(int year, int month)
        {
            var yearTrading = LoadYearTrading(year);
            var investments = yearTrading.Investments;
            var liquidities = yearTrading.Liquidities;

            DateOnly rangeStart;
            DateOnly rangeEnd;

            decimal cumulativeInvestment = 0;
            if (month == 0)
            {
                cumulativeInvestment = LoadAllYearExitInvestment(year);
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

            ChartDataDto dto = new ChartDataDto();
            if (liquiditiesInMonth.Count != 0)
            {
                dto = new ChartDataDto
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

        // --- FUNZIONI DI SUPPORTO ---

        private string GetFilePathForYear(int year)
        {
            var directory = Path.Combine(Directory.GetCurrentDirectory(), "Data");
            if (!Directory.Exists(directory))
                Directory.CreateDirectory(directory);

            return Path.Combine(directory, $"{year}.json");
        }

        private YearTrading LoadYearTrading(int year)
        {
            var path = GetFilePathForYear(year);
            if (!System.IO.File.Exists(path))
                return new YearTrading() { Year = year };

            var json = System.IO.File.ReadAllText(path);
            return JsonSerializer.Deserialize<YearTrading>(json) ?? new();
        }

        private decimal LoadAllYearExitInvestment(int year)
        {
            var directory = Path.Combine(Directory.GetCurrentDirectory(), "Data");

            string[] filePaths = Directory.GetFiles(directory, "*.json");

            decimal exitInvestment = 0;
            foreach (var file in filePaths)
            {
                string fileName = Path.GetFileName(file);

                int yearFile = 0;
                int.TryParse(fileName.Split(".")[0], out yearFile);
                if (yearFile != 0 && yearFile < year)
                {
                    exitInvestment += LoadYearTrading(yearFile).ExitInvestment;
                }
            }

            return exitInvestment;
        }
    }
}
