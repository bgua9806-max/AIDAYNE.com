
import React, { useEffect, useState } from 'react';
import { Search, Mail, Phone, Calendar, User, MoreHorizontal, Shield, Wallet, ShoppingBag, X, Clock, CheckCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Customer } from '../../types';

interface OrderSummary {
    id: string;
    total: number;
    created_at: string;
    status: string;
}

interface EnrichedCustomer extends Customer {
    totalSpend: number;
    orderCount: number;
    lastOrderDate: string | null;
    isVip: boolean;
}

export const AdminCustomers: React.FC = () => {
  const [customers, setCustomers] = useState<EnrichedCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal State
  const [selectedCustomer, setSelectedCustomer] = useState<EnrichedCustomer | null>(null);
  const [customerOrders, setCustomerOrders] = useState<OrderSummary[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // 1. Fetch Customers
        const { data: customerData, error: custError } = await supabase
          .from('customers')
          .select('*')
          .order('created_at', { ascending: false });

        if (custError) throw custError;

        // 2. Fetch All Orders (Optimized: In real app, consider using RPC or specific query)
        const { data: orderData, error: ordError } = await supabase
          .from('orders')
          .select('id, email, total, created_at, status');

        if (ordError) throw ordError;

        // 3. Merge Data to calculate Metrics
        if (customerData) {
            const enriched = customerData.map((c: Customer) => {
                // Find orders for this customer by email
                const myOrders = orderData?.filter((o: any) => o.email?.toLowerCase() === c.email?.toLowerCase()) || [];
                
                // Calculate Total Spend (Only completed orders)
                const totalSpend = myOrders
                    .filter((o: any) => o.status === 'completed')
                    .reduce((sum: number, o: any) => sum + (o.total || 0), 0);
                
                // Last order
                const lastOrder = myOrders.length > 0 ? myOrders.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0] : null;

                return {
                    ...c,
                    totalSpend,
                    orderCount: myOrders.length,
                    lastOrderDate: lastOrder ? lastOrder.created_at : null,
                    isVip: totalSpend >= 1000000 // VIP Threshold: 1 Million VND
                };
            });
            setCustomers(enriched);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Fetch specific history when opening modal
  const handleViewCustomer = async (customer: EnrichedCustomer) => {
      setSelectedCustomer(customer);
      setLoadingHistory(true);
      try {
          const { data } = await supabase
            .from('orders')
            .select('*')
            .eq('email', customer.email)
            .order('created_at', { ascending: false });
          
          if (data) setCustomerOrders(data);
      } catch (e) {
          console.error(e);
      } finally {
          setLoadingHistory(false);
      }
  };

  const filteredCustomers = customers.filter(c => 
    (c.full_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (c.email?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in relative">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
         <div>
            <h1 className="text-2xl font-extrabold text-gray-900">Khách hàng</h1>
            <p className="text-sm text-gray-500">Quản lý hồ sơ và lịch sử mua sắm.</p>
         </div>
         <div className="bg-white px-4 py-2 rounded-xl border border-gray-100 shadow-sm flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            <span className="text-sm font-bold text-gray-700">{customers.length} Thành viên</span>
         </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
         <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Tìm kiếm theo tên hoặc email..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
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
                     <th className="p-6">Thành viên</th>
                     <th className="p-6">Liên hệ</th>
                     <th className="p-6">Chi tiêu</th>
                     <th className="p-6">Vai trò</th>
                     <th className="p-6 text-right"></th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-gray-100">
                  {loading ? (
                    <tr><td colSpan={5} className="p-8 text-center">Đang tải danh sách...</td></tr>
                  ) : filteredCustomers.map((customer) => (
                     <tr 
                        key={customer.id} 
                        className="hover:bg-gray-50/80 transition-colors cursor-pointer group"
                        onClick={() => handleViewCustomer(customer)}
                     >
                        <td className="p-6">
                           <div className="flex items-center gap-4">
                              {customer.avatar_url ? (
                                <img src={customer.avatar_url} alt="" className="w-12 h-12 rounded-full object-cover border border-gray-200" />
                              ) : (
                                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                                   <User size={20} />
                                </div>
                              )}
                              <div>
                                 <div className="flex items-center gap-2">
                                     <div className="font-bold text-gray-900 text-sm">{customer.full_name || 'Chưa đặt tên'}</div>
                                     {customer.isVip && (
                                         <span className="bg-yellow-100 text-yellow-700 text-[10px] font-bold px-1.5 py-0.5 rounded border border-yellow-200 flex items-center gap-0.5">
                                             <Shield size={10} fill="currentColor" /> VIP
                                         </span>
                                     )}
                                 </div>
                                 <div className="text-xs text-gray-400 font-mono mt-1">ID: {customer.id.slice(0, 8)}...</div>
                              </div>
                           </div>
                        </td>
                        <td className="p-6">
                           <div className="space-y-1">
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                 <Mail size={14} className="text-gray-400" /> {customer.email}
                              </div>
                              {customer.phone && (
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                   <Phone size={14} className="text-gray-400" /> {customer.phone}
                                </div>
                              )}
                           </div>
                        </td>
                        <td className="p-6">
                           <div className="font-bold text-gray-900 text-sm">
                               {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(customer.totalSpend)}
                           </div>
                           <div className="text-xs text-gray-500 mt-1">{customer.orderCount} đơn hàng</div>
                        </td>
                        <td className="p-6">
                           {customer.email.includes('admin') ? (
                              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-bold border border-purple-200">
                                 <Shield size={12} /> Admin
                              </span>
                           ) : (
                              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-bold border border-blue-100">
                                 <User size={12} /> Member
                              </span>
                           )}
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
            {!loading && filteredCustomers.length === 0 && (
               <div className="p-12 text-center text-gray-500">Chưa có khách hàng nào đăng ký.</div>
            )}
         </div>
      </div>

      {/* CUSTOMER 360 MODAL */}
      {selectedCustomer && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedCustomer(null)}></div>
              
              <div className="bg-white rounded-[2rem] w-full max-w-4xl max-h-[90vh] overflow-hidden relative z-10 shadow-2xl animate-fade-in-up flex flex-col">
                  
                  {/* Header */}
                  <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-white shrink-0">
                      <div>
                          <h3 className="text-xl font-extrabold text-gray-900 flex items-center gap-2">
                              Hồ sơ khách hàng
                              {selectedCustomer.isVip && <span className="bg-yellow-400 text-white text-[10px] px-2 py-0.5 rounded shadow-sm">VIP</span>}
                          </h3>
                      </div>
                      <button onClick={() => setSelectedCustomer(null)} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"><X size={20}/></button>
                  </div>

                  <div className="flex-1 overflow-y-auto bg-gray-50/50 p-8">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                          
                          {/* Left: Profile Card */}
                          <div className="md:col-span-1 space-y-6">
                              <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 text-center">
                                  <div className="w-24 h-24 rounded-full bg-gray-100 mx-auto mb-4 flex items-center justify-center text-gray-400 border-4 border-white shadow-lg overflow-hidden">
                                      {selectedCustomer.avatar_url ? (
                                          <img src={selectedCustomer.avatar_url} className="w-full h-full object-cover" />
                                      ) : (
                                          <User size={40} />
                                      )}
                                  </div>
                                  <h4 className="text-lg font-bold text-gray-900">{selectedCustomer.full_name || 'Khách hàng'}</h4>
                                  <p className="text-sm text-gray-500 mb-6">{selectedCustomer.email}</p>
                                  
                                  <div className="grid grid-cols-2 gap-4 border-t border-gray-100 pt-4 text-left">
                                      <div>
                                          <div className="text-xs text-gray-400 uppercase font-bold">Tham gia</div>
                                          <div className="text-sm font-medium">{new Date(selectedCustomer.created_at).toLocaleDateString('vi-VN')}</div>
                                      </div>
                                      <div>
                                          <div className="text-xs text-gray-400 uppercase font-bold">SĐT</div>
                                          <div className="text-sm font-medium">{selectedCustomer.phone || '--'}</div>
                                      </div>
                                  </div>
                              </div>

                              <div className="bg-gradient-to-br from-gray-900 to-black p-6 rounded-3xl shadow-lg text-white">
                                  <div className="flex items-center gap-3 mb-4 opacity-80">
                                      <Wallet size={20} /> <span className="font-bold text-sm uppercase tracking-wide">Tổng chi tiêu</span>
                                  </div>
                                  <div className="text-3xl font-extrabold text-green-400 mb-1">
                                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(selectedCustomer.totalSpend)}
                                  </div>
                                  <div className="text-xs text-gray-400">Trên tổng {selectedCustomer.orderCount} đơn hàng</div>
                              </div>
                          </div>

                          {/* Right: Purchase History */}
                          <div className="md:col-span-2">
                              <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                  <ShoppingBag size={20} className="text-primary"/> Lịch sử mua hàng
                              </h4>
                              
                              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden min-h-[300px]">
                                  {loadingHistory ? (
                                      <div className="p-8 text-center text-gray-400">Đang tải lịch sử...</div>
                                  ) : customerOrders.length === 0 ? (
                                      <div className="p-12 text-center text-gray-400 italic">Khách hàng chưa có đơn hàng nào.</div>
                                  ) : (
                                      <table className="w-full text-left">
                                          <thead className="bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase">
                                              <tr>
                                                  <th className="p-4">Mã đơn</th>
                                                  <th className="p-4">Ngày đặt</th>
                                                  <th className="p-4">Trạng thái</th>
                                                  <th className="p-4 text-right">Tổng tiền</th>
                                              </tr>
                                          </thead>
                                          <tbody className="divide-y divide-gray-100">
                                              {customerOrders.map(order => (
                                                  <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                                                      <td className="p-4 font-mono text-xs font-bold text-gray-600">#{order.id.slice(0, 8)}</td>
                                                      <td className="p-4 text-sm text-gray-600">{new Date(order.created_at).toLocaleDateString('vi-VN')}</td>
                                                      <td className="p-4">
                                                          <span className={`text-[10px] font-bold px-2 py-1 rounded border ${
                                                              order.status === 'completed' ? 'bg-green-50 text-green-700 border-green-200' :
                                                              order.status === 'pending' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                                                              'bg-red-50 text-red-700 border-red-200'
                                                          }`}>
                                                              {order.status}
                                                          </span>
                                                      </td>
                                                      <td className="p-4 text-right font-bold text-primary text-sm">
                                                          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.total)}
                                                      </td>
                                                  </tr>
                                              ))}
                                          </tbody>
                                      </table>
                                  )}
                              </div>
                          </div>

                      </div>
                  </div>
              </div>
          </div>
      )}

    </div>
  );
};
