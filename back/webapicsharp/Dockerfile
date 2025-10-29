# Etapa base para .NET 9
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS base
WORKDIR /app
EXPOSE 5031

# SDK para compilar con .NET 9
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src
COPY ["webapicsharp.csproj", "./"]
RUN dotnet restore "./webapicsharp.csproj"
COPY . .
RUN dotnet build "webapicsharp.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "webapicsharp.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Imagen final
FROM base AS final
WORKDIR /app

# Copiar la app publicada
COPY --from=publish /app/publish .

# Copiar script de pruebas de conexión
COPY check-dbs.sh /usr/local/bin/check-dbs.sh

# Dar permisos de ejecución al script
RUN chmod +x /usr/local/bin/check-dbs.sh

# Configurar solo HTTP (evita errores de certificado)
ENV ASPNETCORE_URLS=http://+:5031
ENV DOTNET_RUNNING_IN_CONTAINER=true
ENV DOTNET_USE_POLLING_FILE_WATCHER=true

# Healthcheck que ejecuta el script dentro del contenedor
HEALTHCHECK --interval=10s --timeout=5s --retries=3 \
    CMD /usr/local/bin/check-dbs.sh

# Comando por defecto
ENTRYPOINT ["dotnet", "webapicsharp.dll"]