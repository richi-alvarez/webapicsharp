import React, {useState, useEffect, useCallback, memo} from "react";
import {get, post, put, del} from "../api/api";
import {useAuth} from "../context/AuthContext";

const ProyectoRow = memo(({proyecto, onEdit, onDelete}) => (
    <tr>
        <td>{proyecto.ProyectoPadre?.[0].Codigo}</td>
        <td>{proyecto.Responsable?.[0].Nombre}</td>
        <td>{proyecto.TipoProyecto?.[0].Nombre}</td>
        <td>{proyecto.Codigo}</td>
        <td>{proyecto.Titulo}</td>
        <td>{proyecto.Descripcion}</td>
        <td>{proyecto.FechaInicio}</td>
        <td>{proyecto.FechaFinPrevista}</td>
        <td>{proyecto.FechaModificacion}</td>
        <td>{proyecto.FechaFinalizacion}</td>
        <td className="d-grid gap-2 d-md-flex justify-content-md-end">
            <button className="btn btn-warning" onClick={() => onEdit(proyecto)}>Editar</button>
            <button className="btn btn-danger" onClick={() => onDelete(proyecto.Id)}>Eliminar</button>
        </td>
    </tr>
));


function ProyectoPage() {
    const {token} = useAuth();
    const [proyectos, setProyectos] = useState([]);
    const [responsable, setResponsable] = useState([]);
    const [tipoProyecto, setTipoProyecto] = useState([]);
    const [proyectoActual, setProyectoActual] = useState({
        Id: 0,
        IdProyectoPadre:'',
        IdResponsable:'',
        IdTipoProyecto:'',
        Codigo: '',
        Titulo: '',
        Descripcion: '',
        FechaInicio: '',
        FechaFinPrevista: '',
        FechaModificacion: '',
        FechaFinalizacion: '',
        RutaLogo:'',
    });
    const [esEdicion, setEsEdicion] = useState(false);
    const [mensaje, setMensaje] = useState('');
    const [cargando, setCargando] = useState(false);    
    // ✅ Función para formatear fechas
    const formatearFecha = useCallback((fecha) => {
        if (!fecha) return '';
        
        try {
            // Si es una fecha ISO, extraer solo la parte de fecha
            if (typeof fecha === 'string' && fecha.includes('T')) {
                return fecha.split('T')[0];
            }
            
            // Si ya está en formato YYYY-MM-DD
            if (typeof fecha === 'string' && fecha.match(/^\d{4}-\d{2}-\d{2}$/)) {
                return fecha;
            }
            
            // Convertir a Date y formatear
            const fechaObj = new Date(fecha);
            if (isNaN(fechaObj.getTime())) return '';
            
            return fechaObj.toISOString().split('T')[0];
        } catch (error) {
            console.error('Error al formatear fecha:', error);
            return '';
        }
    }, []);

    const cargarDatosIniciales = useCallback(async () => {
        if(!token) return;

        try {
            //tablas vinculadas
            const responsableReq = await get('/Responsable', token);
            if (Array.isArray(responsableReq)) {
                setResponsable(responsableReq);
                //console.log("responsables cargados:", responsableReq);
            }
            const tipoProyectoReq =  await get('/TipoProyecto', token);
            if(Array.isArray(tipoProyectoReq)){
                setTipoProyecto(tipoProyectoReq);
                //console.log("tipos de proyecto cargados:", tipoProyectoReq);
            }
        }catch (error) {
            console.error("Error al cargar datos iniciales:", error);
            setMensaje(`Error al cargar datos: ${error.message}`);
        }
    },[token]);

    const cargarProyectos = useCallback(async () => {
        if (!token) return;
        setCargando(true);
        try {
            const data = await get('/Proyecto', token);
            if (!Array.isArray(data) || data.length === 0) {
                console.log("No se encontraron responsables");
                setProyectos([]);
                return;
            }
            //agregar datos vinculados de los otros modelos
            const proyectosCompletos = await Promise.all(
                data.map(async (proyecto) => {
                    // Aquí puedes agregar llamadas adicionales para obtener datos vinculados si es necesario
                    let responsables = null;
                    if (Array.isArray(responsable)) {
                        responsables = responsable.filter((r) => r.Id === proyecto.IdResponsable);
                    }
                    let tipoProyectos = null;
                    if (Array.isArray(tipoProyecto)) {
                        tipoProyectos = tipoProyecto.filter((tp) => tp.Id === proyecto.IdTipoProyecto);
                    }
                    let proyectoPadre = null;
                    if(proyecto.IdProyectoPadre){
                        proyectoPadre = await get(`/Proyecto/Id/${proyecto.IdTipoProyecto}`, token);
                    }
                    return {
                        ...proyecto,
                        Responsable: responsables && responsables.length > 0 ? responsables : null,
                        TipoProyecto: tipoProyectos && tipoProyectos.length > 0 ? tipoProyectos : null,
                        ProyectoPadre: proyectoPadre && proyectoPadre.length > 0 ? proyectoPadre : null,
                        // Agrega otros datos vinculados aquí si es necesario
                    }
                })
            );
            console.log("Proyectos completos cargados:", proyectosCompletos);
            setProyectos(proyectosCompletos);
        } catch (err) {
            setMensaje(`Error: ${err.message}`);
        } finally {
            setCargando(false);
        }
    }, [token]);

    useEffect(() => {
        if(responsable.length > 0 && tipoProyecto.length > 0){
            cargarProyectos();  
        }
    }, [cargarProyectos, responsable, tipoProyecto]);

    useEffect(() => {
        cargarDatosIniciales();
    }, [cargarDatosIniciales]);

    const manejarCambio = useCallback((e) => {
        const { name, value } = e.target;
        setProyectoActual((prev) => ({
            ...prev,
            [name]:  name.includes('Id') ? parseInt(value) || 0 : value,
        }));
    }, []);

    const prepararEdicion = useCallback((proyecto) => {
        // Formatear las fechas al cargar el proyecto para edición
        const proyectoFormateado = {
            Id: proyecto.Id,
            IdProyectoPadre: proyecto.IdProyectoPadre || '',
            IdResponsable: proyecto.IdResponsable || '',
            IdTipoProyecto: proyecto.IdTipoProyecto || '',
            Codigo: proyecto.Codigo || '',
            Titulo: proyecto.Titulo || '',
            Descripcion: proyecto.Descripcion || '',
            FechaInicio: formatearFecha(proyecto.FechaInicio),
            FechaFinPrevista: formatearFecha(proyecto.FechaFinPrevista),
            FechaModificacion: formatearFecha(proyecto.FechaModificacion),
            FechaFinalizacion: formatearFecha(proyecto.FechaFinalizacion),
            RutaLogo: proyecto.RutaLogo || '', 
        };
        setProyectoActual(proyectoFormateado);
        setEsEdicion(true);
        setMensaje('');
    }, [formatearFecha]);

    const limpiarFormulario = useCallback(() => {
        setProyectoActual({
            Id: 0,
            IdProyectoPadre:'',
            IdResponsable:'',
            IdTipoProyecto:'',
            Codigo: '',
            Titulo: '',
            Descripcion: '',
            FechaInicio: '',
            FechaFinPrevista: '',
            FechaModificacion: '',
            FechaFinalizacion: '',
            RutaLogo:'',
        });
        setEsEdicion(false);
        setMensaje('');
    }, []);

    const guardarProyecto = useCallback(
        async (e) => {
            e.preventDefault();
            try {

                // Validaciones
                if (!proyectoActual.IdProyectoPadre) {
                    setMensaje('El Proyecto padre es requerido');
                    return;
                }
                if (!proyectoActual.IdResponsable) {
                    setMensaje('Debe seleccionar un tipo de responsable');
                    return;
                }
                if (!proyectoActual.IdTipoProyecto) {
                    setMensaje('Debe seleccionar un tipo de proyecto');
                    return;
                }

                if (!proyectoActual.Codigo.trim()) {
                    setMensaje('Debe de ingresar un codigo para el proyecto');
                    return;
                }

                if (!proyectoActual.Titulo.trim()) {
                    setMensaje('Debe de ingresar un titulo para el proyecto');
                    return;
                }

                if (!proyectoActual.Descripcion.trim()) {
                    setMensaje('Debe de ingresar una descripcion para el proyecto');
                    return;
                }

                if (!esEdicion) {
                    // Crear nuevo proyecto
                    await post('/Proyecto', proyectoActual, token);
                    setMensaje('Proyecto creado exitosamente.');
                } else {
                    // Actualizar proyecto existente
                    await put(`/Proyecto`,proyectoActual.Id, proyectoActual, null, token);
                    setMensaje('Proyecto actualizado exitosamente.');
                }
                limpiarFormulario();
                cargarProyectos();
            } catch (err) {
                setMensaje(`Error: ${err.message}`);
            }
        },
        [esEdicion, proyectoActual, token, limpiarFormulario, cargarProyectos]
    );

    const eliminarProyecto = useCallback(
        async (id) => {
            if (!window.confirm('¿Estás seguro de que deseas eliminar este proyecto?')) return;
            try {
                await del(`/Proyecto`,id, token);
                setMensaje('Proyecto eliminado exitosamente.');
                cargarProyectos();
            } catch (err) {
                setMensaje(`Error: ${err.message}`);
            }  
        },
        [token, cargarProyectos]
    );

    if (cargando) {
        return (
            <div className="d-flex justify-content-center p-4">
                <div className="spinner-border" role="status">
                    <span className="visually-hidden">Cargando proyectos...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="container mt-4">
            <h2>Gestión de Proyectos</h2>
            {mensaje && <div className="alert alert-info">{mensaje}</div>}
            <form onSubmit={guardarProyecto} className="mb-4">
                <div className="mb-3">
                    <label className="form-label">Proyecto padre:</label>
                    <select
                        name="IdProyectoPadre"
                        value={proyectoActual.IdProyectoPadre}
                        onChange={manejarCambio}
                        required
                        className="form-select"
                    >
                        <option value={0}>Seleccionar proyecto padre</option>
                        {proyectos.map((resp) => (
                            <option key={resp.Id} value={resp.Id}>
                                {resp.Titulo}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="mb-3">
                    <label className="form-label">Responsable:</label>
                    <select
                        name="IdResponsable"
                        value={proyectoActual.IdResponsable}
                        onChange={manejarCambio}
                        required
                        className="form-select"
                    >
                        <option value={0}>Seleccionar responsable...</option>
                        {responsable.map((resp) => (
                            <option key={resp.Id} value={resp.Id}>
                                {resp.Nombre}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="mb-3">
                    <label className="form-label">Tipo de proyecto:</label>
                    <select
                        name="IdTipoProyecto"
                        value={proyectoActual.IdTipoProyecto}
                        onChange={manejarCambio}
                        required
                        className="form-select"
                    >
                        <option value={0}>Seleccionar Tipo proyecto</option>
                        {tipoProyecto.map((resp) => (
                            <option key={resp.Id} value={resp.Id}>
                                {resp.Nombre}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="mb-3">
                    <label className="form-label">Código</label>
                    <input type="text" className="form-control" name="Codigo" value={proyectoActual.Codigo} onChange={manejarCambio} required />
                </div>
                <div className="mb-3">
                    <label className="form-label">Título</label>
                    <input type="text" className="form-control" name="Titulo" value={proyectoActual.Titulo} onChange={manejarCambio} required />
                </div>
                <div className="mb-3">
                    <label className="form-label">Descripción</label>
                    <textarea className="form-control" name="Descripcion" value={proyectoActual.Descripcion} onChange={manejarCambio} required />
                </div>
                <div className="mb-3">
                    <label className="form-label">Fecha de Inicio</label>
                    <input type="date" className="form-control" name="FechaInicio" value={proyectoActual.FechaInicio} onChange={manejarCambio} />
                </div>
                <div className="mb-3">
                    <label className="form-label">Fecha Fin Prevista</label>
                    <input type="date" className="form-control" name="FechaFinPrevista" value={proyectoActual.FechaFinPrevista} onChange={manejarCambio} />
                </div>
                <div className="mb-3">
                    <label className="form-label">Fecha de Modificación</label>
                    <input type="date" className="form-control" name="FechaModificacion" value={proyectoActual.FechaModificacion} onChange={manejarCambio} />
                </div>
                <div className="mb-3">
                    <label className="form-label">Fecha de Finalización</label>
                    <input type="date" className="form-control" name="FechaFinalizacion" value={proyectoActual.FechaFinalizacion} onChange={manejarCambio} />
                </div>
                <div className="mb-3" hidden>
                    <label className="form-label">RutaLogo</label>
                    <input type="text" className="form-control" name="RutaLogo" value={proyectoActual.RutaLogo} onChange={manejarCambio} />
                </div>
                <button type="submit" className="btn btn-primary">{esEdicion ? 'Actualizar Proyecto' : 'Crear Proyecto'}</button>
                <button type="button" className="btn btn-secondary ms-2" onClick={limpiarFormulario}>Limpiar</button>
            </form>

            {cargando ? (
                <div className="d-flex justify-content-center p-4">
                    <div className="spinner-border" role="status">
                        <span className="visually-hidden">Cargando proyectos...</span>
                    </div>
                </div> 
            ) : proyectos.length > 0 ? (
            <table className="table table-striped">
                <thead>
                    <tr>
                        <th>Proyecto Padre</th>
                        <th>Responsable</th>
                        <th>Tipo Proyecto</th>
                        <th>Código</th>
                        <th>Título</th>
                        <th>Descripción</th>   
                        <th>Fecha de Inicio</th>
                        <th>Fecha Fin Prevista</th>
                        <th>Fecha de Modificación</th>
                        <th>Fecha de Finalización</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {proyectos.map((proyecto) => (
                        <ProyectoRow key={proyecto.Id} proyecto={proyecto} onEdit={prepararEdicion} onDelete={eliminarProyecto} />
                    ))}
                </tbody>
            </table>
            ) : (
                <div className="alert alert-info mt-4">
                    No se encontraron proyectos registrados.
                </div>
            )}
        </div>
    );
}

export default ProyectoPage;