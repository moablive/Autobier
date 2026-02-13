import { useState, useEffect, useRef } from 'react';
import type { FormEvent, ChangeEvent, MouseEvent } from 'react';
import { X, Save, Loader2, ImageIcon, DollarSign } from 'lucide-react';

// Importamos os tipos
import type { IProduct, ICreateProductDTO } from '@autobier/types';
import type { ICategory } from '@autobier/types';

// Mudança de interface para type para satisfazer o linter
type EditProductModalProps = {
  isOpen: boolean;
  onClose: () => void;
  // ID opcional para criação
  onSave: (id: string | undefined, data: ICreateProductDTO) => Promise<void>; 
  product: IProduct | null;
  categories: ICategory[];
  isLoading: boolean;
};

export function EditProductModal({ 
  isOpen, 
  onClose, 
  onSave, 
  product, 
  categories,
  isLoading 
}: EditProductModalProps) {
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- ESTADOS DO FORMULÁRIO ---
  // Removida tipagem explícita <string> (inferência automática)
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [pricePurchase, setPricePurchase] = useState('');
  const [priceSale, setPriceSale] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [imageBase64, setImageBase64] = useState('');

  // Sincroniza o formulário ao abrir ou trocar de produto
  useEffect(() => {
    // Se o modal não estiver aberto, não faz nada
    if (!isOpen) return;

    if (product) {
      // --- MODO EDIÇÃO ---
      setName(product.name);
      setDescription(product.description ?? '');
      
      const pVal = Number(product.purchase_price);
      setPricePurchase(!isNaN(pVal) ? pVal.toFixed(2) : '');

      const sVal = Number(product.sale_price);
      setPriceSale(!isNaN(sVal) ? sVal.toFixed(2) : '');

      setCategoryId(product.category_id);
      setImageBase64(product.image_base64 ?? '');
    } else {
      // --- MODO CRIAÇÃO ---
      setName('');
      setDescription('');
      setPricePurchase('');
      setPriceSale('');
      setCategoryId(categories.length > 0 ? categories[0].id : '');
      setImageBase64('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, product?.id]); 
  // Alteração chave: Dependemos de product?.id em vez do objeto product inteiro
  // Isso evita loops de renderização se o objeto mudar de referência mas for o mesmo produto

  // Manipulação de imagem
  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setImageBase64('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Formata preços visualmente ao sair do campo
  const handlePriceBlur = (setter: (val: string) => void, value: string) => {
    if (!value) return;
    const numberVal = parseFloat(value.replace(',', '.'));
    if (!isNaN(numberVal)) {
      setter(numberVal.toFixed(2));
    }
  };

  // Envio do formulário
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!name || !priceSale || !categoryId) return;

    // Removida anotação de tipo explícita const payload: ICreateProductDTO
    const payload: ICreateProductDTO = {
      name,
      description,
      purchase_price: Number(String(pricePurchase).replace(',', '.')) || 0,
      sale_price: Number(String(priceSale).replace(',', '.')),
      category_id: categoryId,
      image_base64: imageBase64
    };

    await onSave(product?.id, payload);
  };

  if (!isOpen) return null;

  const isEditMode = !!product;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col transform transition-all scale-100">
        
        {/* Header */}
        <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-white z-10">
          <div>
            <h2 className="text-2xl font-black text-gray-800 tracking-tight">
              {isEditMode ? 'Editar Produto' : 'Novo Produto'}
            </h2>
            <p className="text-sm text-gray-500 font-medium">
              {isEditMode ? 'Atualize as informações do item abaixo.' : 'Preencha os dados para cadastrar.'}
            </p>
          </div>
          <button 
            type="button" 
            onClick={onClose} 
            className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 md:p-8 space-y-8 custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Dados */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Nome do Produto</label>
                <input 
                  type="text" required
                  autoFocus={!isEditMode}
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-4 focus:ring-autobier-500/10 focus:border-autobier-500 transition"
                  placeholder="Ex: Coca-Cola 350ml"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Categoria</label>
                <div className="relative">
                  <select 
                    value={categoryId}
                    onChange={e => setCategoryId(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-4 focus:ring-autobier-500/10 focus:border-autobier-500 bg-white appearance-none"
                    required
                  >
                    <option value="" disabled>Selecione...</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Custo</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                    <input 
                      type="number" step="0.01"
                      value={pricePurchase}
                      onChange={e => setPricePurchase(e.target.value)}
                      onBlur={(e) => handlePriceBlur(setPricePurchase, e.target.value)}
                      className="w-full pl-9 pr-3 py-3 border border-gray-300 rounded-xl outline-none focus:ring-4 focus:ring-autobier-500/10 focus:border-autobier-500 transition"
                      placeholder="0.00"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Venda</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-green-600" size={14} />
                    <input 
                      type="number" step="0.01" required
                      value={priceSale}
                      onChange={e => setPriceSale(e.target.value)}
                      onBlur={(e) => handlePriceBlur(setPriceSale, e.target.value)}
                      className="w-full pl-9 pr-3 py-3 border border-gray-300 rounded-xl outline-none focus:ring-4 focus:ring-green-500/10 focus:border-green-500 transition font-semibold text-gray-900"
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Descrição <span className="text-gray-400 font-normal text-xs">(Opcional)</span></label>
                <textarea 
                  rows={3}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-4 focus:ring-autobier-500/10 focus:border-autobier-500 resize-none transition"
                  placeholder="Breve descrição do produto..."
                />
              </div>
            </div>

            {/* Imagem */}
            <div>
               <label className="block text-sm font-bold text-gray-700 mb-2">Imagem</label>
               
               <div 
                 className={`relative w-full aspect-square border-2 border-dashed ${imageBase64 ? 'border-autobier-300' : 'border-gray-300'} rounded-2xl flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition overflow-hidden group cursor-pointer`}
                 onClick={() => fileInputRef.current?.click()}
               >
                  <input 
                    ref={fileInputRef}
                    type="file" 
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  
                  {imageBase64 ? (
                    <>
                      <img src={imageBase64} alt="Preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition z-10 gap-2">
                        <ImageIcon className="text-white" size={32} />
                        <span className="text-white text-sm font-bold">Alterar Foto</span>
                        <button 
                          type="button"
                          onClick={handleRemoveImage}
                          className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition"
                        >
                          Remover
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="text-center text-gray-400 p-6">
                      <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
                        <ImageIcon className="text-gray-400" size={24} />
                      </div>
                      <span className="text-sm font-bold text-gray-600">Clique para enviar</span>
                      <span className="block text-xs mt-1">JPG ou PNG</span>
                    </div>
                  )}
               </div>
            </div>
          </div>

          {/* Footer */}
          <div className="pt-6 border-t border-gray-100 flex justify-end gap-3">
            <button 
              type="button" 
              onClick={onClose}
              className="px-6 py-3 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition font-bold"
              disabled={isLoading}
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              disabled={isLoading}
              className={`flex-1 md:flex-none px-8 py-3 bg-autobier-500 text-white font-bold rounded-xl shadow-lg hover:bg-red-600 transition-all active:scale-95 flex items-center justify-center gap-2 ${
                isLoading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {isLoading ? (
                <Loader2 className="animate-spin w-5 h-5" />
              ) : (
                <Save className="w-5 h-5" />
              )}
              {isEditMode ? 'Salvar Alterações' : 'Criar Produto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}