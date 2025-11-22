import React, {createContext, useContext, useState, useEffect, use} from "react";
import useFetch from "../hooks/useFetch";

const AuthContext = createContext();

export const AuthProvider = ({children}) => {
    const [token, setToken] = useState(() => localStorage.getItem("authToken") || null);
    const [idUsuario, setIdUsuario] = useState(null);
    const [emailUsuario, setEmailUsuario] = useState(null);
    const [isLoading, setLoading] = useState(false);
    const [registing, registerRequest] = useFetch("Usuario?esquema=valor&camposEncriptar=contrasena", "POST");
    const [charging, makeActivedAvatar] = useFetch("Usuario/verificar-contrasena?esquema=valor", "POST");
    const [isGettingUser, getUser] = useFetch("Usuario/Email", "GET");
    const [isSarchingRol, makeRol] = useFetch(`Usuario_rol/IdUsuario`, "GET");
    const [logining, makeLogin] = useFetch("Autenticacion/token", "POST");
    const loading = registing || logining || charging || isSarchingRol || isLoading || isGettingUser;
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
                        localStorage.setItem("authToken", data.token);
                        setToken(data.token);
                        resolve(data);
                    },
                    (error) => {
                        console.error("Error en activar usuario:", error);
                        reject(error);
                    }
                );
            } catch (error) {
                console.error("Error en registro:", error);
                reject(error);
            }
        }, 1000);
    });
    };

    const searchRols = async (id) => {
        return new Promise(async (resolve, reject) => {
            try {
                await makeRol(
                    `/${id}`, 
                    `Bearer ${token}`,
                    (data) => {
                        resolve(data);
                    },
                    (error) => {
                        console.error("Error en buscar roles:", error);
                        reject(error);
                    }
                );
            } catch (error) {
                console.error("Error en buscar roles:", error);
                reject(error);
            }
        });
    }

    const getUserByEmail = async (email) => {
        return new Promise(async (resolve, reject) => {
            try {
                await getUser(
                    `/${email}`,
                    `Bearer ${token}`,
                    (data) => {
                        resolve(data);
                    },
                    (error) => {
                        console.error("Error en buscar usuario:", error);
                        reject(error);
                    }
                );
            } catch (error) {
                console.error("Error en buscar usuario:", error);
                reject(error);
            }
        });
    }

    const login = async (email,contrasena) => {
        return new Promise(async (resolve, reject) => {
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
                    async (data) => {
                        localStorage.setItem("authToken", data.token);
                        setToken(data.token);
                        setEmailUsuario(email);
                        const emailresult = await getUserByEmail(email);
                        if(emailresult.datos.length > 0){
                            setIdUsuario(emailresult.datos[0].Id);
                            const rolresult =  await searchRols(emailresult.datos[0].Id);
                            if(rolresult.datos && rolresult.datos.length > 0){
                                console.log("Roles del usuario:", rolresult.datos);
                                localStorage.setItem("rol", rolresult.datos[0].IdRol);
                            }
                        }
                        
                        resolve(data);
                    },
                    (error) => {
                        console.error("Error en login:", error);
                        reject(error);
                    }
                );
            } catch (error) {
                console.error("Error en registro:", error);
                reject(error);
            }
        });
    };

    const logout = () => {
        localStorage.removeItem("authToken");
        localStorage.removeItem("rol");
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
                    },
                    (error) => {
                        console.error("Error en registro:", error);
                        reject(error);
                    }
                );
            } catch (error) {
                console.error("Error respuesta registro:", error);
                reject(error);
            }
        }, 1000);
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
