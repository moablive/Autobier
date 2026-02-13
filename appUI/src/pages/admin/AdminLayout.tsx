import { Outlet } from 'react-router-dom';
import { Sidebar } from '../../components/Sidebar';
import { authService } from '@autobier/http-client';
import { User } from 'lucide-react';

export function AdminLayout() {
  const user = authService.getUser();

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* 1. Sidebar Fixa na Esquerda */}
      <Sidebar />

      {/* 2. Área de Conteúdo (Direita) */}
      <div className="flex-1 flex flex-col overflow-hidden">
        
        {/* Header Superior Simples (Apenas User Profile) */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-end px-8 shadow-sm z-10">
           <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-gray-800">{user?.nome}</p>
                <p className="text-xs text-gray-500">Administrador</p>
              </div>
              <div className="h-10 w-10 bg-autobier-100 rounded-full flex items-center justify-center text-autobier-500 border border-autobier-200">
                <User size={20} />
              </div>
           </div>
        </header>

        {/* Onde as páginas (Dashboard, Relatórios) serão renderizadas */}
        <main className="flex-1 overflow-auto p-8">
           {/* O Outlet renderiza a rota filha atual */}
           <Outlet />
        </main>
      </div>
    </div>
  );
}