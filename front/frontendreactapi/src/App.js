import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/Layout';
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
import TipoProducto from './pages/TipoProducto.jsx';
import ProductoPage from './pages/ProductoPage.jsx';
import ProyectoProducto from './pages/ProyectoProducto.jsx';
import Wellcome from './pages/Wellcome.jsx';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/logout" element={<LogoutPage />} />
          <Route element={<ProtectedRoute />} >
            <Route element={<Layout />}>
              <Route path="/wellcome" element={<Wellcome />} />
              <Route path="/usuarios" element={<UsuariosPage />} />
              <Route path="/tiporesponsable" element={<TipoResponsable />} />
              <Route path="/responsable" element={<Responsable />} />
              <Route path="/tipoproyectos" element={<TipoProyectoPage />} />
              <Route path="/estados" element={<EstadoPage />} />
              <Route path="/entregables" element={<EntregablesPage />} />
              <Route path="/proyectos" element={<ProyectoPage />} />
              <Route path="/estadoproyecto" element={<EstadoProyecto />} />
              <Route path="/tipoproducto" element={<TipoProducto />} />
              <Route path="/productos" element={<ProductoPage />} />
              <Route path="/proyectoproducto" element={<ProyectoProducto />} />
            </Route>
          </Route>
          <Route path="*" element={<LoginPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
