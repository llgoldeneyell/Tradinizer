
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.FileProviders;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Tradinizer.Server.Helpers;
using Tradinizer.Server.Models;

namespace Tradinizer.Server
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            // Add services to the container.
            builder.Services.AddControllers();
            builder.Services.AddOpenApi();

            //int port = builder.Configuration.GetValue<int>("AppSettings:Port", 5000);

            //builder.WebHost.ConfigureKestrel(options =>
            //{
            //    options.ListenLocalhost(port);
            //});

            builder.Services.AddDbContext<AppDbContext>(options =>
                options.UseSqlite("Data Source=tradinizer.db"));

            // 1. Aggiungi Identity
            builder.Services.AddIdentity<ApplicationUser, IdentityRole>(options =>
            {
                options.Password.RequireDigit = false;
                options.Password.RequireNonAlphanumeric = false;
                options.Password.RequiredLength = 6;
            })
            .AddEntityFrameworkStores<AppDbContext>()
            .AddDefaultTokenProviders();

            // 2. Configura JWT
            var jwtSettings = builder.Configuration.GetSection("JwtSettings");
            var secretKey = jwtSettings["SecretKey"];
            if (string.IsNullOrEmpty(secretKey))
            {
                throw new InvalidOperationException("JWT SecretKey non configurata. Controlla appsettings.json!");
            }

            var key = Encoding.UTF8.GetBytes(secretKey);

            builder.Services.AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
            })
            .AddJwtBearer(options =>
            {
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidateLifetime = true,
                    ValidateIssuerSigningKey = true,
                    ValidIssuer = jwtSettings["Issuer"] ?? "defaultissuer",
                    ValidAudience = jwtSettings["Audience"] ?? "defaultaudience",
                    IssuerSigningKey = new SymmetricSecurityKey(key),
                };
                options.Events = new JwtBearerEvents
                {
                    OnAuthenticationFailed = context =>
                    {
                        Console.WriteLine("Authentication failed: " + context.Exception.Message);
                        return Task.CompletedTask;
                    },
                    OnTokenValidated = context =>
                    {
                        Console.WriteLine("Token validato per: " + context.Principal.Identity?.Name);
                        return Task.CompletedTask;
                    }
                };
            });

            var app = builder.Build();

            var viteDistPath = Path.GetFullPath(Path.Combine(Directory.GetCurrentDirectory(), "..", "tradinizer.client", "dist"));

            app.UseDefaultFiles();
            //app.MapStaticAssets();
            //app.UseStaticFiles();
            app.UseStaticFiles(new StaticFileOptions
            {
                FileProvider = new PhysicalFileProvider(viteDistPath),
                RequestPath = ""
            });

            // Configure the HTTP request pipeline.
            if (app.Environment.IsDevelopment())
            {
                app.MapOpenApi();
            }

            app.UseHttpsRedirection();

            // 3. Usa l’autenticazione prima di Authorization
            app.UseAuthentication();
            app.UseAuthorization();


            app.MapControllers();

            //app.MapFallbackToFile("/index.html");

            app.MapFallbackToFile("index.html", new StaticFileOptions
            {
                FileProvider = new PhysicalFileProvider(viteDistPath)
            });

            app.Run();
        }
    }
}
