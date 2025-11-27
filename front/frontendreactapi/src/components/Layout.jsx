import React, { useState } from 'react';
import { Link, Outlet } from 'react-router-dom';
import {Header} from './Header';

export const Layout = () => {
  const [openMenus, setOpenMenus] = useState({});
  const [activeMenuItem, setActiveMenuItem] = useState('inicio');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleMenu = (menuName) => {
    setOpenMenus(prev => ({
      ...prev,
      [menuName]: !prev[menuName]
    }));
  };

  const showSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleMenuItemClick = (menuItem) => {
    setActiveMenuItem(menuItem);
  };
  const content =  <Outlet />;

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
                      <i className="ti ti-atom"></i>
                    </span>
                    <span className="hide-menu">Inicio</span>
                  </div>
                </Link>
              </li>
              <li className={`sidebar-item`}>
                <a 
                  href="#" 
                  aria-expanded={openMenus.usuario || false} 
                  className={`sidebar-link justify-content-between has-arrow ${activeMenuItem === 'usuario' ? 'active' : ''}`}
                  onClick={(e) => {
                    e.preventDefault();
                    toggleMenu('usuario');
                    handleMenuItemClick('usuario');
                  }}
                >
                  <div className="d-flex align-items-center gap-3">
                    <span className="d-flex">
                      <i className="ti ti-user-circle"></i>
                    </span>
                    <span className="hide-menu">Usuarios</span>
                  </div>
                </a>
                <ul aria-expanded={openMenus.usuario || false} className={`collapse first-level ${openMenus.usuario ? 'in' : ''}`}>
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
              <li className={`sidebar-item`}>
                <a 
                  href="#" 
                  aria-expanded={openMenus.proyectos || false} 
                  className={`sidebar-link justify-content-between has-arrow ${activeMenuItem === 'proyectos' ? 'active' : ''}`}
                  onClick={(e) => {
                    e.preventDefault();
                    toggleMenu('proyectos');
                    handleMenuItemClick('proyectos');
                  }}
                >
                  <div className="d-flex align-items-center gap-3">
                    <span className="d-flex">
                      <i className="ti ti-files"></i>
                    </span>
                    <span className="hide-menu">Proyectos</span>
                  </div>
                </a>
                <ul aria-expanded={openMenus.proyectos || false} className={`collapse first-level ${openMenus.proyectos ? 'in' : ''}`}>
                  <li className="sidebar-item">
                    <Link to="/proyectos" className="sidebar-link justify-content-between">
                      <div class="d-flex align-items-center gap-3">
                        <div class="round-16 d-flex align-items-center justify-content-center">
                          <i class="ti ti-circle"></i>
                        </div>
                        <span class="hide-menu">Proyectos</span>
                      </div>
                    </Link>
                  </li>
                  <li className="sidebar-item">
                    <Link to="/tipoproyectos" className="sidebar-link justify-content-between">
                      <div class="d-flex align-items-center gap-3">
                        <div class="round-16 d-flex align-items-center justify-content-center">
                          <i class="ti ti-circle"></i>
                        </div>
                        <span class="hide-menu">Tipos de Proyecto</span>
                      </div>
                    </Link>
                  </li>
                  <li className="sidebar-item">
                    <Link to="/estadoproyecto" className="sidebar-link justify-content-between">
                      <div class="d-flex align-items-center gap-3">
                        <div class="round-16 d-flex align-items-center justify-content-center">
                          <i class="ti ti-circle"></i>
                        </div>
                        <span class="hide-menu">Estado Proyecto</span>
                      </div>
                    </Link>
                  </li>
                  <li className="sidebar-item">
                    <Link to="/proyectoproducto" className="sidebar-link justify-content-between">
                      <div class="d-flex align-items-center gap-3">
                        <div class="round-16 d-flex align-items-center justify-content-center">
                          <i class="ti ti-circle"></i>
                        </div>
                        <span class="hide-menu">Producto Proyecto</span>
                      </div>
                    </Link>
                  </li>
                </ul>
              </li> 
              <li className={`sidebar-item`}>
                <Link 
                  to="/estados" 
                  className={`sidebar-link justify-content-between  ${activeMenuItem === 'estados' ? 'active' : ''}`}
                  onClick={() => handleMenuItemClick('estados')}
                >
                  <div className="d-flex align-items-center gap-3">
                    <span className="d-flex">
                      <i className="ti ti-chart-line"></i>
                    </span>
                    <span className="hide-menu">Estados</span>
                  </div>
                </Link>
              </li>  
              <li className={`sidebar-item`}>
                <Link 
                  to="/entregables" 
                  className={`sidebar-link justify-content-between  ${activeMenuItem === 'entregables' ? 'active' : ''}`}
                  onClick={() => handleMenuItemClick('entregables')}
                >
                  <div className="d-flex align-items-center gap-3">
                    <span className="d-flex">
                      <i className="ti ti-aperture"></i>
                    </span>
                    <span className="hide-menu">Entregables</span>
                  </div>
                </Link>
              </li>
              <li className={`sidebar-item`}>
                <a 
                  href="#" 
                  aria-expanded={openMenus.responsable || false} 
                  className={`sidebar-link justify-content-between has-arrow ${activeMenuItem === 'responsable' ? 'active' : ''}`}
                  onClick={(e) => {
                    e.preventDefault();
                    toggleMenu('responsable');
                    handleMenuItemClick('responsable');
                  }}
                >
                  <div className="d-flex align-items-center gap-3">
                    <span className="d-flex">
                      <i className="ti ti-user-circle"></i>
                    </span>
                    <span className="hide-menu">Responsables</span>
                  </div>
                </a>
                <ul aria-expanded={openMenus.responsable || false} className={`collapse first-level ${openMenus.responsable ? 'in' : ''}`}>
                  <li className="sidebar-item">
                    <Link to="/responsable" className="sidebar-link justify-content-between">
                      <div class="d-flex align-items-center gap-3">
                        <div class="round-16 d-flex align-items-center justify-content-center">
                          <i class="ti ti-circle"></i>
                        </div>
                        <span class="hide-menu">Responsables</span>
                      </div>
                    </Link>
                  </li>
                  <li className="sidebar-item">
                    <Link to="/tiporesponsable" className="sidebar-link justify-content-between">
                      <div class="d-flex align-items-center gap-3">
                        <div class="round-16 d-flex align-items-center justify-content-center">
                          <i class="ti ti-circle"></i>
                        </div>
                        <span class="hide-menu">Tipo de responsable</span>
                      </div>
                    </Link>
                  </li>
                  <li className="sidebar-item">
                    <Link to="/responsableentregable" className="sidebar-link justify-content-between">
                      <div class="d-flex align-items-center gap-3">
                        <div class="round-16 d-flex align-items-center justify-content-center">
                          <i class="ti ti-circle"></i>
                        </div>
                        <span class="hide-menu">Responsabe entregable</span>
                      </div>
                    </Link>
                  </li>
                </ul>
              </li> 
              <li className={`sidebar-item`}>
                <a 
                  href="#" 
                  aria-expanded={openMenus.productos || false} 
                  className={`sidebar-link justify-content-between has-arrow ${activeMenuItem === 'productos' ? 'active' : ''}`}
                  onClick={(e) => {
                    e.preventDefault();
                    toggleMenu('productos');
                    handleMenuItemClick('productos');
                  }}
                >
                  <div className="d-flex align-items-center gap-3">
                    <span className="d-flex">
                      <i className="ti ti-components"></i>
                    </span>
                    <span className="hide-menu">Productos</span>
                  </div>
                </a>
                <ul aria-expanded={openMenus.productos || false} className={`collapse first-level ${openMenus.productos ? 'in' : ''}`}>
                  <li className="sidebar-item">
                    <Link to="/productos" className="sidebar-link justify-content-between">
                      <div class="d-flex align-items-center gap-3">
                        <div class="round-16 d-flex align-items-center justify-content-center">
                          <i class="ti ti-circle"></i>
                        </div>
                        <span class="hide-menu">Productos</span>
                      </div>
                    </Link>
                  </li>
                  <li className="sidebar-item">
                    <Link to="/tipoproducto" className="sidebar-link justify-content-between">
                      <div class="d-flex align-items-center gap-3">
                        <div class="round-16 d-flex align-items-center justify-content-center">
                          <i class="ti ti-circle"></i>
                        </div>
                        <span class="hide-menu">Tipo de producto</span>
                      </div>
                    </Link>
                  </li>
                  <li className="sidebar-item">
                    <Link to="/productoentregable" className="sidebar-link justify-content-between">
                      <div class="d-flex align-items-center gap-3">
                        <div class="round-16 d-flex align-items-center justify-content-center">
                          <i class="ti ti-circle"></i>
                        </div>
                        <span class="hide-menu">Producto entregable</span>
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
        <Header showSidebar={showSidebar}/>
        {/* Header end */}

        <div className="body-wrapper-inner">
          <div class="container-fluid">
          
            <main className='row' style={{overflow:"auto"}}>
              {content}
            </main>
          </div>
        </div>

      </div>
    </div>
  );
};
