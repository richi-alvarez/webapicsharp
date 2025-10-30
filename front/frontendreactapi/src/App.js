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
import { LogoutPage } from './pages/LogoutPage.jsx';
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
          <Link to="/register">Register</Link>
          {' | '}
          <Link to="/logout">Log-out</Link>
        </nav>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/logout" element={<LogoutPage />} />
          <Route element={<ProtectedRoute />} >
            <Route path="/usuarios" element={<UsuariosPage />} />
            <Route path="/tipoproyectos" element={<TipoProyectoPage />} />
            <Route path="/estados" element={<EstadoPage />} />
            <Route path="/entregables" element={<EntregablesPage />} />
          </Route>
          <Route path="*" element={<LoginPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
