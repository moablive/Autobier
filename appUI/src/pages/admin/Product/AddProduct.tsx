import { useEffect, useState, useRef } from 'react';
import type { ChangeEvent, FormEvent, MouseEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, ArrowLeft, Image as ImageIcon, Loader2, AlertCircle, CheckCircle, Trash2, DollarSign } from 'lucide-react';
import { productService } from '@autobier/http-client';
import type { ICategory } from '@autobier/types';
import type { IApiError } from '@autobier/types';

export function AddProduct() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // --- ESTADOS DO FORMULÁRIO ---
  // Removida tipagem explícita <string> pois o TS infere pelo valor inicial ''
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [pricePurchase, setPricePurchase] = useState('');
  const [priceSale, setPriceSale] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [imageBase64, setImageBase64] = useState('');

  // --- ESTADOS DE SISTEMA ---
  // Aqui mantemos <ICategory[]> pois o valor inicial [] não revela o tipo do array
  const [categories, setCategories] = useState<ICategory[]>([]);
  // Removida tipagem explícita <boolean>
  const [isLoading, setIsLoading] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true); 
  const [error, setError] = useState('');

  // --- ESTADOS DOS MODAIS ---
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  // 1. Carregar categorias ao abrir
  useEffect(() => {
    loadCategories();
  }, []);

  // Removido : Promise<void> (inferido automaticamente)
  async function loadCategories() {
    try {
      setIsPageLoading(true);
      const response = await productService.getAllCategories();
      const list = Array.isArray(response) ? response : [];
      setCategories(list);
      if (list.length > 0) setCategoryId(list[0].id);
    } catch (err) {
      console.error("Erro ao buscar categorias", err);
      setError("Não foi possível carregar as categorias.");
    } finally {
      setIsPageLoading(false);
    }
  }

  // 2. Manipula a Imagem
  // Removido : void do retorno
  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("A imagem deve ter no máximo 5MB.");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setImageBase64(reader.result as string);
        setError('');
      };
      reader.readAsDataURL(file);
    }
  };

  // Adicionado tipo genérico ao MouseEvent para ser mais específico
  const handleRemoveImage = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setImageBase64('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // 3. Formatação de Preço (UX)
  // Simplificada a assinatura da função para evitar tipos complexos desnecessários no linter
  const handlePriceBlur = (setter: (value: string) => void, value: string) => {
    if (!value) return;
    const numberVal = parseFloat(value.replace(',', '.'));
    if (!isNaN(numberVal)) {
      setter(numberVal.toFixed(2));
    }
  };

  // 4. Enviar Formulário
  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (!name.trim()) throw new Error("O nome do produto é obrigatório.");
      if (!categoryId) throw new Error("Selecione uma categoria válida.");
      if (!priceSale || Number(priceSale) <= 0) throw new Error("Informe um preço de venda válido.");

      const payload = {
        name,
        description,
        purchase_price: Number(pricePurchase.replace(',', '.')) || 0,
        sale_price: Number(priceSale.replace(',', '.')),
        category_id: categoryId,
        image_base64: imageBase64 || ''
      };

      await productService.createProduct(payload);
      
      setShowSuccessModal(true);

    } catch (err: unknown) {
      console.error(err);
      let errorMessage = "Erro desconhecido ao salvar.";
      
      if (err instanceof Error) {
         // Verificamos se parece um erro de API (com response.data)
         const apiError = err as unknown as IApiError;
         if (apiError.response?.data?.message) {
            errorMessage = apiError.response.data.message;
         } else {
            errorMessage = err.message;
         }
      }
      
      setError(errorMessage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setIsLoading(false);
    }
  }

  const handleBackClick = () => {
    const isDirty = name || priceSale || imageBase64 || description;
    
    if (isDirty) {
      setShowCancelModal(true);
    } else {
      navigate(-1);
    }
  };

  if (isPageLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 text-autobier-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 animate-fade-in relative">
      <div className="max-w-5xl mx-auto">
        
        {/* --- CABEÇALHO --- */}
        <div className="flex items-center gap-4 mb-8">
          <button 
            onClick={handleBackClick}
            type="button"
            className="p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-100 hover:text-autobier-600 transition shadow-sm"
          >
            <ArrowLeft size={20} className="text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-black text-gray-800 tracking-tight">Novo Produto</h1>
            <p className="text-sm text-gray-500">Preencha os dados para adicionar ao cardápio.</p>
          </div>
        </div>

        {/* --- MENSAGEM DE ERRO VISUAL --- */}
        {error && (
          <div className="bg-red-50 border border-red-100 p-4 mb-6 rounded-xl shadow-sm flex items-start gap-3 animate-shake">
            <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={20} />
            <div className="flex-1">
              <h4 className="text-red-800 font-bold text-sm">Atenção</h4>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* --- FORMULÁRIO --- */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-8">
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* LADO ESQUERDO: CAMPOS */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* Nome */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Nome do Item <span className="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    required
                    autoFocus
                    disabled={isLoading}
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-4 focus:ring-autobier-500/10 focus:border-autobier-500 outline-none transition disabled:bg-gray-50 disabled:text-gray-400"
                    placeholder="Ex: Cerveja Artesanal IPA"
                  />
                </div>

                {/* Categoria */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Categoria <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <select 
                      value={categoryId}
                      onChange={e => setCategoryId(e.target.value)}
                      disabled={isLoading}
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 bg-white focus:ring-4 focus:ring-autobier-500/10 focus:border-autobier-500 outline-none appearance-none disabled:bg-gray-50"
                      required
                    >
                      <option value="" disabled>Selecione uma categoria...</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                    {/* Seta customizada do select para ficar bonito */}
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                    </div>
                  </div>
                </div>

                {/* Preços */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Preço Custo (R$)</label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                      <input 
                        type="number" 
                        step="0.01"
                        disabled={isLoading}
                        value={pricePurchase}
                        onChange={e => setPricePurchase(e.target.value)}
                        onBlur={(e) => handlePriceBlur(setPricePurchase, e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-4 focus:ring-autobier-500/10 focus:border-autobier-500 outline-none transition disabled:bg-gray-50"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Preço Venda (R$) <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-green-600" size={16} />
                      <input 
                        type="number" 
                        step="0.01"
                        required
                        disabled={isLoading}
                        value={priceSale}
                        onChange={e => setPriceSale(e.target.value)}
                        onBlur={(e) => handlePriceBlur(setPriceSale, e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-4 focus:ring-green-500/10 focus:border-green-500 outline-none transition font-semibold text-gray-900 disabled:bg-gray-50"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                </div>

                {/* Descrição */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Descrição</label>
                  <textarea 
                    rows={4}
                    disabled={isLoading}
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-4 focus:ring-autobier-500/10 focus:border-autobier-500 outline-none resize-none transition disabled:bg-gray-50"
                    placeholder="Descreva os ingredientes ou detalhes do produto..."
                  />
                </div>
              </div>

              {/* LADO DIREITO: IMAGEM */}
              <div className="lg:col-span-1">
                <label className="block text-sm font-bold text-gray-700 mb-2">Foto do Produto</label>
                
                <div 
                  className={`relative group w-full aspect-square bg-gray-50 border-2 border-dashed ${imageBase64 ? 'border-autobier-300' : 'border-gray-300'} rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100 hover:border-autobier-400 transition overflow-hidden`}
                  onClick={() => !isLoading && fileInputRef.current?.click()}
                >
                  <input 
                    ref={fileInputRef}
                    type="file" 
                    accept="image/*"
                    disabled={isLoading}
                    onChange={handleImageChange}
                    className="hidden"
                  />

                  {imageBase64 ? (
                    <>
                      <img 
                        src={imageBase64} 
                        alt="Preview" 
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                      {/* Overlay para trocar/remover */}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex flex-col items-center justify-center gap-2">
                        <p className="text-white font-bold text-sm">Trocar foto</p>
                        <button 
                          onClick={handleRemoveImage}
                          type="button"
                          className="px-3 py-1 bg-red-600 text-white text-xs rounded-lg hover:bg-red-700 transition"
                        >
                          Remover
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="text-center p-6">
                      <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3 text-gray-400 group-hover:text-autobier-500 group-hover:bg-autobier-50 transition">
                        <ImageIcon size={24} />
                      </div>
                      <span className="text-sm font-medium text-gray-600 group-hover:text-autobier-600 transition block">
                        Clique para enviar
                      </span>
                      <span className="text-xs text-gray-400 mt-1 block">JPG, PNG (max 5MB)</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* BOTÕES DE AÇÃO */}
            <div className="pt-6 border-t border-gray-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={handleBackClick}
                disabled={isLoading}
                className="px-6 py-3 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 hover:border-gray-300 transition disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className={`flex items-center gap-2 px-8 py-3 bg-autobier-500 text-white font-bold rounded-xl shadow-lg hover:bg-red-600 transition-all active:scale-95 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : <Save className="w-5 h-5" />}
                <span>{isLoading ? 'Salvando...' : 'Salvar Produto'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* ================================================================== */}
      {/* MODAL DE SUCESSO */}
      {/* ================================================================== */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-8 text-center transform transition-all scale-100">
            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-green-100">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h3 className="text-2xl font-black text-gray-800 mb-2">Sucesso!</h3>
            <p className="text-gray-500 mb-8 leading-relaxed">
              O produto <strong className="text-gray-800">{name}</strong> foi adicionado ao seu cardápio e já está visível para vendas.
            </p>
            <div className="space-y-3">
              <button
                onClick={() => {
                  setShowSuccessModal(false);
                  navigate('/admin/produtos');
                }}
                className="w-full py-3.5 bg-autobier-500 text-white font-bold rounded-xl hover:bg-red-600 transition shadow-lg shadow-autobier-500/20 active:scale-95"
              >
                Voltar para a Lista
              </button>
              <button
                onClick={() => {
                   setName('');
                   setDescription('');
                   setPriceSale('');
                   setPricePurchase('');
                   setImageBase64('');
                   setShowSuccessModal(false);
                   window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="w-full py-3.5 bg-white text-gray-700 font-bold rounded-xl border border-gray-200 hover:bg-gray-50 transition active:scale-95"
              >
                Cadastrar Novo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================== */}
      {/* MODAL DE CANCELAR */}
      {/* ================================================================== */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-8 text-center transform transition-all scale-100">
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-red-100">
              <Trash2 className="w-10 h-10 text-red-500" />
            </div>
            <h3 className="text-xl font-black text-gray-800 mb-2">Descartar Alterações?</h3>
            <p className="text-gray-500 mb-8 leading-relaxed">
              Você começou a preencher este produto. Se sair agora, todos os dados serão perdidos.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowCancelModal(false)}
                className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition"
              >
                Continuar
              </button>
              <button
                onClick={() => navigate(-1)}
                className="flex-1 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition shadow-lg shadow-red-500/20"
              >
                Sair
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}