const BASE_URL = "http://localhost:5031/api";

// ✅ Función helper para manejar errores de respuesta
async function handleResponseError(resp) {
    let errorData = { mensaje: `HTTP ${resp.status}: ${resp.statusText}` };
    
    const contentType = resp.headers.get("content-type");
    
    try {
        if (contentType && contentType.includes("application/json")) {
            errorData = await resp.json();
        } else {
            const textData = await resp.text();
            if (textData) {
                errorData.mensaje = textData;
            }
        }
    } catch (parseError) {
        console.warn("No se pudo parsear el error:", parseError);
    }

    const error = new Error(errorData.mensaje || "Error en la petición");
    error.status = resp.status;
    error.mensaje = errorData.mensaje;
    error.estado = errorData.estado || resp.status;
    
    throw error;
}

export async function get(path, token) {
    try {
        const resp = await fetch(BASE_URL + path, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        if (!resp.ok) {
            await handleResponseError(resp);
        }

        const data = await resp.json();
        return data.datos;
    } catch (error) {
        console.error("Error en GET:", error);
        throw error;
    }
}


export async function post(path, model, token) {
    try {
        const resp = await fetch(BASE_URL + path, {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
            body: JSON.stringify(model),
        });

        if (!resp.ok) {
            let errorMessage = "Error al registrar el dato";
            
            // ✅ Manejar respuestas de error sin JSON
            const contentType = resp.headers.get("content-type");
            
            if (contentType && contentType.includes("application/json")) {
                try {
                    const errorData = await resp.json();
                    errorMessage = errorData.mensaje || errorMessage;
                } catch (jsonError) {
                    // Si falla el JSON, usar texto plano
                    try {
                        const textData = await resp.text();
                        errorMessage = textData || errorMessage;
                    } catch (textError) {
                        errorMessage = `HTTP ${resp.status}: ${resp.statusText}`;
                    }
                }
            } else {
                try {
                    const textData = await resp.text();
                    errorMessage = textData || `HTTP ${resp.status}: ${resp.statusText}`;
                } catch (textError) {
                    errorMessage = `HTTP ${resp.status}: ${resp.statusText}`;
                }
            }

            const error = new Error(errorMessage);
            error.status = resp.status;
            throw error;
        }

        return await resp.json();
    } catch (error) {
        console.error("Error en POST:", error);
        throw error;
    }
}

export async function put(path, Id, model, esquema = null,token, query='Id') {
    try {
        const url = `${BASE_URL + path}/${query}/${encodeURIComponent(Id)}${esquema || ''}`;
        const resp = await fetch(url, {
            method: "PUT",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
            body: JSON.stringify(model),
        });

        if (!resp.ok) {
            let errorMessage = "Error al actualizar";
            
            try {
                const textData = await resp.text();
                errorMessage = textData || errorMessage;
            } catch (textError) {
                errorMessage = `HTTP ${resp.status}: ${resp.statusText}`;
            }

            const error = new Error(errorMessage);
            error.status = resp.status;
            throw error;
        }

        return await resp.json();
    } catch (error) {
        console.error("Error en PUT:", error);
        throw error;
    }
}

export async function del(path, Id,token, query='Id') {
    try {
        const url = `${BASE_URL + path}/${query}/${encodeURIComponent(Id)}`;
        const resp = await fetch(url, { 
            method: "DELETE",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` }
        });

        if (!resp.ok) {
            let errorMessage = "Error al eliminar";
            
            try {
                const textData = await resp.text();
                errorMessage = textData || errorMessage;
            } catch (textError) {
                errorMessage = `HTTP ${resp.status}: ${resp.statusText}`;
            }

            const error = new Error(errorMessage);
            error.status = resp.status;
            throw error;
        }

        return await resp.json();
    } catch (error) {
        console.error("Error en DELETE:", error);
        throw error;
    }
}