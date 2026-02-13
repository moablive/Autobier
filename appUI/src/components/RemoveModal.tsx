import { AlertTriangle, X } from 'lucide-react';

interface RemoveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  itemName?: string;
}

export function RemoveModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Excluir Item", 
  message = "Tem certeza que deseja remover este item? Esta ação não pode ser desfeita.",
  itemName
}: RemoveModalProps) {
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 w-full max-w-sm shadow-2xl transform transition-all animate-fade-in relative">
        
        {/* Botão X para fechar no canto superior */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>

        <div className="flex flex-col items-center text-center">
          {/* Ícone de Alerta */}
          <div className="mb-4 text-red-500 bg-red-500/10 p-4 rounded-full">
            <AlertTriangle size={40} />
          </div>

          <h2 className="text-xl font-bold text-white mb-2">
            {title}
          </h2>
          
          <p className="text-gray-300 mb-2">
            {message}
          </p>
          
          {itemName && (
            <p className="text-white font-semibold bg-gray-900/50 px-3 py-1 rounded mb-6 border border-gray-700">
              "{itemName}"
            </p>
          )}

          <div className="flex gap-3 w-full mt-4">
            <button
              onClick={onClose}
              className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            
            <button
              onClick={onConfirm}
              className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-3 rounded-lg transition-colors"
            >
              Sim, Excluir
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}