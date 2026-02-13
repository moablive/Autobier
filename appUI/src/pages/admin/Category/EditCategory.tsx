import { useState, useEffect, type FormEvent } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Edit, Loader2 } from 'lucide-react';
import { AxiosError } from 'axios';
import { toast } from 'react-toastify';
import { categoryService } from '@autobier/http-client';
import { SuccessModal } from '../../../components/SuccessModal';

export function EditCategory() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    async function loadCategory() {
      if (!id) return;
      try {
        const allCategories = await categoryService.getAll();
        const found = allCategories.find(c => c.id === id);
        
        if (found) {
          setName(found.name);
          setDescription(found.description || '');
        } else {
          toast.error("Categoria não encontrada.");
          navigate('/admin/categories');
        }
      } catch (error) {
        console.error("Erro ao carregar categoria", error);
        toast.error("Erro ao carregar dados da categoria.");
        navigate('/admin/categories');
      } finally {
        setIsLoadingData(false);
      }
    }
    loadCategory();
  }, [id, navigate]);

  async function handleUpdate(e: FormEvent) {
    e.preventDefault();
    if (!id) return;

    if (!name.trim()) {
      toast.warning("O nome da categoria não pode ficar vazio.");
      return;
    }

    setIsSaving(true);

    try {
      await categoryService.update(id, { name, description });
      setShowSuccessModal(true);
    } catch (error) {
      const err = error as AxiosError<{ error: string }>;
      console.error(err);
      toast.error(err.response?.data?.error || "Erro ao atualizar categoria.");
    } finally {
      setIsSaving(false);
    }
  }

  function handleCloseModal() {
    setShowSuccessModal(false);
    navigate('/admin/categories');
  }

  // Renderização de Loading Centralizado
  if (isLoadingData) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] text-gray-500 gap-3">
        <Loader2 size={40} className="animate-spin text-autobier-500" />
        <p>Carregando dados da categoria...</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in p-6 max-w-2xl mx-auto">
      <SuccessModal 
        isOpen={showSuccessModal}
        onClose={handleCloseModal}
        title="Atualizado com Sucesso!"
        message={`As alterações na categoria "${name}" foram salvas.`}
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
            <Edit className="text-autobier-500" /> Editar Categoria
          </h1>
        </div>
      </div>

      {/* Formulário - Tema Claro */}
      <form 
        onSubmit={handleUpdate} 
        className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm flex flex-col gap-6"
      >
        <div>
          <label className="text-gray-700 font-medium text-sm mb-2 block">
            Nome da Categoria <span className="text-red-500">*</span>
          </label>
          <input 
            type="text"
            className="w-full bg-gray-50 border border-gray-200 text-gray-800 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-autobier-500/20 focus:border-autobier-500 transition-all"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            disabled={isSaving}
          />
        </div>

        <div>
          <label className="text-gray-700 font-medium text-sm mb-2 block">
            Descrição
          </label>
          <textarea 
            className="w-full bg-gray-50 border border-gray-200 text-gray-800 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-autobier-500/20 focus:border-autobier-500 transition-all h-32 resize-none"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={isSaving}
          />
        </div>

        <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
          <Link
            to="/admin/categories"
            className="px-6 py-3 rounded-lg text-gray-600 hover:bg-gray-100 font-medium transition-colors"
          >
            Cancelar
          </Link>

          <button 
            type="submit" 
            disabled={isSaving}
            className="bg-autobier-500 hover:bg-autobier-600 text-white font-bold px-6 py-3 rounded-lg flex items-center gap-2 transition-all shadow-md shadow-autobier-200 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save size={20} />
                Salvar Alterações
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}