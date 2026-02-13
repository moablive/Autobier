import { Router } from 'express';
import { OrderController } from '../controllers/order.controller';
import { WebhookController } from '../controllers/webhook.controller';
import { isAuthenticated } from '@autobier/middlewares';

const orderRoutes = Router();

const orderController = new OrderController();
const webhookController = new WebhookController();

// --- ROTAS DE PEDIDO ---

// POST /order/checkout
// Público: O cliente finaliza o carrinho e gera o Pix
orderRoutes.post('/checkout', orderController.store);

// GET /order/status/:id
// Público: O cliente consulta o status do seu pedido para o polling
orderRoutes.get('/status/:id', orderController.showStatus);

// GET /order
// Privado: Painel administrativo/Cozinha
orderRoutes.get('/', isAuthenticated, orderController.index);

// DELETE /order/:id
// Privado: Cancela o pedido no banco e a cobrança no Asaas
// O ':id' é o ID interno do pedido no seu banco de dados
orderRoutes.delete('/:id', isAuthenticated, orderController.delete);


// --- ROTAS DE WEBHOOK (INTEGRAÇÕES) ---

// POST /order/webhook/asaas
// Público: O Asaas envia a notificação de pagamento aqui
orderRoutes.post('/webhook/asaas', webhookController.handle);

export { orderRoutes };