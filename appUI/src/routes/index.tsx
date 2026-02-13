import { Routes, Route, BrowserRouter, Navigate } from 'react-router-dom';
import { PublicRoutes } from './public.routes';
import { AuthRoutes } from './auth.routes';
import { AdminRoutes } from './admin/admin.routes';

/**
 * Configuração principal de rotas da aplicação
 * Organizado em módulos separados para melhor manutenção
 * 
 * Estrutura:
 * - PublicRoutes: Rotas acessíveis aos clientes (cardápio, homepage)
 * - AuthRoutes: Rotas de autenticação (login)
 * - AdminRoutes: Rotas administrativas protegidas (dashboard, produtos, etc)
 */
export function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        
        {/* =========================================================
            ROTAS PÚBLICAS (CLIENTE)
           ========================================================= */}
        {PublicRoutes()}

        {/* =========================================================
            ROTAS DE AUTENTICAÇÃO
           ========================================================= */}
        {AuthRoutes()}

        {/* =========================================================
            ROTAS ADMINISTRATIVAS (PROTEGIDAS)
           ========================================================= */}
        {AdminRoutes()}

        {/* =========================================================
            TRATAMENTO DE ERRO (404)
           ========================================================= */}
        {/* Redireciona rotas inexistentes para a homepage do cardápio */}
        <Route path="*" element={<Navigate to="/" replace />} />
        
      </Routes>
    </BrowserRouter>
  );
}