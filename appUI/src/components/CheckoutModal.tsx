import { useState, useEffect } from 'react';
import { X, QrCode, Copy, CheckCircle, Loader2, CreditCard, PartyPopper } from 'lucide-react';
import { orderService } from '@autobier/http-client';
import type { IOrderResponse } from '@autobier/types';
import type { ICartItem } from '@autobier/types';

type CheckoutModalProps = {
  isOpen: boolean;
  onClose: () => void;
  cartItems: Array<ICartItem>; 
  totalValue: number;
  onClearCart: () => void;
};

// Interface auxiliar para tratar o erro do Axios
type ApiError = {
  response?: {
    data?: {
      error?: string;
    };
  };
};

export function CheckoutModal({ isOpen, onClose, cartItems, totalValue, onClearCart }: CheckoutModalProps) {
  // Estados do Formulário
  const [name, setName] = useState('');
  const [cpf, setCpf] = useState('');
  
  // Estados de Controle
  const [isLoading, setIsLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<IOrderResponse | null>(null);
  const [isPaid, setIsPaid] = useState(false);

  // Polling de Status
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;

    if (orderSuccess && !isPaid) {
      interval = setInterval(async () => {
        try {
          const { status } = await orderService.getOrderStatus(orderSuccess.id);
          if (status === 'PAID') {
            setIsPaid(true);
            clearInterval(interval);
          }
        } catch (error) {
          console.error("Erro no polling:", error);
        }
      }, 5000); // Consulta a cada 5 segundos
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [orderSuccess, isPaid]);

  if (!isOpen) return null;

  async function handleFinishOrder(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    
    if (cartItems.length === 0) {
      alert("Carrinho vazio!");
      return;
    }
    
    // Validação básica de CPF/CNPJ
    const cleanCpf = cpf.replace(/\D/g, '');
    if (cleanCpf.length < 11) {
      alert("Por favor, digite um CPF ou CNPJ válido.");
      return;
    }

    setIsLoading(true);

    try {
      const payload = {
        customer_name: name,
        customer_cpf: cleanCpf,
        items: cartItems.map(item => ({
          product_id: item.id,
          quantity: item.quantity
        }))
      };

      // 1. Chama o Backend
      const order = await orderService.createOrder(payload);
      
      // [DEBUG] Veja isso no Console do Navegador (F12)
      console.log("📦 Resposta Recebida no Modal:", order);
      
      if (!order.qr_code_base64) {
         console.error("⚠️ O campo 'qr_code_base64' veio vazio!", order);
      }

      // 2. Define sucesso
      setOrderSuccess(order);
      
      // 3. Limpa carrinho
      onClearCart(); 

    } catch (error: unknown) {
      console.error(error);
      const apiError = error as ApiError;
      const errorMsg = apiError.response?.data?.error || "Erro ao processar pedido. Verifique os dados.";
      alert(errorMsg);
    } finally {
      setIsLoading(false);
    }
  }

  const handleClose = (): void => {
    if (orderSuccess) {
      setOrderSuccess(null);
      setIsPaid(false);
      setName('');
      setCpf('');
    }
    onClose();
  };

  const handleCopyPix = (): void => {
    if (orderSuccess?.copy_paste_code) {
      navigator.clipboard.writeText(orderSuccess.copy_paste_code);
      alert("Código Pix copiado!");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Cabeçalho */}
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <h2 className="font-bold text-lg text-gray-800 flex items-center gap-2">
            <CreditCard className="text-autobier-500" size={20} /> 
            Checkout
          </h2>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 transition">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          
          {/* ESTÁGIO 1: Formulário */}
          {!orderSuccess ? (
            <form onSubmit={handleFinishOrder} className="space-y-6">
              <div className="bg-blue-50 p-4 rounded-lg text-blue-800 text-sm mb-4 flex justify-between items-center">
                <span className="font-bold">Total a Pagar:</span> 
                <span className="text-xl font-bold">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalValue)}
                </span>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
                <input 
                  type="text" 
                  required 
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-autobier-500 outline-none transition-all"
                  placeholder="Seu nome"
                  value={name}
                  onChange={e => setName(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">CPF (Obrigatório para Pix)</label>
                <input 
                  type="text" 
                  required 
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-autobier-500 outline-none transition-all"
                  placeholder="000.000.000-00"
                  value={cpf}
                  onChange={e => setCpf(e.target.value)} 
                />
              </div>

              <button 
                type="submit" 
                disabled={isLoading}
                className={`w-full font-bold py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 text-white
                  ${isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 shadow-green-200'}
                `}
              >
                {isLoading ? <Loader2 className="animate-spin" /> : <QrCode />}
                {isLoading ? 'Gerando Pix...' : 'Gerar QR Code Pix'}
              </button>
            </form>
          ) : (
            
            /* ESTÁGIO 2: Sucesso - QR Code ou Pagamento Confirmado */
            <div className="flex flex-col items-center text-center space-y-6 animate-fade-in">
              
              {isPaid ? (
                // TELA DE PAGAMENTO CONFIRMADO
                <div className="flex flex-col items-center py-8 space-y-4 animate-bounce-in">
                  <div className="bg-green-100 p-6 rounded-full text-green-600 shadow-inner">
                    <PartyPopper size={64} />
                  </div>
                  <h3 className="text-2xl font-black text-gray-800">Pagamento Confirmado!</h3>
                  <p className="text-gray-500 font-medium max-w-[250px]">
                    Seu pedido já foi enviado para a cozinha e em breve estará pronto.
                  </p>
                  <button 
                    onClick={handleClose}
                    className="mt-4 bg-gray-900 text-white px-8 py-3 rounded-xl font-bold hover:scale-105 transition active:scale-95"
                  >
                    Entendi
                  </button>
                </div>
              ) : (
                // TELA DO QR CODE (AGUARDANDO PAGAMENTO)
                <>
                  <div className="flex items-center gap-2 text-green-700 bg-green-50 px-4 py-2 rounded-full font-bold text-sm border border-green-100">
                    <CheckCircle size={16} /> Pedido Criado!
                  </div>

                  <div className="space-y-2 flex flex-col items-center w-full">
                    <p className="text-gray-600 font-medium">Escaneie o QR Code abaixo:</p>
                    
                    {/* Lógica de Renderização do QR Code */}
                    {orderSuccess.qr_code_base64 ? (
                      <div className="p-2 border-4 border-autobier-100 rounded-xl inline-block bg-white shadow-sm">
                        <img 
                          /* Garante que o prefixo base64 está correto */
                          src={
                            orderSuccess.qr_code_base64.startsWith('data:image') 
                              ? orderSuccess.qr_code_base64 
                              : `data:image/png;base64,${orderSuccess.qr_code_base64}`
                          }
                          alt="QR Code Pix" 
                          className="w-64 h-64 rounded-lg object-contain"
                        />
                      </div>
                    ) : (
                      <div className="w-64 h-64 bg-gray-100 flex flex-col items-center justify-center rounded-xl mx-auto border-2 border-dashed border-gray-300 gap-2 p-4">
                        <QrCode size={40} className="text-gray-300" />
                        <span className="text-gray-400 text-xs text-center">
                          Imagem não carregou.<br/>Tente usar o "Copia e Cola" abaixo.
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="w-full">
                    <p className="text-xs text-gray-500 mb-2 uppercase font-bold tracking-wide">Pix Copia e Cola</p>
                    <div className="flex gap-2">
                      <input 
                        readOnly 
                        value={orderSuccess.copy_paste_code || 'Código indisponível'} 
                        className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-600 outline-none focus:border-autobier-300 truncate"
                        onClick={(e) => e.currentTarget.select()}
                      />
                      <button 
                        type="button"
                        onClick={handleCopyPix}
                        className="bg-autobier-500 hover:bg-autobier-600 text-white p-2.5 rounded-lg transition shadow-md shadow-autobier-200 shrink-0"
                        title="Copiar código"
                      >
                        <Copy size={18} />
                      </button>
                    </div>
                  </div>

                  <div className="text-xs text-yellow-700 bg-yellow-50 p-4 rounded-lg border border-yellow-100 text-left w-full flex items-start gap-3">
                    <Loader2 size={16} className="animate-spin shrink-0 mt-0.5" />
                    <div>
                      <strong>Aguardando pagamento...</strong><br/>
                      A confirmação acontece automaticamente em instantes.
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}