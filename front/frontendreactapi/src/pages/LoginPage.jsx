import React, {useState, useEffect} from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const LoginPage = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const { login, loading } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const result = await login(username, password);
            if(result && result.estado == 200){
                navigate("/"); // Redirigir a la página de inicio después del registro
            }
        } catch (err) {
            setError("Invalid username or password");
        }
    };
    if (loading) {
        return (
            <div className="d-flex justify-content-center p-4">
                    <div className="spinner-border" role="status">
                        <span className="visually-hidden">Cargando responsables...</span>
                    </div>
                </div>
        ); // or a spinner
    }
    return (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", width: "300px" }}>
                <h2>Login</h2>
                {error && <div style={{ color: "red", marginBottom: "10px" }}>{error}</div>}
                <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    style={{ marginBottom: "10px", padding: "8px" }}
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    style={{ marginBottom: "10px", padding: "8px" }}
                />
                <button type="submit" style={{ padding: "10px", backgroundColor: "#283593", color: "white", border: "none" }}>
                    Login
                </button>
            </form>
        </div>
    );
};

export default LoginPage;