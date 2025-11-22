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
    CREATE DATABASE IF NOT EXISTS mariadb;
    USE mariadb;

-- SQL Server:
-- IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = N'postgresdb')
--     CREATE DATABASE postgresdb;
-- GO
-- USE postgresdb;
-- GO

-- ===============================================
-- CREACIÓN DE USUARIOS Y PERMISOS
-- ===============================================

-- PostgreSQL:
-- CREATE USER appuser WITH PASSWORD 'app_pass';
-- GRANT ALL PRIVILEGES ON DATABASE postgresdb TO appuser;

-- MySQL/MariaDB:
    --CREATE USER 'appuser'@'%' IDENTIFIED BY 'app_pass';
    --GRANT ALL PRIVILEGES ON mariadb.* TO 'appuser'@'%';
    --FLUSH PRIVILEGES;

-- SQL Server:
-- CREATE LOGIN appuser WITH PASSWORD = 'app_pass';
-- CREATE USER appuser FOR LOGIN appuser;
-- ALTER ROLE db_owner ADD MEMBER appuser;

-- ===============================================
-- CREACIÓN DE TABLAS (sintaxis unificada)
-- Ajustar IDENTITY / AUTO_INCREMENT / SERIAL según motor
-- ===============================================
CREATE TABLE WeatherForecast (
    Date date NOT NULL,
    TemperatureC int NOT NULL,
    Summary varchar(255) NULL,
    -- No necesitamos columna para TemperatureF porque es calculada en la aplicación
    PRIMARY KEY (Date)
);

-- Tabla para almacenar configuraciones JWT
CREATE TABLE configuracionjwt (
    Id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    ClaveSecreta VARCHAR(500) NOT NULL,
    Issuer VARCHAR(100) NOT NULL,
    Audience VARCHAR(100) NOT NULL,
    DuracionMinutos INT NOT NULL DEFAULT 15,
    FechaCreacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FechaActualizacion DATETIME NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
    Activo BOOLEAN NOT NULL DEFAULT TRUE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

-- Índices para mejorar el rendimiento
CREATE INDEX IX_configuracionjwt_Issuer ON configuracionjwt(Issuer);
CREATE INDEX IX_configuracionjwt_Audience ON configuracionjwt(Audience);
CREATE INDEX IX_configuracionjwt_Activo ON configuracionjwt(Activo);

-- Insertar configuración por defecto
INSERT INTO configuracionjwt (ClaveSecreta, Issuer, Audience, DuracionMinutos, Activo)
VALUES 
('ClaveSuperSecreta123456', 'webapicsharp', 'clientes', 15, TRUE);


CREATE TABLE Usuario (
    Id INT NOT NULL AUTO_INCREMENT,
    Email VARCHAR(255) NOT NULL,
    Contrasena VARCHAR(255) NOT NULL,
    RutaAvatar VARCHAR(255) NOT NULL,
    Activo BOOLEAN NOT NULL,
    PRIMARY KEY (Id),
    UNIQUE KEY UQ_Usuario_Email (Email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO Usuario (Email, Contrasena, RutaAvatar, Activo)
VALUES 
('juan.perez@example.com', '12345678', '/avatars/juan.png', TRUE),
('maria.gomez@example.com', 'maria123', '/avatars/maria.png', TRUE),
('carlos.lopez@example.com', 'carlos2024', '/avatars/carlos.png', FALSE);

CREATE TABLE Rol ( 
    Id INT NOT NULL AUTO_INCREMENT, 
    nombre VARCHAR(255) NOT NULL, 
    PRIMARY KEY (Id) 
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO Rol (nombre) VALUES ('Administrador'),('Vendedor'),('Cajero'),('Contador'),('Cliente');

CREATE TABLE Usuario_rol (
    IdUsuario INT NOT NULL,
    IdRol INT NOT NULL,
    PRIMARY KEY (IdUsuario, IdRol),
    CONSTRAINT FK_UsuarioRol_Usuario FOREIGN KEY (IdUsuario) REFERENCES Usuario(Id) ON DELETE CASCADE,
    CONSTRAINT FK_UsuarioRol_Rol FOREIGN KEY (IdRol) REFERENCES Rol(Id) ON DELETE CASCADE
);

CREATE TABLE TipoResponsable (
    Id INT NOT NULL AUTO_INCREMENT,
    Titulo VARCHAR(50) NOT NULL,
    Descripcion VARCHAR(255) NOT NULL,
    CONSTRAINT UQ_TipoResponsable_Titulo UNIQUE (Titulo),
    PRIMARY KEY (Id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO TipoResponsable (Titulo, Descripcion) VALUES
  ('Product Owner', 'Responsable de maximizar el valor del producto.'),
  ('Scrum Master', 'Facilita el proceso Scrum y elimina impedimentos.'),
  ('Desarrollador', 'Implementa funcionalidades y corrige errores.');

CREATE TABLE Responsable (
    Id INT NOT NULL AUTO_INCREMENT,
    IdTipoResponsable INT NOT NULL,
    IdUsuario INT NOT NULL,
    Nombre VARCHAR(255) NOT NULL,
    PRIMARY KEY (Id),
    CONSTRAINT FK_Responsable_TipoResponsable FOREIGN KEY (IdTipoResponsable) REFERENCES TipoResponsable(Id),
    CONSTRAINT FK_Responsable_Usuario FOREIGN KEY (IdUsuario) REFERENCES Usuario(Id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO Responsable (IdTipoResponsable, IdUsuario, Nombre) VALUES
  (1, 1, 'Juan Pérez'),
  (2, 2, 'María Gómez'),
  (3, 3, 'Carlos López');



CREATE TABLE TipoProyecto (
    Id INT NOT NULL AUTO_INCREMENT,
    Nombre VARCHAR(150) NOT NULL,
    Descripcion VARCHAR(255) NOT NULL,
    CONSTRAINT UQ_TipoProyecto_Nombre UNIQUE (Nombre),
    PRIMARY KEY (Id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO TipoProyecto (Nombre, Descripcion)
VALUES 
('Desarrollo Web', 'Proyecto enfocado en la creación de sitios o aplicaciones web.'),
('Aplicación Móvil', 'Proyecto orientado al desarrollo de apps móviles en Android o iOS.'),
('Automatización', 'Proyectos relacionados con la automatización de procesos empresariales.');


CREATE TABLE Estado (
    Id INT NOT NULL AUTO_INCREMENT,
    Nombre VARCHAR(50) NOT NULL,
    Descripcion VARCHAR(255) NOT NULL,
    CONSTRAINT UQ_Estado_Nombre UNIQUE (Nombre),
    PRIMARY KEY (Id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO Estado (Nombre, Descripcion)
VALUES 
('En Progreso', 'El proyecto se encuentra actualmente en desarrollo.'),
('Completado', 'El proyecto ha finalizado exitosamente.'),
('Pendiente', 'El proyecto está en espera de ser iniciado.');



CREATE TABLE Proyecto (
    Id INT NOT NULL AUTO_INCREMENT,
    IdProyectoPadre INT NULL,
    IdResponsable INT NOT NULL,
    IdTipoProyecto INT NOT NULL,
    Codigo VARCHAR(50) NULL,
    Titulo VARCHAR(255) NOT NULL,
    Descripcion LONGTEXT NULL,
    FechaInicio DATE NULL,
    FechaFinPrevista DATE NULL,
    FechaModificacion DATE NULL,
    FechaFinalizacion DATE NULL,
    RutaLogo LONGTEXT NULL,
    PRIMARY KEY (Id),
    CONSTRAINT FK_Proyecto_ProyectoPadre FOREIGN KEY (IdProyectoPadre)
        REFERENCES Proyecto(Id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT FK_Proyecto_Responsable FOREIGN KEY (IdResponsable)
        REFERENCES Responsable(Id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT FK_Proyecto_TipoProyecto FOREIGN KEY (IdTipoProyecto)
        REFERENCES TipoProyecto(Id)
        ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX IX_Proyecto_IdProyectoPadre ON Proyecto(IdProyectoPadre);
CREATE INDEX IX_Proyecto_IdResponsable ON Proyecto(IdResponsable);
CREATE INDEX IX_Proyecto_IdTipoProyecto ON Proyecto(IdTipoProyecto);

INSERT INTO Proyecto (
  IdProyectoPadre, IdResponsable, IdTipoProyecto, Codigo, Titulo, Descripcion,
  FechaInicio, FechaFinPrevista, FechaModificacion, FechaFinalizacion, RutaLogo
) VALUES
  (NULL, 1, 1, 'PRJ-001', 'Sitio corporativo', 'Desarrollo de sitio web corporativo.',
   '2025-11-01', '2026-01-31', NULL, NULL, '/logos/proyecto1.png'),
  (NULL, 2, 2, 'PRJ-002', 'App móvil clientes', 'Aplicación móvil para clientes.',
   '2025-11-15', '2026-03-15', NULL, NULL, '/logos/proyecto2.png'),
  (NULL, 3, 3, 'PRJ-003', 'Automatización logística', 'Automatización de procesos logísticos.',
   '2025-12-01', '2026-04-30', NULL, NULL, '/logos/proyecto3.png');

CREATE TABLE Estado_Proyecto (
    IdProyecto INT NOT NULL,
    IdEstado INT NOT NULL,
    PRIMARY KEY (IdProyecto),
    CONSTRAINT FK_EstadoProyecto_Proyecto
        FOREIGN KEY (IdProyecto) REFERENCES Proyecto(Id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT FK_EstadoProyecto_Estado
        FOREIGN KEY (IdEstado) REFERENCES Estado(Id)
        ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Índice para mejorar consultas por estado
CREATE INDEX IX_Estado_Proyecto_IdEstado ON Estado_Proyecto(IdEstado);

-- Datos de prueba (asumiendo Proyecto Id 1..3 y Estado Id 1..3 ya insertados)
INSERT INTO Estado_Proyecto (IdProyecto, IdEstado) VALUES
  (1, 1), -- Proyecto 1 -> En Progreso
  (2, 2), -- Proyecto 2 -> Completado
  (3, 3); -- Proyecto 3 -> Pendiente


CREATE TABLE TipoProducto (
    Id INT NOT NULL AUTO_INCREMENT,
    Nombre VARCHAR(150) NOT NULL,
    Descripcion VARCHAR(255) NOT NULL,
    CONSTRAINT UQ_TipoProducto_Nombre UNIQUE (Nombre),
    PRIMARY KEY (Id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO TipoProducto (Nombre, Descripcion) VALUES
  ('Software', 'Productos de software y licencias.'),
  ('Hardware', 'Equipos y dispositivos físicos.'),
  ('Servicios', 'Servicios de soporte y consultoría.');


CREATE TABLE Producto (
    Id INT NOT NULL AUTO_INCREMENT,
    IdTipoProducto INT NOT NULL,
    Codigo VARCHAR(50) NULL,
    Titulo VARCHAR(255) NOT NULL,
    Descripcion LONGTEXT NULL,
    FechaInicio DATE NULL,
    FechaFinPrevista DATE NULL,
    FechaModificacion DATE NULL,
    FechaFinalizacion DATE NULL,
    RutaLogo LONGTEXT NULL,
    PRIMARY KEY (Id),
    CONSTRAINT FK_Producto_TipoProducto
        FOREIGN KEY (IdTipoProducto) REFERENCES TipoProducto(Id)
        ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


INSERT INTO Producto (
  IdTipoProducto, Codigo, Titulo, Descripcion,
  FechaInicio, FechaFinPrevista, FechaModificacion, FechaFinalizacion, RutaLogo
) VALUES
  (1, 'PRD-001', 'Licencia CRM', 'Licencia anual de CRM para 10 usuarios.',
   '2025-11-01', '2026-11-01', NULL, NULL, '/logos/producto1.png'),
  (2, 'PRD-002', 'Servidor Rack 2U', 'Servidor para data center con 64GB RAM.',
   '2025-11-15', '2026-02-28', NULL, NULL, '/logos/producto2.png'),
  (3, 'PRD-003', 'Soporte Premium', 'Soporte y consultoría por 12 meses.',
   '2025-12-01', '2026-12-01', NULL, NULL, '/logos/producto3.png');

 CREATE TABLE Proyecto_Producto (
    IdProyecto INT NOT NULL,
    IdProducto INT NOT NULL,
    FechaAsociacion DATE NULL,
    PRIMARY KEY (IdProyecto, IdProducto),
    CONSTRAINT FK_ProyectoProducto_Proyecto
        FOREIGN KEY (IdProyecto) REFERENCES Proyecto(Id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT FK_ProyectoProducto_Producto
        FOREIGN KEY (IdProducto) REFERENCES Producto(Id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Índice opcional para consultas por producto
CREATE INDEX IX_Proyecto_Producto_IdProducto ON Proyecto_Producto(IdProducto);

-- Datos de prueba (asume Proyecto Id 1..3 y Producto Id 1..3)
INSERT INTO Proyecto_Producto (IdProyecto, IdProducto, FechaAsociacion) VALUES
  (1, 1, '2025-11-05'),
  (2, 2, '2025-11-20'),
  (3, 3, '2025-12-05');

-- 


CREATE TABLE Entregable (
    Id INT NOT NULL AUTO_INCREMENT,
    Codigo VARCHAR(50) NULL,
    Titulo VARCHAR(255) NOT NULL,
    Descripcion LONGTEXT NULL,
    FechaInicio DATE NULL,
    FechaFinPrevista DATE NULL,
    FechaModificacion DATE NULL,
    FechaFinalizacion DATE NULL,
    PRIMARY KEY (Id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3 registros de prueba
INSERT INTO Entregable (
    Codigo, Titulo, Descripcion, 
    FechaInicio, FechaFinPrevista, FechaModificacion, FechaFinalizacion
) VALUES
    ('ENT-001', 'Análisis de Requisitos', 'Documento completo de análisis y requisitos del sistema.',
     '2025-11-01', '2025-11-15', NULL, NULL),
    ('ENT-002', 'Diseño de Base de Datos', 'Diseño completo del modelo de datos y estructura de BD.',
     '2025-11-16', '2025-11-30', NULL, NULL),
    ('ENT-003', 'Prototipo Funcional', 'Prototipo funcional con las características principales.',
     '2025-12-01', '2025-12-20', NULL, NULL);

CREATE TABLE Producto_Entregable (
    IdProducto INT NOT NULL,
    IdEntregable INT NOT NULL,
    FechaAsociacion DATE NULL,
    PRIMARY KEY (IdProducto, IdEntregable),
    CONSTRAINT FK_ProductoEntregable_Producto
        FOREIGN KEY (IdProducto) REFERENCES Producto(Id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT FK_ProductoEntregable_Entregable
        FOREIGN KEY (IdEntregable) REFERENCES Entregable(Id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Índice opcional para consultas por entregable
CREATE INDEX IX_Producto_Entregable_IdEntregable ON Producto_Entregable(IdEntregable);

-- Datos de prueba (asume Producto Id 1..3 y Entregable Id 1..3)
INSERT INTO Producto_Entregable (IdProducto, IdEntregable, FechaAsociacion) VALUES
  (1, 1, '2025-11-02'), -- Licencia CRM -> Análisis de Requisitos
  (2, 2, '2025-11-17'), -- Servidor Rack -> Diseño de BD
  (3, 3, '2025-12-02'); -- Soporte Premium -> Prototipo Funcional

CREATE TABLE Responsable_Entregable (
    IdResponsable INT NOT NULL,
    IdEntregable INT NOT NULL,
    FechaAsociacion DATE NULL,
    PRIMARY KEY (IdResponsable, IdEntregable),
    CONSTRAINT FK_ResponsableEntregable_Responsable
        FOREIGN KEY (IdResponsable) REFERENCES Responsable(Id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT FK_ResponsableEntregable_Entregable
        FOREIGN KEY (IdEntregable) REFERENCES Entregable(Id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Índice opcional para consultas por entregable
CREATE INDEX IX_Responsable_Entregable_IdEntregable ON Responsable_Entregable(IdEntregable);

-- Datos de prueba (asume Responsable Id 1..3 y Entregable Id 1..3)
INSERT INTO Responsable_Entregable (IdResponsable, IdEntregable, FechaAsociacion) VALUES
  (1, 1, '2025-11-01'), -- Juan Pérez -> Análisis de Requisitos
  (2, 2, '2025-11-16'), -- María Gómez -> Diseño de BD
  (3, 3, '2025-12-01'); -- Carlos López -> Prototipo Funcional






CREATE TABLE Archivo (
    Id INT NOT NULL AUTO_INCREMENT,
    IdUsuario INT NOT NULL,
    Ruta LONGTEXT NOT NULL,
    Nombre VARCHAR(255) NOT NULL,
    Tipo VARCHAR(50) NULL,
    Fecha DATE NULL,
    PRIMARY KEY (Id),
    CONSTRAINT FK_Archivo_Usuario
        FOREIGN KEY (IdUsuario) REFERENCES Usuario(Id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Índice para optimizar consultas por usuario
CREATE INDEX IX_Archivo_IdUsuario ON Archivo(IdUsuario);

-- Datos de prueba (asume Usuario Id 1..3)
INSERT INTO Archivo (IdUsuario, Ruta, Nombre, Tipo, Fecha) VALUES
  (1, '/uploads/documentos/requisitos_proyecto.pdf', 'Requisitos del Proyecto', 'PDF', '2025-11-01'),
  (2, '/uploads/imagenes/diagrama_bd.png', 'Diagrama Base de Datos', 'PNG', '2025-11-16'),
  (3, '/uploads/codigo/prototipo_v1.zip', 'Prototipo Versión 1', 'ZIP', '2025-12-01');


CREATE TABLE Archivo_Entregable (
    IdArchivo INT NOT NULL,
    IdEntregable INT NOT NULL,
    PRIMARY KEY (IdArchivo, IdEntregable),
    CONSTRAINT FK_ArchivoEntregable_Archivo
        FOREIGN KEY (IdArchivo) REFERENCES Archivo(Id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT FK_ArchivoEntregable_Entregable
        FOREIGN KEY (IdEntregable) REFERENCES Entregable(Id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Índice opcional para consultas por entregable
CREATE INDEX IX_Archivo_Entregable_IdEntregable ON Archivo_Entregable(IdEntregable);

-- Datos de prueba (asume Archivo Id 1..3 y Entregable Id 1..3)
INSERT INTO Archivo_Entregable (IdArchivo, IdEntregable) VALUES
  (1, 1), -- Requisitos del Proyecto -> Análisis de Requisitos
  (2, 2), -- Diagrama Base de Datos -> Diseño de BD
  (3, 3); -- Prototipo Versión 1 -> Prototipo Funcional


CREATE TABLE Actividad (
    Id INT NOT NULL AUTO_INCREMENT,
    IdEntregable INT NOT NULL,
    Titulo VARCHAR(255) NOT NULL,
    Descripcion LONGTEXT NULL,
    FechaInicio DATE NULL,
    FechaFinPrevista DATE NULL,
    FechaModificacion DATE NULL,
    FechaFinalizacion DATE NULL,
    Prioridad INT NULL,
    PorcentajeAvance INT NULL CHECK (PorcentajeAvance BETWEEN 0 AND 100),
    PRIMARY KEY (Id),
    CONSTRAINT FK_Actividad_Entregable
        FOREIGN KEY (IdEntregable) REFERENCES Entregable(Id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Índice para optimizar consultas por entregable
CREATE INDEX IX_Actividad_IdEntregable ON Actividad(IdEntregable);

-- Datos de prueba (asume Entregable Id 1..3)
INSERT INTO Actividad (
    IdEntregable, Titulo, Descripcion, 
    FechaInicio, FechaFinPrevista, FechaModificacion, FechaFinalizacion,
    Prioridad, PorcentajeAvance
) VALUES
    (1, 'Recolección de requisitos funcionales', 'Entrevistar stakeholders y documentar requisitos funcionales del sistema.',
     '2025-11-01', '2025-11-08', NULL, NULL, 1, 25),
    (2, 'Modelado de entidades', 'Crear modelo entidad-relación y definir estructura de tablas.',
     '2025-11-16', '2025-11-23', NULL, NULL, 2, 50),
    (3, 'Desarrollo de interfaz principal', 'Implementar pantallas principales del prototipo funcional.',
     '2025-12-01', '2025-12-10', NULL, NULL, 1, 0);

CREATE TABLE Presupuesto (
    Id INT NOT NULL AUTO_INCREMENT,
    IdProyecto INT NOT NULL,
    MontoSolicitado DECIMAL(15,2) NOT NULL,
    Estado VARCHAR(20) NOT NULL DEFAULT 'Pendiente' 
        CHECK (Estado IN ('Pendiente','Aprobado','Rechazado')),
    MontoAprobado DECIMAL(15,2) NULL,
    PeriodoAnio INT NULL,
    FechaSolicitud DATE NULL,
    FechaAprobacion DATE NULL,
    Observaciones LONGTEXT NULL,
    PRIMARY KEY (Id),
    CONSTRAINT FK_Presupuesto_Proyecto
        FOREIGN KEY (IdProyecto) REFERENCES Proyecto(Id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Índice para optimizar consultas por proyecto
CREATE INDEX IX_Presupuesto_IdProyecto ON Presupuesto(IdProyecto);

-- Datos de prueba (asume Proyecto Id 1..3)
INSERT INTO Presupuesto (
    IdProyecto, MontoSolicitado, Estado, MontoAprobado, 
    PeriodoAnio, FechaSolicitud, FechaAprobacion, Observaciones
) VALUES
    (1, 150000.00, 'Aprobado', 140000.00, 
     2025, '2025-10-15', '2025-10-25', 'Presupuesto aprobado con reducción del 6.67% por optimización de recursos.'),
    (2, 85000.00, 'Pendiente', NULL, 
     2025, '2025-10-20', NULL, 'Presupuesto en revisión por el comité de aprobaciones.'),
    (3, 200000.00, 'Rechazado', NULL, 
     2025, '2025-10-10', '2025-10-22', 'Presupuesto rechazado por exceder límites establecidos para el período.');

CREATE TABLE DistribucionPresupuesto (
    Id INT NOT NULL AUTO_INCREMENT,
    IdPresupuestoPadre INT NOT NULL,
    IdProyectoHijo INT NOT NULL,
    MontoAsignado DECIMAL(15,2) NOT NULL,
    PRIMARY KEY (Id),
    CONSTRAINT FK_Distribucion_Presupuesto
        FOREIGN KEY (IdPresupuestoPadre) REFERENCES Presupuesto(Id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT FK_Distribucion_Proyecto
        FOREIGN KEY (IdProyectoHijo) REFERENCES Proyecto(Id)
        ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Índices para optimizar consultas
CREATE INDEX IX_DistribucionPresupuesto_IdPresupuestoPadre ON DistribucionPresupuesto(IdPresupuestoPadre);
CREATE INDEX IX_DistribucionPresupuesto_IdProyectoHijo ON DistribucionPresupuesto(IdProyectoHijo);

-- Datos de prueba (asume Presupuesto Id 1 aprobado con 140,000 distribuido a proyectos hijos)
INSERT INTO DistribucionPresupuesto (
    IdPresupuestoPadre, IdProyectoHijo, MontoAsignado
) VALUES
    (1, 1, 60000.00), -- Del presupuesto aprobado de proyecto principal -> subproyecto 1
    (1, 2, 45000.00), -- Del presupuesto aprobado de proyecto principal -> subproyecto 2
    (1, 3, 35000.00); -- Del presupuesto aprobado de proyecto principal -> subproyecto 3

CREATE TABLE EjecucionPresupuesto (
    Id INT NOT NULL AUTO_INCREMENT,
    IdPresupuesto INT NOT NULL,
    Anio INT NOT NULL,
    MontoPlaneado DECIMAL(15,2) NULL,
    MontoEjecutado DECIMAL(15,2) NULL,
    Observaciones LONGTEXT NULL,
    PRIMARY KEY (Id),
    CONSTRAINT FK_Ejecucion_Presupuesto
        FOREIGN KEY (IdPresupuesto) REFERENCES Presupuesto(Id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Índice para optimizar consultas por presupuesto y año
CREATE INDEX IX_EjecucionPresupuesto_IdPresupuesto ON EjecucionPresupuesto(IdPresupuesto);
CREATE INDEX IX_EjecucionPresupuesto_Anio ON EjecucionPresupuesto(Anio);

-- Datos de prueba (asume Presupuesto Id 1..3)
INSERT INTO EjecucionPresupuesto (
    IdPresupuesto, Anio, MontoPlaneado, MontoEjecutado, Observaciones
) VALUES
    (1, 2025, 140000.00, 85000.00, 'Ejecución del 60.7% al tercer trimestre. Dentro de los parámetros esperados.'),
    (2, 2025, NULL, NULL, 'Presupuesto pendiente de aprobación, no se ha iniciado ejecución.'),
    (3, 2025, NULL, NULL, 'Presupuesto rechazado, no hay ejecución programada.');

-- Constraint único para evitar duplicados de presupuesto por año
ALTER TABLE EjecucionPresupuesto 
ADD CONSTRAINT UQ_EjecucionPresupuesto_Presupuesto_Anio 
UNIQUE (IdPresupuesto, Anio);

CREATE TABLE VariableEstrategica (
    Id INT NOT NULL AUTO_INCREMENT,
    Titulo VARCHAR(255) NOT NULL,
    Descripcion LONGTEXT NULL,
    PRIMARY KEY (Id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Datos de prueba
INSERT INTO VariableEstrategica (Titulo, Descripcion) VALUES
    ('Crecimiento de Ingresos', 'Incremento porcentual de los ingresos anuales de la organización.'),
    ('Satisfacción del Cliente', 'Medición del nivel de satisfacción de los clientes a través de encuestas y métricas de calidad.'),
    ('Eficiencia Operacional', 'Optimización de procesos y reducción de costos operativos para mejorar la rentabilidad.');

CREATE TABLE ObjetivoEstrategico (
    Id INT NOT NULL AUTO_INCREMENT,
    IdVariable INT NOT NULL,
    Titulo VARCHAR(255) NOT NULL,
    Descripcion LONGTEXT NULL,
    PRIMARY KEY (Id),
    CONSTRAINT FK_ObjetivoEstrategico_Variable
        FOREIGN KEY (IdVariable) REFERENCES VariableEstrategica(Id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Índice para optimizar consultas por variable
CREATE INDEX IX_ObjetivoEstrategico_IdVariable ON ObjetivoEstrategico(IdVariable);

-- Datos de prueba (asume VariableEstrategica Id 1..3)
INSERT INTO ObjetivoEstrategico (IdVariable, Titulo, Descripcion) VALUES
    (1, 'Incrementar ingresos 15% anual', 'Lograr un crecimiento sostenido del 15% en los ingresos anuales mediante la expansión de mercados y mejora de productos.'),
    (2, 'Alcanzar 90% satisfacción cliente', 'Mantener un nivel de satisfacción del cliente superior al 90% a través de mejoras continuas en calidad y servicio.'),
    (3, 'Reducir costos operativos 10%', 'Optimizar procesos internos para reducir los costos operativos en un 10% sin comprometer la calidad del servicio.');

CREATE TABLE MetaEstrategica (
    Id INT NOT NULL AUTO_INCREMENT,
    IdObjetivo INT NOT NULL,
    Titulo VARCHAR(255) NOT NULL,
    Descripcion LONGTEXT NULL,
    PRIMARY KEY (Id),
    CONSTRAINT FK_MetaEstrategica_Objetivo
        FOREIGN KEY (IdObjetivo) REFERENCES ObjetivoEstrategico(Id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Índice para optimizar consultas por objetivo
CREATE INDEX IX_MetaEstrategica_IdObjetivo ON MetaEstrategica(IdObjetivo);

-- Datos de prueba (asume ObjetivoEstrategico Id 1..3)
INSERT INTO MetaEstrategica (IdObjetivo, Titulo, Descripcion) VALUES
    (1, 'Aumentar ventas Q4 en 15%', 'Incrementar las ventas del cuarto trimestre en un 15% respecto al mismo período del año anterior mediante campañas focalizadas y nuevos canales de distribución.'),
    (2, 'NPS superior a 80 puntos', 'Alcanzar un Net Promoter Score (NPS) superior a 80 puntos implementando mejoras en el servicio al cliente y procesos de calidad.'),
    (3, 'Automatizar 5 procesos clave', 'Automatizar 5 procesos operativos críticos para reducir tiempos de ejecución en 40% y minimizar errores manuales.');

CREATE TABLE Meta_Proyecto (
    IdMeta INT NOT NULL,
    IdProyecto INT NOT NULL,
    FechaAsociacion DATE NULL,
    PRIMARY KEY (IdMeta, IdProyecto),
    CONSTRAINT FK_MetaProyecto_Meta
        FOREIGN KEY (IdMeta) REFERENCES MetaEstrategica(Id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT FK_MetaProyecto_Proyecto
        FOREIGN KEY (IdProyecto) REFERENCES Proyecto(Id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Índices para optimizar consultas
CREATE INDEX IX_Meta_Proyecto_IdMeta ON Meta_Proyecto(IdMeta);
CREATE INDEX IX_Meta_Proyecto_IdProyecto ON Meta_Proyecto(IdProyecto);

-- Datos de prueba (asume MetaEstrategica Id 1..3 y Proyecto Id 1..3)
INSERT INTO Meta_Proyecto (IdMeta, IdProyecto, FechaAsociacion) VALUES
  (1, 1, '2025-11-01'), -- Aumentar ventas Q4 en 15% -> Sitio corporativo
  (2, 2, '2025-11-15'), -- NPS superior a 80 puntos -> App móvil clientes
  (3, 3, '2025-12-01'); -- Automatizar 5 procesos clave -> Automatización logística



