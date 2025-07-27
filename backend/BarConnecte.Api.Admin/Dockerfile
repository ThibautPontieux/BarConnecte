FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src
COPY . .
COPY nuget.config .

# Pack BarConnecte.Core en local
RUN dotnet pack BarConnecte.Core/BarConnecte.Core.csproj -o ./nupkgs

# Restore en utilisant le package local
RUN dotnet restore BarConnecte.Api.Admin/BarConnecte.Api.Admin.csproj
RUN dotnet publish BarConnecte.Api.Admin/BarConnecte.Api.Admin.csproj -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:9.0
WORKDIR /app
COPY --from=build /app/publish .
EXPOSE 80
ENTRYPOINT ["dotnet", "BarConnecte.Api.Admin.dll"]