import { IProduct } from './product.interface';

// Item do pedido (Visualização detalhada)
export interface IOrderItem {
  id: string;
  product_id: string;
  quantity: number;
  price: number;
  product?: IProduct | { name: string; image_base64?: string | null };
}

// Item do pedido (Requisição de criação)
export interface IOrderItemRequest {
  product_id: string;
  quantity: number;
}

// Alias para o Frontend (carrinho)
export interface IOrderItemDTO {
  id: string;       // ID do Produto
  quantity: number;
}

export interface ICreateOrderDTO {
  customer_name: string;
  customer_cpf: string;
  items: IOrderItemRequest[];
}

export interface IOrder {
  id: string;
  customer_name: string;
  customer_cpf?: string;
  total_value: number;
  status: 'PENDING' | 'PAID' | 'FAILED';
  
  asaas_payment_id?: string | null;
  qr_code_base64?: string | null;
  copy_paste_code?: string | null;

  items?: IOrderItem[];
  
  created_at: string | Date; // API retorna Date, JSON serializa string
  updated_at?: string | Date;
}

export interface IOrderResponse {
  id: string;
  total_value: number;
  status: 'PENDING' | 'PAID' | 'FAILED';
  customer_name: string;
  created_at: string;
  qr_code_base64: string;
  copy_paste_code: string;
}