import { Trash2, Loader2, X, AlertTriangle } from 'lucide-react';
import type { IProduct } from '@autobier/types';

interface DeleteProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  product: IProduct | null;
  isLoading: boolean;
}

export function DeleteProductModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  product, 
  isLoading 
}: DeleteProductModalProps) {
  
  if (!isOpen || !product) return null;

  return (
    // Z-index 110 para garantir que fique acima do modal de edição se necessário
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden transform transition-all scale-100 relative">
        
        {/* Botão fechar (X) discreto */}
        <button 
          onClick={onClose}
          disabled={isLoading}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition disabled:opacity-0"
        >
          <X size={20} />
        </button>

        <div className="p-8 text-center">
          
          {/* Ícone de Destaque com "Halo" */}
          <div className="bg-red-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-red-100">
            <Trash2 className="text-red-600 w-10 h-10" strokeWidth={1.5} />
          </div>

          <h3 className="text-2xl font-black text-gray-800 mb-2">Excluir Produto?</h3>
          
          <p className="text-gray-500 mb-6 leading-relaxed">
            Você selecionou <strong className="text-gray-800">"{product.name}"</strong> para remoção.
          </p>

          {/* Box de Aviso/Cuidado */}
          <div className="bg-red-50 border border-red-100 rounded-xl p-3 mb-8 flex items-center justify-center gap-2 text-red-700">
            <AlertTriangle size={18} className="shrink-0" />
            <span className="text-xs font-bold uppercase tracking-wide">Ação Irreversível</span>
          </div>
          
          {/* Botões de Ação */}
          <div className="flex flex-col-reverse sm:flex-row gap-3">
            <button 
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-4 py-3.5 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition font-bold disabled:opacity-50"
            >
              Cancelar
            </button>
            
            <button 
              onClick={onConfirm}
              disabled={isLoading}
              className={`flex-1 px-4 py-3.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition font-bold shadow-lg shadow-red-500/20 flex items-center justify-center gap-2 active:scale-95 ${
                isLoading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Excluindo...</span>
                </>
              ) : (
                'Sim, Excluir'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}