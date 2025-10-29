#!/bin/bash
set -e

echo "========================================"
echo " 🔎 PROBANDO CONEXIÓN A POSTGRES"
echo "========================================"
docker exec -it postgresdb psql -U root -d postgresdb -c "\l" || echo "❌ Error conectando a Postgres"
docker exec -it postgresdb psql -U root -d postgresdb -c "\dt" || echo "❌ No se pudieron listar tablas en Postgres"

echo ""
echo "========================================"
echo " 🔎 PROBANDO CONEXIÓN A MARIADB"
echo "========================================"
docker exec -it mariadb mysql -uroot -ptest -e "SHOW DATABASES;" || echo "❌ Error conectando a MariaDB"
docker exec -it mariadb mysql -uroot -ptest -e "USE mariadb; SHOW TABLES;" || echo "❌ No se pudieron listar tablas en MariaDB"

echo ""
echo "========================================"
echo " 🔎 PROBANDO CONEXIÓN A SQL SERVER"
echo "========================================"
docker exec -it sqlserver /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P 'YourStrong@Passw0rd' -Q "SELECT name FROM sys.databases;" || echo "❌ Error conectando a SQL Server"
docker exec -it sqlserver /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P 'YourStrong@Passw0rd' -d master -Q "SELECT name FROM sys.tables;" || echo "❌ No se pudieron listar tablas en SQL Server"

echo ""
echo "✅ PRUEBAS FINALIZADAS"