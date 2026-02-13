import { Route } from 'react-router-dom';
import { AdminLayout } from '../../pages/admin/AdminLayout';

// Importação dos Módulos Separados
import { DashboardRoutes } from './dashboard.routes';
import { OrderRoutes } from './orders.routes';
import { ProductRoutes } from './products.routes';
import { CategoryRoutes } from './categories.routes';
import { ReportRoutes } from './reports.routes';

/**
 * Agregador de Rotas Administrativas
 * Usa o AdminLayout como wrapper para todas as sub-rotas
 */
export function AdminRoutes() {
  return (
    <Route element={<AdminLayout />}>
      {DashboardRoutes()}
      {OrderRoutes()}
      {ProductRoutes()}
      {CategoryRoutes()}
      {ReportRoutes()}
    </Route>
  );
}