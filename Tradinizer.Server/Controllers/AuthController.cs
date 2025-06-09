using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using BCrypt.Net;
using Tradinizer.Server.Helpers;
using Tradinizer.Server.Models;
using Microsoft.AspNetCore.Identity;
using System.Web;

namespace Tradinizer.Server.Controllers
{

    [ApiController]
    [Route("[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _configuration;
        private readonly UserManager<User> _userManager;
        private readonly IEmailSender _emailSender;

        public AuthController(ApplicationDbContext context, IConfiguration configuration, UserManager<User> userManager, IEmailSender emailSender)
        {
            _context = context;
            _configuration = configuration;
            _userManager = userManager;
            _emailSender = emailSender;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequest request)
        {
            if (await _userManager.FindByNameAsync(request.Username) != null)
                return BadRequest("Username già usato");

            if (await _userManager.FindByEmailAsync(request.Email) != null)
                return BadRequest("Email già usata");

            var user = new User
            {
                UserName = request.Username,
                Email = request.Email,
                EmailConfirmed = false // Email non confermata finché non clicca il link
            };

            var result = await _userManager.CreateAsync(user, request.Password);
            if (!result.Succeeded)
                return BadRequest(result.Errors);

            // Genera token di conferma email
            var token = await _userManager.GenerateEmailConfirmationTokenAsync(user);
            // Encode token per URL
            var encodedToken = System.Web.HttpUtility.UrlEncode(token);

            // Crea l'URL di conferma (modifica l'URL base con il tuo frontend o endpoint apposito)
            var confirmationLink = $"{Request.Scheme}://{Request.Host}/confirm-email?userId={user.Id}&token={encodedToken}";

            // Invia email con il link
            await _emailSender.SendEmailAsync(user.Email, "Conferma la tua email",
                $"Ciao {user.UserName},<br/><br/>Per favore conferma il tuo account cliccando sul link: <a href='{confirmationLink}'>Conferma Email</a>");

            return Ok("Registrazione avvenuta con successo, controlla la tua email per attivare l'account");
        }

        [HttpGet("confirm-email")]
        public async Task<IActionResult> ConfirmEmail(string userId, string token)
        {
            if (userId == null || token == null)
                return BadRequest("User ID e token sono richiesti");

            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
                return NotFound("Utente non trovato");

            var decodedToken = HttpUtility.UrlDecode(token);
            var result = await _userManager.ConfirmEmailAsync(user, decodedToken);

            if (result.Succeeded)
                return Ok("Email confermata con successo");
            else
                return BadRequest("Errore nella conferma dell'email");
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            var user = await _context.Users.SingleOrDefaultAsync(u => u.UserName == request.Username);
            if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
                return Unauthorized("Credenziali non valide");

            var token = GenerateJwtToken(user);
            return Ok(new { Token = token });
        }

        // GET: api/users
        [HttpGet]
        public async Task<ActionResult<IEnumerable<User>>> GetUsers()
        {
            var users = await _context.Users.ToListAsync();
            return Ok(users);
        }

        private string GenerateJwtToken(User user)
        {
            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Id),
                new Claim("username", user.UserName!),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
            };

            var jwtKey = _configuration["Jwt:Key"];

            if (string.IsNullOrEmpty(jwtKey))
            {
                throw new InvalidOperationException("JWT key not configured.");
            }

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));

            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: claims,
                expires: DateTime.Now.AddHours(2),
                signingCredentials: creds);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }

    public record RegisterRequest(string Username, string Email, string Password);
    public record LoginRequest(string Username, string Password);

}
