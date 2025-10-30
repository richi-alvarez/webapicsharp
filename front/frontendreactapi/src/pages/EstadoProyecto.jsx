import React, {useState, useEffect, useCallback, memo} from "react";
import {get, post, put, del} from "../api/api";
import {useAuth} from "../context/AuthContext";

const ProyectoRow = memo(({proyecto, onEdit, onDelete}) => (
    <tr>
        <td>{proyecto.Proyecto?.[0].Codigo}</td>
        <td>{proyecto.Estado?.[0].Nombre}</td>
        <td className="d-grid gap-2 d-md-flex justify-content-md-end">
            <button className="btn btn-warning" onClick={() => onEdit(proyecto)}>Editar</button>
            <button className="btn btn-danger" onClick={() => onDelete(proyecto.IdProyecto)}>Eliminar</button>
        </td>
    </tr>
));


function EstadoProyecto() {
    const {token} = useAuth();
    const [estadoProyecto, setEstadoProyecto] = useState([]);
    const [proyectos, setProyecto] = useState([]);
    const [estado, setEstado] = useState([]);
    const [proyectoActual, setProyectoActual] = useState({
        IdProyecto:'',
        IdEstado:'',
    });
    const [esEdicion, setEsEdicion] = useState(false);
    const [mensaje, setMensaje] = useState('');
    const [cargando, setCargando] = useState(false);    


    const cargarDatosIniciales = useCallback(async () => {
        if(!token) return;

        try {
            //tablas vinculadas
            const proyectoReq = await get('/Proyecto', token);
            if (Array.isArray(proyectoReq)) {
                setProyecto(proyectoReq);
                }
            const estadoReq =  await get('/Estado', token);
            if(Array.isArray(estadoReq)){
                setEstado(estadoReq);
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
            const data = await get('/Estado_Proyecto', token);
            if (!Array.isArray(data) || data.length === 0) {
                console.log("No se encontraron proyectos");
                setEstadoProyecto([]);
                return;
            }
            //agregar datos vinculados de los otros modelos
            const proyectosCompletos = await Promise.all(
                data.map(async (proyecto) => {
                    // Aquí puedes agregar llamadas adicionales para obtener datos vinculados si es necesario
                    let proyectoVinculado = null;
                    if(proyecto.IdProyecto){    
                        proyectoVinculado = await get(`/Proyecto/Id/${proyecto.IdProyecto}`, token);
                    }
                    /*if (Array.isArray(proyectos)) {
                        proyectoVinculado = proyectos.filter((r) => r.Id === proyecto.IdProyecto);
                    }*/
                    let estadosPro = null;
                    if(proyecto.IdEstado){
                        estadosPro = await get(`/Estado/Id/${proyecto.IdEstado}`, token);
                    }
                    /*if (Array.isArray(estado)) {
                        estadosPro = estado.filter((tp) => tp.Id === proyecto.IdEstado);
                    }*/
    
                    return {
                        ...proyecto,
                        Proyecto: proyectoVinculado && proyectoVinculado.length > 0 ? proyectoVinculado : null,
                        Estado: estadosPro && estadosPro.length > 0 ? estadosPro : null,
                        // Agrega otros datos vinculados aquí si es necesario
                    }
                })
            );
            console.log("Proyectos completos cargados:", proyectosCompletos);
            setEstadoProyecto(proyectosCompletos);
        } catch (err) {
            setMensaje(`Error: ${err.message}`);
        } finally {
            setCargando(false);
        }
    }, [token]);

    useEffect(() => {
        if(proyectos.length > 0 && estado.length > 0){
            cargarProyectos();  
        }
    }, [cargarProyectos, proyectos, estado]);

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
            IdProyecto: proyecto.IdProyecto,
            IdEstado: proyecto.IdEstado || '',
        };
        setProyectoActual(proyectoFormateado);
        setEsEdicion(true);
        setMensaje('');
    }, []);

    const limpiarFormulario = useCallback(() => {
        setProyectoActual({
            IdProyecto:'',
            IdEstado:'',
        });
        setEsEdicion(false);
        setMensaje('');
    }, []);

    const guardarProyecto = useCallback(
        async (e) => {
            e.preventDefault();
            try {

                // Validaciones
                if (!proyectoActual.IdProyecto) {
                    setMensaje('El Proyecto  es requerido');
                    return;
                }
                if (!proyectoActual.IdEstado) {
                    setMensaje('Debe seleccionar un estado');
                    return;
                }
                

                if (!esEdicion) {
                    // Crear nuevo proyecto
                    await post('/Estado_Proyecto', proyectoActual, token);
                    setMensaje('Proyecto creado exitosamente.');
                } else {
                    // Actualizar proyecto existente
                    await put(`/Estado_Proyecto`,proyectoActual.IdProyecto, proyectoActual, null, token,'IdProyecto');
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
                await del(`/Estado_Proyecto`,id, token,'IdProyecto');
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
            <h2>Gestión de Estados de Proyectos</h2>
            {mensaje && <div className="alert alert-info">{mensaje}</div>}
            <form onSubmit={guardarProyecto} className="mb-4">
                <div className="mb-3">
                    <label className="form-label">Proyecto:</label>
                    <select
                        name="IdProyecto"
                        value={proyectoActual.IdProyecto}
                        onChange={manejarCambio}
                        required
                        className="form-select"
                    >
                        <option value={0}>Seleccionar proyecto</option>
                        {proyectos.map((resp) => (
                            <option key={resp.Id} value={resp.Id}>
                                {resp.Codigo}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="mb-3">
                    <label className="form-label">Estado:</label>
                    <select
                        name="IdEstado"
                        value={proyectoActual.IdEstado}
                        onChange={manejarCambio}
                        required
                        className="form-select"
                    >
                        <option value={0}>Seleccionar estado...</option>
                        {estado.map((resp) => (
                            <option key={resp.Id} value={resp.Id}>
                                {resp.Nombre}
                            </option>
                        ))}
                    </select>
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
            ) : estadoProyecto.length > 0 ? (
            <table className="table table-striped">
                <thead>
                    <tr>
                        <th>Proyecto </th>
                        <th>Estado</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {estadoProyecto.map((proyecto) => (
                        <ProyectoRow key={proyecto.IdProyecto} proyecto={proyecto} onEdit={prepararEdicion} onDelete={eliminarProyecto} />
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

export default EstadoProyecto;