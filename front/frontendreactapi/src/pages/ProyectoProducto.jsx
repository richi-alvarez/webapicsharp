import React, {useState, useEffect, useCallback, memo} from "react";
import {get, post, put, del} from "../api/api";
import {useAuth} from "../context/AuthContext";

const ResponsableRow = memo(({Responsable, onEdit, onDelete}) => (
    <tr>
        <td>{Responsable.Proyecto?.[0].Codigo || 'Sin tipo'}</td>
        <td>{Responsable.Producto?.[0].Codigo || 'Sin usuario'}</td>
        <td>{Responsable.FechaAsociacion}</td>
        <td className="d-grid gap-2 d-md-flex justify-content-md-end">
            <button className="btn btn-warning" onClick={() => onEdit(Responsable)}>
                Editar
            </button>
            <button hidden className="btn btn-danger" onClick={() => onDelete(Responsable.IdProyecto)} style={{display:"none"}}  >
                Eliminar
            </button>
        </td>
    </tr>
));

function ProyectoProducto() {
    const {token} = useAuth();
    
    const [responsables, setResponsables] = useState([]);
    const [proyectos, setProyecto] = useState([]);
    const [productos, setProducto] = useState([]);
    
    const [responsableActual, setResponsableActual] = useState({
        IdProyecto: '',
        IdProducto: 0,
        FechaAsociacion: 0
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
    // ✅ Cargar datos iniciales (tipos y productos)
    const cargarDatosIniciales = useCallback(async () => {
        if (!token) return;
        
        try {
            //tablas vinculadas
            // Cargar tipos de responsable
            const tiposData = await get('/Proyecto', token);
            if (Array.isArray(tiposData)) {
                setProyecto(tiposData);
            }

            // Cargar productos
            const productosData = await get('/Producto', token);
            if (Array.isArray(productosData)) {
                setProducto(productosData);
            }
        } catch (error) {
            console.error("Error al cargar datos iniciales:", error);
            setMensaje(`Error al cargar datos: ${error.message}`);
        }
    }, [token]);

    // ✅ Cargar responsables con sus relaciones
    const cargarResponsables = useCallback(async () => {
        if (!token) return;
        
        setCargando(true);
        try {
            const data = await get('/Proyecto_Producto', token);
            
            if (!Array.isArray(data) || data.length === 0) {
                console.log("No se encontraron Proyecto_Producto");
                setResponsables([]);
                return;
            }

            // ✅ Cargar datos relacionados para cada responsable
            const responsablesCompletos = await Promise.all(
                data.map(async (responsable) => {
                    try {
                        // Cargar tipo de responsable
                        let tipoProyecto = null;
                        if (responsable.IdProyecto) {
                            tipoProyecto = await get(`/Proyecto/Id/${responsable.IdProyecto}`, token);
                        }

                        // Cargar producto
                        let producto = null;
                        if (responsable.IdProducto) {
                            producto = await get(`/Producto/Id/${responsable.IdProducto}`, token);
                        }

                        return {
                            ...responsable,
                            Proyecto: tipoProyecto,
                            Producto: producto
                        };
                    } catch (error) {
                        console.error(`Error al cargar datos del responsable ${responsable.Id}:`, error);
                        return {
                            ...responsable,
                            Proyecto: null,
                            Producto: null
                        };
                    }
                })
            );

            setResponsables(responsablesCompletos);            
        } catch (err) {
            console.error("Error al cargar responsables:", err);
            setMensaje(`Error: ${err.message}`);
            setResponsables([]);
        } finally {
            setCargando(false);
        }
    }, [token]);

    useEffect(() => {
        cargarDatosIniciales();
    }, [cargarDatosIniciales]);

    useEffect(() => {
        if (proyectos.length > 0 && productos.length > 0) {
            cargarResponsables();
        }
    }, [cargarResponsables, proyectos.length, productos.length]);

    const manejarCambio = useCallback((e) => {
        const {name, value} = e.target;
        setResponsableActual((prev) => ({
            ...prev,
            [name]: name.includes('Id') ? parseInt(value) || 0 : value,
        }));
    }, []);

    const prepararEdicion = useCallback((responsable) => {
        setResponsableActual({
            IdProyecto: responsable.IdProyecto,
            IdProducto: responsable.IdProducto,
            FechaAsociacion: formatearFecha(responsable.FechaAsociacion)
        });
        setEsEdicion(true);
        setMensaje('');
    }, [formatearFecha]);

    const limpiarFormulario = useCallback(() => {
        setResponsableActual({
            IdProyecto: 0,
            IdProducto: '',
            FechaAsociacion: 0,
        });
        setEsEdicion(false);
        setMensaje('');
    }, []);

    const manejarEnvio = useCallback(async (e) => {
        e.preventDefault();
        
        // Validaciones
        if (!responsableActual.FechaAsociacion.trim()) {
            setMensaje('La fecha es requerido');
            return;
        }
        if (!responsableActual.IdProyecto) {
            setMensaje('Debe seleccionar un tipo de proyecto');
            return;
        }
        if (!responsableActual.IdProducto) {
            setMensaje('Debe seleccionar un producto');
            return;
        }

        try {
            if (!esEdicion) {
                await post('/Proyecto_Producto', responsableActual,token);
                setMensaje('Proyecto_Producto creado correctamente.');
            } else {
                await put('/Proyecto_Producto', responsableActual.IdProyecto, responsableActual, null, token,'IdProyecto');
                setMensaje('Proyecto_Producto actualizado correctamente.');
            }
            await cargarResponsables();
            limpiarFormulario();
        } catch (err) {
            setMensaje(`Error: ${err.message}`);
        }
    }, [esEdicion, responsableActual, cargarResponsables, limpiarFormulario]);

    const manejarEliminacion = useCallback(async (id) => {
        const confirmado = window.confirm('¿Seguro que quieres eliminar este Proyecto_Producto?');
        if (!confirmado) return;
        
        try {
            await del('/Proyecto_Producto', id, token,'IdProyecto');
            setMensaje('Proyecto_Producto eliminado correctamente.');
            await cargarResponsables();
        } catch (err) {
            setMensaje(`Error: ${err.message}`);
        }
    }, [cargarResponsables]);

    return (
        <div className="container">
            <h2>Gestión de Proyecto_Producto</h2>
            {mensaje && <div className="alert alert-info">{mensaje}</div>}
            
            <form onSubmit={manejarEnvio}>
                
                <div className="mb-3">
                    <label className="form-label">Proyecto:</label>
                    <select
                        name="IdProyecto"
                        value={responsableActual.IdProyecto}
                        onChange={manejarCambio}
                        required
                        className="form-select"
                    >
                        <option value={0}>Seleccionar proyecto...</option>
                        {proyectos.map((tipo) => (
                            <option key={tipo.Id} value={tipo.Id}>
                                {tipo.Codigo}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="mb-3">
                    <label className="form-label">Producto:</label>
                    <select
                        name="IdProducto"
                        value={responsableActual.IdProducto}
                        onChange={manejarCambio}
                        required
                        className="form-select"
                    >
                        <option value={0}>Seleccionar producto...</option>
                        {productos.map((usuario) => (
                            <option key={usuario.Id} value={usuario.Id}>
                                {usuario.Codigo}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="mb-3">
                    <label className="form-label">Fecha de Asociacion</label>
                    <input type="date" className="form-control" name="FechaAsociacion" value={responsableActual.FechaAsociacion} onChange={manejarCambio} />
                </div>
                
                <button type="submit" className="btn btn-primary">
                    {esEdicion ? 'Actualizar ProyectoProducto' : 'Crear ProyectoProducto'}
                </button>
                
                {esEdicion && (
                    <button 
                        type="button" 
                        className="btn btn-secondary ms-2" 
                        onClick={limpiarFormulario}
                    >
                        Cancelar
                    </button>
                )}
            </form>

            {cargando ? (
                <div className="d-flex justify-content-center p-4">
                    <div className="spinner-border" role="status">
                        <span className="visually-hidden">Cargando responsables...</span>
                    </div>
                </div>
            ) : responsables.length > 0 ? (
                <table className="table table-striped mt-4">
                    <thead>
                        <tr>
                            <th>Proyecto</th>
                            <th>Producto</th>
                            <th>FechaAsociacion</th>
                            <th className="text-end">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {responsables.map((responsable) => (
                            <ResponsableRow
                                key={responsable.Id}
                                Responsable={responsable}
                                onEdit={prepararEdicion}
                                onDelete={manejarEliminacion}
                            />
                        ))}
                    </tbody>
                </table>
            ) : (
                <div className="alert alert-info mt-4">
                    No se encontraron responsables registrados.
                </div>
            )}
        </div>
    );
}

export default memo(ProyectoProducto);