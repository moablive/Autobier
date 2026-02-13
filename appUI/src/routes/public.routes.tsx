import { Route } from 'react-router-dom';
import { UserHomepage } from '../pages/user/Homepage';

/**
 * Rotas públicas acessíveis pelos clientes
 */
export function PublicRoutes() {
  return (
    <>
      {/* Homepage com Cardápio e Carrinho */}
      <Route path="/" element={<UserHomepage />} />
    </>
  );
}