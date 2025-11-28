# Guía de Deployment a MonsterASP.NET

## Archivos preparados:
✅ **webapicsharp-deploy.zip** (10.5 MB) - Listo para subir a MonsterASP.NET

## Pasos para el deployment en MonsterASP.NET:

### 1. Subir el archivo
- Accede a tu panel de control de MonsterASP.NET
- Ve a la sección de "File Manager" o "Archivos"
- Sube el archivo `webapicsharp-deploy.zip`
- Extrae el contenido en la carpeta raíz de tu sitio web

### 2. Configurar la cadena de conexión
En el panel de control de MonsterASP.NET:
- Ve a "Database" y crea una nueva base de datos SQL Server
- Anota la cadena de conexión proporcionada
- En "Configuration" o "App Settings", agrega:
  - **Key:** `ConnectionStrings__SqlServer`
  - **Value:** Tu cadena de conexión de SQL Server

### 3. Variables de entorno necesarias:
```
ConnectionStrings__SqlServer = Server=tu-servidor;Database=tu-base-datos;User Id=usuario;Password=contraseña;
DatabaseProvider = SqlServer
ASPNETCORE_ENVIRONMENT = Production
```

### 4. Configuración de la aplicación
- Asegúrate de que el archivo `web.config` esté en la raíz
- La aplicación usará .NET 9.0
- El punto de entrada es `webapicsharp.dll`

### 5. Ejecutar script SQL
Ejecuta el archivo `docker/db/mariadb.sql` adaptándolo para SQL Server:
- Cambia la sintaxis de AUTO_INCREMENT por IDENTITY(1,1)
- Ajusta los tipos de datos según SQL Server
- Ejecuta el script en tu base de datos

### 6. Configurar CORS (si es necesario)
Si tienes problemas de CORS, el frontend debe estar en el mismo dominio o configurar:
```json
{
  "AllowedOrigins": ["https://tu-dominio-frontend.com"]
}
```

### 7. Testing
Una vez deployed:
- Accede a `https://tu-sitio.com/swagger` para ver la documentación API
- Prueba el endpoint de autenticación: `POST /Autenticacion/token`
- Verifica la conexión a la base de datos

## Archivos incluidos en el deployment:
- ✅ Aplicación compilada (.dll)
- ✅ Dependencias (.dll libraries)
- ✅ Configuraciones (appsettings.json)
- ✅ web.config para IIS
- ✅ Archivos de localización

## Estructura de la API:
- **Autenticación:** `/Autenticacion/token`
- **Entidades:** `/Usuario`, `/Proyecto`, `/Entregable`, etc.
- **Upload:** `/Upload/avatar`
- **Swagger UI:** `/swagger`

## Troubleshooting:
1. **Error 500:** Verificar cadena de conexión y permisos de DB
2. **CORS errors:** Configurar AllowedOrigins en appsettings.json
3. **File upload issues:** Verificar permisos de carpeta para uploads
4. **JWT issues:** Verificar ClaveSecreta en configuración

---
**Archivo generado:** `webapicsharp-deploy.zip`
**Fecha:** $(date)
**Tamaño:** 10.5 MB
**Versión .NET:** 9.0
