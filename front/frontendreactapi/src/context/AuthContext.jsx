import React, {createContext, useContext, useState, useEffect, useCallback} from "react";
import useFetch from "../hooks/useFetch";

const AuthContext = createContext();

export const AuthProvider = ({children}) => {
    const [token, setToken] = useState(() => localStorage.getItem("authToken") || null);
    const [rol, setRol] = useState(() => localStorage.getItem("rol") || null);
    const [rutaAvatar, setRutaAvatar] = useState(() => localStorage.getItem("RutaAvatar") || null);
    const [idUsuario, setIdUsuario] = useState(null);
    const [emailUsuario, setEmailUsuario] = useState(null);
    const [isLoading, setLoading] = useState(false);
    const [registing, registerRequest] = useFetch("Usuario?esquema=valor&camposEncriptar=contrasena", "POST");
    const [charging, makeActivedAvatar] = useFetch("Usuario/verificar-contrasena?esquema=valor", "POST");
    const [isGettingUser, getUser] = useFetch("Usuario/Email", "GET");
    const [isSarchingRol, getRol] = useFetch(`Usuario_rol/IdUsuario`, "GET");
    const [isSearchingImage, getAvatarImage] = useFetch(`Upload/avatar/${rutaAvatar}`, "GET");
    const [ isSettingRole, setRoleRequest ] = useFetch("Usuario_rol", "POST");
    const [logining, makeLogin] = useFetch("Autenticacion/token", "POST");
    const [isUpdatingImage, updateImage] = useFetch("Upload/avatar", "POST");
    const loading = registing || logining || charging || isSarchingRol || isLoading || isGettingUser || isUpdatingImage || isSettingRole || isSearchingImage;
    useEffect(() => {
        const storedToken = localStorage.getItem("authToken");
        if (storedToken) {
            setToken(storedToken);
        }
        const storedRol = localStorage.getItem("rol");
        if (storedRol) {
            setRol(storedRol);
        }
        const rutaAvatar = localStorage.getItem("RutaAvatar");
        if (rutaAvatar) {
            setRutaAvatar(rutaAvatar);
        }
        const usurioId = localStorage.getItem("UserId");
        if (usurioId) {
            setIdUsuario(usurioId);
        }
    }, []);

    useEffect(() => {
        const handleRoles = async () => {
            if(emailUsuario){
                try{
                    localStorage.setItem("Email", emailUsuario);
                    var userId = localStorage.getItem("UserId");
                    if(!userId){
                        const user = await getUserByEmail(emailUsuario);
                        if(user && user.datos && user.datos[0].Id){
                            localStorage.setItem("UserId",user.datos[0].Id);
                            setIdUsuario(user.datos[0].Id);
                            userId = user.datos[0].Id;
                        }
                    }
                    const rolresult = await searchRols(userId);
                    if(rolresult.datos && rolresult.datos.length > 0){
                        console.log("Roles del usuario encontrados:", rolresult.datos);
                        localStorage.setItem("rol", rolresult.datos[0].IdRol);
                        setRol(rolresult.datos[0].IdRol);
                    }else{
                        console.log("Usuario sin roles asignados, asignando rol por defecto");
                        await setRole(2, userId);
                        localStorage.setItem("rol", "2");
                        setRol("2");
                    }
                } catch (err) {
                    console.error("Error al buscar roles, asignando rol por defecto:", err);
                    try {
                        await setRole(2, userId);
                        localStorage.setItem("rol", "2");
                        setRol("2");
                        console.log("Rol por defecto asignado exitosamente");
                    } catch (setRoleErr) {
                        console.error("Error al asignar rol por defecto:", setRoleErr);
                    }
                }
            }
        };

        handleRoles();
    }, [emailUsuario]);


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

    const setRole = async (IdRol,IdUsuario) => {
        return new Promise((resolve, reject) => {
            setTimeout(async () => {
                try {
                    await setRoleRequest(
                        { 
                            "IdRol": IdRol,
                            "IdUsuario": IdUsuario
                        }, 
                        null, 
                        (data) => {
                            console.log("Setted Role:", data);
                            resolve(data);
                        },
                        (error) => {
                            console.error("Error en asignar rol al usuario:", error);
                            reject(error);
                        }
                    );
                } catch (error) {
                    console.error("Error en registro de roles:", error);
                    reject(error);
                }
            }, 1000);
        });
    };

    const searchRols = async (id) => {
        return new Promise(async (resolve, reject) => {
            try {
                await getRol(
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
        localStorage.removeItem("RutaAvatar");
        localStorage.removeItem("UserId");
        localStorage.removeItem("Email");
        setToken(null);
        setRol(null);
        setRutaAvatar(null);
        setIdUsuario(null);
        setEmailUsuario(null);
    };


// Opción 2: Con setTimeout (si necesitas el delay)
const register = async (email, password, avatar, activo) => {
    return new Promise((resolve, reject) => {
        setTimeout(async () => {
            try {
                await registerRequest(
                    { email, "contrasena": password, "rutaavatar": avatar, activo }, 
                    null, 
                    async (data) => {
                        try{
                            if(data && data.estado == 200){
                                console.log("Registered user data:", data);
                                if(data.data && data.data.exito){
                                    /*const roleUser = await setRole(2, data.data.Id);
                                    if(roleUser){
                                        resolve(data);
                                    }*/
                                   setRutaAvatar(data.data.registro.RutaAvatar);
                                   localStorage.setItem("RutaAvatar", data.data.registro.RutaAvatar);
                                   setIdUsuario(data.data.registro.Id);
                                    localStorage.setItem("UserId", data.data.registro.Id);                                  
                                   resolve(data);
                                }
                            }else{
                                reject(data);
                            }
                        } catch (error) {
                            console.error("Error en registro de roles:", error);
                            reject(error);
                        }
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

const uploadImage = async (file, email) => {
    return new Promise((resolve, reject) => {
        const formData = new FormData();
        formData.append('avatar', file);
        formData.append('email', email); // Agregar email al FormData
        setTimeout(async () => {
            try {
                await updateImage(
                    formData, 
                    null, 
                    (data) => {
                        console.log("Registered Image:", data);
                        resolve(data);
                    },
                    (error) => {
                        console.error("Error en registro:", error);
                        reject(error);
                    }
                );
            } catch (error) {
                console.error("Error respuesta uploadImage:", error);
                reject(error);
            }
        }, 1000);
    });
}

const getImage = useCallback((rutaAvatar, email) => {
    const apiUrl = process.env.REACT_APP_API_URL || 'http://proyectositm-10221.runasp.net/api';
    if(rutaAvatar){
        return `${apiUrl}/Upload/avatar/${rutaAvatar}`;
    }else{
        if(email){
            const defaultAvatarUrl = `${apiUrl}/Upload/avatar/by-email/${email}`;
            return defaultAvatarUrl;
        }else{
            return null;
        }
    }
}, [rutaAvatar]);

    return (
        <AuthContext.Provider value={{token, rol, idUsuario, login, logout, uploadImage, loading, register, activedAvatar, getImage}}>
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
