import React, {useState} from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export const RegisterPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [avatar, setAvatar] = useState("");
  const navigate = useNavigate();
  const { register, loading } = useAuth();
  const [error, setError] = useState(null);
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
     const result = await register(email, password, avatar, 0);
     console.log("Registro completado:", result);
     if(result && result.estado == 200){
         navigate("/"); // Redirigir a la página de inicio después del registro
     }
    } catch (error) {
      console.error("Error al registrar:", error);
       setError("Invalid username or password");
    }
  };
    if (loading) {
        return <div>Loading...</div>; // or a spinner
    }else{
return (
    <div>
      <h2>Register</h2>
      {error && <div style={{ color: "red", marginBottom: "10px" }}>{error}</div>}
      <form onSubmit={handleSubmit}>
        <div>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div>
            <label>Ruta Avatar:</label>
            <input
              type="text"
              value={avatar}
              onChange={(e) => {setAvatar(e.target.value)}}
              required
            />      
        </div>
        <button type="submit">Register</button>
      </form>
    </div>
  );
    }
  };
