import React, {useState, useEffect, useCallback, useMemo, memo} from "react";
import {get, post, put, del} from "../api/api";
import {useAuth} from "../context/AuthContext";
// ✅ Fila memorizada: solo se re-renderiza si cambia el tipo responsable
const TipoResponsableRow = memo(({tipoResponsable, onEdit, onDelete, token}) => (
    <tr>
        <td>{tipoResponsable.Titulo}</td>
        <td>{tipoResponsable.Descripcion}</td>
        <td class="d-grid gap-2 d-md-flex justify-content-md-end">
            <button class="btn btn-warning" onClick={() => onEdit(tipoResponsable, token)}>Editar</button>
            <button class="btn btn-danger" onClick={() => onDelete(tipoResponsable.Id, token)}>Eliminar</button>
        </td>
    </tr>
));

function TipoResponsablePage() {
    const {token} = useAuth();
    const [tiposResponsable, setTiposResponsable] = useState([]);   
    const [tipoResponsableActual, setTipoResponsableActual] = useState({
        Id: 0,
        Titulo: '',
        Descripcion: ''
    });
    const [esEdicion, setEsEdicion] = useState(false);
    const [mensaje, setMensaje] = useState('');
    const [cargando, setCargando] = useState(false);

    // ✅ useCallback mantiene la referencia estable
    const cargarTiposResponsable = useCallback(async () => {
        if (!token) return;
        setCargando(true);
        try {
            const data = await get('/TipoResponsable', token);
            setTiposResponsable(Array.isArray(data) ? data : []);
        } catch (err) {
            setMensaje(`Error: ${err.message}`);
        } finally {
            setCargando(false);
        }
    }, [token]);

    useEffect(() => {
        cargarTiposResponsable();
    }, [cargarTiposResponsable]);

    const manejarCambio = useCallback((e) => {
        const {name, value} = e.target;
        setTipoResponsableActual((prev) => ({
            ...prev,
            [name]: value,
        }));
    }, []);

    const prepararEdicion = useCallback((tipoResponsable, token) => {
        setTipoResponsableActual(tipoResponsable);
        setEsEdicion(true);
        setMensaje('');
    }, []);

    const limpiarFormulario = useCallback(() => {
        setTipoResponsableActual({
            Id: 0,
            Titulo: '',
            Descripcion: '',
        });
        setEsEdicion(false);
        setMensaje('');
    }, []);

    const manejarEnvio = useCallback( async (e) => {
        e.preventDefault();
        try {
            if (!esEdicion) { 
                await post('/TipoResponsable',tipoResponsableActual, token);
                setMensaje('Tipo Responsable creado correctamente.');
            } else {
                await put('/TipoResponsable',tipoResponsableActual.Id, tipoResponsableActual,null, token);
                setMensaje('Tipo Responsable actualizado correctamente.');
            }
            await cargarTiposResponsable();
            limpiarFormulario();
        } catch (err) {
            setMensaje(`Error: ${err.message}`);
        }
        },[esEdicion, tipoResponsableActual, cargarTiposResponsable, limpiarFormulario]
    );

    const manejarEliminacion = useCallback(async (Id, token) => {
        const confirmado = window.confirm(`¿Seguro que quieres eliminar el Tipo Responsable?`);
        if (!confirmado) return;
        try {
            await del('/TipoResponsable',Id, token);
            setMensaje('Tipo Responsable eliminado correctamente.');
            await cargarTiposResponsable();
        } catch (err) {
            setMensaje(`Error: ${err.message}`);
        }
    }, [cargarTiposResponsable]
    );

    return (
        <div className="container">
            <h2>Gestión de Tipos de Responsable</h2>
            {mensaje && <div className="alert alert-info">{mensaje}</div>}
            <form onSubmit={manejarEnvio}>
                <div className="mb-3">
                    <label className="form-label">Titulo:</label>
                    <input
                        type="text"
                        name="Titulo"
                        value={tipoResponsableActual.Titulo}
                        onChange={manejarCambio}
                        required
                        className="form-control"
                    />
                </div>
                <div className="mb-3">
                    <label className="form-label">Descripcion:</label>
                    <textarea
                        name="Descripcion"
                        value={tipoResponsableActual.Descripcion}
                        onChange={manejarCambio}
                        required
                        className="form-control"
                    ></textarea>
                </div>
                <button type="submit" className="btn btn-primary">
                    {esEdicion ? 'Actualizar Tipo Responsable' : 'Crear Tipo Responsable'}
                </button>
            </form>
            {cargando ? (
                <div className="d-flex justify-content-center p-4">
                    <div className="spinner-border" role="status">
                        <span className="visually-hidden">Cargando responsables...</span>
                    </div>
                </div> 
            ) : (
                <table className="table table-striped mt-4">
                    <thead>
                        <tr>
                            <th>Titulo</th>
                            <th>Descripcion</th>
                            <th className="text-end">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tiposResponsable.map((tr) => (
                            <TipoResponsableRow
                                key={tr.Id}
                                tipoResponsable={tr}
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

export default memo(TipoResponsablePage);