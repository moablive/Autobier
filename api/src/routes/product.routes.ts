import { Router } from 'express';
import { ProductController } from '../controllers/product.controller';
import { isAuthenticated } from '@autobier/middlewares';

const productRoutes = Router();
const productController = new ProductController();


// USER
// Listagem de produtos (Protegido por token)
productRoutes.get('/', productController.index);


//ADM

// Criação de produto (Protegido por token)
productRoutes.post('/', isAuthenticated, productController.store);
// Edição de produto (Precisa do ID)

productRoutes.put('/:id', isAuthenticated, productController.update);

// Exclusão de produto (Precisa do ID)
productRoutes.delete('/:id', isAuthenticated, productController.delete);

export { productRoutes };