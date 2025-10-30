import React, {useState, useEffect, useCallback, memo} from "react";
import {get, post, put, del} from "../api/api";
import {useAuth} from "../context/AuthContext";

const ResponsableRow = memo(({Responsable, onEdit, onDelete}) => (
    <tr>
        <td>{Responsable.Nombre}</td>
        <td>{Responsable.TipoResponsable?.[0].Titulo || 'Sin tipo'}</td>
        <td>{Responsable.Usuario?.[0].Email || 'Sin usuario'}</td>
        <td className="d-grid gap-2 d-md-flex justify-content-md-end">
            <button className="btn btn-warning" onClick={() => onEdit(Responsable)}>
                Editar
            </button>
            <button className="btn btn-danger" onClick={() => onDelete(Responsable.Id)}>
                Eliminar
            </button>
        </td>
    </tr>
));

function Responsable() {
    const {token} = useAuth();
    
    const [responsables, setResponsables] = useState([]);
    const [tiposResponsable, setTiposResponsable] = useState([]);
    const [usuarios, setUsuarios] = useState([]);
    
    const [responsableActual, setResponsableActual] = useState({
        Id: 0,
        Nombre: '',
        IdTipoResponsable: 0,
        IdUsuario: 0
    });
    
    const [esEdicion, setEsEdicion] = useState(false);
    const [mensaje, setMensaje] = useState('');
    const [cargando, setCargando] = useState(false);

    // ✅ Cargar datos iniciales (tipos y usuarios)
    const cargarDatosIniciales = useCallback(async () => {
        if (!token) return;
        
        try {
            //tablas vinculadas
            // Cargar tipos de responsable
            const tiposData = await get('/TipoResponsable', token);
            if (Array.isArray(tiposData)) {
                setTiposResponsable(tiposData);
            }

            // Cargar usuarios
            const usuariosData = await get('/Usuario', token);
            if (Array.isArray(usuariosData)) {
                setUsuarios(usuariosData);
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
            const data = await get('/Responsable', token);
            
            if (!Array.isArray(data) || data.length === 0) {
                console.log("No se encontraron responsables");
                setResponsables([]);
                return;
            }

            // ✅ Cargar datos relacionados para cada responsable
            const responsablesCompletos = await Promise.all(
                data.map(async (responsable) => {
                    try {
                        // Cargar tipo de responsable
                        let tipoResponsable = null;
                        if (responsable.IdTipoResponsable) {
                            tipoResponsable = await get(`/TipoResponsable/Id/${responsable.IdTipoResponsable}`, token);
                        }

                        // Cargar usuario
                        let usuario = null;
                        if (responsable.IdUsuario) {
                            usuario = await get(`/Usuario/Id/${responsable.IdUsuario}`, token);
                        }

                        return {
                            ...responsable,
                            TipoResponsable: tipoResponsable,
                            Usuario: usuario
                        };
                    } catch (error) {
                        console.error(`Error al cargar datos del responsable ${responsable.Id}:`, error);
                        return {
                            ...responsable,
                            TipoResponsable: null,
                            Usuario: null
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
        if (tiposResponsable.length > 0 && usuarios.length > 0) {
            cargarResponsables();
        }
    }, [cargarResponsables, tiposResponsable.length, usuarios.length]);

    const manejarCambio = useCallback((e) => {
        const {name, value} = e.target;
        setResponsableActual((prev) => ({
            ...prev,
            [name]: name.includes('Id') ? parseInt(value) || 0 : value,
        }));
    }, []);

    const prepararEdicion = useCallback((responsable) => {
        setResponsableActual({
            Id: responsable.Id,
            Nombre: responsable.Nombre,
            IdTipoResponsable: responsable.IdTipoResponsable,
            IdUsuario: responsable.IdUsuario
        });
        setEsEdicion(true);
        setMensaje('');
    }, []);

    const limpiarFormulario = useCallback(() => {
        setResponsableActual({
            Id: 0,
            Nombre: '',
            IdTipoResponsable: 0,
            IdUsuario: 0
        });
        setEsEdicion(false);
        setMensaje('');
    }, []);

    const manejarEnvio = useCallback(async (e) => {
        e.preventDefault();
        
        // Validaciones
        if (!responsableActual.Nombre.trim()) {
            setMensaje('El nombre es requerido');
            return;
        }
        if (!responsableActual.IdTipoResponsable) {
            setMensaje('Debe seleccionar un tipo de responsable');
            return;
        }
        if (!responsableActual.IdUsuario) {
            setMensaje('Debe seleccionar un usuario');
            return;
        }

        try {
            if (!esEdicion) {
                await post('/Responsable', responsableActual,token);
                setMensaje('Responsable creado correctamente.');
            } else {
                await put('/Responsable', responsableActual.Id, responsableActual, null, token);
                setMensaje('Responsable actualizado correctamente.');
            }
            await cargarResponsables();
            limpiarFormulario();
        } catch (err) {
            setMensaje(`Error: ${err.message}`);
        }
    }, [esEdicion, responsableActual, cargarResponsables, limpiarFormulario]);

    const manejarEliminacion = useCallback(async (id) => {
        const confirmado = window.confirm('¿Seguro que quieres eliminar este responsable?');
        if (!confirmado) return;
        
        try {
            await del('/Responsable', id, token);
            setMensaje('Responsable eliminado correctamente.');
            await cargarResponsables();
        } catch (err) {
            setMensaje(`Error: ${err.message}`);
        }
    }, [cargarResponsables]);

    return (
        <div className="container">
            <h2>Gestión de Responsables</h2>
            {mensaje && <div className="alert alert-info">{mensaje}</div>}
            
            <form onSubmit={manejarEnvio}>
                <div className="mb-3">
                    <label className="form-label">Nombre:</label>
                    <input
                        type="text"
                        name="Nombre"
                        value={responsableActual.Nombre}
                        onChange={manejarCambio}
                        required
                        className="form-control"
                    />
                </div>

                <div className="mb-3">
                    <label className="form-label">Tipo de Responsable:</label>
                    <select
                        name="IdTipoResponsable"
                        value={responsableActual.IdTipoResponsable}
                        onChange={manejarCambio}
                        required
                        className="form-select"
                    >
                        <option value={0}>Seleccionar tipo...</option>
                        {tiposResponsable.map((tipo) => (
                            <option key={tipo.Id} value={tipo.Id}>
                                {tipo.Titulo}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="mb-3">
                    <label className="form-label">Usuario:</label>
                    <select
                        name="IdUsuario"
                        value={responsableActual.IdUsuario}
                        onChange={manejarCambio}
                        required
                        className="form-select"
                    >
                        <option value={0}>Seleccionar usuario...</option>
                        {usuarios.map((usuario) => (
                            <option key={usuario.Id} value={usuario.Id}>
                                {usuario.Email}
                            </option>
                        ))}
                    </select>
                </div>
                
                <button type="submit" className="btn btn-primary">
                    {esEdicion ? 'Actualizar Responsable' : 'Crear Responsable'}
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
                            <th>Nombre</th>
                            <th>Tipo</th>
                            <th>Usuario</th>
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

export default memo(Responsable);