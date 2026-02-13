import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  FileBarChart,
  ShoppingBag,
  LogOut,
  Beer,
  Tags,
} from "lucide-react";
import { authService } from "@autobier/http-client";

export function Sidebar() {
  const navigate = useNavigate();

  const getLinkClass = ({ isActive }: { isActive: boolean }) => {
    const baseClass =
      "flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200";
    const stateClass = isActive
      ? "bg-autobier-500 text-white shadow-md"
      : "text-gray-400 hover:bg-white/10 hover:text-white";
    return `${baseClass} ${stateClass}`;
  };

  const handleLogout = () => {
    authService.logout();
    navigate("/"); 
  };

  return (
    <aside className="w-64 bg-autobier-900 min-h-screen flex flex-col border-r border-gray-800">
      <div className="h-16 flex items-center px-6 border-b border-gray-800">
        <div className="flex items-center gap-2 text-white font-bold text-xl tracking-wider">
          <Beer className="text-autobier-500" />
          <span>
            AUTO<span className="text-autobier-500">.</span>BIER
          </span>
        </div>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2">
        <p className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
          Principal
        </p>

        <NavLink to="/admin/dashboard" className={getLinkClass}>
          <LayoutDashboard size={20} />
          Visão Geral
        </NavLink>

        <NavLink to="/admin/orders" className={getLinkClass}>
          <ShoppingBag size={20} />
          Pedidos
        </NavLink>

        <div className="pt-4 pb-2">
          <p className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Gerenciamento
          </p>
        </div>

        <NavLink to="/admin/products" className={getLinkClass}>
          <Beer size={20} />
          Produtos
        </NavLink>

        <NavLink to="/admin/categories" className={getLinkClass}>
          <Tags size={20} />
          Categorias
        </NavLink>

        <NavLink to="/admin/reports" className={getLinkClass}>
          <FileBarChart size={20} />
          Relatórios
        </NavLink>
      </nav>

      <div className="p-4 border-t border-gray-800">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-lg w-full transition-colors"
        >
          <LogOut size={20} />
          Sair do Sistema
        </button>
      </div>
    </aside>
  );
}