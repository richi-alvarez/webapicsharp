import React, {useEffect} from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Wellcome = () => {
    const { logout,setToken } = useAuth();
    const navigate = useNavigate();

    return (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
            <h2>Bienvenido.</h2>
        </div>
    );
}

export default Wellcome;