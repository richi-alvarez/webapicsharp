import React, {useState} from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export const RegisterPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [avatar, setAvatar] = useState("");
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const navigate = useNavigate();
  const { register, loading, uploadImage } = useAuth();
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatar(file.name); // Solo guardamos el nombre original para mostrar

      // Crear preview de la imagen
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null); // Limpiar errores previos
    
    try {
      let avatarFileName = "";
      
      if (avatarFile) {
        // Subir la imagen al servidor y obtener el nombre del archivo
        const uploadResult = await uploadImage(avatarFile, email);
        avatarFileName = uploadResult.fileName || uploadResult.nombre || avatarFile.name;
        console.log("Imagen subida con nombre:", avatarFileName);
      }
      
      // Registrar el usuario con el nombre del archivo de imagen
      const result = await register(email, password, avatarFileName, 0);
      console.log("Registro completado:", result);
      
      if (result && result.estado === 200) {
        navigate("/login"); // Redirigir al login después del registro
      }
    } catch (error) {
      console.error("Error al registrar usuario:", error);
      setError(error.message || "Error al registrar usuario. Intenta nuevamente.");
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
    }else{
return (
    <div className="page-wrapper" id="main-wrapper" data-layout="vertical" data-navbarbg="skin6" data-sidebartype="full"
    data-sidebar-position="fixed" data-header-position="fixed">
      {error &&<div style={{width:"500px", marginTop:"10px"}}
              > <div class="alert alert-warning" role="alert">
              {error}
              </div>
          </div>
      }
    <div
      className="position-relative overflow-hidden text-bg-light min-vh-100 d-flex align-items-center justify-content-center">
      <div className="d-flex align-items-center justify-content-center w-100">
        <div className="row justify-content-center w-100">
          <div className="col-md-8 col-lg-6 col-xxl-3">
            <div className="card mb-0">
              <div className="card-body">
                <a href="./index.html" className="text-nowrap logo-img text-center d-block py-3 w-100">
                  <img src="./assets/images/logos/logo.svg" alt=""/>
                </a>
                <p className="text-center">Your Social Campaigns</p>
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label htmlFor="exampleInputtext1" className="form-label">Avatar</label>
                    <input 
                    type="file" 
                    className="form-control" 
                    id="exampleInputtext1"
                    aria-describedby="textHelp"
                    onChange={handleFileChange}
                    accept="image/*"
                    />
                    {avatarPreview && (
                      <div className="mt-3 text-center">
                        <img 
                          src={avatarPreview} 
                          alt="Preview" 
                          style={{
                            width: '100px', 
                            height: '100px', 
                            objectFit: 'cover', 
                            borderRadius: '50%',
                            border: '2px solid #ddd'
                          }} 
                        />
                        <p className="mt-2 text-muted">{avatar}</p>
                      </div>
                    )}
                    <div className="form-text">Selecciona una imagen para tu avatar (JPG, PNG, GIF)</div>
                  </div>
                  <div className="mb-3">
                    <label htmlFor="exampleInputEmail1" className="form-label">Email Address</label>
                    <input type="email" 
                    className="form-control" 
                    id="exampleInputEmail1" 
                    aria-describedby="emailHelp"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    />
                  </div>
                  <div className="mb-4">
                    <label htmlFor="exampleInputPassword1" className="form-label">Password</label>
                    <input 
                    type="password" 
                    className="form-control" 
                    id="exampleInputPassword1"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    />
                  </div>
                  <button  type="submit" className="btn btn-primary w-100 py-8 fs-4 mb-4 rounded-2">Sign Up</button>
                  <div className="d-flex align-items-center justify-content-center">
                    <p className="fs-4 mb-0 fw-bold">Already have an Account?</p>
                    <a className="text-primary fw-bold ms-2" href="./authentication-login.html">Sign In</a>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  );
    }
  };
