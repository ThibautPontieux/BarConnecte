using BarConnecte.Api.Public.Endpoints;
using BarConnecte.Api.Public.Extensions;
using Microsoft.EntityFrameworkCore;
using BarConnecte.Core.Datas;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddDbContext<BarDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("Default")));
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins(
                "http://localhost:3000", 
                "https://localhost:3000")
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

var app = builder.Build();

app.UseCors("AllowFrontend");

app.UseSwagger();
app.UseSwaggerUI();

app.MapGroup("public")
    .MapMenus();

app.Run();
