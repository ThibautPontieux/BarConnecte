using BarConnecte.Api.Public.Extensions;
using Microsoft.EntityFrameworkCore;
using BarConnecte.Core.Datas;
using BarConnecte.Core.Services.Implementations;
using BarConnecte.Core.Services.Interfaces;

var builder = WebApplication.CreateBuilder(args);

// Database Configuration
builder.Services.AddDbContext<BarDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("Default")));

// Services Configuration
builder.Services.AddScoped<IOrderService, OrderService>();
builder.Services.AddScoped<INotificationService, NotificationService>();

// API Documentation
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// CORS Configuration
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

// Middleware Configuration
app.UseCors("AllowFrontend");

app.UseSwagger();
app.UseSwaggerUI();

app.MapGroup("public")
    .WithTags("Public Menus")
    .WithSummary("Endpoints for accessing menus in the public API")
    .MapMenus();

app.MapGroup("public/orders")
    .WithTags("Public Orders")
    .WithSummary("Endpoints for accessing orders in the public API")
    .MapOrders();

app.Run();
