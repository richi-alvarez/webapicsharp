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



-- CREATE TABLE persona (
--     codigo VARCHAR(20) PRIMARY KEY,
--     nombre VARCHAR(100) NOT NULL,
--     email VARCHAR(100) NOT NULL,
--     telefono VARCHAR(20) NOT NULL
-- );

-- CREATE TABLE empresa (
--     codigo VARCHAR(10) PRIMARY KEY,
--     nombre VARCHAR(200) NOT NULL
-- );

-- CREATE TABLE usuario (
--     email VARCHAR(100) PRIMARY KEY,
--     contrasena VARCHAR(100) NOT NULL
-- );

-- CREATE TABLE rol (
--     id INT IDENTITY(1,1) PRIMARY KEY,
--     nombre VARCHAR(100) UNIQUE NOT NULL
-- );

-- CREATE TABLE ruta (
--     ruta VARCHAR(100) PRIMARY KEY,
--     descripcion VARCHAR(255) NOT NULL
-- );

-- CREATE TABLE cliente (
--     id INT IDENTITY(1,1) PRIMARY KEY,
--     credito NUMERIC(14,2) NOT NULL DEFAULT 0 CHECK (credito >= 0),
--     fkcodpersona VARCHAR(20) NOT NULL UNIQUE REFERENCES persona (codigo),
--     fkcodempresa VARCHAR(10) REFERENCES empresa (codigo)
-- );

-- CREATE TABLE vendedor (
--     id INT IDENTITY(1,1) PRIMARY KEY,
--     carnet INT NOT NULL,
--     direccion VARCHAR(100) NOT NULL,
--     fkcodpersona VARCHAR(20) NOT NULL UNIQUE REFERENCES persona (codigo)
-- );

-- CREATE TABLE rol_usuario (
--     fkemail VARCHAR(100) NOT NULL REFERENCES usuario (email) ON UPDATE CASCADE ON DELETE CASCADE,
--     fkidrol INT NOT NULL REFERENCES rol (id),
--     PRIMARY KEY (fkemail, fkidrol)
-- );

-- CREATE TABLE rutarol (
--     ruta VARCHAR(100) NOT NULL REFERENCES ruta (ruta) ON UPDATE CASCADE ON DELETE CASCADE,
--     rol VARCHAR(100) NOT NULL REFERENCES rol (nombre) ON UPDATE CASCADE ON DELETE CASCADE,
--     PRIMARY KEY (ruta, rol)
-- );

-- CREATE TABLE producto (
--     codigo VARCHAR(30) PRIMARY KEY,
--     nombre VARCHAR(100) NOT NULL,
--     stock INT NOT NULL CHECK (stock >= 0),
--     valorunitario NUMERIC(14,2) NOT NULL CHECK (valorunitario >= 0)
-- );

-- CREATE TABLE factura (
--     numero INT IDENTITY(1,1) PRIMARY KEY,
--     fecha DATETIME2 NOT NULL DEFAULT GETDATE(),
--     total NUMERIC(14,2) NOT NULL DEFAULT 0 CHECK (total >= 0),
--     fkidcliente INT NOT NULL REFERENCES cliente (id),
--     fkidvendedor INT NOT NULL REFERENCES vendedor (id)
-- );

-- CREATE TABLE productosporfactura (
--     fknumfactura INT NOT NULL REFERENCES factura (numero) ON DELETE CASCADE,
--     fkcodproducto VARCHAR(30) NOT NULL REFERENCES producto (codigo),
--     cantidad INT NOT NULL CHECK (cantidad > 0),
--     subtotal NUMERIC(14,2) NOT NULL DEFAULT 0 CHECK (subtotal >= 0),
--     PRIMARY KEY (fknumfactura, fkcodproducto)
-- );
-- GO

-- -- ================================================================
-- -- TRIGGER: Actualizar totales y stock automáticamente
-- -- ================================================================
-- CREATE OR ALTER TRIGGER trigger_actualizar_totales_y_stock
-- ON productosporfactura
-- AFTER INSERT, UPDATE, DELETE
-- AS
-- BEGIN
--     SET NOCOUNT ON;
    
--     IF EXISTS(SELECT * FROM inserted) AND NOT EXISTS(SELECT * FROM deleted)
--     BEGIN
--         UPDATE ppf
--         SET subtotal = i.cantidad * p.valorunitario
--         FROM productosporfactura ppf
--         INNER JOIN inserted i ON ppf.fknumfactura = i.fknumfactura AND ppf.fkcodproducto = i.fkcodproducto
--         INNER JOIN producto p ON p.codigo = i.fkcodproducto;
        
--         UPDATE p
--         SET stock = stock - i.cantidad
--         FROM producto p
--         INNER JOIN inserted i ON p.codigo = i.fkcodproducto;
        
--         UPDATE f
--         SET total = ISNULL((SELECT SUM(subtotal) FROM productosporfactura WHERE fknumfactura = f.numero), 0)
--         FROM factura f
--         INNER JOIN inserted i ON f.numero = i.fknumfactura;
--     END
    
--     IF EXISTS(SELECT * FROM inserted) AND EXISTS(SELECT * FROM deleted)
--     BEGIN
--         UPDATE ppf
--         SET subtotal = i.cantidad * p.valorunitario
--         FROM productosporfactura ppf
--         INNER JOIN inserted i ON ppf.fknumfactura = i.fknumfactura AND ppf.fkcodproducto = i.fkcodproducto
--         INNER JOIN producto p ON p.codigo = i.fkcodproducto;
        
--         UPDATE p
--         SET stock = stock + d.cantidad - i.cantidad
--         FROM producto p
--         INNER JOIN deleted d ON p.codigo = d.fkcodproducto
--         INNER JOIN inserted i ON p.codigo = i.fkcodproducto;
        
--         UPDATE f
--         SET total = ISNULL((SELECT SUM(subtotal) FROM productosporfactura WHERE fknumfactura = f.numero), 0)
--         FROM factura f
--         INNER JOIN inserted i ON f.numero = i.fknumfactura;
--     END
    
--     IF EXISTS(SELECT * FROM deleted) AND NOT EXISTS(SELECT * FROM inserted)
--     BEGIN
--         UPDATE p
--         SET stock = stock + d.cantidad
--         FROM producto p
--         INNER JOIN deleted d ON p.codigo = d.fkcodproducto;
        
--         UPDATE f
--         SET total = ISNULL((SELECT SUM(subtotal) FROM productosporfactura WHERE fknumfactura = f.numero), 0)
--         FROM factura f
--         INNER JOIN deleted d ON f.numero = d.fknumfactura;
--     END
-- END;
-- GO

-- -- ================================================================
-- -- STORED PROCEDURES: Facturas (maestro-detalle)
-- -- ================================================================
-- CREATE OR ALTER PROCEDURE crear_factura_con_detalle
--     @p_fkidcliente INT,
--     @p_fkidvendedor INT,
--     @p_fecha DATETIME2,
--     @p_detalles NVARCHAR(MAX)
-- AS
-- BEGIN
--     SET NOCOUNT ON;
--     DECLARE @v_numfactura INT;
--     DECLARE @ErrorMessage NVARCHAR(4000);
--     DECLARE @ErrorSeverity INT;
--     DECLARE @ErrorState INT;
    
--     BEGIN TRY
--         BEGIN TRANSACTION;
        
--         IF NOT EXISTS (SELECT 1 FROM cliente WHERE id = @p_fkidcliente)
--             THROW 50001, 'El cliente especificado no existe', 1;
        
--         IF NOT EXISTS (SELECT 1 FROM vendedor WHERE id = @p_fkidvendedor)
--             THROW 50002, 'El vendedor especificado no existe', 1;
        
--         INSERT INTO factura (fkidcliente, fkidvendedor, fecha)
--         VALUES (@p_fkidcliente, @p_fkidvendedor, @p_fecha);
        
--         SET @v_numfactura = SCOPE_IDENTITY();
        
--         INSERT INTO productosporfactura (fknumfactura, fkcodproducto, cantidad)
--         SELECT @v_numfactura, fkcodproducto, cantidad
--         FROM OPENJSON(@p_detalles)
--         WITH (fkcodproducto VARCHAR(30) '$.fkcodproducto', cantidad INT '$.cantidad');
        
--         IF EXISTS (
--             SELECT 1 FROM producto p
--             INNER JOIN productosporfactura ppf ON p.codigo = ppf.fkcodproducto
--             WHERE ppf.fknumfactura = @v_numfactura AND p.stock < 0
--         )
--             THROW 50003, 'Stock insuficiente para uno o más productos', 1;
        
--         COMMIT TRANSACTION;
--         SELECT 'Factura ' + CAST(@v_numfactura AS VARCHAR) + ' creada exitosamente' AS Mensaje;
--     END TRY
--     BEGIN CATCH
--         IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
--         SELECT @ErrorMessage = ERROR_MESSAGE(), @ErrorSeverity = ERROR_SEVERITY(), @ErrorState = ERROR_STATE();
--         RAISERROR (@ErrorMessage, @ErrorSeverity, @ErrorState);
--     END CATCH
-- END;
-- GO

-- CREATE OR ALTER PROCEDURE actualizar_factura_con_detalle
--     @p_numfactura INT,
--     @p_fkidcliente INT,
--     @p_fkidvendedor INT,
--     @p_fecha DATETIME2,
--     @p_detalles NVARCHAR(MAX)
-- AS
-- BEGIN
--     SET NOCOUNT ON;
--     DECLARE @ErrorMessage NVARCHAR(4000);
--     DECLARE @ErrorSeverity INT;
--     DECLARE @ErrorState INT;
    
--     BEGIN TRY
--         BEGIN TRANSACTION;
        
--         IF NOT EXISTS (SELECT 1 FROM factura WHERE numero = @p_numfactura)
--             THROW 50004, 'La factura especificada no existe', 1;
        
--         IF NOT EXISTS (SELECT 1 FROM cliente WHERE id = @p_fkidcliente)
--             THROW 50001, 'El cliente especificado no existe', 1;
        
--         IF NOT EXISTS (SELECT 1 FROM vendedor WHERE id = @p_fkidvendedor)
--             THROW 50002, 'El vendedor especificado no existe', 1;
        
--         UPDATE factura
--         SET fkidcliente = @p_fkidcliente, fkidvendedor = @p_fkidvendedor, fecha = @p_fecha
--         WHERE numero = @p_numfactura;
        
--         UPDATE p SET stock = stock + ppf.cantidad
--         FROM producto p
--         INNER JOIN productosporfactura ppf ON p.codigo = ppf.fkcodproducto
--         WHERE ppf.fknumfactura = @p_numfactura;
        
--         DELETE FROM productosporfactura WHERE fknumfactura = @p_numfactura;
        
--         INSERT INTO productosporfactura (fknumfactura, fkcodproducto, cantidad)
--         SELECT @p_numfactura, fkcodproducto, cantidad
--         FROM OPENJSON(@p_detalles)
--         WITH (fkcodproducto VARCHAR(30) '$.fkcodproducto', cantidad INT '$.cantidad');
        
--         IF EXISTS (
--             SELECT 1 FROM producto p
--             INNER JOIN productosporfactura ppf ON p.codigo = ppf.fkcodproducto
--             WHERE ppf.fknumfactura = @p_numfactura AND p.stock < 0
--         )
--             THROW 50003, 'Stock insuficiente para uno o más productos', 1;
        
--         COMMIT TRANSACTION;
--         SELECT 'Factura ' + CAST(@p_numfactura AS VARCHAR) + ' actualizada exitosamente' AS Mensaje;
--     END TRY
--     BEGIN CATCH
--         IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
--         SELECT @ErrorMessage = ERROR_MESSAGE(), @ErrorSeverity = ERROR_SEVERITY(), @ErrorState = ERROR_STATE();
--         RAISERROR (@ErrorMessage, @ErrorSeverity, @ErrorState);
--     END CATCH
-- END;
-- GO

-- CREATE OR ALTER PROCEDURE eliminar_factura_con_detalle
--     @p_numfactura INT
-- AS
-- BEGIN
--     SET NOCOUNT ON;
--     DECLARE @ErrorMessage NVARCHAR(4000);
--     DECLARE @ErrorSeverity INT;
--     DECLARE @ErrorState INT;
    
--     BEGIN TRY
--         BEGIN TRANSACTION;
        
--         IF NOT EXISTS (SELECT 1 FROM factura WHERE numero = @p_numfactura)
--             THROW 50004, 'La factura especificada no existe', 1;
        
--         UPDATE p SET stock = stock + ppf.cantidad
--         FROM producto p
--         INNER JOIN productosporfactura ppf ON p.codigo = ppf.fkcodproducto
--         WHERE ppf.fknumfactura = @p_numfactura;
        
--         DELETE FROM factura WHERE numero = @p_numfactura;
        
--         COMMIT TRANSACTION;
--     END TRY
--     BEGIN CATCH
--         IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
--         SELECT @ErrorMessage = ERROR_MESSAGE(), @ErrorSeverity = ERROR_SEVERITY(), @ErrorState = ERROR_STATE();
--         RAISERROR (@ErrorMessage, @ErrorSeverity, @ErrorState);
--     END CATCH
-- END;
-- GO

-- CREATE OR ALTER FUNCTION consultar_factura_con_detalle(@p_numfactura INT)
-- RETURNS NVARCHAR(MAX)
-- AS
-- BEGIN
--     DECLARE @resultado NVARCHAR(MAX);
    
--     SELECT @resultado = (
--         SELECT 
--             f.numero, f.fecha, f.total,
--             c.fkcodpersona AS cliente,
--             v.fkcodpersona AS vendedor,
--             (
--                 SELECT d.fkcodproducto, d.cantidad, d.subtotal, p.valorunitario
--                 FROM productosporfactura d
--                 INNER JOIN producto p ON p.codigo = d.fkcodproducto
--                 WHERE d.fknumfactura = f.numero
--                 FOR JSON PATH
--             ) AS detalle
--         FROM factura f
--         INNER JOIN cliente c ON c.id = f.fkidcliente
--         INNER JOIN vendedor v ON v.id = f.fkidvendedor
--         WHERE f.numero = @p_numfactura
--         FOR JSON PATH, WITHOUT_ARRAY_WRAPPER
--     );
    
--     RETURN @resultado;
-- END;
-- GO

-- -- ================================================================
-- -- STORED PROCEDURES: Usuarios con Roles
-- -- NOTA: El cifrado lo hace la API C# con el parámetro camposEncriptar
-- -- ================================================================
-- CREATE OR ALTER PROCEDURE crear_usuario_con_roles
--     @p_email VARCHAR(100),
--     @p_contrasena VARCHAR(100),
--     @p_roles NVARCHAR(MAX)
-- AS
-- BEGIN
--     SET NOCOUNT ON;
--     DECLARE @ErrorMessage NVARCHAR(4000), @ErrorSeverity INT, @ErrorState INT;
    
--     BEGIN TRY
--         BEGIN TRANSACTION;
        
--         IF EXISTS (SELECT 1 FROM usuario WHERE email = @p_email)
--             THROW 50005, 'El usuario ya existe', 1;
        
--         INSERT INTO usuario (email, contrasena) VALUES (@p_email, @p_contrasena);
        
--         INSERT INTO rol_usuario (fkemail, fkidrol)
--         SELECT @p_email, fkidrol
--         FROM OPENJSON(@p_roles) WITH (fkidrol INT '$.fkidrol');
        
--         COMMIT TRANSACTION;
--     END TRY
--     BEGIN CATCH
--         IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
--         SELECT @ErrorMessage = ERROR_MESSAGE(), @ErrorSeverity = ERROR_SEVERITY(), @ErrorState = ERROR_STATE();
--         RAISERROR (@ErrorMessage, @ErrorSeverity, @ErrorState);
--     END CATCH
-- END;
-- GO

-- CREATE OR ALTER PROCEDURE actualizar_usuario_con_roles
--     @p_email VARCHAR(100),
--     @p_contrasena VARCHAR(100),
--     @p_roles NVARCHAR(MAX)
-- AS
-- BEGIN
--     SET NOCOUNT ON;
--     DECLARE @ErrorMessage NVARCHAR(4000), @ErrorSeverity INT, @ErrorState INT;
    
--     BEGIN TRY
--         BEGIN TRANSACTION;
        
--         IF NOT EXISTS (SELECT 1 FROM usuario WHERE email = @p_email)
--             THROW 50006, 'El usuario no existe', 1;
        
--         IF @p_contrasena IS NOT NULL AND @p_contrasena != ''
--             UPDATE usuario SET contrasena = @p_contrasena WHERE email = @p_email;
        
--         DELETE FROM rol_usuario WHERE fkemail = @p_email;
        
--         INSERT INTO rol_usuario (fkemail, fkidrol)
--         SELECT @p_email, fkidrol
--         FROM OPENJSON(@p_roles) WITH (fkidrol INT '$.fkidrol');
        
--         COMMIT TRANSACTION;
--     END TRY
--     BEGIN CATCH
--         IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
--         SELECT @ErrorMessage = ERROR_MESSAGE(), @ErrorSeverity = ERROR_SEVERITY(), @ErrorState = ERROR_STATE();
--         RAISERROR (@ErrorMessage, @ErrorSeverity, @ErrorState);
--     END CATCH
-- END;
-- GO

-- CREATE OR ALTER PROCEDURE eliminar_usuario_con_roles
--     @p_email VARCHAR(100)
-- AS
-- BEGIN
--     SET NOCOUNT ON;
--     DECLARE @ErrorMessage NVARCHAR(4000), @ErrorSeverity INT, @ErrorState INT;
    
--     BEGIN TRY
--         BEGIN TRANSACTION;
        
--         IF NOT EXISTS (SELECT 1 FROM usuario WHERE email = @p_email)
--             THROW 50006, 'El usuario no existe', 1;
        
--         DELETE FROM rol_usuario WHERE fkemail = @p_email;
--         DELETE FROM usuario WHERE email = @p_email;
        
--         COMMIT TRANSACTION;
--     END TRY
--     BEGIN CATCH
--         IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
--         SELECT @ErrorMessage = ERROR_MESSAGE(), @ErrorSeverity = ERROR_SEVERITY(), @ErrorState = ERROR_STATE();
--         RAISERROR (@ErrorMessage, @ErrorSeverity, @ErrorState);
--     END CATCH
-- END;
-- GO

-- CREATE OR ALTER FUNCTION consultar_usuario_con_roles(@p_email VARCHAR(100))
-- RETURNS NVARCHAR(MAX)
-- AS
-- BEGIN
--     DECLARE @resultado NVARCHAR(MAX);
    
--     SELECT @resultado = (
--         SELECT u.email,
--             (
--                 SELECT r.id AS idrol, r.nombre
--                 FROM rol_usuario ru
--                 INNER JOIN rol r ON r.id = ru.fkidrol
--                 WHERE ru.fkemail = u.email
--                 FOR JSON PATH
--             ) AS roles
--         FROM usuario u
--         WHERE u.email = @p_email
--         FOR JSON PATH, WITHOUT_ARRAY_WRAPPER
--     );
    
--     RETURN @resultado;
-- END;
-- GO

-- CREATE OR ALTER FUNCTION listar_usuarios_con_roles()
-- RETURNS NVARCHAR(MAX)
-- AS
-- BEGIN
--     DECLARE @resultado NVARCHAR(MAX);
    
--     SELECT @resultado = (
--         SELECT u.email,
--             (
--                 SELECT r.id AS idrol, r.nombre
--                 FROM rol_usuario ru
--                 INNER JOIN rol r ON r.id = ru.fkidrol
--                 WHERE ru.fkemail = u.email
--                 FOR JSON PATH
--             ) AS roles
--         FROM usuario u
--         FOR JSON PATH
--     );
    
--     RETURN ISNULL(@resultado, '[]');
-- END;
-- GO

-- -- ================================================================
-- -- STORED PROCEDURES: Permisos (RBAC)
-- -- ================================================================
-- CREATE OR ALTER FUNCTION verificar_acceso_ruta(
--     @p_email VARCHAR(100),
--     @p_ruta VARCHAR(100)
-- )
-- RETURNS NVARCHAR(MAX)
-- AS
-- BEGIN
--     DECLARE @v_tiene_acceso BIT = 0;
--     DECLARE @resultado NVARCHAR(MAX);
    
--     IF EXISTS (
--         SELECT 1
--         FROM usuario u
--         INNER JOIN rol_usuario ur ON u.email = ur.fkemail
--         INNER JOIN rol r ON ur.fkidrol = r.id
--         INNER JOIN rutarol rr ON r.nombre = rr.rol
--         WHERE u.email = @p_email AND rr.ruta = @p_ruta
--     )
--         SET @v_tiene_acceso = 1;
    
--     SELECT @resultado = (
--         SELECT @v_tiene_acceso AS tiene_acceso, @p_email AS email, @p_ruta AS ruta
--         FOR JSON PATH, WITHOUT_ARRAY_WRAPPER
--     );
    
--     RETURN @resultado;
-- END;
-- GO

-- CREATE OR ALTER PROCEDURE listar_rutarol
-- AS
-- BEGIN
--     SET NOCOUNT ON;
--     SELECT ruta, rol FROM rutarol ORDER BY ruta, rol;
-- END;
-- GO

-- CREATE OR ALTER PROCEDURE crear_rutarol
--     @p_ruta VARCHAR(100),
--     @p_rol VARCHAR(100)
-- AS
-- BEGIN
--     SET NOCOUNT ON;
    
--     IF NOT EXISTS (SELECT 1 FROM rol WHERE nombre = @p_rol)
--     BEGIN
--         SELECT 0 AS success, 'El rol especificado no existe' AS message FOR JSON PATH, WITHOUT_ARRAY_WRAPPER;
--         RETURN;
--     END
    
--     IF EXISTS (SELECT 1 FROM rutarol WHERE ruta = @p_ruta AND rol = @p_rol)
--     BEGIN
--         SELECT 0 AS success, 'El permiso ya existe' AS message FOR JSON PATH, WITHOUT_ARRAY_WRAPPER;
--         RETURN;
--     END
    
--     INSERT INTO rutarol (ruta, rol) VALUES (@p_ruta, @p_rol);
--     SELECT 1 AS success, 'Permiso creado exitosamente' AS message FOR JSON PATH, WITHOUT_ARRAY_WRAPPER;
-- END;
-- GO

-- CREATE OR ALTER PROCEDURE eliminar_rutarol
--     @p_ruta VARCHAR(100),
--     @p_rol VARCHAR(100)
-- AS
-- BEGIN
--     SET NOCOUNT ON;
    
--     IF NOT EXISTS (SELECT 1 FROM rutarol WHERE ruta = @p_ruta AND rol = @p_rol)
--     BEGIN
--         SELECT 0 AS success, 'El permiso no existe' AS message FOR JSON PATH, WITHOUT_ARRAY_WRAPPER;
--         RETURN;
--     END
    
--     DELETE FROM rutarol WHERE ruta = @p_ruta AND rol = @p_rol;
--     SELECT 1 AS success, 'Permiso eliminado exitosamente' AS message FOR JSON PATH, WITHOUT_ARRAY_WRAPPER;
-- END;
-- GO

-- -- ================================================================
-- -- DATOS INICIALES
-- -- ================================================================
-- INSERT INTO rol (nombre) VALUES ('Administrador'),('Vendedor'),('Cajero'),('Contador'),('Cliente');
-- INSERT INTO empresa (codigo, nombre) VALUES ('E001', 'Comercial Los Andes S.A.'),('E002', 'Distribuciones El Centro S.A.');
-- INSERT INTO persona (codigo, nombre, email, telefono) VALUES
-- ('P001', 'Ana Torres', 'ana.torres@correo.com', '3011111111'),
-- ('P002', 'Carlos Pérez', 'carlos.perez@correo.com', '3022222222'),
-- ('P003', 'María Gómez', 'maria.gomez@correo.com', '3033333333'),
-- ('P004', 'Juan Díaz', 'juan.diaz@correo.com', '3044444444'),
-- ('P005', 'Laura Rojas', 'laura.rojas@correo.com', '3055555555'),
-- ('P006', 'Pedro Castillo', 'pedro.castillo@correo.com', '3066666666');
-- INSERT INTO cliente (credito, fkcodpersona, fkcodempresa) VALUES (500000, 'P001', 'E001'),(250000, 'P003', 'E002'),(400000, 'P005', 'E001');
-- INSERT INTO vendedor (carnet, direccion, fkcodpersona) VALUES (1001, 'Calle 10 #5-33', 'P002'),(1002, 'Carrera 15 #7-20', 'P004'),(1003, 'Avenida 30 #18-09', 'P006');
-- INSERT INTO producto (codigo, nombre, stock, valorunitario) VALUES
-- ('PR001', 'Laptop Lenovo IdeaPad', 20, 2500000),
-- ('PR002', 'Monitor Samsung 24"', 30, 800000),
-- ('PR003', 'Teclado Logitech K380', 50, 150000),
-- ('PR004', 'Mouse HP', 60, 90000),
-- ('PR005', 'Impresora Epson EcoTank', 15, 1100000),
-- ('PR006', 'Auriculares Sony WH-CH510', 25, 240000),
-- ('PR007', 'Tablet Samsung Tab A9', 18, 950000),
-- ('PR008', 'Disco Duro Seagate 1TB', 35, 280000);

-- EXEC crear_usuario_con_roles 'admin@correo.com', 'admin123', '[{"fkidrol":1}]';
-- EXEC crear_usuario_con_roles 'vendedor1@correo.com', 'vend123', '[{"fkidrol":2},{"fkidrol":3}]';
-- EXEC crear_usuario_con_roles 'jefe@correo.com', 'jefe123', '[{"fkidrol":1},{"fkidrol":3},{"fkidrol":4}]';
-- EXEC crear_usuario_con_roles 'cliente1@correo.com', 'cli123', '[{"fkidrol":5}]';

-- EXEC crear_factura_con_detalle 1, 1, '2025-10-15', '[{"fkcodproducto":"PR001","cantidad":1},{"fkcodproducto":"PR004","cantidad":2}]';
-- EXEC crear_factura_con_detalle 2, 2, '2025-10-16', '[{"fkcodproducto":"PR002","cantidad":2},{"fkcodproducto":"PR005","cantidad":1}]';
-- EXEC crear_factura_con_detalle 3, 3, '2025-10-17', '[{"fkcodproducto":"PR003","cantidad":3},{"fkcodproducto":"PR007","cantidad":1}]';

-- INSERT INTO ruta (ruta, descripcion) VALUES
-- ('/home', 'Página principal - Dashboard'),
-- ('/usuarios', 'Gestión de usuarios'),
-- ('/facturas', 'Gestión de facturas'),
-- ('/clientes', 'Gestión de clientes'),
-- ('/vendedores', 'Gestión de vendedores'),
-- ('/personas', 'Gestión de personas'),
-- ('/empresas', 'Gestión de empresas'),
-- ('/productos', 'Gestión de productos'),
-- ('/roles', 'Gestión de roles'),
-- ('/permisos', 'Gestión de permisos (asignación rol-ruta)'),
-- ('/permisos/crear', 'Crear permiso (POST)'),
-- ('/permisos/eliminar', 'Eliminar permiso (POST)'),
-- ('/rutas', 'Gestión de rutas del sistema'),
-- ('/rutas/crear', 'Crear ruta (POST)'),
-- ('/rutas/eliminar', 'Eliminar ruta (POST)');

-- INSERT INTO rutarol (ruta, rol) VALUES 
-- ('/home', 'Administrador'),('/usuarios', 'Administrador'),('/facturas', 'Administrador'),('/clientes', 'Administrador'),('/vendedores', 'Administrador'),('/personas', 'Administrador'),('/empresas', 'Administrador'),('/productos', 'Administrador'),('/roles', 'Administrador'),('/permisos', 'Administrador'),('/permisos/crear', 'Administrador'),('/permisos/eliminar', 'Administrador'),('/rutas', 'Administrador'),('/rutas/crear', 'Administrador'),('/rutas/eliminar', 'Administrador'),
-- ('/home', 'Vendedor'),('/facturas', 'Vendedor'),('/clientes', 'Vendedor'),
-- ('/home', 'Cajero'),('/facturas', 'Cajero'),
-- ('/home', 'Contador'),('/clientes', 'Contador'),('/productos', 'Contador'),
-- ('/home', 'Cliente'),('/productos', 'Cliente');
-- GO