using Microsoft.EntityFrameworkCore;
using SmartRetirement.Api.Data;
using SmartRetirement.Api.Repositories.Implementations;
using SmartRetirement.Api.Repositories.Interfaces;
using SmartRetirement.Api.Services.Implementations;
using SmartRetirement.Api.Services.Interfaces;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();

// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

// grab value from apsettings.json
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

// Dependency injection
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite(connectionString));

builder.Services.AddScoped(typeof(IRepository<>), typeof(Repository<>));
builder.Services.AddScoped<IParticipantRepository, ParticipantRepository>();
builder.Services.AddScoped<IEmployerRepository, EmployerRepository>();
builder.Services.AddScoped<IPlanRepository, PlanRepository>();
builder.Services.AddScoped<IContributionRepository, ContributionRepository>();

builder.Services.AddScoped<IParticipantService, ParticipantService>();
builder.Services.AddScoped<IPlanService, PlanService>();
builder.Services.AddScoped<IContributionService, ContributionService>();

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
