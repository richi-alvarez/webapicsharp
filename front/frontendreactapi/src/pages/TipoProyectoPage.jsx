import React, {useState, useEffect, useCallback, useMemo, memo} from "react";
import {get, post, put, del} from "../api/api";
import {useAuth} from "../context/AuthContext";
// ✅ Fila memorizada: solo se re-renderiza si cambia el tipo responsable
const TipoTipoProyectoRow = memo(({tipoTipoProyecto, onEdit, onDelete, token}) => (
    <tr>
        <td>{tipoTipoProyecto.Nombre}</td>
        <td>{tipoTipoProyecto.Descripcion}</td>
        <td class="d-grid gap-2 d-md-flex justify-content-md-end">
            <button class="btn btn-warning" onClick={() => onEdit(tipoTipoProyecto, token)}>Editar</button>
            <button class="btn btn-danger" onClick={() => onDelete(tipoTipoProyecto.Id, token)}>Eliminar</button>
        </td>
    </tr>
));

function TipoProyectoPage() {
    const {token} = useAuth();
    const [tiposTipoProyecto, setTiposTipoProyecto] = useState([]);   
    const [tipoTipoProyectoActual, setTipoTipoProyectoActual] = useState({
        Id: 0,
        Nombre: '',
        Descripcion: ''
    });
    const [esEdicion, setEsEdicion] = useState(false);
    const [mensaje, setMensaje] = useState('');
    const [cargando, setCargando] = useState(false);

    // ✅ useCallback mantiene la referencia estable
    const cargarTiposTipoProyecto = useCallback(async () => {
        if (!token) return;
        setCargando(true);
        try {
            const data = await get('/TipoProyecto', token);
            setTiposTipoProyecto(Array.isArray(data) ? data : []);
        } catch (err) {
            setMensaje(`Error: ${err.message}`);
        } finally {
            setCargando(false);
        }
    }, [token]);

    useEffect(() => {
        cargarTiposTipoProyecto();
    }, [cargarTiposTipoProyecto]);

    const manejarCambio = useCallback((e) => {
        const {name, value} = e.target;
        setTipoTipoProyectoActual((prev) => ({
            ...prev,
            [name]: value,
        }));
    }, []);

    const prepararEdicion = useCallback((tipoTipoProyecto, token) => {
        setTipoTipoProyectoActual(tipoTipoProyecto);
        setEsEdicion(true);
        setMensaje('');
    }, []);

    const limpiarFormulario = useCallback(() => {
        setTipoTipoProyectoActual({
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
                await post('/TipoProyecto',tipoTipoProyectoActual, token);
                setMensaje('Tipo TipoProyecto creado correctamente.');
            } else {
                await put('/TipoProyecto',tipoTipoProyectoActual.Id, tipoTipoProyectoActual,null, token);
                setMensaje('Tipo Proyecto actualizado correctamente.');
            }
            await cargarTiposTipoProyecto();
            limpiarFormulario();
        } catch (err) {
            setMensaje(`Error: ${err.message}`);
        }
        },[esEdicion, tipoTipoProyectoActual, cargarTiposTipoProyecto, limpiarFormulario]
    );

    const manejarEliminacion = useCallback(async (Id, token) => {
        const confirmado = window.confirm(`¿Seguro que quieres eliminar el Tipo TipoProyecto?`);
        if (!confirmado) return;
        try {
            await del('/TipoProyecto',Id, token);
            setMensaje('Tipo Proyecto eliminado correctamente.');
            await cargarTiposTipoProyecto();
        } catch (err) {
            setMensaje(`Error: ${err.message}`);
        }
    }, [cargarTiposTipoProyecto]
    );

    return (
        <div className="container">
            <h2>Gestión de Tipos de TipoProyecto</h2>
            {mensaje && <div className="alert alert-info">{mensaje}</div>}
            <form onSubmit={manejarEnvio}>
                <div className="mb-3">
                    <label className="form-label">Nombre:</label>
                    <input
                        type="text"
                        name="Nombre"
                        value={tipoTipoProyectoActual.Nombre}
                        onChange={manejarCambio}
                        required
                        className="form-control"
                    />
                </div>
                <div className="mb-3">
                    <label className="form-label">Descripcion:</label>
                    <textarea
                        name="Descripcion"
                        value={tipoTipoProyectoActual.Descripcion}
                        onChange={manejarCambio}
                        required
                        className="form-control"
                    ></textarea>
                </div>
                <button type="submit" className="btn btn-primary">
                    {esEdicion ? 'Actualizar Tipo TipoProyecto' : 'Crear Tipo TipoProyecto'}
                </button>
            </form>
            {cargando ? (
                <div className="d-flex justify-content-center p-4">
                    <div className="spinner-border" role="status">
                        <span className="visually-hidden">Cargando Tipo Proyectos...</span>
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
                        {tiposTipoProyecto.map((tr) => (
                            <TipoTipoProyectoRow
                                key={tr.Id}
                                tipoTipoProyecto={tr}
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

export default memo(TipoProyectoPage);