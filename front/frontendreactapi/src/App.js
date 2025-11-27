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
import ProductoEntregable from './pages/ProductoEntregable.jsx';
import ResponsableEntregable from './pages/ResponsableEntregable.jsx';
import Wellcome from './pages/Wellcome.jsx';
import { PrivateRoute } from './components/PrivateRoute.jsx';

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
              <Route path="/usuarios" element={
                <PrivateRoute roles={['Administrador']}>
                  <UsuariosPage />
                </PrivateRoute>
                }
              />
              <Route path="/tiporesponsable" 
                element={
                <PrivateRoute roles={['Administrador']}>
                  <TipoResponsable />
                </PrivateRoute>
                } 
              />
              <Route path="/responsable" 
                element={
                 <PrivateRoute roles={['Administrador', 'User']}> 
                  <Responsable />
                </PrivateRoute>  
              } />
              <Route path="/tipoproyectos" 
                element={
                  <PrivateRoute roles={['Administrador']}>
                    <TipoProyectoPage />
                  </PrivateRoute>
                } />
              <Route path="/estados" 
                element={
                  <PrivateRoute roles={['Administrador']}>
                    <EstadoPage />
                  </PrivateRoute>
                  } 
              />
              <Route path="/entregables" 
                element={
                  <PrivateRoute roles={['Administrador', 'User']}>
                    <EntregablesPage />
                  </PrivateRoute>
                } />
              <Route path="/proyectos" element={
                <PrivateRoute roles={['Administrador', 'User']}>
                  <ProyectoPage />
                </PrivateRoute>
              } />
              <Route path="/estadoproyecto" element={
                <PrivateRoute roles={['Administrador', 'User']}>
                  <EstadoProyecto />
                </PrivateRoute>
              } />
              <Route path="/tipoproducto" element={
                <PrivateRoute roles={['Administrador']}>
                  <TipoProducto />
                </PrivateRoute>
              } />
              <Route path="/productos" element={
                <PrivateRoute roles={['Administrador', 'User']}>
                  <ProductoPage />
                </PrivateRoute>
              } />
              <Route path="/proyectoproducto" element={
                <PrivateRoute roles={['Administrador', 'User']}>
                  <ProyectoProducto />
                </PrivateRoute>
              } />
              <Route path="/productoentregable" element={
                <PrivateRoute roles={['Administrador', 'User']}>
                  <ProductoEntregable />
                </PrivateRoute>
              } />
              <Route path="/responsableentregable" element={
                <PrivateRoute roles={['Administrador', 'User']}>
                  <ResponsableEntregable />
                </PrivateRoute>
              } />
            </Route>
          </Route>
          <Route path="*" element={<LoginPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
