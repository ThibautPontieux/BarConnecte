using BarConnecte.Api.Admin.Extensions;
using BarConnecte.Core.Datas;
using BarConnecte.Core.Services.Implementations;
using BarConnecte.Core.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

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

app.MapGroup("admin/drinks")
    .WithTags("Admin Drinks")
    .WithSummary("Endpoints for managing drinks in the admin panel")
    .MapDrinks();

app.MapGroup("admin/orders")
    .WithTags("Admin Orders")
    .WithSummary("Endpoints for managing orders in the admin panel")
    .MapOrders();

app.Run();