import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { fetchUsuarios, crearUsuario, actualizarUsuarioPorId, eliminarUsuarioPorId } from '../api/estados';

// ✅ Fila memorizada: solo se re-renderiza si cambia el usuario
const UsuarioRow = memo(({ usuario, onEdit, onDelete }) => (

    <tr>
        <td>{usuario.Nombre}</td>
        <td>{usuario.Descripcion}</td>
        <td>{usuario.Acciones}</td>
        <td class="d-grid gap-2 d-md-flex justify-content-md-end">
            <button class="btn btn-warning" onClick={() => onEdit(usuario)}>Editar</button>
            <button class="btn btn-danger" onClick={() => onDelete(usuario.Id)}>Eliminar</button>
        </td>
    </tr>
));

function EstadosPage() {
    const [usuarios, setUsuarios] = useState([]);
    const [usuarioActual, setUsuarioActual] = useState({
        Id: 0,
        Nombre: '',
        Descripcion: '',
    });
    const [esEdicion, setEsEdicion] = useState(false);
    const [mensaje, setMensaje] = useState('');
    const [cargando, setCargando] = useState(false);

    // ✅ useCallback mantiene la referencia estable
    const cargarUsuarios = useCallback(async () => {
        setCargando(true);
        try {
            const data = await fetchUsuarios(window.location.pathname);
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
            Nombre: '',
            Descripcion: '',
            Acciones: '',
        });
        setEsEdicion(false);
        setMensaje('');
    }, []);

    const guardarUsuario = useCallback(
        async (e) => {
            e.preventDefault();
            try {
                if (!esEdicion) {
                    let newProyect = {
                        Nombre: usuarioActual.Nombre,
                        Descripcion: usuarioActual.Descripcion,
                    }
                    await crearUsuario(window.location.pathname,newProyect);
                    setMensaje('Estados creado correctamente.');
                } else {
                    await actualizarUsuarioPorId(window.location.pathname,usuarioActual.Id, usuarioActual);
                    setMensaje('Estados actualizado correctamente.');
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
            const confirmado = window.confirm(`¿Seguro que quieres eliminar al Estados?`);
            if (!confirmado) return;
            try {
                await eliminarUsuarioPorId(window.location.pathname,Id);
                setMensaje('Estados eliminado correctamente.');
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

    return (<div style={{margin:"10px"}}> <h1>Gestión de Estados</h1>
        {cargando && <p>Cargando...</p>}
        {mensaje && <div>{mensaje}</div>}
        <table className="table table-striped caption-top">
            <caption>Lista de Estados</caption>
            <thead>
                <tr>
                    <th>Nombre</th>
                    <th>Descripción</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody>{filasUsuarios}</tbody>
        </table>

        <form onSubmit={guardarUsuario}>
            <div class="mb-3">
                <label for="exampleInputEmail1" class="form-label">Nombre:</label>
                <input type="text" class="form-control"  name="Nombre" value={usuarioActual.Nombre} onChange={manejarCambio} />
            </div>
            <div class="mb-3">
                <label for="exampleInputPassword1" class="form-label">Descripción:</label>
                <input type="text" class="form-control" name="Descripcion" value={usuarioActual.Descripcion} onChange={manejarCambio} />
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

export default memo(EstadosPage);
