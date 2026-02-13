import { Route } from 'react-router-dom';
import { PrivateRoute } from './PrivateRoute';
import { ProductsList } from '../../pages/admin/Product/ProductsList';

export function ProductRoutes() {
  return (
    // Como usamos Modal agora, só temos a rota de listagem
    <Route 
      path="/admin/products" 
      element={
        <PrivateRoute adminOnly={true}>
          <ProductsList />
        </PrivateRoute>
      } 
    />
  );
}