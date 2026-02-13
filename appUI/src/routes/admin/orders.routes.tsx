import { Route } from 'react-router-dom';
import { PrivateRoute } from './PrivateRoute';
import { Orders } from '../../pages/admin/Orders/Orders';

export function OrderRoutes() {
  return (
    <Route 
      path="/admin/orders" 
      element={
        <PrivateRoute>
          <Orders />
        </PrivateRoute>
      } 
    />
  );
}