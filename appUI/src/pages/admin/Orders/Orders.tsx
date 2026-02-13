import { useEffect, useState } from "react";
import {
  RefreshCw,
  Clock,
  CheckCircle,
  XCircle,
  ShoppingBag,
  Trash2,
} from "lucide-react";
import { orderService } from "@autobier/http-client";
import type { IOrder } from "@autobier/types";
import { RemoveModal } from "../../../components/RemoveModal"; 
import { toast } from "react-toastify";

interface StatusConfig {
  color: string;
  icon: React.ElementType;
  label: string;
}

export function Orders() {
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [orderToDelete, setOrderToDelete] = useState<IOrder | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Busca de pedidos
  async function fetchOrders(): Promise<void> {
    try {
      const data = await orderService.getAllOrders();
      setOrders(data);
      setLastUpdated(new Date());
    } catch (error: unknown) {
      console.error("Erro ao atualizar pedidos:", error);
    } finally {
      setIsLoading(false);
    }
  }

  // Polling a cada 10 segundos
  useEffect(() => {
    fetchOrders();
    const interval = setInterval(() => {
      fetchOrders().catch(console.error);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  // Abre o modal de confirmação
  function handleOpenDeleteModal(order: IOrder): void {
    setOrderToDelete(order);
    setIsModalOpen(true);
  }

  // Executa o cancelamento real (Backend + Asaas)
  async function handleConfirmDelete(): Promise<void> {
    if (!orderToDelete) return;

    try {
      setIsDeleting(true);
      await orderService.cancelOrder(orderToDelete.id);

      // Atualização Visual: Remove da lista local
      setOrders((prev) => prev.filter((o) => o.id !== orderToDelete.id));
      
      toast.success(`Pedido de ${orderToDelete.customer_name} cancelado!`);
    } catch (error: unknown) {
      console.error(error);
      toast.error("Não foi possível cancelar o pedido.");
    } finally {
      setIsDeleting(false);
      setIsModalOpen(false);
      setOrderToDelete(null);
    }
  }

  const StatusBadge = ({ status }: { status: string }) => {
    const config: Record<string, StatusConfig> = {
      PENDING: {
        color: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
        icon: Clock,
        label: "Aguardando Pagamento",
      },
      PAID: {
        color: "bg-green-500/10 text-green-500 border-green-500/20",
        icon: CheckCircle,
        label: "Pago (Preparar)",
      },
      CANCELLED: {
        color: "bg-red-500/10 text-red-500 border-red-500/20",
        icon: XCircle,
        label: "Cancelado",
      },
    };

    const current = config[status] || config.PENDING;
    const Icon = current.icon;

    return (
      <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${current.color}`}>
        <Icon size={14} /> {current.label}
      </span>
    );
  };

  return (
    <div className="animate-fade-in space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <ShoppingBag className="text-autobier-500" /> Monitor de Pedidos
          </h1>
          <p className="text-gray-500 text-sm flex items-center gap-2">
            Atualização automática ativa
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
          </p>
        </div>

        <div className="flex items-center gap-3 text-sm text-gray-400">
          <span>Última atualização: {lastUpdated.toLocaleTimeString()}</span>
          <button
            onClick={() => { setIsLoading(true); fetchOrders(); }}
            className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:text-autobier-500 transition shadow-sm"
          >
            <RefreshCw size={18} className={isLoading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* Tabela de Pedidos */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {!isLoading && orders.length === 0 ? (
          <div className="p-12 text-center text-gray-400 flex flex-col items-center">
            <ShoppingBag size={48} className="mb-4 opacity-20" />
            <p>Nenhum pedido recebido hoje.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-600 font-bold uppercase text-xs">
                <tr>
                  <th className="px-6 py-4">Horário</th>
                  <th className="px-6 py-4">Cliente</th>
                  <th className="px-6 py-4">Itens</th>
                  <th className="px-6 py-4 text-right">Total</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition group">
                    <td className="px-6 py-4 text-gray-500">
                      {new Date(order.created_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900 text-lg">
                      {order.customer_name}
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        {(order.items || []).map((item, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-gray-700">
                            <span className="bg-gray-200 text-gray-800 text-xs font-bold px-1.5 py-0.5 rounded">{item.quantity}x</span>
                            <span className="truncate max-w-[150px]">{item.product?.name || "Produto"}</span>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-gray-800 text-lg">
                      {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(order.total_value))}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center">
                        <StatusBadge status={order.status} />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center">
                        <button
                          onClick={() => handleOpenDeleteModal(order)}
                          className="p-2 bg-white text-red-500 border border-red-100 rounded-lg hover:bg-red-500 hover:text-white transition shadow-sm"
                          title="Excluir Pedido"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <RemoveModal
        isOpen={isModalOpen}
        onClose={() => !isDeleting && setIsModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Cancelar Pedido"
        message="Deseja realmente cancelar este pedido? Esta ação removerá a cobrança do Asaas e o pedido do banco."
        itemName={orderToDelete ? `Pedido de ${orderToDelete.customer_name}` : ""}
      />
    </div>
  );
}