import axios, { AxiosInstance, isAxiosError } from 'axios';
import 'dotenv/config';
import { 
  ICustomerData, 
  IPixResponse, 
  IAsaasListCustomerResponse, 
  IAsaasCustomerResponse,
  IAsaasPaymentRequest,
  IAsaasPaymentResponse,
  IAsaasQrCodeResponse
} from '@autobier/types';

export class AsaasService {
  private api: AxiosInstance;

  constructor() {
    // Define URL (Sandbox ou Produção) baseada no .env
    const API_URL = process.env.ASAAS_API_URL || 'https://sandbox.asaas.com/api/v3';
    const API_KEY = process.env.ASAAS_API_KEY;

    // Trava de segurança: Se não tiver chave, nem adianta tentar
    if (!API_KEY) {
      throw new Error("❌ ERRO CRÍTICO: ASAAS_API_KEY não configurada no arquivo .env");
    }

    this.api = axios.create({
      baseURL: API_URL,
      headers: {
        access_token: API_KEY,
        'Content-Type': 'application/json'
      }
    });
  }

  /**
   * 1. Busca ou Cria Cliente no Asaas
   * Retorna o ID do cliente (ex: cus_000005086877)
   */
  async getCustomerId({ name, cpfCnpj, email }: ICustomerData): Promise<string> {
    const cleanCpf = cpfCnpj.replace(/\D/g, ''); // Garante apenas números

    try {
      // A. Tenta buscar cliente existente pelo CPF
      const responseBusca = await this.api.get<IAsaasListCustomerResponse>('/customers', {
        params: { cpfCnpj: cleanCpf }
      });

      // Se encontrou, retorna o ID do primeiro da lista
      if (responseBusca.data.data && responseBusca.data.data.length > 0) {
        return responseBusca.data.data[0].id;
      }

      // B. Se não achar, cria novo cadastro
      // Usamos um e-mail padrão caso não venha informado (venda balcão)
      const emailFinal = email || "cliente.balcao@autobier.com";

      const responseCriacao = await this.api.post<IAsaasCustomerResponse>('/customers', {
        name: name,
        cpfCnpj: cleanCpf,
        email: emailFinal
      });

      return responseCriacao.data.id;

    } catch (error: any) {
      this.logError(error, "Criação de Cliente");
      throw new Error("Falha ao registrar cliente no Asaas. Verifique se o CPF é válido.");
    }
  }

  /**
   * 2. Cria Cobrança Pix e Recupera QR Code (Imagem)
   */
  async createPixCharge(customerId: string, value: number): Promise<IPixResponse> {
    try {
      // Define vencimento para hoje
      const today = new Date().toISOString().split('T')[0];

      // Monta o payload tipado conforme sua interface
      const payload: IAsaasPaymentRequest = {
        customer: customerId,
        billingType: 'PIX',
        dueDate: today,
        value: value,
        description: "Pedido Autobier - Balcão"
      };

      // A. POST /payments - Cria a intenção de pagamento
      const chargeResponse = await this.api.post<IAsaasPaymentResponse>('/payments', payload);
      const paymentData = chargeResponse.data;

      // B. GET /payments/{id}/pixQrCode - Busca a imagem
      // Esse passo é OBRIGATÓRIO porque a criação não devolve a imagem
      const qrCodeResponse = await this.api.get<IAsaasQrCodeResponse>(
        `/payments/${paymentData.id}/pixQrCode`
      );

      // Retorna o objeto combinado conforme IPixResponse
      return {
        id: paymentData.id,
        encodedImage: qrCodeResponse.data.encodedImage, // Aqui está a imagem Base64
        payload: qrCodeResponse.data.payload,           // Aqui está o copia-e-cola
        netValue: paymentData.netValue
      };

    } catch (error: any) {
      this.logError(error, "Geração de Pix");
      throw new Error("Falha ao gerar o QR Code Pix.");
    }
  }

  /**
   * 3. Remover/Cancelar cobrança no Asaas
   * Chamado quando um pedido é cancelado no sistema antes de ser pago.
   */
  async deletePayment(paymentId: string): Promise<boolean> {
    try {
      console.log(`📡 [AsaasService] Solicitando exclusão da cobrança: ${paymentId}`);
      
      // Chamada oficial: DELETE /payments/{id}
      await this.api.delete(`/payments/${paymentId}`);
      
      return true;
    } catch (error: any) {
      // Se o erro for 404, significa que a cobrança já não existe mais no Asaas
      if (error.response?.status === 404) {
        console.warn(`⚠️ [AsaasService] Cobrança ${paymentId} não encontrada ou já removida.`);
        return true; 
      }

      this.logError(error, "Exclusão de Cobrança");
      
      // Caso a cobrança já esteja PAGA, o Asaas retornará um erro (não pode deletar o que já foi pago)
      // Nesse caso, o erro será tratado e repassado para a controller
      throw error;
    }
  }

  /**
   * Helper para logs de erro mais limpos no terminal
   */
  private logError(error: any, context: string) {
    console.error(`\n❌ [AsaasService] Erro em: ${context}`);
    
    if (isAxiosError(error)) {
      // O Asaas costuma mandar o erro detalhado dentro de response.data.errors
      const asaasErrors = error.response?.data?.errors;
      if (asaasErrors && Array.isArray(asaasErrors)) {
        asaasErrors.forEach((err: any) => console.error(`   -> Motivo: ${err.description}`));
      } else {
        console.error("   -> Detalhes:", JSON.stringify(error.response?.data, null, 2));
      }
    } else {
      console.error("   -> Erro inesperado:", error.message);
    }
  }
}