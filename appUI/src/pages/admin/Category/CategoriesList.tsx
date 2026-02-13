import { useEffect, useState } from 'react';
import { Plus, Trash2, Edit, Tags, Loader2, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AxiosError } from 'axios';
import { toast } from 'react-toastify';
import { categoryService } from '@autobier/http-client';
import type { ICategory } from '@autobier/types';
import { RemoveModal } from '../../../components/RemoveModal';

export function CategoriesList() {
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<ICategory | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  async function loadCategories() {
    try {
      const data = await categoryService.getAll();
      setCategories(data);
    } catch (error) {
      console.error("Erro ao buscar categorias", error);
      toast.error("Erro ao carregar categorias.");
    } finally {
      setLoading(false);
    }
  }

  function handleOpenDeleteModal(category: ICategory) {
    setSelectedCategory(category);
    setDeleteModalOpen(true);
  }

  async function handleConfirmDelete() {
    if (!selectedCategory) return;

    try {
      setIsDeleting(true);
      await categoryService.delete(selectedCategory.id);
      
      // Atualiza a lista visualmente
      setCategories(current => current.filter(cat => cat.id !== selectedCategory.id));
      
      toast.success("Categoria removida com sucesso!");
      setDeleteModalOpen(false);
      setSelectedCategory(null);
    } catch (error) {
      const err = error as AxiosError<{ error: string }>;
      const errorMessage = err.response?.data?.error || "Não foi possível excluir. Verifique se há produtos vinculados.";
      
      toast.error(errorMessage);
      setDeleteModalOpen(false); 
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="animate-fade-in p-6 max-w-6xl mx-auto space-y-6">
      
      {/* Modal de Confirmação */}
      <RemoveModal 
        isOpen={isDeleteModalOpen}
        onClose={() => !isDeleting && setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Excluir Categoria"
        message="Tem certeza que deseja remover esta categoria? Produtos vinculados impedirão a exclusão."
        itemName={selectedCategory?.name}
      />

      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Tags className="text-autobier-500" /> Categorias
          </h1>
          <p className="text-gray-500 text-sm">Gerencie as seções do seu cardápio.</p>
        </div>

        <Link 
          to="/admin/categories/new" 
          className="bg-autobier-500 hover:bg-autobier-600 text-white px-5 py-2.5 rounded-lg flex items-center gap-2 transition-all shadow-md shadow-autobier-200 hover:shadow-lg font-medium"
        >
          <Plus size={20} />
          Nova Categoria
        </Link>
      </div>

      {/* Tabela */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-600 font-semibold uppercase text-xs border-b border-gray-100">
            <tr>
              <th className="px-6 py-4">Nome</th>
              <th className="px-6 py-4">Descrição</th>
              <th className="px-6 py-4 text-center w-32">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            
            {/* Estado de Loading */}
            {loading ? (
              <tr>
                <td colSpan={3} className="px-6 py-12 text-center text-gray-400">
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 size={32} className="animate-spin text-autobier-500" />
                    <span className="text-sm">Carregando categorias...</span>
                  </div>
                </td>
              </tr>
            ) : categories.length === 0 ? (
              /* Estado Vazio */
              <tr>
                <td colSpan={3} className="px-6 py-12 text-center text-gray-400">
                  <div className="flex flex-col items-center gap-2">
                    <Search size={32} className="opacity-20" />
                    <p>Nenhuma categoria cadastrada.</p>
                  </div>
                </td>
              </tr>
            ) : (
              /* Lista de Categorias */
              categories.map((category) => (
                <tr key={category.id} className="hover:bg-gray-50 transition-colors group">
                  <td className="px-6 py-4 font-medium text-gray-800">
                    {category.name}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {category.description || <span className="text-gray-300 italic">Sem descrição</span>}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center gap-2">
                      {/* ✅ AJUSTADO: Rota em Inglês (categories/edit) */}
                      <Link 
                        to={`/admin/categories/edit/${category.id}`} 
                        className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <Edit size={18} />
                      </Link>
                      <button 
                        onClick={() => handleOpenDeleteModal(category)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Excluir"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}