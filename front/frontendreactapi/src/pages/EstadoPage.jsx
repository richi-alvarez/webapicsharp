import React, {useState, useEffect, useCallback, useMemo, memo} from "react";
import {get, post, put, del} from "../api/api";
import {useAuth} from "../context/AuthContext";
// ✅ Fila memorizada: solo se re-renderiza si cambia el tipo responsable
const EstadoRow = memo(({Estado, onEdit, onDelete, token}) => (
    <tr>
        <td>{Estado.Nombre}</td>
        <td>{Estado.Descripcion}</td>
        <td class="d-grid gap-2 d-md-flex justify-content-md-end">
            <button class="btn btn-warning" onClick={() => onEdit(Estado, token)}>Editar</button>
            <button class="btn btn-danger" onClick={() => onDelete(Estado.Id, token)}>Eliminar</button>
        </td>
    </tr>
));

function EstadoPage() {
    const {token} = useAuth();
    const [estados, setEstado] = useState([]);   
    const [EstadoActual, setEstadoActual] = useState({
        Id: 0,
        Nombre: '',
        Descripcion: ''
    });
    const [esEdicion, setEsEdicion] = useState(false);
    const [mensaje, setMensaje] = useState('');
    const [cargando, setCargando] = useState(false);

    // ✅ useCallback mantiene la referencia estable
    const cargarEstado = useCallback(async () => {
        if (!token) return;
        setCargando(true);
        try {
            const data = await get('/Estado', token);
            setEstado(Array.isArray(data) ? data : []);
        } catch (err) {
            setMensaje(`Error: ${err.message}`);
        } finally {
            setCargando(false);
        }
    }, [token]);

    useEffect(() => {
        cargarEstado();
    }, [cargarEstado]);

    const manejarCambio = useCallback((e) => {
        const {name, value} = e.target;
        setEstadoActual((prev) => ({
            ...prev,
            [name]: value,
        }));
    }, []);

    const prepararEdicion = useCallback((Estado, token) => {
        setEstadoActual(Estado);
        setEsEdicion(true);
        setMensaje('');
    }, []);

    const limpiarFormulario = useCallback(() => {
        setEstadoActual({
            Id: 0,
            Nombre: '',
            Descripcion: '',
        });
        setEsEdicion(false);
        setMensaje('');
    }, []);

    const manejarEnvio = useCallback( async (e) => {
        e.preventDefault();
        try {
            if (!esEdicion) { 
                await post('/Estado',EstadoActual, token);
                setMensaje('Estado creado correctamente.');
            } else {
                await put('/Estado',EstadoActual.Id, EstadoActual,null, token);
                setMensaje('Estado actualizado correctamente.');
            }
            await cargarEstado();
            limpiarFormulario();
        } catch (err) {
            setMensaje(`Error: ${err.message}`);
        }
        },[esEdicion, EstadoActual, cargarEstado, limpiarFormulario]
    );

    const manejarEliminacion = useCallback(async (Id, token) => {
        const confirmado = window.confirm(`¿Seguro que quieres eliminar el Tipo TipoProyecto?`);
        if (!confirmado) return;
        try {
            await del('/Estado',Id, token);
            setMensaje('Estado eliminado correctamente.');
            await cargarEstado();
        } catch (err) {
            setMensaje(`Error: ${err.message}`);
        }
    }, [cargarEstado]
    );

    return (
        <div className="container">
            <h2>Gestión de Tipos de Estado</h2>
            {mensaje && <div className="alert alert-info">{mensaje}</div>}
            <form onSubmit={manejarEnvio}>
                <div className="mb-3">
                    <label className="form-label">Nombre:</label>
                    <input
                        type="text"
                        name="Nombre"
                        value={EstadoActual.Nombre}
                        onChange={manejarCambio}
                        required
                        className="form-control"
                    />
                </div>
                <div className="mb-3">
                    <label className="form-label">Descripcion:</label>
                    <textarea
                        name="Descripcion"
                        value={EstadoActual.Descripcion}
                        onChange={manejarCambio}
                        required
                        className="form-control"
                    ></textarea>
                </div>
                <button type="submit" className="btn btn-primary">
                    {esEdicion ? 'Actualizar Estado' : 'Crear Estado'}
                </button>
            </form>
            {cargando ? (
                <div className="d-flex justify-content-center p-4">
                    <div className="spinner-border" role="status">
                        <span className="visually-hidden">Cargando Estado...</span>
                    </div>
                </div> 
            ) : (
                <table className="table table-striped mt-4">
                    <thead>
                        <tr>
                            <th>Nombre</th>
                            <th>Descripcion</th>
                            <th className="text-end">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {estados.map((tr) => (
                            <EstadoRow
                                key={tr.Id}
                                Estado={tr}
                                onEdit={prepararEdicion}
                                onDelete={manejarEliminacion}
                            />
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}

export default memo(EstadoPage);