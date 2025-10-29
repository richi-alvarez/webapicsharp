#!/bin/bash
set -e

# Variables (pueden venir del docker-compose)
DB_NAME="${POSTGRES_DB:-postgresdb}"
DB_USER="${POSTGRES_USER:-sa}"
DB_PASSWORD="${POSTGRES_PASSWORD:-test}"
SQL_FILE="/docker-entrypoint-initdb.d/postgresdb.sql"

echo "---------------------------- start -----------------------------------"

echo "Creando base de datos $DB_NAME y ejecutando $SQL_FILE..."

# Ejecutar SQL
psql -v ON_ERROR_STOP=1 -U "$DB_USER" -d "$DB_NAME" -f "$SQL_FILE"

echo "Base de datos PostgreSQL inicializada correctamente."

echo "---------------------------- finish -----------------------------------"