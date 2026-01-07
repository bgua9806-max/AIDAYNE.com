import React, { useEffect, useState } from 'react';
import { Search, Filter, MoreHorizontal, Clock, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';

// Helper interface since we didn't export Order type globally yet
interface Order {
  id: string;
  customer_name: string;
  created_at: string;
  total: number;
  status: string;
  payment_method: string;
}

export const AdminOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
        if (!error && data) {
           setOrders(data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
         <div>
            <h1 className="text-2xl font-extrabold text-gray-900">Đơn hàng</h1>
            <p className="text-sm text-gray-500">Quản lý và xử lý đơn hàng.</p>
         </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-4">
         <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Tìm mã đơn, tên khách hàng..." 
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-primary/20 text-sm font-medium"
            />
         </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
         <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
               <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500 font-bold">
                     <th className="p-6">Mã đơn</th>
                     <th className="p-6">Khách hàng</th>
                     <th className="p-6">Ngày đặt</th>
                     <th className="p-6">Thanh toán</th>
                     <th className="p-6">Tổng tiền</th>
                     <th className="p-6">Trạng thái</th>
                     <th className="p-6 text-right"></th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-gray-100">
                  {loading ? (
                    <tr><td colSpan={7} className="p-8 text-center">Đang tải đơn hàng...</td></tr>
                  ) : orders.map((order) => (
                     <tr key={order.id} className="hover:bg-gray-50/80 transition-colors">
                        <td className="p-6 font-bold text-gray-900">#{order.id.slice(0, 8)}</td>
                        <td className="p-6">
                           <div className="font-bold text-gray-800 text-sm">{order.customer_name || 'Khách lẻ'}</div>
                        </td>
                        <td className="p-6 text-sm text-gray-500">{new Date(order.created_at).toLocaleDateString('vi-VN')}</td>
                        <td className="p-6 text-sm text-gray-600">{order.payment_method || 'Chuyển khoản'}</td>
                        <td className="p-6 font-bold text-gray-900">
                           {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.total)}
                        </td>
                        <td className="p-6">
                           <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold capitalize
                              ${order.status === 'completed' ? 'bg-green-100 text-green-700' : 
                                order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 
                                'bg-red-100 text-red-700'}`}>
                              {order.status === 'completed' ? <CheckCircle size={14} /> : 
                               order.status === 'pending' ? <Clock size={14} /> : <XCircle size={14} />}
                              {order.status === 'completed' ? 'Hoàn thành' : 
                               order.status === 'pending' ? 'Chờ xử lý' : 'Đã hủy'}
                           </span>
                        </td>
                        <td className="p-6 text-right">
                           <button className="text-gray-400 hover:text-gray-900 p-2 rounded-lg hover:bg-gray-100 transition-colors">
                              <MoreHorizontal size={20} />
                           </button>
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>
            {!loading && orders.length === 0 && <div className="p-8 text-center text-gray-500">Chưa có đơn hàng nào</div>}
         </div>
      </div>
    </div>
  );
};
