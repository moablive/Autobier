import { Router } from 'express';

// Importação das rotas modulares
import { categoryRoutes } from './category.routes';
import { productRoutes } from './product.routes';   
import { orderRoutes } from './order.routes';   

const router = Router();

// Lembre-se: O app.ts já adicionou o prefixo '/api' antes de chegar aqui.

// --- Rotas de Domínio ---

// 1. CATEGORIAS
// Prefixo neste arquivo: /categories
// Rota Final: GET  http://localhost:3333/api/categories (Listar no cardápio)
// Rota Final: POST http://localhost:3333/api/categories (Criar - Admin)
router.use('/categories', categoryRoutes);

// 3. PRODUTOS
// Prefixo neste arquivo: /products
// Rota Final: GET  http://localhost:3333/api/products (Listar tudo)
// Rota Final: POST http://localhost:3333/api/products (Criar - Admin)
router.use('/products', productRoutes);

// 4. PEDIDOS (Checkout & Webhook)
// Prefixo neste arquivo: /orders
// Rota Final: POST http://localhost:3333/api/orders/checkout (Cliente fecha conta e gera Pix)
// Rota Final: GET  http://localhost:3333/api/orders (Cozinha vê pedidos)
// Rota Final: POST http://localhost:3333/api/orders/webhook/asaas (Asaas avisa pagamento)
router.use('/orders', orderRoutes);

export { router };