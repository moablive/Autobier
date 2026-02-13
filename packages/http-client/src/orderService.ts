import api from './api';
import type { ICreateOrderDTO, IOrderResponse, IOrder } from '@autobier/types';

export const orderService = {
  
  async createOrder(payload: ICreateOrderDTO): Promise<IOrderResponse> {
    const { data } = await api.post<IOrderResponse>('/orders/checkout', payload);
    return data;
  },

  async getAllOrders(): Promise<IOrder[]> {
    const { data } = await api.get<IOrder[]>('/orders');
    return data;
  },

  async cancelOrder(id: string): Promise<void> {
    await api.delete(`/orders/${id}`);
  },

  async getOrderStatus(id: string): Promise<{ id: string, status: string }> {
    const { data } = await api.get<{ id: string, status: string }>(`/orders/status/${id}`);
    return data;
  },

  async clearHistory(): Promise<void> {
    await api.delete('/orders/history');
  }
};