import { Request, Response } from 'express';
import { OrderService } from '../services/order.service';

export class OrderController {
  
  // ==========================================================
  // 1. CRIAR PEDIDO (CHECKOUT)
  // POST /orders
  // ==========================================================
  async store(req: Request, res: Response): Promise<Response> {
    const { customer_name, customer_cpf, items } = req.body;
    
    // DEBUG: Ajuda a ver se o front enviou os dados certos
    console.log("📥 [OrderController] Recebido:", { 
      name: customer_name, 
      cpf: customer_cpf, 
      items_count: items?.length 
    });

    const orderService = new OrderService();

    try {
      const order = await orderService.createOrder({
        customer_name,
        customer_cpf,
        items 
      });

      return res.status(201).json(order);

    } catch (error: any) {
      console.error("❌ Erro no Checkout:", error);
      
      // Tratamento específico para erros do Asaas (Axios)
      if (error.response?.data) {
        const asaasError = error.response.data.errors?.[0]?.description || JSON.stringify(error.response.data);
        return res.status(400).json({ 
          error: "Erro na operadora de pagamento (Asaas)", 
          details: asaasError
        });
      }

      // Erros de validação (ex: Carrinho vazio, Produto não encontrado)
      return res.status(400).json({ 
        error: error.message || "Falha ao processar checkout" 
      });
    }
  }

  // ==========================================================
  // 1.1 CONSULTAR STATUS DO PEDIDO (POLLING CLIENTE)
  // GET /order/status/:id
  // ==========================================================
  async showStatus(req: Request, res: Response): Promise<Response> {
    const { id } = req.params;
    const orderService = new OrderService();

    try {
      // Usamos db.query diretamente para ser mais rápido (apenas leitura de status)
      const { db } = await import('@autobier/db');
      const { orders } = await import('@autobier/types');
      const { eq } = await import('drizzle-orm');

      const order = await db.query.orders.findFirst({
        where: (orders, { eq }) => eq(orders.id, id as string),
        columns: {
          status: true,
          id: true
        }
      });

      if (!order) {
        return res.status(404).json({ error: "Pedido não encontrado" });
      }

      return res.json({ id: order.id, status: order.status });
    } catch (error) {
      console.error("❌ Erro ao buscar status:", error);
      return res.status(500).json({ error: "Erro interno ao buscar status" });
    }
  }

  // ==========================================================
  // 2. LISTAR PEDIDOS (ADMIN/COZINHA)
  // GET /orders
  // ==========================================================
  async index(req: Request, res: Response): Promise<Response> {
    const orderService = new OrderService();
    
    try {
      const orders = await orderService.listOrders();
      return res.json(orders);
    } catch (error) {
      console.error("❌ Erro ao listar:", error);
      return res.status(500).json({ error: "Erro interno ao listar pedidos" });
    }
  }

  // ==========================================================
  // 3. LIMPAR HISTÓRICO (DEV/TESTES)
  // DELETE /orders/history
  // ==========================================================
  async clearHistory(req: Request, res: Response): Promise<Response> {
    const orderService = new OrderService();
    
    try {
      await orderService.clearHistory();
      console.log("🧹 Histórico de pedidos limpo com sucesso.");
      return res.status(200).json({ message: "Histórico de pedidos apagado." });
    } catch (error: any) {
      console.error("❌ Erro ao limpar histórico:", error);
      return res.status(500).json({ error: "Não foi possível limpar o histórico." });
    }
  }


  // ==========================================================
  // 4. CANCELAR/EXCLUIR PEDIDO ESPECÍFICO
  // DELETE /orders/:id
  // ==========================================================
  async delete(req: Request, res: Response): Promise<Response> {
    const { id } = req.params; // Pega o ID que vem na URL (ex: /orders/123)
    const orderService = new OrderService();

    console.log(`🗑️ [OrderController] Solicitando cancelamento do pedido: ${id}`);

    try {
      await orderService.deleteOrder(id as string);
      
      return res.status(200).json({ 
        message: "Pedido e cobrança cancelados com sucesso." 
      });

    } catch (error: any) {
      console.error("❌ Erro ao deletar pedido:", error);

      // Tratamento para caso o erro venha do Asaas (ex: pagamento já foi pago e não pode deletar)
      if (error.response?.data) {
        return res.status(400).json({
          error: "Não foi possível cancelar no Asaas",
          details: error.response.data.errors?.[0]?.description || "Erro desconhecido"
        });
      }

      return res.status(400).json({ 
        error: error.message || "Falha ao excluir pedido" 
      });
    }
  }
}