const BASE_URL = "http://localhost:5031/api";

export async function fetchUsuarios(path ,token) {
    console.log("path", path)
  const resp = await fetch(BASE_URL+path, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  if (!resp.ok) throw new Error("Error al obtener usuarios");
  const data = await resp.json();
  return data.datos;  // suponiendo que la respuesta tiene { datos: [...] }
}

export async function crearUsuario(path,usuario) {
  const resp = await fetch(BASE_URL+path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(usuario),
  });
  if (!resp.ok) throw new Error("Error al crear usuario");
  return await resp.json();
}

export async function actualizarUsuarioPorId(path, Id, usuario) {
  const url = `${BASE_URL+path}/Id/${encodeURIComponent(Id)}`;
  const resp = await fetch(url, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(usuario),
  });
  if (!resp.ok) {
    const txt = await resp.text();
    throw new Error(`Error al actualizar: ${txt}`);
  }
  return await resp.json();
}

export async function eliminarUsuarioPorId(path,Id) {
  const url = `${BASE_URL+path}/Id/${encodeURIComponent(Id)}`;
  const resp = await fetch(url, { method: "DELETE" });
  if (!resp.ok) {
    const txt = await resp.text();
    throw new Error(`Error al eliminar: ${txt}`);
  }
  return await resp.json();
}
