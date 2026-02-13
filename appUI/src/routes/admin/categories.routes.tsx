import { Route } from 'react-router-dom';
import { PrivateRoute } from './PrivateRoute';
import { CategoriesList } from '../../pages/admin/Category/CategoriesList';
import { AddCategory } from '../../pages/admin/Category/AddCategory';
import { EditCategory } from '../../pages/admin/Category/EditCategory';

export function CategoryRoutes() {
  return (
    <>

      <Route 
        path="/admin/categories" 
        element={
          <PrivateRoute>
            <CategoriesList />
          </PrivateRoute>
        } 
      />

      <Route 
        path="/admin/categories/new" 
        element={
          <PrivateRoute adminOnly={true}>
            <AddCategory />
          </PrivateRoute>
        } 
      />

      <Route 
        path="/admin/categories/edit/:id" 
        element={
          <PrivateRoute adminOnly={true}>
            <EditCategory />
          </PrivateRoute>
        } 
      />
    </>
  );
}