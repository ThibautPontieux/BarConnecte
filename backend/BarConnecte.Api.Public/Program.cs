using BarConnecte.Api.Public.Endpoints;
using BarConnecte.Api.Public.Extensions;
using Microsoft.EntityFrameworkCore;
using BarConnecte.Core.Datas;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddDbContext<BarDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("Default")));
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

app.UseSwagger();
app.UseSwaggerUI();

app.MapGroup("public")
    .MapMenus();

app.Run();
