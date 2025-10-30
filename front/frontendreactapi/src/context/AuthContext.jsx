import React, {createContext, useContext, useState, useEffect, use} from "react";
import useFetch from "../hooks/useFetch";

const AuthContext = createContext();

export const AuthProvider = ({children}) => {
    const [token, setToken] = useState(() => localStorage.getItem("authToken") || null);
    const [registing, registerRequest] = useFetch("Usuario?esquema=valor&camposEncriptar=contrasena", "POST");
    const [charging, makeActivedAvatar] = useFetch("Usuario/verificar-contrasena?esquema=valor", "POST");
    const [logining, makeLogin] = useFetch("Autenticacion/token", "POST");
    const loading = registing || logining || charging;
    useEffect(() => {
        const storedToken = localStorage.getItem("authToken");
        if (storedToken) {
            setToken(storedToken);
        }
    
    }, []);

    const activedAvatar = async (email,contrasena) => {
        return new Promise((resolve, reject) => {
        setTimeout(async () => {
            try {
                await makeActivedAvatar(
                    { 
                        "campoUsuario": "email",
                        "campoContrasena": "contrasena",
                        "valorUsuario": email,
                        "valorContrasena": contrasena
                    }, 
                    null, 
                    (data) => {
                        console.log("Login user data:", data);
                        localStorage.setItem("authToken", data.token);
                        setToken(data.token);
                        resolve(data);
                    }
                );
            } catch (error) {
                console.error("Error en registro:", error);
                reject(error);
            }
        }, 3000);
    });
    };

    const login = async (email,contrasena) => {
        return new Promise((resolve, reject) => {
        setTimeout(async () => {
            try {
                await makeLogin(
                    { 
                        "tabla": "Usuario",
                        "campoUsuario": "email",
                        "campoContrasena": "contrasena",
                        "usuario": email,
                        "contrasena": contrasena
                    }, 
                    null, 
                    (data) => {
                        localStorage.setItem("authToken", data.token);
                        setToken(data.token);
                        resolve(data);
                    }
                );
            } catch (error) {
                console.error("Error en registro:", error);
                reject(error);
            }
        }, 3000);
    });
    };

    const logout = () => {
        localStorage.removeItem("authToken");
        setToken(null);
    };


// Opción 2: Con setTimeout (si necesitas el delay)
const register = async (email, password, avatar, activo) => {
    return new Promise((resolve, reject) => {
        setTimeout(async () => {
            try {
                await registerRequest(
                    { email, "contrasena": password, "rutaavatar": avatar, activo }, 
                    null, 
                    (data) => {
                        console.log("Registered user data:", data);
                        resolve(data);
                    }
                );
            } catch (error) {
                console.error("Error en registro:", error);
                reject(error);
            }
        }, 3000);
    });
};


    return (
        <AuthContext.Provider value={{token, login, logout, loading, register, activedAvatar}}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
