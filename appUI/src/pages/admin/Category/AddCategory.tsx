import { useState, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save, Tag } from 'lucide-react';
import { AxiosError } from 'axios'; 
import { toast } from 'react-toastify';
import { categoryService } from '@autobier/http-client';
import { SuccessModal } from '../../../components/SuccessModal';

export function AddCategory() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  async function handleRegister(e: FormEvent) {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.warning("O nome da categoria é obrigatório.");
      return;
    }

    setLoading(true);

    try {
      await categoryService.create({ name, description });
      setShowSuccessModal(true); 
    } catch (error) {
      const err = error as AxiosError<{ error: string }>;
      console.error(err);
      toast.error(err.response?.data?.error || "Erro ao cadastrar categoria.");
    } finally {
      setLoading(false);
    }
  }

  function handleCloseModal() {
    setShowSuccessModal(false);
    navigate('/admin/categories');
  }

  return (
    <div className="animate-fade-in max-w-2xl mx-auto p-6">
      <SuccessModal 
        isOpen={showSuccessModal}
        onClose={handleCloseModal}
        title="Categoria Criada!"
        message={`A categoria "${name}" foi adicionada ao cardápio com sucesso.`}
      />

      {/* Cabeçalho */}
      <div className="mb-6 flex items-center gap-4">
        <Link 
          to="/admin/categories"
          className="p-2 bg-white border border-gray-200 rounded-lg text-gray-500 hover:text-autobier-500 hover:border-autobier-200 transition-all shadow-sm"
          title="Voltar"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Tag className="text-autobier-500" /> Nova Categoria
          </h1>
          <p className="text-gray-500 text-sm">Preencha os dados para organizar seu cardápio.</p>
        </div>
      </div>

      {/* Formulário */}
      <form 
        onSubmit={handleRegister} 
        className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm flex flex-col gap-6"
      >
        <div>
          <label className="text-gray-700 font-medium text-sm mb-2 block">
            Nome da Categoria <span className="text-red-500">*</span>
          </label>
          <input 
            type="text"
            className="w-full bg-gray-50 border border-gray-200 text-gray-800 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-autobier-500/20 focus:border-autobier-500 transition-all placeholder:text-gray-400"
            placeholder="Ex: Bebidas, Lanches, Sobremesas"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            disabled={loading}
          />
        </div>

        <div>
          <label className="text-gray-700 font-medium text-sm mb-2 block">
            Descrição <span className="text-gray-400 font-normal">(Opcional)</span>
          </label>
          <textarea 
            className="w-full bg-gray-50 border border-gray-200 text-gray-800 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-autobier-500/20 focus:border-autobier-500 transition-all placeholder:text-gray-400 h-32 resize-none"
            placeholder="Descreva brevemente o que contém nesta categoria..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={loading}
          />
        </div>

        <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
          <Link
            to="/admin/categories" /* ✅ AJUSTADO: Rota em inglês */
            className="px-6 py-3 rounded-lg text-gray-600 hover:bg-gray-100 font-medium transition-colors"
          >
            Cancelar
          </Link>
          
          <button 
            type="submit" 
            disabled={loading}
            className="bg-autobier-500 hover:bg-autobier-600 text-white font-bold px-6 py-3 rounded-lg flex items-center gap-2 transition-all shadow-md shadow-autobier-200 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save size={20} />
                Salvar Categoria
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}