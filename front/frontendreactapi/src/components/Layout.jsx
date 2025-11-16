import React from 'react';
import { Link, Outlet } from 'react-router-dom';

export const Layout = () => {
  return (
    <div>
      <nav style={{ padding: '1rem', backgroundColor: '#f0f0f0', marginBottom: '1rem' }}>
        <Link to="/wellcome">Inicio</Link>
        {' | '}
        <Link to="/usuarios">Usuarios</Link>
        {' | '}
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
  );
};
