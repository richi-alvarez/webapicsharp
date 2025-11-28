import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { get, post, put, del } from '../api/api';
import { useAuth } from '../context/AuthContext';
// ✅ Fila memorizada: solo se re-renderiza si cambia el usuario
const UsuarioRow = memo(({ usuario, onEdit, onDelete, token }) => (

    <tr>
        <td>{usuario.Email}</td>
        <td>{usuario.Contrasena}</td>
        <td>{usuario.RutaAvatar}</td>
        <td>{usuario.Activo ? 'Sí' : 'No'}</td>
        <td class="d-grid gap-2 d-md-flex justify-content-md-end">
            <button class="btn btn-warning" onClick={() => onEdit(usuario,token)}>Editar</button>
            <button class="btn btn-danger" onClick={() => onDelete(usuario.Id,token)}>Eliminar</button>
        </td>
    </tr>
));

function UsuariosPage() {
    const { token,uploadImage } = useAuth();
    const [usuarios, setUsuarios] = useState([]);
    const [usuarioActual, setUsuarioActual] = useState({
        Id: 0,
        Email: '',
        Contrasena: '',
        RutaAvatar: '',
        Activo: false,
    });
    const [avatar, setAvatar] = useState("");
    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState("");
    const [esEdicion, setEsEdicion] = useState(false);
    const [mensaje, setMensaje] = useState('');
    const [cargando, setCargando] = useState(false);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
        setAvatarFile(file);
        setAvatar(file.name); // Solo guardamos el nombre original para mostrar

        // Crear preview de la imagen
        const reader = new FileReader();
        reader.onload = (e) => {
            setAvatarPreview(e.target.result);
        };
        reader.readAsDataURL(file);
        }
    };

    // ✅ useCallback mantiene la referencia estable
    const cargarUsuarios = useCallback(async () => {
        setCargando(true);
        try {
            const data = await get('/Usuario', token);
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

    const prepararEdicion = useCallback((usuario, token) => {
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
                    let avatarFileName = "";
                    if (avatarFile) {
                        // Subir la imagen al servidor y obtener el nombre del archivo
                        const uploadResult = await uploadImage(avatarFile, usuarioActual.Email);
                        avatarFileName = uploadResult.fileName || uploadResult.nombre || avatarFile.name;
                        console.log("Imagen subida con nombre:", avatarFileName);
                    }
                    usuarioActual.RutaAvatar = avatarFileName;
                    await post('/Usuario?esquema=valor&camposEncriptar=Contrasena',usuarioActual, token);
                    setMensaje('Usuario creado correctamente.');
                } else {
                    await put('/Usuario',usuarioActual.Id, usuarioActual, '?esquema=valor&camposEncriptar=Contrasena', token);
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
        async (Id, token) => {
            const confirmado = window.confirm(`¿Seguro que quieres eliminar al usuario?`);
            if (!confirmado) return;
            try {
                await del('/Usuario',Id, token);
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
            usuarios.map((u) => (<UsuarioRow key={u.Id} usuario={u} token={token} onEdit={prepararEdicion} onDelete={eliminarUsuario} />
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
            <div className="mb-3">
                <label htmlFor="exampleInputAvatar1" className="form-label">Avatar</label>
                    <input 
                    ame="RutaAvatar"
                    type="file" 
                    className="form-control" 
                    id="exampleInputtext1"
                    aria-describedby="textHelp"
                    onChange={handleFileChange}
                    accept="image/*"
                    />
                    {avatarPreview && (
                      <div className="mt-3 text-center">
                        <img 
                          src={avatarPreview} 
                          alt="Preview" 
                          style={{
                            width: '100px', 
                            height: '100px', 
                            objectFit: 'cover', 
                            borderRadius: '50%',
                            border: '2px solid #ddd'
                          }} 
                        />
                        <p className="mt-2 text-muted">{avatar}</p>
                      </div>
                    )}
                    <div className="form-text">Selecciona una imagen para tu avatar (JPG, PNG, GIF)</div>
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
