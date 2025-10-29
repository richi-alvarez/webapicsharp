#!/bin/bash
set -e

DB_NAME="${MYSQL_DATABASE:-mariadb}"
DB_USER="${MYSQL_USER:-root}"
DB_USER_ROO="root"
DB_PASSWORD="${MYSQL_PASSWORD:-test}"
SQL_FILE="/docker-entrypoint-initdb.d/mariadb.sql"

echo "Inicializando MariaDB/MySQL: $DB_NAME  $DB_USER $DB_USER_ROO $DB_PASSWORD"

echo "---------------------------- start -----------------------------------"

mysql -h localhost -u"$DB_USER_ROO" -p"$DB_PASSWORD" "$DB_NAME" < "$SQL_FILE"

echo "MariaDB/MySQL inicializado correctamente."

echo "---------------------------- finish -----------------------------------"