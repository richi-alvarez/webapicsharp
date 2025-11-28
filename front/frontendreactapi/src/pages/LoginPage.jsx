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
                navigate("/wellcome"); // Redirigir a la página de inicio después del registro
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
        <div className="page-wrapper" id="main-wrapper" data-layout="vertical" data-navbarbg="skin6" data-sidebartype="full"
             data-sidebar-position="fixed" data-header-position="fixed">
            {error &&<div style={{width:"500px", marginTop:"10px"}}
                    > <div class="alert alert-warning" role="alert">
                    {error}
                    </div>
                </div>
            }
                <div className="position-relative overflow-hidden text-bg-light min-vh-100 d-flex align-items-center justify-content-center">

                    <div className="d-flex align-items-center justify-content-center w-100">
                        <div class="row justify-content-center w-100">
                            <div className="col-md-8 col-lg-6 col-xxl-3">
                                <div className="card mb-0">
                                    <div className="card-body">
                                        <a href="./index.html" className="text-nowrap logo-img text-center d-block py-3 w-100">
                                        <img src="./assets/images/logos/logo.svg" alt="" />
                                        </a>
                                        <p class="text-center">Your Social Campaigns</p>
                                        <form  onSubmit={handleSubmit}>
                                            <div className="mb-3">
                                                <label htmlFor="exampleInputEmail1" className="form-label">Username</label>
                                                <input 
                                                placeholder="Username"
                                                value={username}
                                                onChange={(e) => setUsername(e.target.value)}
                                                type="email" 
                                                className="form-control"
                                                id="exampleInputEmail1" 
                                                aria-describedby="emailHelp"
                                                  />
                                            </div>
                                            <div class="mb-4">
                                                <label htmlFor="exampleInputPassword1" className="form-label">Password</label>
                                                <input 
                                                type="password"
                                                placeholder="Password"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                className="form-control" id="exampleInputPassword1" />
                                            </div>
                                            <button type="submit" className="btn btn-primary w-100 py-8 fs-4 mb-4 rounded-2">
                                                Login
                                            </button>

                                        </form>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
        </div>
    );
};

export default LoginPage;