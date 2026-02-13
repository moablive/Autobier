import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, Loader2 } from 'lucide-react';
import { authService } from '@autobier/http-client';

export function Login() {
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false); 

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    
    // Limpa erros anteriores e inicia loading
    setError('');
    setIsLoading(true);

    try {
      const response = await authService.login({ email, password });
      
      authService.saveSession(response);
      
      // Redireciona para o Dashboard
      navigate('/admin/dashboard'); 
    } catch (err) {
      // Mensagem genérica por segurança, ou você pode tratar o erro do axios aqui
      setError('E-mail ou senha incorretos. Tente novamente.');
      console.error(err);
    } finally {
      // Garante que o loading pare, mesmo com erro
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-autobier-900 px-4">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md animate-fade-in">
        
        {/* Cabeçalho do Card */}
        <div className="text-center mb-8">
          <div className="bg-autobier-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-autobier-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Painel Administrativo</h2>
          <p className="text-gray-500 text-sm mt-1">Autobier</p>
        </div>
        
        {/* Mensagem de Erro */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded text-sm flex items-center">
             <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          {/* Input E-mail */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input 
                type="email" 
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-autobier-500 focus:border-autobier-500 sm:text-sm transition-colors"
                placeholder="admin@autobier.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Input Senha */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input 
                type="password" 
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-autobier-500 focus:border-autobier-500 sm:text-sm transition-colors"
                placeholder="••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Botão de Ação */}
          <button 
            type="submit" 
            disabled={isLoading}
            className={`w-full flex items-center justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-autobier-500 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-autobier-500 transition-all ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                Entrando...
              </>
            ) : (
              'Acessar Sistema'
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-400">
            Acesso restrito a funcionários autorizados.
          </p>
        </div>
      </div>
    </div>
  );
}