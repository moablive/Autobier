// asaas.interface.ts

// ==========================================
// DADOS DE ENTRADA (O que o Service recebe)
// ==========================================

export interface ICustomerData {
  name: string;
  cpfCnpj: string;
  email?: string; 
}

// Dados internos para enviar ao Asaas (POST /payments)
export interface IAsaasPaymentRequest {
  customer: string;
  billingType: 'PIX';
  dueDate: string;
  value: number;
  description?: string;
}

// ==========================================
// DADOS DE SAÍDA (O que o Service devolve)
// ==========================================

// O objeto final que o Controller vai receber e mandar pro Front
export interface IPixResponse {
  id: string;           // ID da transação no Asaas (pay_xxxxxxxx)
  encodedImage: string; // Imagem Base64 do QR Code
  payload: string;      // Código "Copia e Cola"
  netValue: number;     // Valor do pedido
}

// ==========================================
// TIPAGEM INTERNA (Respostas da API do Asaas)
// ==========================================

export interface IAsaasCustomerResponse {
  id: string;
  name: string;
  cpfCnpj: string;
}

export interface IAsaasListCustomerResponse {
  data: IAsaasCustomerResponse[];
  totalCount: number;
}

export interface IAsaasPaymentResponse {
  id: string;
  customer: string;
  value: number;
  netValue: number;
  status: string;
}

export interface IAsaasQrCodeResponse {
  encodedImage: string;
  payload: string;
  expirationDate: string;
}