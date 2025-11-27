using Microsoft.AspNetCore.Mvc;

namespace webapicsharp.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UploadController : ControllerBase
    {
        private readonly IWebHostEnvironment _environment;
        private readonly ILogger<UploadController> _logger;

        public UploadController(IWebHostEnvironment environment, ILogger<UploadController> logger)
        {
            _environment = environment;
            _logger = logger;
        }

        [HttpPost("avatar")]
        public async Task<IActionResult> UploadAvatar(IFormFile avatar, [FromForm] string email)
        {
            try
            {
                if (avatar == null || avatar.Length == 0)
                {
                    return BadRequest(new { mensaje = "No se ha seleccionado ningún archivo", estado = 400 });
                }

                if (string.IsNullOrEmpty(email))
                {
                    return BadRequest(new { mensaje = "El email es requerido", estado = 400 });
                }

                // Validar tipo de archivo (solo imágenes)
                var allowedTypes = new[] { "image/jpeg", "image/jpg", "image/png", "image/gif" };
                if (!allowedTypes.Contains(avatar.ContentType.ToLower()))
                {
                    return BadRequest(new { mensaje = "Solo se permiten archivos de imagen (JPG, PNG, GIF)", estado = 400 });
                }

                // Validar tamaño (máximo 5MB)
                if (avatar.Length > 5 * 1024 * 1024)
                {
                    return BadRequest(new { mensaje = "El archivo es demasiado grande. Máximo 5MB", estado = 400 });
                }

                // Crear directorio si no existe
                var uploadsFolder = Path.Combine(_environment.ContentRootPath, "uploads", "avatars");
                if (!Directory.Exists(uploadsFolder))
                {
                    Directory.CreateDirectory(uploadsFolder);
                }

                // Generar nombre usando el email (limpiarlo de caracteres no válidos)
                var fileExtension = Path.GetExtension(avatar.FileName);
                var cleanEmail = email.Replace("@", "_").Replace(".", "_");
                var timestamp = DateTime.Now.ToString("yyyyMMddHHmmss");
                var uniqueFileName = $"{cleanEmail}_{timestamp}{fileExtension}";
                var filePath = Path.Combine(uploadsFolder, uniqueFileName);

                // Guardar el archivo
                using (var fileStream = new FileStream(filePath, FileMode.Create))
                {
                    await avatar.CopyToAsync(fileStream);
                }

                _logger.LogInformation($"Avatar guardado: {uniqueFileName}");

                return Ok(new 
                { 
                    mensaje = "Archivo subido exitosamente",
                    fileName = uniqueFileName,
                    originalName = avatar.FileName,
                    size = avatar.Length,
                    estado = 200 
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al subir avatar");
                return StatusCode(500, new { mensaje = "Error interno del servidor", estado = 500 });
            }
        }

        [HttpGet("avatar/{fileName}")]
        public IActionResult GetAvatar(string fileName)
        {
            try
            {
                var uploadsFolder = Path.Combine(_environment.ContentRootPath, "uploads", "avatars");
                var filePath = Path.Combine(uploadsFolder, fileName);

                if (!System.IO.File.Exists(filePath))
                {
                    return NotFound(new { mensaje = "Archivo no encontrado", estado = 404 });
                }

                var fileBytes = System.IO.File.ReadAllBytes(filePath);
                var contentType = GetContentType(fileName);

                return File(fileBytes, contentType);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error al obtener avatar: {fileName}");
                return StatusCode(500, new { mensaje = "Error interno del servidor", estado = 500 });
            }
        }

        [HttpGet("avatar/by-email/{email}")]
        public IActionResult GetAvatarByEmail(string email)
        {
            try
            {
                var uploadsFolder = Path.Combine(_environment.ContentRootPath, "uploads", "avatars");
                var cleanEmail = email.Replace("@", "_").Replace(".", "_");
                
                // Buscar archivos que comiencen con el email limpio
                var files = Directory.GetFiles(uploadsFolder, $"{cleanEmail}_*.*");
                
                if (files.Length == 0)
                {
                    return NotFound(new { mensaje = "Avatar no encontrado para este email", estado = 404 });
                }

                // Tomar el archivo más reciente (por si hay múltiples)
                var mostRecentFile = files.OrderByDescending(f => System.IO.File.GetCreationTime(f)).First();
                var fileName = Path.GetFileName(mostRecentFile);

                var fileBytes = System.IO.File.ReadAllBytes(mostRecentFile);
                var contentType = GetContentType(fileName);

                return File(fileBytes, contentType);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error al obtener avatar por email: {email}");
                return StatusCode(500, new { mensaje = "Error interno del servidor", estado = 500 });
            }
        }

        private string GetContentType(string fileName)
        {
            var extension = Path.GetExtension(fileName).ToLowerInvariant();
            return extension switch
            {
                ".jpg" or ".jpeg" => "image/jpeg",
                ".png" => "image/png",
                ".gif" => "image/gif",
                _ => "application/octet-stream"
            };
        }
    }
}
