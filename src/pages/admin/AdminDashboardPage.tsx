import React, { useState } from "react";
import { Link } from "react-router-dom";
import { AdminLayout } from "../../components/admin/AdminLayout";
import { useData, type OrderRecord, type OrderStatus } from "../../context/DataContext";
import { useToast } from "../../context/ToastContext";
import {
  UtensilsCrossed,
  CheckCircle2,
  Star,
  ShoppingBag,
  ArrowRight,
  Plus,
  Clock,
  Eye,
  X,
  Phone,
} from "lucide-react";

export const AdminDashboardPage: React.FC = () => {
  const { menuItems, featuredItemIds, orders, updateOrderStatus } = useData();
  const { showToast } = useToast();
  const [selectedOrder, setSelectedOrder] = useState<OrderRecord | null>(null);

  // Time-aware greeting
const [currentHour, setCurrentHour] = useState(new Date().getHours());

React.useEffect(() => {
  const timer = setInterval(() => {
    setCurrentHour(new Date().getHours());
  }, 60000);

  return () => clearInterval(timer);
}, []);

const greeting =
  currentHour < 12
    ? "Good morning"
    : currentHour < 17
      ? "Good afternoon"
      : "Good evening";

  // Dynamic KPI Metrics
  const totalMenuItems = menuItems.length;
  const availableItemsCount = menuItems.filter((i) => i.isAvailable !== false).length;
  const featuredCount = featuredItemIds.length;
  const ordersTodayCount = orders.length;

  const recentOrders = orders.slice(0, 6);

  const handleStatusChange = (orderId: string, newStatus: OrderStatus) => {
    updateOrderStatus(orderId, newStatus);
    showToast(`Order #${orderId} marked as ${newStatus}`);
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder({ ...selectedOrder, status: newStatus });
    }
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case "Pending":
        return "bg-amber-50 text-amber-800 border-amber-200";
      case "Confirmed":
        return "bg-blue-50 text-blue-800 border-blue-200";
      case "Preparing":
        return "bg-purple-50 text-purple-800 border-purple-200";
      case "Ready":
        return "bg-indigo-50 text-indigo-800 border-indigo-200";
      case "Completed":
        return "bg-emerald-50 text-emerald-800 border-emerald-200";
      case "Cancelled":
        return "bg-stone-100 text-stone-600 border-stone-200";
    }
  };

  return (
    <AdminLayout
      pageTitle={`${greeting} 👋`}
      pageSubtitle="Here's what's happening with your cafe today."
      actions={
        <Link
          to="/admin/menu"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#064F50] hover:bg-[#043839] text-[#F8F5ED] text-xs font-semibold uppercase tracking-wider rounded-xl transition-all shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Item</span>
        </Link>
      }
    >
      {/* 4 Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-8">
        {/* Card 1 */}
        <div className="bg-white rounded-2xl p-5 border border-[#E5DFD5] shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#755546] block mb-1">
              Total Menu Items
            </span>
            <span className="font-serif text-3xl font-bold text-[#1C241E]">
              {totalMenuItems}
            </span>
            <p className="text-[11px] text-[#767E7A] mt-1 font-light">Across all categories</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-[#FAF7F2] border border-[#E5DFD5] flex items-center justify-center text-[#26332A]">
            <UtensilsCrossed className="w-5 h-5" />
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white rounded-2xl p-5 border border-[#E5DFD5] shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#755546] block mb-1">
              Available Today
            </span>
            <span className="font-serif text-3xl font-bold text-emerald-700">
              {availableItemsCount}
            </span>
            <p className="text-[11px] text-[#767E7A] mt-1 font-light">
              {totalMenuItems - availableItemsCount} sold out
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white rounded-2xl p-5 border border-[#E5DFD5] shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#755546] block mb-1">
              Featured Items
            </span>
            <span className="font-serif text-3xl font-bold text-[#C59F54]">
              {featuredCount}
            </span>
            <p className="text-[11px] text-[#767E7A] mt-1 font-light">On customer homepage</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-[#C59F54]">
            <Star className="w-5 h-5" />
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-white rounded-2xl p-5 border border-[#E5DFD5] shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#755546] block mb-1">
              Orders Today
            </span>
            <span className="font-serif text-3xl font-bold text-[#1C241E]">
              {ordersTodayCount}
            </span>
            <p className="text-[11px] text-[#767E7A] mt-1 font-light">WhatsApp &amp; Takeaway</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-[#FAF7F2] border border-[#E5DFD5] flex items-center justify-center text-[#26332A]">
            <ShoppingBag className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Recent Orders Section */}
      <div className="bg-white rounded-2xl border border-[#E5DFD5] shadow-2xs overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-[#EFE9DE] flex items-center justify-between">
          <div>
            <h2 className="font-serif text-xl font-bold text-[#1C241E]">
              Recent Orders
            </h2>
            <p className="text-xs text-[#767E7A] font-light mt-0.5">
              Live incoming customer requests
            </p>
          </div>

          <Link
            to="/admin/orders"
            className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#755546] hover:text-[#1C241E] transition-colors"
          >
            <span>View All Orders</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Orders Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF7F2] text-[#755546] uppercase font-semibold text-[10px] tracking-wider border-b border-[#EFE9DE]">
              <tr>
                <th className="py-3 px-4 sm:px-6">Order</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Items</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Time</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EFE9DE]">
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#767E7A] font-light">
                    No orders placed yet today.
                  </td>
                </tr>
              ) : (
                recentOrders.map((order) => {
                  const itemsSummary = order.items
                    .map((i) => `${i.name} ×${i.quantity}`)
                    .join(", ");

                  return (
                    <tr
                      key={order.id}
                      className="hover:bg-[#FAF7F2]/60 transition-colors cursor-pointer group"
                      onClick={() => setSelectedOrder(order)}
                    >
                      <td className="py-3.5 px-4 sm:px-6 font-mono font-bold text-[#1C241E]">
                        #{order.id}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-[#1C241E]">
                        {order.customerName}
                      </td>
                      <td className="py-3.5 px-4 max-w-xs truncate text-[#575E5B] font-light" title={itemsSummary}>
                        {itemsSummary}
                      </td>
                      <td className="py-3.5 px-4 font-serif font-bold text-[#1C241E]">
                        ₹{order.totalAmount}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusBadge(
                            order.status
                          )}`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-[#767E7A] font-light whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-[#9CA3AF]" />
                          <span>{order.createdAt}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedOrder(order);
                          }}
                          className="p-1 text-[#755546] hover:text-[#1C241E] rounded-md transition-colors"
                          title="View order details"
                          aria-label="View order details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 transition-all"
          onClick={() => setSelectedOrder(null)}
        >
          <div
            className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-[#E5DFD5] overflow-hidden p-6 animate-in fade-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between pb-4 border-b border-[#EFE9DE]">
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[#755546]">
                  Order Details
                </span>
                <h3 className="font-serif text-2xl font-bold text-[#1C241E]">
                  Order #{selectedOrder.id}
                </h3>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1.5 text-[#767E7A] hover:text-black rounded-lg cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-4 text-xs">
              {/* Customer info */}
              <div className="bg-[#FAF7F2] p-3 rounded-xl border border-[#EFE9DE] space-y-1">
                <div className="flex justify-between">
                  <span className="text-[#767E7A]">Customer:</span>
                  <span className="font-bold text-[#1C241E]">{selectedOrder.customerName}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#767E7A]">Phone:</span>
                  <a
                    href={`tel:${selectedOrder.customerPhone}`}
                    className="font-mono text-[#26332A] hover:underline flex items-center gap-1"
                  >
                    <Phone className="w-3 h-3" />
                    <span>{selectedOrder.customerPhone}</span>
                  </a>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#767E7A]">Type:</span>
                  <span className="font-semibold text-[#755546]">{selectedOrder.orderType}</span>
                </div>
                {selectedOrder.note && (
                  <div className="pt-1 text-[11px] text-[#575E5B] italic border-t border-[#E8DFD3]">
                    Note: &ldquo;{selectedOrder.note}&rdquo;
                  </div>
                )}
              </div>

              {/* Items List */}
              <div className="space-y-2">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[#755546]">
                  Ordered Items
                </span>
                <div className="divide-y divide-[#EFE9DE] border border-[#EFE9DE] rounded-xl overflow-hidden bg-white">
                  {selectedOrder.items.map((i, idx) => (
                    <div key={idx} className="p-3 flex items-center justify-between">
                      <div>
                        <span className="font-medium text-[#1C241E]">{i.name}</span>
                        <span className="text-[#767E7A] text-[11px] ml-1.5">×{i.quantity}</span>
                      </div>
                      <span className="font-serif font-bold text-[#1C241E]">
                        ₹{i.price * i.quantity}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total & Current Status */}
              <div className="flex items-center justify-between pt-2 border-t border-[#EFE9DE]">
                <span className="text-sm font-bold text-[#1C241E]">Total Amount</span>
                <span className="font-serif text-2xl font-bold text-[#1C241E]">
                  ₹{selectedOrder.totalAmount}
                </span>
              </div>

              {/* Change Status Action Buttons */}
              <div className="pt-2">
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#755546] mb-2">
                  Update Status
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(["Confirmed", "Preparing", "Ready", "Completed", "Cancelled"] as OrderStatus[]).map((st) => (
                    <button
                      key={st}
                      onClick={() => handleStatusChange(selectedOrder.id, st)}
                      className={`py-1.5 px-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer border ${
                        selectedOrder.status === st
                          ? "bg-[#26332A] text-white border-[#26332A]"
                          : "bg-white text-[#575E5B] border-[#D5C7B5] hover:bg-[#FAF7F2]"
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};
