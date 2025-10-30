import React, {useEffect} from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const LogoutPage = () => {
    const { logout,setToken } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        // Eliminar el token de autenticación al cerrar sesión
        logout();
        localStorage.removeItem("authToken");
        console.log("User logged out");
        navigate("/");
    }, []);

    return (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
            <h2>You have been logged out.</h2>
        </div>
    );
}

export default LogoutPage;