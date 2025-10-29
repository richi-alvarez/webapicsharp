namespace FrontendBlazorApi.Models
{
    public class RespuestaApi<T>
    {
        public string Tabla { get; set; } = string.Empty;
        public string Esquema { get; set; } = string.Empty;
        public int? Limite { get; set; }
        public int Total { get; set; }
        public List<T> Datos { get; set; } = new();
    }
}
