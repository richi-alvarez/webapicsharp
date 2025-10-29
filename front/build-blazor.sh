#!/bin/bash
set -e  # Detiene el script si ocurre algún error

# Nombre del proyecto
PROJECT_NAME="FrontendBlazorApi"

echo "🚀 Creando proyecto Blazor Server: $PROJECT_NAME"

# Si ya existe una carpeta previa, la eliminamos
if [ -d "$PROJECT_NAME" ]; then
  echo "⚠️  Eliminando proyecto anterior..."
  rm -rf "$PROJECT_NAME"
fi

# Crear nuevo proyecto Blazor Server con .NET 8
dotnet new blazor -o $PROJECT_NAME

cd $PROJECT_NAME

# Compilar para verificar que todo funciona
echo "🧱 Compilando proyecto Blazor..."
dotnet build -c Release

echo "✅ Proyecto Blazor creado correctamente en $(pwd)"
