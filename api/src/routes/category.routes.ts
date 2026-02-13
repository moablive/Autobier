import { Router } from 'express';
import { CategoryController } from '../controllers/category.controller';
import { isAuthenticated } from '@autobier/middlewares';

const categoryRoutes = Router();
const categoryController = new CategoryController();

// --- Rotas de Categorias ---

// Listar todas (GET /categories) - PÚBLICO (Cliente/Cardápio)
categoryRoutes.get('/', categoryController.index);

// Criar (POST /categories) - Protegido (Admin)
categoryRoutes.post('/', isAuthenticated, categoryController.store);

// Editar (PUT /categories/:id) - Protegido (Admin)
categoryRoutes.put('/:id', isAuthenticated, categoryController.update);

// Excluir (DELETE /categories/:id) - Protegido (Admin)
categoryRoutes.delete('/:id', isAuthenticated, categoryController.delete);

export { categoryRoutes };