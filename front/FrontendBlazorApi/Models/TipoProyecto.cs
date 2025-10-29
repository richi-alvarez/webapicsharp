namespace FrontendBlazorApi.Models
{
    public class TipoProyecto
    {
        // Identificador único del tipo de proyecto
        public int IdTipoProyecto { get; set; }

        // Nombre del tipo de proyecto (ejemplo: "Desarrollo de software", "Infraestructura")
        public string Nombre { get; set; }

        // Descripción breve del tipo de proyecto
        public string Descripcion { get; set; }
    }
}
