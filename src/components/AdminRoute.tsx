import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate, Outlet } from 'react-router-dom';

/**
 * Este componente verifica se o usuário tem perfil de "Admin".
 * Se sim, renderiza a página solicitada (via <Outlet />).
 * Se não, redireciona o usuário para o Dashboard.
 */
const AdminRoute: React.FC = () => {
  const { userProfile } = useAuth();

  if (userProfile !== 'Admin') {
    // Usuário não é admin, redireciona
    return <Navigate to="/dashboard" replace />;
  }

  // Usuário é admin, permite o acesso
  return <Outlet />;
};

export default AdminRoute;