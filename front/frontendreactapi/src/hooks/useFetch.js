import { useState, useCallback } from "react";

// Debug: Verificar que la variable de entorno se está cargando
console.log("🔧 Variable de entorno REACT_APP_API_URL:", process.env.REACT_APP_API_URL);

const apiUrl = process.env.REACT_APP_API_URL;
const BASE_URL = apiUrl;

console.log("🌐 BASE_URL configurada:", BASE_URL);

const useFetch = (url, method = 'GET') => {
    const [isLoading, setLoadingState] = useState(false);
    const makeFetchRequestCb = useCallback(makeFetchRequest, [url, method]);

    async function makeFetchRequest(body, authToken, successCb, errorCb = () => {}) {
        setLoadingState(true);
        const CONNECTION_ERROR_MSG = "Connection error";

        var requestUrl = `${BASE_URL}/${url}`;

        const headers = {
          "Content-type": "application/json"
        } 

        if(authToken){
            headers["Authorization"] = authToken;
        }
       
        try{
            // ✅ ESPERAR 2 SEGUNDOS ANTES DE HACER LA PETICIÓN
            console.log("Esperando 2 segundos...");
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            if(method === 'GET'){
                // Para GET, el body se usa como parte de la URL (path parameters)
                if(body && body !== null){
                    requestUrl += `${body}`;
                }
                var response = await fetch(requestUrl, {
                    method: method,
                    headers: headers
                });
            }else{
                if(url.includes("Upload/avatar")){
                    // Para subida de archivos, NO establecer Content-Type manualmente
                    // El browser establece automáticamente multipart/form-data con boundary
                    const uploadHeaders = {
                        'accept': '*/*'
                    };
                    if(authToken){
                        uploadHeaders["Authorization"] = authToken;
                    }
                    // Verificar que body es FormData
                    console.log("Enviando FormData:", body instanceof FormData);
                    var response = await fetch(requestUrl, {
                        method: method,
                        headers: uploadHeaders,
                        body: body, // body debe ser FormData
                    });
                }else{
                    var response = await fetch(requestUrl, {
                        method: method,
                        headers: headers,
                        body: JSON.stringify(body),
                    });
                }
            }
            if (!response.ok) {
                const data = await response.json();
                //errorCb(data.mensaje || "Request failed", data.estado || response.status);
                const error = new Error(data.mensaje || "Request failed");
                error.status = response.status;
                error.mensaje = data.mensaje || "Request failed";
                error.estado = data.estado || response.status;
                
                throw error;
            }
            const data = await response.json();
            successCb(data, data.estado || 200);
            return data;
        } catch (error) {
            console.error("Error al registrar:", error);
            const errorMessage = error.mensaje || CONNECTION_ERROR_MSG;
            errorCb(errorMessage, error.status || 500);
        }finally{
            setLoadingState(false);
        }
    }

    return [isLoading, makeFetchRequestCb];
}

export default useFetch;