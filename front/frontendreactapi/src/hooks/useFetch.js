import { useState, useCallback } from "react";

const useFetch = (url, method = 'GET') => {
    const [isLoading, setLoadingState] = useState(false);
    const makeFetchRequestCb = useCallback(makeFetchRequest, [url, method]);

    async function makeFetchRequest(body, authToken, successCb, errorCb = () => {}) {
        setLoadingState(true);
        const CONNECTION_ERROR_MSG = "Connection error";
        const BASE_URL = 'http://localhost:5031/api/';
        
        const headers = {
          "Content-type": "application/json"
        } 

        if(authToken){
            headers["Authorization"] = authToken;
        }
        try{
            // ✅ ESPERAR 5 SEGUNDOS ANTES DE HACER LA PETICIÓN
            console.log("Esperando 5 segundos...");
            await new Promise(resolve => setTimeout(resolve, 5000));
            
            console.log("Realizando petición...");
            const response = await fetch(`${BASE_URL+url}`, {
             method: method,
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(body),
            });
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
            console.log("Petición exitosa:", data);
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