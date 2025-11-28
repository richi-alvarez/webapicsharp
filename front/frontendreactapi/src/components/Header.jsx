import React, {useState, useEffect} from "react";
import { useNavigate,Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export const Header = ({showSidebar}) => {
    const { getImage } = useAuth();
    const [imageUrl, setImageUrl] = useState("assets/images/profile/user-1.jpg");

    useEffect(() => {
        // Aquí podrías usar getImage si necesitas cargar la imagen del usuario u otra lógica
        const rutaAvatar = localStorage.getItem("RutaAvatar");
        const email = localStorage.getItem("Email");
        var imageUrl = "";
        if (rutaAvatar) {
            imageUrl = getImage(rutaAvatar);
        }else{
            if(email){
                imageUrl = getImage(null, email);
            }
        }
        console.log("URL de la imagen del avatar:", imageUrl);
        if(imageUrl){
            setImageUrl(imageUrl);
        }
    }, [getImage]);

    return (
        <header className="app-header">
          <nav className="navbar navbar-expand-lg navbar-light">
          <ul className="navbar-nav">
            <li className="nav-item d-block d-xl-none">
              <a className="nav-link sidebartoggler " 
              id="headerCollapse" 
              href="#"
              onClick={(e) => {
                e.preventDefault();
                showSidebar();
              }}
              >
                <i className="ti ti-menu-2"></i>
              </a>
            </li>
            <li className="nav-item dropdown">
              <a className="nav-link " href="#" id="drop1" data-bs-toggle="dropdown" aria-expanded="false">
                <i className="ti ti-bell"></i>
                <div class="notification bg-primary rounded-circle"></div>
              </a>
              <div className="dropdown-menu dropdown-menu-animate-up" aria-labelledby="drop1">
                <div className="message-body">
                  <a href="#" class="dropdown-item">
                    Item 1
                  </a>
                  <a href="#" class="dropdown-item">
                    Item 2
                  </a>
                </div>
              </div>
            </li>
          </ul>
          <div className="navbar-collapse justify-content-end px-0" id="navbarNav">
            <ul className="navbar-nav flex-row ms-auto align-items-center justify-content-end">
               
              <li className="nav-item dropdown">
                <a className="nav-link " href="#" id="drop2" data-bs-toggle="dropdown"
                  aria-expanded="false">
                  <img src={imageUrl} alt="" width="35" height="35" className="rounded-circle" />
                </a>
                <div className="dropdown-menu dropdown-menu-end dropdown-menu-animate-up" aria-labelledby="drop2">
                  <div className="message-body">
                    <a href="#" class="d-flex align-items-center gap-2 dropdown-item">
                      <i className="ti ti-user fs-6"></i>
                      <p className="mb-0 fs-3">My Profile</p>
                    </a>
                    <a href="#" class="d-flex align-items-center gap-2 dropdown-item">
                      <i className="ti ti-mail fs-6"></i>
                      <p className="mb-0 fs-3">My Account</p>
                    </a>
                    <a href="#" class="d-flex align-items-center gap-2 dropdown-item">
                      <i className="ti ti-list-check fs-6"></i>
                      <p className="mb-0 fs-3">My Task</p>
                    </a>
                     <Link className="btn btn-outline-primary mx-3 mt-2 d-block" to="/logout">Cerrar Sesión</Link>
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </nav>
        </header>
    )
}