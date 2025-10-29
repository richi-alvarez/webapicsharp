-- Database: postgresdb

-- DROP DATABASE IF EXISTS postgresdb;

CREATE DATABASE postgresdb
    WITH
    OWNER = sa
    ENCODING = 'UTF8'
    LC_COLLATE = 'en_US.utf8'
    LC_CTYPE = 'en_US.utf8'
    LOCALE_PROVIDER = 'libc'
    TABLESPACE = pg_default
    CONNECTION LIMIT = -1
    IS_TEMPLATE = False;
	
CREATE TABLE WeatherForecast (
    Date date NOT NULL,
    TemperatureC integer NOT NULL,
    Summary text,      -- permite NULL por defecto
    PRIMARY KEY (Date)
);

CREATE TABLE Usuario (
    Id SERIAL PRIMARY KEY,
    Email VARCHAR(255) NOT NULL,
    Contrasena VARCHAR(255) NOT NULL,
    RutaAvatar VARCHAR(255) NOT NULL,
    Activo BOOLEAN NOT NULL,
    CONSTRAINT UQ_Usuario_Email UNIQUE (Email)
);

CREATE TABLE tipo_proyecto (
    id_tipo_proyecto SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    descripcion VARCHAR(500) NOT NULL
);

CREATE TABLE estado (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    descripcion VARCHAR(500) NOT NULL
);

CREATE TABLE entregable (
    id_entregable SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    fecha_entrega TIMESTAMP NOT NULL,
    descripcion VARCHAR(1000) NOT NULL
);
