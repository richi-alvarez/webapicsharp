import React, { useState } from 'react';
import { Link, Outlet } from 'react-router-dom';

export const Layout = () => {
  const [isUsuarioOpen, setIsUsuarioOpen] = useState(false);
  const [activeMenuItem, setActiveMenuItem] = useState('inicio');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleUsuarioMenu = () => {
    setIsUsuarioOpen(!isUsuarioOpen);
  };

  const showSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleMenuItemClick = (menuItem) => {
    setActiveMenuItem(menuItem);
  };

  return (
    <div
     className={`page-wrapper  ${isSidebarOpen  ? 'show-sidebar' : ''}`}
    id="main-wrapper" data-layout="vertical" data-navbarbg="skin6" data-sidebartype="full"
      data-sidebar-position="fixed" data-header-position="fixed">
      {/* Sidebar Start */}
      <aside className="left-sidebar">
        {/* Sidebar scroll */}
        <div>
          <div className="brand-logo d-flex align-items-center justify-content-between">
            <a href="./index.html" className="text-nowrap logo-img">
              <img src="assets/images/logos/logo.svg" alt="" />
            </a>
            <div className="close-btn d-xl-none d-block sidebartoggler cursor-pointer" 
            id="sidebarCollapse"
             onClick={(e) => {
                e.preventDefault();
                showSidebar();
              }}
            >
              <i className="ti ti-x fs-6"></i>
            </div>
          </div>
          {/* Sidebar navigation */}
          <nav className="sidebar-nav scroll-sidebar" data-simplebar="">
            <ul id="sidebarnav">
              <li className="nav-small-cap">
                <i className="ti ti-dots nav-small-cap-icon fs-4"></i>
                <span className="hide-menu">Menu</span>
              </li>
              <li className={`sidebar-item`}>
                <Link 
                  to="/wellcome" 
                  className={`sidebar-link justify-content-between  ${activeMenuItem === 'inicio' ? 'active' : ''}`}
                  onClick={() => handleMenuItemClick('inicio')}
                >
                  <div className="d-flex align-items-center gap-3">
                    <span className="d-flex">
                      <i className="ti ti-aperture"></i>
                    </span>
                    <span className="hide-menu">Inicio</span>
                  </div>
                </Link>
              </li>
              <li className={`sidebar-item`}>
                <a 
                  href="#" 
                  aria-expanded={isUsuarioOpen} 
                  className={`sidebar-link justify-content-between has-arrow ${activeMenuItem === 'usuario' ? 'active' : ''}`}
                  onClick={(e) => {
                    e.preventDefault();
                    toggleUsuarioMenu();
                    handleMenuItemClick('usuario');
                  }}
                >
                  <div className="d-flex align-items-center gap-3">
                    <span className="d-flex">
                      <i className="ti ti-user-circle"></i>
                    </span>
                    <span className="hide-menu">Usuario</span>
                  </div>
                </a>
                <ul aria-expanded={isUsuarioOpen} className={`collapse first-level ${isUsuarioOpen ? 'in' : ''}`}>
                  <li className="sidebar-item">
                    <Link to="/usuarios" className="sidebar-link justify-content-between">
                      <div class="d-flex align-items-center gap-3">
                        <div class="round-16 d-flex align-items-center justify-content-center">
                          <i class="ti ti-circle"></i>
                        </div>
                        <span class="hide-menu">Usuarios</span>
                      </div>
                    </Link>
                  </li>
                </ul>
              </li>
              {/* Add more sidebar items as needed */}
            </ul>
          </nav>
          {/* End Sidebar navigation */}
        </div>
        {/* End Sidebar scroll */}
      </aside>
      {/* Sidebar End */}
      {/* Main wrapper start */}
      <div className='body-wrapper'>

        {/* Header start */}
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
                  <img src="assets/images/profile/user-1.jpg" alt="" width="35" height="35" className="rounded-circle" />
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
                    <a href="./authentication-login.html" class="btn btn-outline-primary mx-3 mt-2 d-block">Logout</a>
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </nav>
        </header>
        {/* Header end */}

        <div className="body-wrapper-inner">
          <div class="container-fluid">
            <nav style={{ padding: '1rem', backgroundColor: '#f0f0f0', marginBottom: '1rem', display: 'none' }}>
              <Link to="/tipoproyectos">Tipos de Proyecto</Link>
              {' | '}
              <Link to="/estados">Estados</Link>
              {' | '}
              <Link to="/entregables">Entregables</Link>
              {' | '}
              <Link to="/tiporesponsable">Tipos de Responsable</Link>
              {' | '}
              <Link to="/responsable">Responsables</Link>
              {' | '}
              <Link to="/proyectos">Proyectos</Link>
              {' | '}
              <Link to="/estadoproyecto">Estado Proyecto</Link>
              {' | '}
              <Link to="/tipoproducto">Tipo Producto</Link>
              {' | '}
              <Link to="/productos">Productos</Link>
              {' | '}
              <Link to="/proyectoproducto">Proyecto Producto</Link>
              {' | '}
              <Link to="/productoentregable">Producto Entregable</Link>
              {' | '}
              <Link to="/logout">Cerrar Sesión</Link>
            </nav>
            <main style={{ padding: '1rem' }}>
              <Outlet />
            </main>
          </div>
        </div>

      </div>
    </div>
  );
};
