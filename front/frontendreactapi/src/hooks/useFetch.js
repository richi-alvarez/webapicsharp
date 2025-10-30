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
            const response = await fetch(`${BASE_URL+url}`, {
            method: method,
            headers: {
                "Content-Type": "application/json",
            },
                body: JSON.stringify(body),
            });
            if (!response.ok) {
                throw new Error("Registration failed");
            }
            const data = await response.json();
            successCb(data, data.estado);
        } catch (error) {
            console.error("Error al registrar:", error);
            const errorMessage = error.mensaje || CONNECTION_ERROR_MSG;
            errorCb(errorMessage, 502);
        }
        setLoadingState(false);

    }

    return [isLoading, makeFetchRequestCb];
}

export default useFetch;