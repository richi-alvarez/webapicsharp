import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import UsuariosPage from './pages/UsuariosPage';
import TipoProyectoPage from './pages/TipoProyectoPage';
import EstadoPage from './pages/EstadoPage';
import EntregablesPage from './pages/EntregablesPage';
import { RegisterPage } from './pages/RegisterPage';
import LogoutPage  from './pages/LogoutPage.jsx';
import TipoResponsable from './pages/TipoResponsable.jsx';
import Responsable from './pages/Responsable.jsx'; 
import ProyectoPage from './pages/ProyectoPage.jsx';
import EstadoProyecto from './pages/EstadoProyecto.jsx';
// puedes agregar más páginas, por ejemplo TipoProyectosPage, etc.

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <nav>
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
          <Link to="/register">Register</Link>
          {' | '}
          <Link to="/proyectos">Proyectos</Link>
          {' | '}
          <Link to="/estadoproyecto">Estado Proyecto</Link> 
          {' | '}
          <Link to="/logout">Log-out</Link>
        </nav>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/logout" element={<LogoutPage />} />
          <Route element={<ProtectedRoute />} >
            <Route path="/usuarios" element={<UsuariosPage />} />
            <Route path="/tiporesponsable" element={<TipoResponsable />} />
            <Route path="/responsable" element={<Responsable />} />
            <Route path="/tipoproyectos" element={<TipoProyectoPage />} />
            <Route path="/estados" element={<EstadoPage />} />
            <Route path="/entregables" element={<EntregablesPage />} />
            <Route path="/proyectos" element={<ProyectoPage />} />
            <Route path="/estadoproyecto" element={<EstadoProyecto />} />
          </Route>
          <Route path="*" element={<LoginPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
