import { Request, Response } from 'express';
import { OrderService } from '../services/order.service';
import { db } from '@autobier/db';
import { orders } from '@autobier/types'; 
import { eq } from 'drizzle-orm';

export class WebhookController {
  
  async handle(req: Request, res: Response): Promise<Response> {
    const { event, payment } = req.body;
    
    if (!event || !payment || !payment.id) {
       return res.status(200).json({ received: false }); 
    }

    console.log(`🔔 Webhook Asaas: [${event}] | ID: ${payment.id}`);
    const orderService = new OrderService();

    try {
      const asaasPaymentId = payment.id;

      if (event === 'PAYMENT_RECEIVED' || event === 'PAYMENT_CONFIRMED') {
        await orderService.updateStatus(asaasPaymentId, 'PAID');
        console.log(`✅ Pedido PAGO: ${asaasPaymentId}`);
      } 
      
      else if (event === 'PAYMENT_DELETED') {
        console.log(`🗑️ Cobrança excluída no Asaas. Sincronizando...`);
        
        // Aqui usamos o dizzle importado acima
        const order = await db.query.orders.findFirst({
          where: (orders, { eq }) => eq(orders.asaas_payment_id, asaasPaymentId)
        });

        if (order) {
          await orderService.deleteOrder(order.id);
        }
      }

      else if (event === 'PAYMENT_OVERDUE' || event === 'PAYMENT_REFUNDED') {
         await orderService.updateStatus(asaasPaymentId, 'CANCELLED');
      }

      return res.status(200).json({ received: true });

    } catch (error: unknown) {
      
      // Tratamento seguro da mensagem de erro
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
      
      console.error("❌ Erro ao processar Webhook:", errorMessage);
      return res.status(200).json({ received: true, error: errorMessage });
    }
  }
}