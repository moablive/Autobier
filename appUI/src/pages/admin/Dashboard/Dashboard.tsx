import { DollarSign, ShoppingBag, Beer } from "lucide-react";

export function Dashboard() {


  // Dados fictícios
  const stats = [
    { title: "Vendas Hoje", value: "R$ 1.250,00", icon: DollarSign, color: "text-green-600", bg: "bg-green-100" },
    { title: "Pedidos Pendentes", value: "3", icon: ShoppingBag, color: "text-orange-600", bg: "bg-orange-100" },
    { title: "Produtos Ativos", value: "12", icon: Beer, color: "text-blue-600", bg: "bg-blue-100" },
  ];

  return (
    <div className="animate-fade-in">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800">Visão Geral</h2>
          <p className="text-gray-500 mt-1">Acompanhe os indicadores do Autobier em tempo real.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center hover:shadow-md transition-all">
              <div className={`p-4 rounded-full ${stat.bg} mr-4`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Área para gráficos futuros ou últimas vendas */}
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center py-20">
            <p className="text-gray-400">Gráfico de Vendas Semanais será exibido aqui.</p>
        </div>
    </div>
  );
}