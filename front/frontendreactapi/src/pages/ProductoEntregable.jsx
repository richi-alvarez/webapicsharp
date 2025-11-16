import React, {useState, useEffect, useCallback, memo} from "react";
import {get, post, put, del} from "../api/api";
import {useAuth} from "../context/AuthContext";

const ResponsableRow = memo(({Responsable, onEdit, onDelete}) => (
    <tr>
        <td>{Responsable.Entregable?.[0].Codigo || 'Sin tipo'}</td>
        <td>{Responsable.Producto?.[0].Codigo || 'Sin usuario'}</td>
        <td>{Responsable.FechaAsociacion}</td>
        <td className="d-grid gap-2 d-md-flex justify-content-md-end">
            <button className="btn btn-warning" onClick={() => onEdit(Responsable)}>
                Editar
            </button>
            <button hidden className="btn btn-danger" onClick={() => onDelete(Responsable.IdProducto)} style={{display:"none"}}>
                Eliminar
            </button>
        </td>
    </tr>
));

function ProductoEntregable() {
    const {token} = useAuth();
    
    const [responsables, setResponsables] = useState([]);
    const [entregables, setEntregable] = useState([]);
    const [productos, setProducto] = useState([]);
    
    const [responsableActual, setResponsableActual] = useState({
        IdProducto: 0,
        IdEntregable: 0,
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
            const tiposData = await get('/Entregable', token);
            if (Array.isArray(tiposData)) {
                setEntregable(tiposData);
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
            const data = await get('/Producto_Entregable', token);
            
            if (!Array.isArray(data) || data.length === 0) {
                console.log("No se encontraron Producto_Entregable");
                setResponsables([]);
                return;
            }

            // ✅ Cargar datos relacionados para cada responsable
            const responsablesCompletos = await Promise.all(
                data.map(async (responsable) => {
                    try {
                        // Cargar tipo de responsable
                        let tipoEntregable = null;
                        if (responsable.IdEntregable) {
                            tipoEntregable = await get(`/Entregable/Id/${responsable.IdEntregable}`, token);
                        }

                        // Cargar producto
                        let producto = null;
                        if (responsable.IdProducto) {
                            producto = await get(`/Producto/Id/${responsable.IdProducto}`, token);
                        }

                        return {
                            ...responsable,
                            Entregable: tipoEntregable,
                            Producto: producto
                        };
                    } catch (error) {
                        console.error(`Error al cargar datos del responsable ${responsable.Id}:`, error);
                        return {
                            ...responsable,
                            Entregable: null,
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
        if (entregables.length > 0 && productos.length > 0) {
            cargarResponsables();
        }
    }, [cargarResponsables, entregables.length, productos.length]);

    const manejarCambio = useCallback((e) => {
        const {name, value} = e.target;
        setResponsableActual((prev) => ({
            ...prev,
            [name]: name.includes('Id') ? parseInt(value) || 0 : value,
        }));
    }, []);

    const prepararEdicion = useCallback((responsable) => {
        setResponsableActual({
            IdEntregable: responsable.IdEntregable,
            IdProducto: responsable.IdProducto,
            FechaAsociacion: formatearFecha(responsable.FechaAsociacion)
        });
        setEsEdicion(true);
        setMensaje('');
    }, [formatearFecha]);

    const limpiarFormulario = useCallback(() => {
        setResponsableActual({
            IdEntregable: 0,
            IdProducto: 0,
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
        if (!responsableActual.IdEntregable) {
            setMensaje('Debe seleccionar un tipo de entregable');
            return;
        }
        if (!responsableActual.IdProducto) {
            setMensaje('Debe seleccionar un producto');
            return;
        }

        try {
            if (!esEdicion) {
                await post('/Producto_Entregable', responsableActual,token);
                setMensaje('Producto_Entregable creado correctamente.');
            } else {
                await put('/Producto_Entregable', responsableActual.IdProducto, responsableActual, null, token,'IdProducto');
                setMensaje('Producto_Entregable actualizado correctamente.');
            }
            await cargarResponsables();
            limpiarFormulario();
        } catch (err) {
            setMensaje(`Error: ${err.message}`);
        }
    }, [esEdicion, responsableActual, cargarResponsables, limpiarFormulario]);

    const manejarEliminacion = useCallback(async (id) => {
        const confirmado = window.confirm('¿Seguro que quieres eliminar este Producto_Entregable?');
        if (!confirmado) return;
        
        try {
            await del('/Producto_Entregable', id, token,'IdProducto');
            setMensaje('Producto_Entregable eliminado correctamente.');
            await cargarResponsables();
        } catch (err) {
            setMensaje(`Error: ${err.message}`);
        }
    }, [cargarResponsables]);

    return (
        <div className="container">
            <h2>Gestión de Producto_Entregable</h2>
            {mensaje && <div className="alert alert-info">{mensaje}</div>}
            
            <form onSubmit={manejarEnvio}>
                
                <div className="mb-3">
                    <label className="form-label">Entregable:</label>
                    <select
                        name="IdEntregable"
                        value={responsableActual.IdEntregable}
                        onChange={manejarCambio}
                        required
                        className="form-select"
                    >
                        <option value={0}>Seleccionar entregable...</option>
                        {entregables.map((tipo) => (
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
                    {esEdicion ? 'Actualizar ProductoEntregable' : 'Crear ProductoEntregable'}
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
                        <span className="visually-hidden">Cargando entregables...</span>
                    </div>
                </div>
            ) : responsables.length > 0 ? (
                <table className="table table-striped mt-4">
                    <thead>
                        <tr>
                            <th>Entregable</th>
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
                    No se encontraron entregables registrados.
                </div>
            )}
        </div>
    );
}

export default memo(ProductoEntregable);