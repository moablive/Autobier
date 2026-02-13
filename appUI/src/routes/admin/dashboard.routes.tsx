import { Route } from 'react-router-dom';
import { PrivateRoute } from './PrivateRoute';
import { Dashboard } from '../../pages/admin/Dashboard/Dashboard';

export function DashboardRoutes() {
  return (
    <Route 
      path="/admin/dashboard" 
      element={
        <PrivateRoute adminOnly={true}>
          <Dashboard />
        </PrivateRoute>
      } 
    />
  );
}