import { useEffect, useState } from 'react';
import { ShoppingCart, Search, Plus, Beer, Loader2 } from 'lucide-react';
import { productService } from '@autobier/http-client';
import { Cart } from '../../components/Cart';
import { CheckoutModal } from '../../components/CheckoutModal'; // Importando o Modal criado
import type { IProduct } from '@autobier/types';
import type { ICategory } from '@autobier/types';
import type { ICartItem } from '@autobier/types';

export function UserHomepage() {
  // Ajuste: Array<T> conforme regras do Total TypeScript
  const [products, setProducts] = useState<Array<IProduct>>([]);
  const [categories, setCategories] = useState<Array<ICategory>>([]);
  
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  
  // Controle do Carrinho
  const [cart, setCart] = useState<Array<ICartItem>>([]);
  const [isCartPageOpen, setIsCartPageOpen] = useState(false);
  
  // Controle do Modal de Pagamento (Pix)
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  useEffect(() => { 
    void loadMenu(); 
  }, []);

  async function loadMenu(): Promise<void> {
    try {
      setIsLoading(true);
      const [pData, cData] = await Promise.all([
        productService.getAllProducts(),
        productService.getAllCategories()
      ]);
      setProducts(pData);
      setCategories(cData);
    } catch (error) { 
      console.error(error); 
    } finally { 
      setIsLoading(false); 
    }
  }

  // Funções de manipulação do Carrinho
  const addToCart = (product: IProduct): void => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (id: string, action: 'add' | 'remove'): void => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = action === 'add' ? item.quantity + 1 : item.quantity - 1;
        return { ...item, quantity: Math.max(1, newQty) };
      }
      return item;
    }));
  };

  const removeItem = (id: string): void => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const clearCart = (): void => {
    setCart([]);
  };

  // ============================================================
  // Lógica de limpar tudo após sucesso no pagamento
  // ============================================================
  const handleSuccessCheckout = (): void => {
    clearCart(); // Limpa o carrinho
    
    // CORREÇÃO AQUI: Removemos setIsCheckoutOpen(false)
    // Isso mantém o modal aberto para exibir o QR Code.
    // O usuário fechará manualmente clicando no "X".
    
    setIsCartPageOpen(false); // Fecha a gaveta do carrinho no fundo
  };

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cart.reduce((sum, item) => sum + (Number(item.sale_price) * item.quantity), 0);

  const filteredProducts = products.filter(p => {
    const matchesCategory = selectedCategory === 'all' || p.category_id === selectedCategory;
    return matchesCategory && p.name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Ajuste: Uso do isLoading para evitar tela branca enquanto carrega
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-gray-400 gap-4">
        <Loader2 className="animate-spin text-autobier-500" size={48} />
        <p className="font-medium animate-pulse">Carregando cardápio...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24 animate-fade-in">
      {/* HEADER SIMPLES */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b px-4 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-autobier-500 italic">AUTOBIER</h1>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Cardápio</p>
        </div>
        
        <button 
          onClick={() => setIsCartPageOpen(true)}
          className="relative p-3 bg-gray-900 text-white rounded-2xl shadow-lg active:scale-95 transition"
        >
          <ShoppingCart size={24} />
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-autobier-500 text-white text-xs font-black w-6 h-6 rounded-full flex items-center justify-center border-2 border-white">
              {cartCount}
            </span>
          )}
        </button>
      </header>

      {/* CONTEÚDO DA HOME (BUSCA, CATEGORIAS, GRID) */}
      <main className="p-4 space-y-6 max-w-6xl mx-auto">
          {/* Input de Busca */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="O que vamos pedir?" 
              className="w-full pl-12 pr-4 py-4 bg-white rounded-2xl shadow-sm outline-none focus:ring-2 focus:ring-autobier-500 transition"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Categorias */}
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            <button 
              onClick={() => setSelectedCategory('all')}
              className={`px-6 py-2 rounded-full font-bold transition-all ${selectedCategory === 'all' ? 'bg-autobier-500 text-white' : 'bg-white text-gray-400 border'}`}
            >
              Todos
            </button>
            {categories.map(cat => (
              <button 
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-6 py-2 rounded-full font-bold transition-all ${selectedCategory === cat.id ? 'bg-autobier-500 text-white' : 'bg-white text-gray-400 border'}`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Grid de Produtos */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredProducts.map(product => (
              <div key={product.id} className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 flex flex-col group active:scale-95 transition-transform duration-200">
                <div className="h-40 relative overflow-hidden">
                  {product.image_base64 ? (
                    <img src={product.image_base64} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full bg-gray-50 flex items-center justify-center text-gray-300"><Beer size={40} /></div>
                  )}
                  <button 
                    onClick={() => addToCart(product)}
                    className="absolute bottom-3 right-3 p-3 bg-white text-autobier-500 rounded-2xl shadow-lg hover:bg-autobier-500 hover:text-white transition-all active:scale-90"
                  >
                    <Plus size={20} strokeWidth={3} />
                  </button>
                </div>
                <div className="p-4 flex-1 flex flex-col">
                  <h3 className="font-bold text-gray-800 text-sm mb-1 line-clamp-1">{product.name}</h3>
                  <span className="mt-auto font-black text-gray-900 text-base">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(product.sale_price))}
                  </span>
                </div>
              </div>
            ))}
          </div>
      </main>

      {/* BOTÃO FLUTUANTE (BARRA DE RESUMO) */}
      {cartCount > 0 && !isCartPageOpen && (
        <div className="fixed bottom-6 left-4 right-4 md:left-auto md:right-6 md:w-80 z-30 animate-bounce-in">
          <button 
            onClick={() => setIsCartPageOpen(true)}
            className="w-full bg-gray-900 text-white p-4 rounded-3xl shadow-2xl flex items-center justify-between ring-4 ring-white"
          >
            <div className="flex items-center gap-3">
              <div className="bg-autobier-500 p-2 rounded-xl text-white">
                <ShoppingCart size={20} strokeWidth={2.5} />
              </div>
              <div className="text-left">
                <span className="font-black text-sm block leading-none">{cartCount} {cartCount === 1 ? 'ITEM' : 'ITENS'}</span>
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Ver Pedido</span>
              </div>
            </div>
            <span className="font-black text-lg tracking-tighter">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cartTotal)}
            </span>
          </button>
        </div>
      )}

      {/* RENDERIZAÇÃO DA PÁGINA DO CARRINHO */}
      {isCartPageOpen && (
        <Cart 
          items={cart}
          onUpdateQuantity={updateQuantity}
          onRemoveItem={removeItem}
          onClearCart={clearCart}
          onClose={() => setIsCartPageOpen(false)}
          // Ao clicar em finalizar no carrinho, abre o Modal de Checkout
          onCheckout={() => setIsCheckoutOpen(true)}
        />
      )}

      {/* MODAL DE CHECKOUT (PIX) */}
      {isCheckoutOpen && (
        <CheckoutModal
          isOpen={true}
          onClose={() => setIsCheckoutOpen(false)}
          cartItems={cart}
          totalValue={cartTotal}
          onClearCart={handleSuccessCheckout}
        />
      )}
    </div>
  );
}