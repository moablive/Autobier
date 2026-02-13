import { CheckCircle } from 'lucide-react';

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message: string;
}

export function SuccessModal({ isOpen, onClose, title = "Sucesso!", message }: SuccessModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 w-full max-w-sm shadow-2xl transform transition-all animate-fade-in">
        <div className="flex flex-col items-center text-center">
          {/* Ícone Animado */}
          <div className="mb-4 text-green-500 bg-green-500/10 p-3 rounded-full">
            <CheckCircle size={48} />
          </div>

          <h2 className="text-xl font-bold text-white mb-2">
            {title}
          </h2>
          
          <p className="text-gray-300 mb-6">
            {message}
          </p>

          <button
            onClick={onClose}
            className="w-full bg-autobier-500 hover:bg-pink-700 text-white font-bold py-3 rounded-lg transition-colors duration-200"
          >
            OK, continuar
          </button>
        </div>
      </div>
    </div>
  );
}