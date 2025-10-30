import React, {useState, useEffect, useCallback, useMemo, memo} from "react";
import {get, post, put, del} from "../api/api";
import {useAuth} from "../context/AuthContext";

// ✅ Corregir className en lugar de class
const EntregableRow = memo(({Entregable, onEdit, onDelete}) => (
    <tr>
        <td>{Entregable.Codigo}</td>
        <td>{Entregable.Titulo}</td>
        <td>{Entregable.Descripcion}</td>
        <td>{Entregable.FechaInicio}</td>
        <td>{Entregable.FechaFinPrevista}</td>
        <td>{Entregable.FechaModificacion}</td>
        <td>{Entregable.FechaFinalizacion}</td>
        <td className="d-grid gap-2 d-md-flex justify-content-md-end">
            <button className="btn btn-warning" onClick={() => onEdit(Entregable)}>
                Editar
            </button>
            <button className="btn btn-danger" onClick={() => onDelete(Entregable.Id)}>
                Eliminar
            </button>
        </td>
    </tr>
));

function EntregablesPage() {
    const {token} = useAuth();
    const [entregables, setEntregable] = useState([]);   
    const [EntregableActual, setEntregableActual] = useState({
        Id: 0,
        Codigo: '',
        Titulo: '',
        Descripcion: '',
        FechaInicio: '',
        FechaFinPrevista: '',
        FechaModificacion: '',
        FechaFinalizacion: '',
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

    const cargarEntregable = useCallback(async () => {
        if (!token) return;
        setCargando(true);
        try {
            const data = await get('/Entregable', token);
            setEntregable(Array.isArray(data) ? data : []);
        } catch (err) {
            setMensaje(`Error: ${err.message}`);
        } finally {
            setCargando(false);
        }
    }, [token]);

    useEffect(() => {
        cargarEntregable();
    }, [cargarEntregable]);

    const manejarCambio = useCallback((e) => {
        const {name, value} = e.target;
        setEntregableActual((prev) => ({
            ...prev,
            [name]: value,
        }));
    }, []);

    // ✅ Corregir prepararEdicion con formateo de fechas
    const prepararEdicion = useCallback((Entregable) => {
        console.log("Datos originales del entregable:", Entregable);
        
        setEntregableActual({
            Id: Entregable.Id,
            Codigo: Entregable.Codigo || '',
            Titulo: Entregable.Titulo || '',
            Descripcion: Entregable.Descripcion || '',
            FechaInicio: formatearFecha(Entregable.FechaInicio),
            FechaFinPrevista: formatearFecha(Entregable.FechaFinPrevista),
            FechaModificacion: formatearFecha(Entregable.FechaModificacion),
            FechaFinalizacion: formatearFecha(Entregable.FechaFinalizacion)
        });
        
        setEsEdicion(true);
        setMensaje('');
        
        console.log("Fechas formateadas para inputs:", {
            FechaInicio: formatearFecha(Entregable.FechaInicio),
            FechaFinPrevista: formatearFecha(Entregable.FechaFinPrevista),
            FechaModificacion: formatearFecha(Entregable.FechaModificacion),
            FechaFinalizacion: formatearFecha(Entregable.FechaFinalizacion)
        });
    }, [formatearFecha]);

    const limpiarFormulario = useCallback(() => {
        setEntregableActual({
            Id: 0,
            Codigo: '',
            Titulo: '',
            Descripcion: '',
            FechaInicio: '',
            FechaFinPrevista: '',
            FechaModificacion: '',
            FechaFinalizacion: '',
        });
        setEsEdicion(false);
        setMensaje('');
    }, []);

    const manejarEnvio = useCallback(async (e) => {
        e.preventDefault();
        try {
            if (!esEdicion) { 
                await post('/Entregable', EntregableActual);
                setMensaje('Entregable creado correctamente.');
            } else {
                await put('/Entregable', EntregableActual.Id, EntregableActual);
                setMensaje('Entregable actualizado correctamente.');
            }
            await cargarEntregable();
            limpiarFormulario();
        } catch (err) {
            setMensaje(`Error: ${err.message}`);
        }
    }, [esEdicion, EntregableActual, cargarEntregable, limpiarFormulario]);

    const manejarEliminacion = useCallback(async (Id) => {
        const confirmado = window.confirm(`¿Seguro que quieres eliminar el Entregable?`);
        if (!confirmado) return;
        try {
            await del('/Entregable', Id);
            setMensaje('Entregable eliminado correctamente.');
            await cargarEntregable();
        } catch (err) {
            setMensaje(`Error: ${err.message}`);
        }
    }, [cargarEntregable]);

    return (
        <div className="container">
            <h2>Gestión de Entregables</h2>
            {mensaje && <div className="alert alert-info">{mensaje}</div>}
            
            <form onSubmit={manejarEnvio}>
                <div className="mb-3">
                    <label className="form-label">Código:</label>
                    <input
                        type="text"
                        name="Codigo"
                        value={EntregableActual.Codigo}
                        onChange={manejarCambio}
                        required
                        className="form-control"
                    />
                </div>
                
                <div className="mb-3">
                    <label className="form-label">Título:</label>
                    <input
                        type="text"
                        name="Titulo"
                        value={EntregableActual.Titulo}
                        onChange={manejarCambio}
                        required
                        className="form-control"
                    />
                </div>
                
                <div className="mb-3">
                    <label className="form-label">Descripción:</label>
                    <textarea
                        name="Descripcion"
                        value={EntregableActual.Descripcion}
                        onChange={manejarCambio}
                        required
                        className="form-control"
                        rows="3"
                    />
                </div>
                
                <div className="mb-3">
                    <label className="form-label">Fecha Inicio:</label>
                    <input
                        type="date"
                        name="FechaInicio"
                        value={EntregableActual.FechaInicio}
                        onChange={manejarCambio}
                        className="form-control"
                    />
                </div>
                
                <div className="mb-3">
                    <label className="form-label">Fecha Fin Prevista:</label>
                    <input
                        type="date"
                        name="FechaFinPrevista"
                        value={EntregableActual.FechaFinPrevista}
                        onChange={manejarCambio}
                        className="form-control"
                    />
                </div>
                
                <div className="mb-3">
                    <label className="form-label">Fecha Modificación:</label>
                    <input
                        type="date"
                        name="FechaModificacion"
                        value={EntregableActual.FechaModificacion}
                        onChange={manejarCambio}
                        className="form-control"
                    />
                </div>
                
                <div className="mb-3">
                    <label className="form-label">Fecha Finalización:</label>
                    <input
                        type="date"
                        name="FechaFinalizacion"
                        value={EntregableActual.FechaFinalizacion}
                        onChange={manejarCambio}
                        className="form-control"
                    />
                </div>
                
                <button type="submit" className="btn btn-primary">
                    {esEdicion ? 'Actualizar Entregable' : 'Crear Entregable'}
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
            ) : entregables.length > 0 ? (
                <table className="table table-striped mt-4">
                    <thead>
                        <tr>
                            <th>Código</th>
                            <th>Título</th>
                            <th>Descripción</th>
                            <th>Fecha Inicio</th>
                            <th>Fecha Fin Prevista</th>
                            <th>Fecha Modificación</th>
                            <th>Fecha Finalización</th>
                            <th className="text-end">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {entregables.map((entregable) => (
                            <EntregableRow
                                key={entregable.Id}
                                Entregable={entregable}
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

export default memo(EntregablesPage);