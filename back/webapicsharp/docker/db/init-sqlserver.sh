#!/bin/bash
set -e

# Variables
SA_PASSWORD="${SA_PASSWORD:-YourStrong@Passw0rd}"
SQL_FILE="/docker-entrypoint-initdb.d/init.sql"

# Esperar a que SQL Server esté listo
echo "Esperando a que SQL Server arranque..."
until /opt/mssql-tools/bin/sqlcmd -S localhost -U SA -P "$SA_PASSWORD" -Q "SELECT 1" &> /dev/null
do
  echo -n "."
  sleep 1
done

echo "Ejecutando script SQL: $SQL_FILE"
# Ejecutar SQL
/opt/mssql-tools/bin/sqlcmd -S localhost -U SA -P "$SA_PASSWORD" -i "$SQL_FILE"

echo "Base de datos SQL Server inicializada correctamente."