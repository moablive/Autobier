import { Route } from 'react-router-dom';
import { Login } from '../components/Login';

/**
 * Rotas de autenticação
 */
export function AuthRoutes() {
  return (
    <>
      {/* Login administrativo */}
      <Route path="/admin/login" element={<Login />} />
    </>
  );
}