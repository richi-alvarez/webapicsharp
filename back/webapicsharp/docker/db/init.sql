-- ===============================================
-- Script de inicialización multi-DB
-- Compatible con: PostgreSQL, MySQL/MariaDB y SQL Server
-- ===============================================

-- ===============================================
-- CREACIÓN DE BASE DE DATOS (ajustar según motor)
-- ===============================================
-- PostgreSQL:
-- CREATE DATABASE postgresdb;
-- \c postgresdb;

-- MySQL/MariaDB:
-- CREATE DATABASE IF NOT EXISTS sqlserverdb;
-- USE sqlserverdb;

-- SQL Server:
    IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = N'postgresdb')
        CREATE DATABASE sqlserverdb;
    GO
    USE sqlserverdb;
    GO

-- ===============================================
-- CREACIÓN DE USUARIOS Y PERMISOS
-- ===============================================

-- PostgreSQL:
-- CREATE USER appuser WITH PASSWORD 'app_pass';
-- GRANT ALL PRIVILEGES ON DATABASE postgresdb TO appuser;

-- MySQL/MariaDB:
-- CREATE USER 'appuser'@'%' IDENTIFIED BY 'app_pass';
-- GRANT ALL PRIVILEGES ON sqlserverdb.* TO 'appuser'@'%';
-- FLUSH PRIVILEGES;

-- SQL Server:
    CREATE LOGIN appuser WITH PASSWORD = 'app_pass';
    CREATE USER appuser FOR LOGIN appuser;
    ALTER ROLE db_owner ADD MEMBER appuser;

-- ===============================================
-- CREACIÓN DE TABLAS (sintaxis unificada)
-- Ajustar IDENTITY / AUTO_INCREMENT / SERIAL según motor
-- ===============================================
CREATE TABLE WeatherForecast (
    Date date NOT NULL PRIMARY KEY,
    TemperatureC int NOT NULL,
    Summary nvarchar(255) NULL
    -- TemperatureF no se almacena
);

-- Tabla para almacenar configuraciones JWT
CREATE TABLE ConfiguracionJwt (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    [Key] NVARCHAR(500) NOT NULL,
    Issuer NVARCHAR(100) NOT NULL,
    Audience NVARCHAR(100) NOT NULL,
    DuracionMinutos INT NOT NULL DEFAULT 15,
    FechaCreacion DATETIME2 NOT NULL DEFAULT GETDATE(),
    FechaActualizacion DATETIME2 NULL,
    Activo BIT NOT NULL DEFAULT 1
);

-- Índices para mejorar el rendimiento
CREATE INDEX IX_ConfiguracionJwt_Issuer ON ConfiguracionJwt(Issuer);
CREATE INDEX IX_ConfiguracionJwt_Audience ON ConfiguracionJwt(Audience);
CREATE INDEX IX_ConfiguracionJwt_Activo ON ConfiguracionJwt(Activo);

-- Insertar configuración por defecto
INSERT INTO ConfiguracionJwt ([Key], Issuer, Audience, DuracionMinutos, Activo)
VALUES 
('ClaveSuperSecreta123456', 'webapicsharp', 'clientes', 15, 1);

-- Trigger para actualizar FechaActualizacion automáticamente
CREATE TRIGGER TR_ConfiguracionJwt_Update
ON ConfiguracionJwt
AFTER UPDATE
AS
BEGIN
    UPDATE ConfiguracionJwt 
    SET FechaActualizacion = GETDATE()
    WHERE Id IN (SELECT Id FROM inserted);
END;

-- Obtener configuración activa
SELECT TOP 1 [Key], Issuer, Audience, DuracionMinutos
FROM ConfiguracionJwt 
WHERE Activo = 1
ORDER BY FechaCreacion DESC;

-- Actualizar duración de tokens
UPDATE ConfiguracionJwt 
SET DuracionMinutos = 60
WHERE Activo = 1;

-- Crear nueva configuración y desactivar la anterior
BEGIN TRANSACTION;
    UPDATE ConfiguracionJwt SET Activo = 0;
    INSERT INTO ConfiguracionJwt ([Key], Issuer, Audience, DuracionMinutos, Activo)
    VALUES ('NuevaClaveSecreta789', 'webapicsharp', 'clientes', 30, 1);
COMMIT;

-- =========================================== -- Tabla: Usuario -- =========================================== CREATE TABLE Usuario ( Id INT IDENTITY(1,1) PRIMARY KEY, Email NVARCHAR(150) NOT NULL UNIQUE, Contrasena NVARCHAR(255) NOT NULL, RutaAvatar NVARCHAR(MAX) NULL, Activo BIT NOT NULL DEFAULT 1 ); -- =========================================== -- Tabla: TipoResponsable -- =========================================== CREATE TABLE TipoResponsable ( Id INT IDENTITY(1,1) PRIMARY KEY, Titulo NVARCHAR(50) NOT NULL, Descripcion NVARCHAR(255) NOT NULL, CONSTRAINT UQ_TipoResponsable_Titulo UNIQUE (Titulo) ); -- =========================================== -- Tabla: Responsable -- =========================================== CREATE TABLE Responsable ( Id INT IDENTITY(1,1) PRIMARY KEY, IdTipoResponsable INT NOT NULL, IdUsuario INT NOT NULL, Nombre NVARCHAR(255) NOT NULL, CONSTRAINT FK_Responsable_TipoResponsable FOREIGN KEY (IdTipoResponsable) REFERENCES TipoResponsable(Id), CONSTRAINT FK_Responsable_Usuario FOREIGN KEY (IdUsuario) REFERENCES Usuario(Id) ON DELETE CASCADE ); -- =========================================== -- Tabla: TipoProyecto -- =========================================== CREATE TABLE TipoProyecto ( Id INT IDENTITY(1,1) PRIMARY KEY, Nombre NVARCHAR(150) NOT NULL, Descripcion NVARCHAR(255) NOT NULL, CONSTRAINT UQ_TipoProyecto_Nombre UNIQUE (Nombre)

); -- =========================================== -- Tabla: Estado -- =========================================== CREATE TABLE Estado ( Id INT IDENTITY(1,1) PRIMARY KEY, Nombre NVARCHAR(50) NOT NULL, Descripcion NVARCHAR(255) NOT NULL, CONSTRAINT UQ_Estado_Nombre UNIQUE (Nombre) ); -- =========================================== -- Tabla: Proyecto -- =========================================== CREATE TABLE Proyecto ( Id INT IDENTITY(1,1) PRIMARY KEY, IdProyectoPadre INT NULL, IdResponsable INT NOT NULL, IdTipoProyecto INT NOT NULL, Codigo NVARCHAR(50) NULL, Titulo NVARCHAR(255) NOT NULL, Descripcion NVARCHAR(MAX) NULL, FechaInicio DATE NULL, FechaFinPrevista DATE NULL, FechaModificacion DATE NULL, FechaFinalizacion DATE NULL, RutaLogo NVARCHAR(MAX) NULL, CONSTRAINT FK_Proyecto_ProyectoPadre FOREIGN KEY (IdProyectoPadre) REFERENCES Proyecto(Id) ON DELETE NO ACTION, CONSTRAINT FK_Proyecto_Responsable FOREIGN KEY (IdResponsable) REFERENCES Responsable(Id), CONSTRAINT FK_Proyecto_TipoProyecto FOREIGN KEY (IdTipoProyecto) REFERENCES TipoProyecto(Id) ); -- =========================================== -- Tabla: Estado_Proyecto -- =========================================== CREATE TABLE Estado_Proyecto ( IdProyecto INT PRIMARY KEY, IdEstado INT NOT NULL, CONSTRAINT FK_EstadoProyecto_Proyecto FOREIGN KEY (IdProyecto) REFERENCES Proyecto(Id) ON DELETE CASCADE, CONSTRAINT FK_EstadoProyecto_Estado FOREIGN KEY (IdEstado) REFERENCES Estado(Id) ); -- =========================================== -- Tabla: TipoProducto -- =========================================== CREATE TABLE TipoProducto ( Id INT IDENTITY(1,1) PRIMARY KEY, Nombre NVARCHAR(150) NOT NULL, Descripcion NVARCHAR(255) NOT NULL, CONSTRAINT UQ_TipoProducto_Nombre UNIQUE (Nombre) ); -- =========================================== -- Tabla: Producto -- =========================================== CREATE TABLE Producto ( Id INT IDENTITY(1,1) PRIMARY KEY, IdTipoProducto INT NOT NULL, Codigo NVARCHAR(50) NULL, Titulo NVARCHAR(255) NOT NULL, Descripcion NVARCHAR(MAX) NULL, FechaInicio DATE NULL, FechaFinPrevista DATE NULL, FechaModificacion DATE NULL, FechaFinalizacion DATE NULL, RutaLogo NVARCHAR(MAX) NULL, CONSTRAINT FK_Producto_TipoProducto FOREIGN KEY (IdTipoProducto) REFERENCES TipoProducto(Id)
); -- =========================================== -- Tabla: Proyecto_Producto (relación N:M) -- =========================================== CREATE TABLE Proyecto_Producto ( IdProyecto INT NOT NULL, IdProducto INT NOT NULL, FechaAsociacion DATE NULL, PRIMARY KEY (IdProyecto, IdProducto), CONSTRAINT FK_ProyectoProducto_Proyecto FOREIGN KEY (IdProyecto) REFERENCES Proyecto(Id) ON DELETE CASCADE, CONSTRAINT FK_ProyectoProducto_Producto FOREIGN KEY (IdProducto) REFERENCES Producto(Id) ON DELETE CASCADE ); -- =========================================== -- Tabla: Entregable -- =========================================== CREATE TABLE Entregable ( Id INT IDENTITY(1,1) PRIMARY KEY, Codigo NVARCHAR(50) NULL, Titulo NVARCHAR(255) NOT NULL, Descripcion NVARCHAR(MAX) NULL, FechaInicio DATE NULL, FechaFinPrevista DATE NULL, FechaModificacion DATE NULL, FechaFinalizacion DATE NULL ); -- =========================================== -- Tabla: Producto_Entregable (relación N:M) -- =========================================== CREATE TABLE Producto_Entregable ( IdProducto INT NOT NULL, IdEntregable INT NOT NULL, FechaAsociacion DATE NULL, PRIMARY KEY (IdProducto, IdEntregable), CONSTRAINT FK_ProductoEntregable_Producto FOREIGN KEY (IdProducto) REFERENCES Producto(Id) ON DELETE CASCADE, CONSTRAINT FK_ProductoEntregable_Entregable FOREIGN KEY (IdEntregable) REFERENCES Entregable(Id) ON DELETE CASCADE ); -- =========================================== -- Tabla: Responsable_Entregable (relación N:M) -- =========================================== CREATE TABLE Responsable_Entregable ( IdResponsable INT NOT NULL, IdEntregable INT NOT NULL, FechaAsociacion DATE NULL, PRIMARY KEY (IdResponsable, IdEntregable), CONSTRAINT FK_ResponsableEntregable_Responsable FOREIGN KEY (IdResponsable) REFERENCES Responsable(Id) ON DELETE CASCADE, CONSTRAINT FK_ResponsableEntregable_Entregable FOREIGN KEY (IdEntregable) REFERENCES Entregable(Id) ON DELETE CASCADE ); -- =========================================== -- Tabla: Archivo -- =========================================== CREATE TABLE Archivo ( Id INT IDENTITY(1,1) PRIMARY KEY, IdUsuario INT NOT NULL, Ruta NVARCHAR(MAX) NOT NULL, Nombre NVARCHAR(255) NOT NULL, Tipo NVARCHAR(50) NULL, Fecha DATE NULL, CONSTRAINT FK_Archivo_Usuario FOREIGN KEY (IdUsuario) REFERENCES Usuario(Id) ON DELETE CASCADE );

-- =========================================== -- Tabla: Archivo_Entregable (relación N:M) -- =========================================== CREATE TABLE Archivo_Entregable ( IdArchivo INT NOT NULL, IdEntregable INT NOT NULL, PRIMARY KEY (IdArchivo, IdEntregable), CONSTRAINT FK_ArchivoEntregable_Archivo FOREIGN KEY (IdArchivo) REFERENCES Archivo(Id) ON DELETE CASCADE, CONSTRAINT FK_ArchivoEntregable_Entregable FOREIGN KEY (IdEntregable) REFERENCES Entregable(Id) ON DELETE CASCADE ); -- =========================================== -- Tabla: Actividad -- =========================================== CREATE TABLE Actividad ( Id INT IDENTITY(1,1) PRIMARY KEY, IdEntregable INT NOT NULL, Titulo NVARCHAR(255) NOT NULL, Descripcion NVARCHAR(MAX) NULL, FechaInicio DATE NULL, FechaFinPrevista DATE NULL, FechaModificacion DATE NULL, FechaFinalizacion DATE NULL, Prioridad INT NULL, PorcentajeAvance INT CHECK (PorcentajeAvance BETWEEN 0 AND 100), CONSTRAINT FK_Actividad_Entregable FOREIGN KEY (IdEntregable) REFERENCES Entregable(Id) ON DELETE CASCADE ); -- =========================================== -- Tabla: Presupuesto -- =========================================== CREATE TABLE Presupuesto ( Id INT IDENTITY(1,1) PRIMARY KEY, IdProyecto INT NOT NULL, MontoSolicitado DECIMAL(15,2) NOT NULL, Estado NVARCHAR(20) NOT NULL DEFAULT 'Pendiente' CHECK (Estado IN ('Pendiente','Aprobado','Rechazado')), MontoAprobado DECIMAL(15,2) NULL, PeriodoAnio INT NULL, FechaSolicitud DATE NULL, FechaAprobacion DATE NULL, Observaciones NVARCHAR(MAX) NULL, CONSTRAINT FK_Presupuesto_Proyecto FOREIGN KEY (IdProyecto) REFERENCES Proyecto(Id) ON DELETE CASCADE ); -- =========================================== -- Tabla: DistribucionPresupuesto -- =========================================== CREATE TABLE DistribucionPresupuesto ( Id INT IDENTITY(1,1) PRIMARY KEY, IdPresupuestoPadre INT NOT NULL, IdProyectoHijo INT NOT NULL, MontoAsignado DECIMAL(15,2) NOT NULL, CONSTRAINT FK_Distribucion_Presupuesto FOREIGN KEY (IdPresupuestoPadre) REFERENCES Presupuesto(Id) ON DELETE CASCADE, CONSTRAINT FK_Distribucion_Proyecto FOREIGN KEY (IdProyectoHijo) REFERENCES Proyecto(Id) ON DELETE NO ACTION ); -- =========================================== -- Tabla: EjecucionPresupuesto -- =========================================== CREATE TABLE EjecucionPresupuesto ( Id INT IDENTITY(1,1) PRIMARY KEY, IdPresupuesto INT NOT NULL, Anio INT NOT NULL,

MontoPlaneado DECIMAL(15,2) NULL, MontoEjecutado DECIMAL(15,2) NULL, Observaciones NVARCHAR(MAX) NULL, CONSTRAINT FK_Ejecucion_Presupuesto FOREIGN KEY (IdPresupuesto) REFERENCES Presupuesto(Id) ON DELETE CASCADE ); -- =========================================== -- Tabla: VariableEstrategica -- =========================================== CREATE TABLE VariableEstrategica ( Id INT IDENTITY(1,1) PRIMARY KEY, Titulo NVARCHAR(255) NOT NULL, Descripcion NVARCHAR(MAX) NULL ); -- =========================================== -- Tabla: ObjetivoEstrategico -- =========================================== CREATE TABLE ObjetivoEstrategico ( Id INT IDENTITY(1,1) PRIMARY KEY, IdVariable INT NOT NULL, Titulo NVARCHAR(255) NOT NULL, Descripcion NVARCHAR(MAX) NULL, CONSTRAINT FK_ObjetivoEstrategico_Variable FOREIGN KEY (IdVariable) REFERENCES VariableEstrategica(Id) ON DELETE CASCADE ); -- =========================================== -- Tabla: MetaEstrategica -- =========================================== CREATE TABLE MetaEstrategica ( Id INT IDENTITY(1,1) PRIMARY KEY, IdObjetivo INT NOT NULL, Titulo NVARCHAR(255) NOT NULL, Descripcion NVARCHAR(MAX) NULL, CONSTRAINT FK_MetaEstrategica_Objetivo FOREIGN KEY (IdObjetivo) REFERENCES ObjetivoEstrategico(Id) ON DELETE CASCADE ); -- =========================================== -- Tabla: Meta_Proyecto (relación N:M) -- =========================================== CREATE TABLE Meta_Proyecto ( IdMeta INT NOT NULL, IdProyecto INT NOT NULL, FechaAsociacion DATE NULL, PRIMARY KEY (IdMeta, IdProyecto), CONSTRAINT FK_MetaProyecto_Meta FOREIGN KEY (IdMeta) REFERENCES MetaEstrategica(Id) ON DELETE CASCADE, CONSTRAINT FK_MetaProyecto_Proyecto FOREIGN KEY (IdProyecto) REFERENCES Proyecto(Id) ON DELETE CASCADE );