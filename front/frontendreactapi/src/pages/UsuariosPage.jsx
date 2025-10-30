import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { fetchUsuarios, crearUsuario, actualizarUsuarioPorId, eliminarUsuarioPorId } from '../api/usuarios';
import { useAuth } from '../context/AuthContext';
// ✅ Fila memorizada: solo se re-renderiza si cambia el usuario
const UsuarioRow = memo(({ usuario, onEdit, onDelete }) => (

    <tr>
        <td>{usuario.Email}</td>
        <td>{usuario.Contrasena}</td>
        <td>{usuario.RutaAvatar}</td>
        <td>{usuario.Activo ? 'Sí' : 'No'}</td>
        <td class="d-grid gap-2 d-md-flex justify-content-md-end">
            <button class="btn btn-warning" onClick={() => onEdit(usuario)}>Editar</button>
            <button class="btn btn-danger" onClick={() => onDelete(usuario.Id)}>Eliminar</button>
        </td>
    </tr>
));

function UsuariosPage() {
    const { token } = useAuth();
    const [usuarios, setUsuarios] = useState([]);
    const [usuarioActual, setUsuarioActual] = useState({
        Id: 0,
        Email: '',
        Contrasena: '',
        RutaAvatar: '',
        Activo: false,
    });
    const [esEdicion, setEsEdicion] = useState(false);
    const [mensaje, setMensaje] = useState('');
    const [cargando, setCargando] = useState(false);

    // ✅ useCallback mantiene la referencia estable
    const cargarUsuarios = useCallback(async () => {
        setCargando(true);
        try {
            const data = await fetchUsuarios('/Usuario', token);
            setUsuarios(Array.isArray(data) ? data : []);
        } catch (err) {
            setMensaje(`Error: ${err.message}`);
        } finally {
            setCargando(false);
        }
    }, []);

    useEffect(() => {
        cargarUsuarios();
    }, [cargarUsuarios]);

    const manejarCambio = useCallback((e) => {
        const { name, value, type, checked } = e.target;
        setUsuarioActual((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    }, []);

    const prepararEdicion = useCallback((usuario) => {
        setUsuarioActual(usuario);
        setEsEdicion(true);
        setMensaje('');
    }, []);

    const limpiarFormulario = useCallback(() => {
        setUsuarioActual({
            Id: 0,
            Email: '',
            Contrasena: '',
            RutaAvatar: '',
            Activo: false,
        });
        setEsEdicion(false);
        setMensaje('');
    }, []);

    const guardarUsuario = useCallback(
        async (e) => {
            e.preventDefault();
            try {
                if (!esEdicion) {
                    await crearUsuario(window.location.pathname,usuarioActual);
                    setMensaje('Usuario creado correctamente.');
                } else {
                    await actualizarUsuarioPorId(window.location.pathname,usuarioActual.Id, usuarioActual);
                    setMensaje('Usuario actualizado correctamente.');
                }
                await cargarUsuarios();
                limpiarFormulario();
            } catch (err) {
                setMensaje(`Error: ${err.message}`);
            }
        },
        [esEdicion, usuarioActual, cargarUsuarios, limpiarFormulario]
    );

    const eliminarUsuario = useCallback(
        async (Id) => {
            const confirmado = window.confirm(`¿Seguro que quieres eliminar al usuario?`);
            if (!confirmado) return;
            try {
                await eliminarUsuarioPorId(window.location.pathname,Id);
                setMensaje('Usuario eliminado correctamente.');
                await cargarUsuarios();
            } catch (err) {
                setMensaje(`Error: ${err.message}`);
            }
        },
        [cargarUsuarios]
    );

    // ✅ Evita recalcular el listado si no cambió
    const filasUsuarios = useMemo(
        () =>
            usuarios.map((u) => (<UsuarioRow key={u.Id} usuario={u} onEdit={prepararEdicion} onDelete={eliminarUsuario} />
            )),
        [usuarios, prepararEdicion, eliminarUsuario]
    );

    return (<div style={{margin:"10px"}}> <h1>Gestión Usuarios</h1>
        {cargando && <p>Cargando...</p>}
        {mensaje && <div>{mensaje}</div>}
        <table className="table table-striped caption-top">
            <caption>Lista de Usuarios</caption>
            <thead>
                <tr>
                    <th>Email</th>
                    <th>Contraseña</th>
                    <th>Ruta Avatar</th>
                    <th>Activo</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody>{filasUsuarios}</tbody>
        </table>

        <form onSubmit={guardarUsuario}>
            <div class="mb-3">
                <label for="exampleInputEmail1" class="form-label">Email:</label>
                <input type="email" class="form-control"  name="Email" value={usuarioActual.Email} onChange={manejarCambio} />
            </div>
            <div class="mb-3">
                <label for="exampleInputPassword1" class="form-label">Contraseña:</label>
                <input type="password" class="form-control" name="Contrasena" value={usuarioActual.Contrasena} onChange={manejarCambio} />
            </div>
            <div class="mb-3">
                <label for="exampleInputAvatar1" class="form-label" >Ruta Avatar:</label>
                <input name="RutaAvatar" class="form-control" value={usuarioActual.RutaAvatar} onChange={manejarCambio} />
            </div>
            <div class="mb-3 form-check">
                <label for="exampleInputActivo1" class="form-check-label">Activo:</label>
                <input type="checkbox" class="form-check-input" name="Activo" checked={usuarioActual.Activo} onChange={manejarCambio} />
            </div>
            <div class="d-grid gap-2 d-md-flex justify-content-md-end">
                            <button type="submit" class="btn btn-secondary">{esEdicion ? 'Actualizar' : 'Crear'}</button>
            <button type="button" class="btn btn-primary" onClick={limpiarFormulario}>
                Nuevo
            </button>
            </div>
        </form>
    </div>

);
}

export default memo(UsuariosPage);
