using System.Text.Json;
using Microsoft.AspNetCore.Mvc;
using Tradinizer.Server.Models;

namespace Tradinizer.Server.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class InvestmentsController : ControllerBase
    {
        [HttpGet("years")]
        public IActionResult GetYears()
        {
            List<string> years = LoadYears();

            years = years.OrderBy(y => y).ToList();

            return Ok(years);
        }

        [HttpPost("setYears/{year}")]
        public IActionResult SetYears(int year)
        {
            List<string> years = LoadYears();

            if (years.Contains(year.ToString()))
                return Conflict(new { message = "Anno già presente." });

            YearTrading tempYearTrading = new YearTrading()
            {
                Year = year
            };

            SaveYearTradings(tempYearTrading);

            return Ok(tempYearTrading);
        }

        [HttpPost]
        public IActionResult PostInvestment([FromBody] Investment investment)
        {
            var year = investment.Date.Year;
            var yearTrading = LoadYearTrading(year);
            var investments = yearTrading.Investments;
            int nextId = investments.Any() ? investments.Max(i => i.Id) + 1 : 1;

            investment.Id = nextId;
            investments.Add(investment);

            yearTrading.ExitInvestment += investment.Amount;

            // Ordina per data
            investments = investments.OrderBy(i => i.Date).ToList();
            SaveYearTradings(yearTrading);
            return Ok(investment);
        }

        [HttpGet("{year}")]
        public IActionResult GetInvestment(int year)
        {
            var investments = LoadYearTrading(year).Investments;
            return Ok(investments);
        }

        [HttpDelete("{year}/{id}")]
        public IActionResult DeleteInvestment(int id, int year)
        {
            var yearTrading = LoadYearTrading(year);
            var investments = yearTrading.Investments;

            var item = investments.FirstOrDefault(i => i.Id == id);
            if (item == null) return NotFound();

            investments.Remove(item);
            yearTrading.ExitInvestment -= item.Amount;
            SaveYearTradings(yearTrading);

            return Ok(item);
        }

        [HttpPost("liquidity")]
        public IActionResult PostLiquidity([FromBody] LiquidityData liquidityData)
        {
            var year = liquidityData.Date.Year;
            var yearTrading = LoadYearTrading(year);
            var liquidities = yearTrading.Liquidities;

            if (liquidities.Exists(x => x.Date == liquidityData.Date))
            {
                var tempLiquidity = liquidities.FirstOrDefault(x => x.Date == liquidityData.Date);
                if (tempLiquidity != null)
                {
                    yearTrading.ExitLiquidity -= tempLiquidity.Amount;
                    liquidities.Remove(tempLiquidity);
                }
            }

            int nextId = liquidities.Any() ? liquidities.Max(i => i.Id) + 1 : 1;

            liquidityData.Id = nextId;

            // Aggiunge la nuova voce
            liquidities.Add(liquidityData);

            yearTrading.ExitLiquidity += liquidityData.Amount;

            // Ordina per data
            liquidities = liquidities.OrderBy(l => l.Date).ToList();

            SaveYearTradings(yearTrading);
            return Ok(liquidityData);
        }

        [HttpGet("liquidity/{year}")]
        public IActionResult GetLiquidity(int year)
        {
            var liquidities = LoadYearTrading(year).Liquidities;
            return Ok(liquidities);
        }

        [HttpDelete("liquidity/{year}/{id}")]
        public IActionResult DeleteLiquidity(int id, int year)
        {
            var yearTrading = LoadYearTrading(year);
            var liquidities = yearTrading.Liquidities;

            var item = liquidities.FirstOrDefault(l => l.Id == id);
            if (item == null) return NotFound();

            liquidities.Remove(item);
            yearTrading.ExitLiquidity -= item.Amount;
            SaveYearTradings(yearTrading);

            return Ok(item);
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
                return new YearTrading() {Year = year };

            var json = System.IO.File.ReadAllText(path);
            return JsonSerializer.Deserialize<YearTrading>(json) ?? new();
        }

        private void SaveYearTradings(YearTrading yearTrading)
        {
            var path = GetFilePathForYear(yearTrading.Year);
            var json = JsonSerializer.Serialize(yearTrading, new JsonSerializerOptions { WriteIndented = true });
            System.IO.File.WriteAllText(path, json);
        }

        private List<string> LoadYears()
        {
            var directory = Path.Combine(Directory.GetCurrentDirectory(), "Data");
            if (!Directory.Exists(directory)) return new List<string>();
            string[] filePaths = Directory.GetFiles(directory, "*.json");

            List<string> years = new List<string>();
            foreach (var file in filePaths)
            {
                string fileName = Path.GetFileName(file).Split(".")[0];
                years.Add(fileName);
            }

            years = years.OrderBy(y => y).ToList();

            return years;
        }
    }
}
