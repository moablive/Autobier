import { Navigate, useLocation } from 'react-router-dom';
import { authService } from '@autobier/http-client';
import type { IPrivateRouteProps } from '@autobier/types';

export function PrivateRoute({ children, adminOnly = false }: IPrivateRouteProps) {
  const location = useLocation();
  
  const isAuth = authService.isAuthenticated();
  const isAdmin = authService.isAdmin();

  // 1. Não logado -> Vai para o Login (Home)
  if (!isAuth) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // 2. É Operador tentando acessar rota de Admin -> Vai para Pedidos
  if (adminOnly && !isAdmin) {
    return <Navigate to="/admin/orders" replace />;
  }

  // 3. Acesso permitido
  return <>{children}</>;
}