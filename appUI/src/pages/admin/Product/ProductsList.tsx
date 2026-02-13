import { useEffect, useState } from 'react';
// removemos o useNavigate pois não é mais usado
import { Plus, Search, Trash2, Edit, Package, Beer, AlertCircle } from 'lucide-react';

import { productService } from '@autobier/http-client'; 
import type { IProduct, ICreateProductDTO } from '@autobier/types';
import type { ICategory } from '@autobier/types';

import { DeleteProductModal } from './DeleteProductModal';
import { EditProductModal } from './EditProductModal';

export function ProductsList() {
  // useNavigate removido

  // --- ESTADOS PRINCIPAIS ---
  // Tipagens explícitas removidas onde o valor inicial já define o tipo (inferência)
  const [products, setProducts] = useState<IProduct[]>([]);
  const [categories, setCategories] = useState<ICategory[]>([]); 
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);

  // --- CONTROLE DE MODAIS ---
  const [selectedProduct, setSelectedProduct] = useState<IProduct | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  const [isActionLoading, setIsActionLoading] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  async function loadInitialData() {
    try {
      setIsLoading(true);
      setError(null);
      const [productsData, categoriesData] = await Promise.all([
        productService.getAllProducts(),
        productService.getAllCategories()
      ]);
      setProducts(Array.isArray(productsData) ? productsData : []);
      setCategories(Array.isArray(categoriesData) ? categoriesData : []);
    } catch (err) {
      console.error("Erro ao carregar dados", err);
      setError("Não foi possível carregar os produtos. Verifique sua conexão.");
    } finally {
      setIsLoading(false);
    }
  }

  // --- HANDLERS ---

  function handleOpenCreate() {
    setSelectedProduct(null); // Define como null para indicar "Novo Produto"
    setIsEditModalOpen(true);
  }

  function handleOpenDelete(product: IProduct) {
    setSelectedProduct(product);
    setIsDeleteModalOpen(true);
  }

  function handleOpenEdit(product: IProduct) {
    setSelectedProduct(product);
    setIsEditModalOpen(true);
  }

  async function onConfirmDelete() {
    if (!selectedProduct) return;
    try {
      setIsActionLoading(true);
      await productService.deleteProduct(selectedProduct.id);
      setProducts(prev => prev.filter(p => p.id !== selectedProduct.id));
      setIsDeleteModalOpen(false);
      setSelectedProduct(null);
    } catch (err) {
      console.error(err);
      setError("Erro ao excluir o produto. Tente novamente.");
    } finally {
      setIsActionLoading(false);
    }
  }

  // Função unificada para Criar e Editar
  async function handleSaveProduct(data: ICreateProductDTO, id?: string) {
    try {
      setIsActionLoading(true);
      
      if (id) {
        // --- MODO EDIÇÃO ---
        const updatedProduct = await productService.updateProduct(id, data);
        setProducts(prev => prev.map(p => p.id === id ? { ...updatedProduct } : p));
      } else {
        // --- MODO CRIAÇÃO ---
        const newProduct = await productService.createProduct(data); 
        setProducts(prev => [newProduct, ...prev]); 
      }
      
      setIsEditModalOpen(false);
      setSelectedProduct(null);
    } catch (err) {
      console.error(err);
      setError("Erro ao salvar o produto.");
    } finally {
      setIsActionLoading(false);
    }
  }

  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCurrency = (value: number | string) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value));
  };

  return (
    <div className="animate-fade-in space-y-6 pb-10">
      
      {/* Header e Ações */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-800 tracking-tight">Produtos</h1>
          <p className="text-gray-500 font-medium">Controle total do seu cardápio e estoque.</p>
        </div>
        
        <button 
          onClick={handleOpenCreate}
          className="flex items-center justify-center gap-2 bg-autobier-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-red-600 transition-all shadow-lg active:scale-95"
        >
          <Plus size={20} strokeWidth={3} />
          <span>Adicionar Produto</span>
        </button>
      </div>

      {/* Barra de Busca e Erros */}
      <div className="space-y-4">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-autobier-500 transition" size={20} />
          <input 
            type="text"
            placeholder="Procurar por nome do item..."
            className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-200 bg-white focus:ring-4 focus:ring-autobier-500/10 focus:border-autobier-500 outline-none transition-all shadow-sm"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 p-4 rounded-xl flex items-center gap-3 text-red-600 animate-shake">
            <AlertCircle size={20} />
            <span className="font-medium text-sm">{error}</span>
          </div>
        )}
      </div>

      {/* Conteúdo Principal */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1,2,3,4].map(i => (
            <div key={i} className="h-80 bg-gray-100 rounded-2xl animate-pulse border border-gray-200" />
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-3xl border-2 border-dashed border-gray-200">
          <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package size={40} className="text-gray-300" />
          </div>
          <h3 className="text-gray-800 font-bold text-lg">Nenhum produto por aqui</h3>
          <p className="text-gray-500 max-w-xs mx-auto">Tente ajustar sua busca ou cadastre um novo item no botão acima.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map(product => (
            <div key={product.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col group">
              
              {/* Imagem do Card */}
              <div className="h-44 bg-gray-50 relative overflow-hidden">
                {product.image_base64 ? (
                  <img src={product.image_base64} alt={product.name} className="w-full h-full object-cover transition duration-700 group-hover:scale-110" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-200 bg-gray-50">
                    <Beer size={48} strokeWidth={1} />
                  </div>
                )}
                
                {/* Badge de Categoria */}
                <div className="absolute top-3 left-3">
                  <span className="bg-white/90 backdrop-blur-md text-[10px] uppercase tracking-widest font-black px-2.5 py-1 rounded-full text-gray-700 shadow-sm border border-white">
                    {product.category?.name || 'Geral'}
                  </span>
                </div>
              </div>

              {/* Info do Card */}
              <div className="p-5 flex-1 flex flex-col">
                <h3 className="font-bold text-gray-800 text-lg mb-1 truncate leading-tight group-hover:text-autobier-600 transition">
                  {product.name}
                </h3>
                <p className="text-gray-400 text-xs line-clamp-2 mb-4 h-8">
                  {product.description || 'Sem descrição cadastrada.'}
                </p>
                
                <div className="mt-auto space-y-3">
                  <div className="flex justify-between items-center bg-gray-50 p-3 rounded-xl">
                    <div>
                      <span className="text-[10px] text-gray-400 uppercase font-bold block">Preço de Venda</span>
                      <span className="text-xl font-black text-gray-900">
                        {formatCurrency(product.sale_price)}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-gray-400 uppercase font-bold block">Custo</span>
                      <span className="text-sm font-bold text-gray-500">
                        {formatCurrency(product.purchase_price)}
                      </span>
                    </div>
                  </div>

                  {/* Ações */}
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleOpenEdit(product)} 
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-bold hover:bg-blue-50 hover:text-blue-600 transition-colors"
                    >
                      <Edit size={16} />
                      <span className="text-sm">Editar</span>
                    </button>
                    <button 
                      onClick={() => handleOpenDelete(product)} 
                      className="px-3 py-2.5 bg-gray-100 text-gray-400 rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modais */}
      <DeleteProductModal 
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedProduct(null);
        }}
        onConfirm={onConfirmDelete}
        product={selectedProduct}
        isLoading={isActionLoading}
      />

      <EditProductModal 
        key={selectedProduct ? selectedProduct.id : 'new'} 
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedProduct(null);
        }}
        // CORREÇÃO: Removida a tipagem explícita para o TS inferir compatibilidade com (id: string | undefined, data: any)
        onSave={(id, data) => handleSaveProduct(data, id)} 
        product={selectedProduct}
        categories={categories}
        isLoading={isActionLoading}
      />

    </div>
  );
}