using Microsoft.EntityFrameworkCore;
using SmartRetirement.Api.Data;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();

// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

// grab value from apsettings.json
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

// Dependancy Injection
builder.Services.AddDbContext<AppDbContext>(Options => Options.UseSqlite(connectionString));

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();
