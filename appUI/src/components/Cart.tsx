import { X, Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import type { ICartItem } from '@autobier/types';

interface CartProps {
  items: Array<ICartItem>;
  onUpdateQuantity: (id: string, action: 'add' | 'remove') => void;
  onRemoveItem: (id: string) => void;
  onClearCart: () => void;
  onClose: () => void;
  onCheckout: () => void;
}

export function Cart({ 
  items, 
  onUpdateQuantity, 
  onRemoveItem, 
  onClose, 
  onCheckout 
}: CartProps) {

  // Calcula o total
  const total = items.reduce((sum, item) => sum + (Number(item.sale_price) * item.quantity), 0);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Overlay escuro (clique fecha) */}
      <div 
        className="absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />

      {/* Painel Lateral */}
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-slide-in-right">
        
        {/* Cabeçalho */}
        <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h2 className="text-xl font-black text-gray-800 flex items-center gap-2">
            <ShoppingBag className="text-autobier-500" /> Seu Pedido
          </h2>
          <button 
            onClick={onClose} 
            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition"
          >
            <X size={24} />
          </button>
        </div>

        {/* Lista de Itens */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-4">
              <ShoppingBag size={64} className="opacity-20" />
              <p className="font-medium text-lg">Seu carrinho está vazio.</p>
              <button 
                onClick={onClose}
                className="text-autobier-500 font-bold hover:underline"
              >
                Voltar ao cardápio
              </button>
            </div>
          ) : (
            items.map(item => (
              <div key={item.id} className="flex gap-4 items-center bg-white">
                {/* Imagem Pequena (Opcional) */}
                <div className="w-16 h-16 bg-gray-100 rounded-xl overflow-hidden shrink-0 border border-gray-100">
                  {item.image_base64 ? (
                    <img src={item.image_base64} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      <ShoppingBag size={20} />
                    </div>
                  )}
                </div>

                {/* Detalhes */}
                <div className="flex-1">
                  <h3 className="font-bold text-gray-800 text-sm line-clamp-2">{item.name}</h3>
                  <div className="text-gray-500 text-xs font-medium mt-1">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(item.sale_price))} unit.
                  </div>
                </div>

                {/* Controles */}
                <div className="flex flex-col items-end gap-2">
                  <button 
                    onClick={() => onRemoveItem(item.id)}
                    className="text-gray-300 hover:text-red-500 transition p-1"
                    title="Remover item"
                  >
                    <Trash2 size={16} />
                  </button>
                  
                  <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-1 border border-gray-200">
                    <button 
                      onClick={() => onUpdateQuantity(item.id, 'remove')}
                      className="w-6 h-6 flex items-center justify-center bg-white rounded shadow-sm text-gray-600 hover:text-red-500 active:scale-95 transition"
                      disabled={item.quantity <= 1}
                    >
                      <Minus size={12} strokeWidth={3} />
                    </button>
                    <span className="text-sm font-bold w-4 text-center">{item.quantity}</span>
                    <button 
                      onClick={() => onUpdateQuantity(item.id, 'add')}
                      className="w-6 h-6 flex items-center justify-center bg-white rounded shadow-sm text-gray-600 hover:text-green-500 active:scale-95 transition"
                    >
                      <Plus size={12} strokeWidth={3} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Rodapé (Total + Ação) */}
        {items.length > 0 && (
          <div className="p-6 bg-white border-t border-gray-100 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
            <div className="flex justify-between items-end mb-6">
              <span className="text-gray-500 font-medium">Total do Pedido</span>
              <span className="text-2xl font-black text-gray-900">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total)}
              </span>
            </div>
            
            <button 
              onClick={onCheckout}
              className="w-full bg-autobier-500 hover:bg-autobier-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-autobier-200 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <span>Ir para Pagamento</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}