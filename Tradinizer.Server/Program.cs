
using Microsoft.Extensions.FileProviders;

namespace Tradinizer.Server
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            // Add services to the container.

            builder.Services.AddControllers();
            // Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
            builder.Services.AddOpenApi();

            int port = builder.Configuration.GetValue<int>("AppSettings:Port", 5000);

            builder.WebHost.ConfigureKestrel(options =>
            {
                options.ListenLocalhost(port);
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
