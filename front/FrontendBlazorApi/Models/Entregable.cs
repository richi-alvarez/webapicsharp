namespace FrontendBlazorApi.Models
{
    public class Entregable
    {
        // Identificador único del entregable
        public int IdEntregable { get; set; }

        // Nombre del entregable (ejemplo: "Informe final", "Manual de usuario")
        public string Nombre { get; set; }

        // Fecha límite para entregar el entregable
        public DateTime FechaEntrega { get; set; }

        // Descripción o detalles del entregable
        public string Descripcion { get; set; }
    }
}
