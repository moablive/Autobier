import { db } from '@autobier/db';
import { orders, orderItems, products } from '@autobier/types';
import { eq, desc } from 'drizzle-orm';
import { AsaasService } from './asaas.service';
import { ICreateOrderDTO, CreateOrderItemDTO } from '@autobier/types';

// Alias para o item antes de ter o order_id
type OrderItemData = Omit<CreateOrderItemDTO, 'id' | 'order_id'>;

export class OrderService {
  
  // ==========================================================
  // 1. CRIAR PEDIDO (CHECKOUT)
  // ==========================================================
  async createOrder({ customer_name, customer_cpf, items }: ICreateOrderDTO) {
    const asaasService = new AsaasService();
    
    if (!items || items.length === 0) {
      throw new Error("O pedido deve conter pelo menos um item.");
    }

    let totalValue = 0;
    const orderItemsData: OrderItemData[] = [];

    // Validar produtos antes de iniciar transação
    for (const item of items) {
      
      // Usamos uma verificação segura para pegar o ID do produto
      const productId = 'product_id' in item ? item.product_id : (item as { id: string }).id;

      if (!productId) {
         throw new Error("Item inválido: ID do produto não informado.");
      }

      const product = await db.query.products.findFirst({ 
        where: (products, { eq }) => eq(products.id, productId) 
      });
      
      if (!product) {
        throw new Error(`Produto ID ${productId} não encontrado.`);
      }
      
      const price = Number(product.sale_price);
      const quantity = Number(item.quantity);

      totalValue += price * quantity;

      orderItemsData.push({
        product_id: product.id,
        quantity: quantity,
        price: price 
      });
    }

    totalValue = Math.round(totalValue * 100) / 100;

    const customerId = await asaasService.getCustomerId({ 
      name: customer_name, 
      cpfCnpj: customer_cpf 
    });

    const pixData = await asaasService.createPixCharge(customerId, totalValue);

    // Transaction para criar Order e OrderItems
    const result = await db.transaction(async (tx) => {
        const [order] = await tx.insert(orders).values({
            customer_name,
            customer_cpf, 
            total_value: totalValue,
            asaas_payment_id: pixData.id, 
            qr_code_base64: pixData.encodedImage,
            copy_paste_code: pixData.payload,
            status: 'PENDING',
        }).returning();

        // Bulk insert items
        if (orderItemsData.length > 0) {
            await tx.insert(orderItems).values(
                orderItemsData.map(item => ({
                    order_id: order.id,
                    product_id: item.product_id,
                    quantity: item.quantity,
                    price: item.price
                }))
            );
        }

        return order;
    });

    // Fetch complete order with items for return
    const completeOrder = await db.query.orders.findFirst({
        where: (orders, { eq }) => eq(orders.id, result.id),
        with: {
            items: {
                with: {
                    product: {
                        columns: { name: true }
                    }
                }
            }
        }
    });

    if (!completeOrder) throw new Error("Erro ao recuperar pedido criado.");

    return {
      id: completeOrder.id,
      total_value: totalValue,
      status: completeOrder.status,
      customer_name: completeOrder.customer_name,
      qr_code_base64: pixData.encodedImage,
      copy_paste_code: pixData.payload,
      created_at: completeOrder.created_at,
      items: completeOrder.items
    };
  }

  // ==========================================================
  // 2. LISTAR PEDIDOS
  // ==========================================================
  async listOrders() {
    return await db.query.orders.findMany({
      orderBy: (orders, { desc }) => [desc(orders.created_at)],
      with: {
        items: {
          with: {
            product: { 
              columns: { name: true, image_base64: true }
            }
          }
        }
      }
    });
  }

  // ==========================================================
  // 3. ATUALIZAR STATUS
  // ==========================================================
  async updateStatus(paymentId: string, status: string) {
    const orderExists = await db.query.orders.findFirst({
      where: (orders, { eq }) => eq(orders.asaas_payment_id, paymentId)
    });

    if (!orderExists) {
      throw new Error(`Pedido com Payment ID ${paymentId} não encontrado.`);
    }

    const [updatedOrder] = await db.update(orders)
      .set({ status })
      .where(eq(orders.id, orderExists.id))
      .returning();

    return updatedOrder;
  }

  // ==========================================================
  // 4. LIMPAR HISTÓRICO
  // ==========================================================
  async clearHistory() {
    // Cascade should handle items if configured DB side, but to be safe:
    await db.delete(orderItems);
    await db.delete(orders);
  }

  // ==========================================================
  // 5. DELETAR PEDIDO
  // ==========================================================
  async deleteOrder(orderId: string) {
    const asaasService = new AsaasService();

    const order = await db.query.orders.findFirst({
      where: (orders, { eq }) => eq(orders.id, orderId)
    });

    if (!order) {
      throw new Error("Pedido não encontrado.");
    }

    if (order.asaas_payment_id) {
      try {
        await asaasService.deletePayment(order.asaas_payment_id);
      } catch (error: unknown) { // ✅ CORREÇÃO 'any-type'
        console.warn(`⚠️ Erro ao deletar no Asaas.`);
      }
    }

    // Cascade delete works if defined in schema, but being explicit within transaction:
    return await db.transaction(async (tx) => {
      // If DB has cascade, this isn't strictly necessary, but good for explicit intent
      await tx.delete(orderItems).where(eq(orderItems.order_id, orderId));
      return await tx.delete(orders).where(eq(orders.id, orderId));
    });
  }
}