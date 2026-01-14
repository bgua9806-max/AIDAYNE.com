
import React, { useEffect, useState } from 'react';
import { Search, Filter, MoreHorizontal, Clock, CheckCircle, XCircle, ArrowRight, Kanban, Loader2, List, Grid, Calendar, Eye, Printer, X, Download } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface Order {
  id: string;
  customer_name: string;
  email?: string;
  phone?: string;
  created_at: string;
  total: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  payment_method: string;
  items?: OrderItem[] | any; // Supports both structure depending on how it's saved
}

const STATUS_COLUMNS = [
    { id: 'pending', label: 'Chờ xử lý', color: 'bg-yellow-100 text-yellow-800', border: 'border-yellow-200', dot: 'bg-yellow-500' },
    { id: 'processing', label: 'Đang xử lý', color: 'bg-blue-100 text-blue-800', border: 'border-blue-200', dot: 'bg-blue-500' },
    { id: 'completed', label: 'Hoàn thành', color: 'bg-green-100 text-green-800', border: 'border-green-200', dot: 'bg-green-500' },
    { id: 'cancelled', label: 'Đã hủy', color: 'bg-red-100 text-red-800', border: 'border-red-200', dot: 'bg-red-500' }
];

export const AdminOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  
  // View & Filter State
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [dateRange, setDateRange] = useState<{ start: string, end: string }>({ start: '', end: '' });

  // Modal State
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
      if (!error && data) {
         setOrders(data as Order[]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
      setUpdatingId(orderId);
      try {
          // Optimistic update
          setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus as any } : o));
          
          const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', orderId);
          if (error) throw error;
      } catch (e) {
          console.error("Update failed", e);
          fetchOrders(); // Revert on fail
      } finally {
          setUpdatingId(null);
      }
  };

  const getNextStatus = (current: string) => {
      if (current === 'pending') return 'processing';
      if (current === 'processing') return 'completed';
      return null;
  };

  // --- PRINT INVOICE LOGIC ---
  const handlePrint = (order: Order) => {
      const printWindow = window.open('', '', 'width=800,height=600');
      if (!printWindow) return;

      const itemsHtml = Array.isArray(order.items) 
        ? order.items.map((item: any) => `
            <tr style="border-bottom: 1px solid #eee;">
                <td style="padding: 10px 0;">${item.name || 'Sản phẩm'}</td>
                <td style="text-align: center;">${item.quantity || 1}</td>
                <td style="text-align: right;">${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price || 0)}</td>
                <td style="text-align: right; font-weight: bold;">${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format((item.price || 0) * (item.quantity || 1))}</td>
            </tr>
          `).join('') 
        : '<tr><td colspan="4">Không có chi tiết sản phẩm</td></tr>';

      const htmlContent = `
        <html>
          <head>
            <title>Hóa đơn #${order.id}</title>
            <style>
              body { font-family: 'Helvetica Neue', Arial, sans-serif; padding: 40px; color: #333; }
              .header { display: flex; justify-content: space-between; margin-bottom: 40px; border-bottom: 2px solid #000; padding-bottom: 20px; }
              .logo { font-size: 24px; font-weight: 900; }
              .invoice-title { font-size: 32px; font-weight: bold; text-transform: uppercase; color: #555; }
              .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 40px; }
              .label { font-size: 12px; text-transform: uppercase; color: #888; font-weight: bold; margin-bottom: 5px; }
              .value { font-size: 16px; font-weight: 500; }
              table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
              th { text-align: left; border-bottom: 2px solid #eee; padding: 10px 0; font-size: 12px; text-transform: uppercase; color: #888; }
              .total-section { text-align: right; border-top: 2px solid #000; padding-top: 20px; }
              .total-label { font-size: 14px; font-weight: bold; margin-right: 20px; }
              .total-value { font-size: 24px; font-weight: 900; color: #0071E3; }
              .footer { margin-top: 60px; text-align: center; font-size: 12px; color: #888; border-top: 1px solid #eee; padding-top: 20px; }
            </style>
          </head>
          <body>
            <div class="header">
               <div class="logo">AIDAYNE<span style="color: #0071E3">.com</span></div>
               <div class="invoice-title">Hóa đơn</div>
            </div>
            
            <div class="info-grid">
               <div>
                  <div class="label">Khách hàng</div>
                  <div class="value">${order.customer_name || 'Khách lẻ'}</div>
                  <div class="value" style="font-size: 14px; color: #666; margin-top: 4px;">${order.email || ''}</div>
                  <div class="value" style="font-size: 14px; color: #666;">${order.phone || ''}</div>
               </div>
               <div style="text-align: right;">
                  <div class="label">Mã đơn hàng</div>
                  <div class="value">#${order.id.slice(0, 8).toUpperCase()}</div>
                  <div class="label" style="margin-top: 15px;">Ngày đặt</div>
                  <div class="value">${new Date(order.created_at).toLocaleDateString('vi-VN')}</div>
               </div>
            </div>

            <table>
               <thead>
                  <tr>
                     <th width="50%">Sản phẩm</th>
                     <th width="15%" style="text-align: center;">SL</th>
                     <th width="20%" style="text-align: right;">Đơn giá</th>
                     <th width="15%" style="text-align: right;">Thành tiền</th>
                  </tr>
               </thead>
               <tbody>
                  ${itemsHtml}
               </tbody>
            </table>

            <div class="total-section">
               <span class="total-label">TỔNG THANH TOÁN</span>
               <span class="total-value">${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.total)}</span>
            </div>

            <div class="footer">
               Cảm ơn bạn đã mua sắm tại AIDAYNE.com!<br/>
               Mọi thắc mắc xin liên hệ support@aidayne.com hoặc hotline 0374.770.023
            </div>
            
            <script>
               window.onload = function() { window.print(); }
            </script>
          </body>
        </html>
      `;

      printWindow.document.write(htmlContent);
      printWindow.document.close();
  };

  // --- FILTERING LOGIC ---
  const filteredOrders = orders.filter(order => {
      // 1. Search ID or Customer
      const matchesSearch = 
          order.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
          (order.customer_name || '').toLowerCase().includes(searchTerm.toLowerCase());
      
      // 2. Status Filter
      const matchesStatus = filterStatus === 'all' || order.status === filterStatus;

      // 3. Date Range Filter
      let matchesDate = true;
      if (dateRange.start) {
          matchesDate = matchesDate && new Date(order.created_at) >= new Date(dateRange.start);
      }
      if (dateRange.end) {
          // End date should include the whole day, so set to 23:59:59 of that day
          const end = new Date(dateRange.end);
          end.setHours(23, 59, 59, 999);
          matchesDate = matchesDate && new Date(order.created_at) <= end;
      }

      return matchesSearch && matchesStatus && matchesDate;
  });

  return (
    <div className="space-y-6 animate-fade-in h-[calc(100vh-140px)] flex flex-col relative">
      
      {/* HEADER & TOOLBAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
         <div>
            <h1 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
                <Kanban size={24} /> Quản lý đơn hàng
            </h1>
            <p className="text-sm text-gray-500">
               {filteredOrders.length} đơn hàng được tìm thấy
            </p>
         </div>
         
         <div className="flex items-center gap-3">
             {/* View Toggle */}
             <div className="bg-white p-1 rounded-xl border border-gray-200 flex items-center shadow-sm">
                 <button 
                    onClick={() => setViewMode('kanban')}
                    className={`p-2 rounded-lg transition-all ${viewMode === 'kanban' ? 'bg-gray-100 text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                    title="Kanban View"
                 >
                    <Grid size={18} />
                 </button>
                 <button 
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-gray-100 text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                    title="List View"
                 >
                    <List size={18} />
                 </button>
             </div>
         </div>
      </div>

      {/* FILTER BAR */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 shrink-0">
          {/* Search */}
          <div className="relative flex-1">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
             <input 
               type="text" 
               placeholder="Tìm mã đơn, tên khách..." 
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-primary/20"
             />
          </div>

          {/* Status Select */}
          <div className="relative w-full md:w-48">
             <select 
               value={filterStatus}
               onChange={(e) => setFilterStatus(e.target.value)}
               className="w-full pl-4 pr-10 py-2 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-primary/20 appearance-none font-medium cursor-pointer"
             >
                <option value="all">Tất cả trạng thái</option>
                <option value="pending">Chờ xử lý</option>
                <option value="processing">Đang xử lý</option>
                <option value="completed">Hoàn thành</option>
                <option value="cancelled">Đã hủy</option>
             </select>
             <Filter className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
          </div>

          {/* Date Range */}
          <div className="flex items-center gap-2">
             <div className="relative">
                <input 
                   type="date" 
                   value={dateRange.start}
                   onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                   className="pl-3 pr-2 py-2 bg-gray-50 border-none rounded-xl text-xs font-medium focus:ring-2 focus:ring-primary/20"
                />
             </div>
             <span className="text-gray-300">-</span>
             <div className="relative">
                <input 
                   type="date" 
                   value={dateRange.end}
                   onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                   className="pl-3 pr-2 py-2 bg-gray-50 border-none rounded-xl text-xs font-medium focus:ring-2 focus:ring-primary/20"
                />
             </div>
          </div>
      </div>

      {/* --- CONTENT AREA --- */}
      <div className="flex-1 overflow-hidden relative">
         
         {/* MODE 1: KANBAN VIEW */}
         {viewMode === 'kanban' && (
             <div className="h-full overflow-x-auto overflow-y-hidden pb-4">
                <div className="flex h-full gap-6 min-w-[1200px]">
                    {STATUS_COLUMNS.map(col => {
                        const colOrders = filteredOrders.filter(o => o.status === col.id);
                        return (
                            <div key={col.id} className="flex-1 flex flex-col bg-gray-100/50 rounded-[1.5rem] border border-gray-200/60 max-w-sm">
                                {/* Column Header */}
                                <div className="p-4 flex items-center justify-between border-b border-gray-100 bg-white/50 backdrop-blur-sm rounded-t-[1.5rem] shrink-0 sticky top-0 z-10">
                                    <div className="flex items-center gap-2">
                                       <div className={`w-2.5 h-2.5 rounded-full ${col.dot}`}></div>
                                       <h3 className="font-bold text-gray-700">{col.label}</h3>
                                    </div>
                                    <span className="bg-white px-2 py-0.5 rounded-md text-xs font-bold text-gray-500 shadow-sm border border-gray-100">
                                        {colOrders.length}
                                    </span>
                                </div>

                                {/* Orders List */}
                                <div className="p-3 flex-1 overflow-y-auto space-y-3 custom-scrollbar">
                                    {loading ? (
                                       <div className="text-center py-10 text-gray-400 text-xs">Đang tải...</div>
                                    ) : colOrders.length === 0 ? (
                                       <div className="text-center py-10 text-gray-400 text-xs italic">Trống</div>
                                    ) : colOrders.map(order => (
                                        <div 
                                           key={order.id} 
                                           onClick={() => setSelectedOrder(order)}
                                           className={`bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all group relative cursor-pointer ${updatingId === order.id ? 'opacity-50 pointer-events-none' : ''}`}
                                        >
                                            <div className="flex justify-between items-start mb-3">
                                                <span className="font-mono text-[10px] font-bold text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded uppercase">
                                                    #{order.id.slice(0, 6)}
                                                </span>
                                                <span className="text-[10px] font-medium text-gray-400">
                                                    {new Date(order.created_at).toLocaleDateString('vi-VN')}
                                                </span>
                                            </div>
                                            
                                            <h4 className="font-bold text-gray-900 text-sm mb-1">{order.customer_name || 'Khách lẻ'}</h4>
                                            <div className="text-xs text-gray-500 mb-3">{order.payment_method}</div>
                                            
                                            <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                                                <span className="font-extrabold text-primary text-sm">
                                                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.total)}
                                                </span>
                                                
                                                {/* Action Buttons (Stop Propagation to prevent opening modal) */}
                                                <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                                                    {col.id !== 'cancelled' && (
                                                        <button 
                                                           onClick={() => handleStatusChange(order.id, 'cancelled')}
                                                           className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" 
                                                           title="Hủy đơn"
                                                        >
                                                            <XCircle size={16} />
                                                        </button>
                                                    )}
                                                    
                                                    {getNextStatus(col.id) && (
                                                        <button 
                                                           onClick={() => handleStatusChange(order.id, getNextStatus(col.id)!)}
                                                           className="flex items-center gap-1 px-2 py-1.5 bg-gray-900 text-white text-[10px] font-bold rounded-lg hover:bg-primary transition-colors shadow-sm"
                                                        >
                                                            {col.id === 'pending' ? 'Xử lý' : 'Hoàn tất'} <ArrowRight size={12} />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                            
                                            {updatingId === order.id && (
                                                <div className="absolute inset-0 bg-white/60 flex items-center justify-center rounded-xl">
                                                    <Loader2 size={20} className="animate-spin text-primary" />
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
             </div>
         )}

         {/* MODE 2: TABLE VIEW */}
         {viewMode === 'list' && (
             <div className="h-full overflow-y-auto bg-white rounded-[1.5rem] shadow-sm border border-gray-100 custom-scrollbar">
                 <table className="w-full text-left border-collapse">
                    <thead className="sticky top-0 z-20 bg-gray-50/95 backdrop-blur">
                       <tr className="border-b border-gray-200 text-xs font-bold text-gray-500 uppercase tracking-wider">
                          <th className="p-4">Mã đơn</th>
                          <th className="p-4">Khách hàng</th>
                          <th className="p-4">Ngày đặt</th>
                          <th className="p-4">Thanh toán</th>
                          <th className="p-4">Tổng tiền</th>
                          <th className="p-4">Trạng thái</th>
                          <th className="p-4 text-right">Hành động</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {filteredOrders.map((order) => {
                            const statusConfig = STATUS_COLUMNS.find(c => c.id === order.status);
                            return (
                                <tr 
                                    key={order.id} 
                                    onClick={() => setSelectedOrder(order)}
                                    className="hover:bg-blue-50/50 transition-colors cursor-pointer group"
                                >
                                    <td className="p-4 font-mono text-xs font-bold text-gray-600">#{order.id.slice(0, 8)}</td>
                                    <td className="p-4">
                                        <div className="font-bold text-sm text-gray-900">{order.customer_name || 'Khách lẻ'}</div>
                                        <div className="text-xs text-gray-500">{order.email}</div>
                                    </td>
                                    <td className="p-4 text-sm text-gray-500">
                                        {new Date(order.created_at).toLocaleDateString('vi-VN')}
                                        <br/>
                                        <span className="text-[10px] opacity-70">{new Date(order.created_at).toLocaleTimeString('vi-VN')}</span>
                                    </td>
                                    <td className="p-4 text-sm text-gray-600">{order.payment_method}</td>
                                    <td className="p-4 font-extrabold text-primary text-sm">
                                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.total)}
                                    </td>
                                    <td className="p-4">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${statusConfig?.color}`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${statusConfig?.dot}`}></span>
                                            {statusConfig?.label}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button 
                                                onClick={() => setSelectedOrder(order)}
                                                className="p-2 bg-white border border-gray-200 rounded-lg text-gray-500 hover:text-primary hover:border-primary transition-all" 
                                                title="Xem chi tiết"
                                            >
                                                <Eye size={16} />
                                            </button>
                                            <button 
                                                onClick={() => handlePrint(order)}
                                                className="p-2 bg-white border border-gray-200 rounded-lg text-gray-500 hover:text-black hover:border-black transition-all" 
                                                title="In hóa đơn"
                                            >
                                                <Printer size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                 </table>
             </div>
         )}
      </div>

      {/* --- ORDER DETAIL MODAL --- */}
      {selectedOrder && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedOrder(null)}></div>
              
              <div className="bg-white rounded-[2rem] w-full max-w-2xl max-h-[90vh] flex flex-col relative z-10 shadow-2xl animate-fade-in-up overflow-hidden">
                  
                  {/* Header */}
                  <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                      <div>
                          <div className="flex items-center gap-3 mb-1">
                              <h3 className="text-xl font-extrabold text-gray-900">Đơn hàng #{selectedOrder.id.slice(0, 8)}</h3>
                              {(() => {
                                  const status = STATUS_COLUMNS.find(s => s.id === selectedOrder.status);
                                  return (
                                      <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase border ${status?.color.replace('bg-', 'bg-white border-')}`}>
                                          {status?.label}
                                      </span>
                                  )
                              })()}
                          </div>
                          <p className="text-xs text-gray-500 flex items-center gap-1">
                              <Calendar size={12} /> {new Date(selectedOrder.created_at).toLocaleString('vi-VN')}
                          </p>
                      </div>
                      <button onClick={() => setSelectedOrder(null)} className="p-2 bg-white rounded-full text-gray-400 hover:text-gray-900 shadow-sm border border-gray-100 transition-all">
                          <X size={20} />
                      </button>
                  </div>

                  {/* Body */}
                  <div className="p-8 overflow-y-auto bg-white flex-1">
                      
                      {/* Customer Info */}
                      <div className="grid grid-cols-2 gap-8 mb-8">
                          <div>
                              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Khách hàng</h4>
                              <div className="font-bold text-gray-900 text-lg mb-1">{selectedOrder.customer_name || 'Khách lẻ'}</div>
                              <div className="text-sm text-gray-500">{selectedOrder.email || 'Không có email'}</div>
                              <div className="text-sm text-gray-500">{selectedOrder.phone || 'Không có SĐT'}</div>
                          </div>
                          <div className="text-right">
                              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Thanh toán</h4>
                              <div className="font-bold text-gray-900 text-lg mb-1">{selectedOrder.payment_method}</div>
                              <div className="text-sm text-gray-500">Trạng thái: Đã thanh toán</div>
                          </div>
                      </div>

                      <div className="w-full h-px bg-gray-100 mb-8"></div>

                      {/* Items List */}
                      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Chi tiết sản phẩm</h4>
                      <div className="space-y-3 mb-8">
                          {Array.isArray(selectedOrder.items) && selectedOrder.items.length > 0 ? (
                              selectedOrder.items.map((item: any, idx: number) => (
                                  <div key={idx} className="flex justify-between items-center p-4 rounded-xl bg-gray-50 border border-gray-100">
                                      <div className="flex items-center gap-4">
                                          <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center font-bold text-xs border border-gray-200 shadow-sm">
                                              {item.quantity}x
                                          </div>
                                          <span className="font-bold text-gray-900 text-sm">{item.name}</span>
                                      </div>
                                      <span className="font-bold text-gray-900">
                                          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price * item.quantity)}
                                      </span>
                                  </div>
                              ))
                          ) : (
                              <div className="text-center py-4 text-gray-400 text-sm italic">Không có thông tin chi tiết sản phẩm.</div>
                          )}
                      </div>

                      {/* Total */}
                      <div className="flex justify-between items-center p-4 rounded-xl bg-blue-50 border border-blue-100">
                          <span className="font-bold text-blue-800">Tổng thanh toán</span>
                          <span className="font-extrabold text-2xl text-blue-600">
                              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(selectedOrder.total)}
                          </span>
                      </div>

                  </div>

                  {/* Footer Actions */}
                  <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                      <button 
                          onClick={() => handlePrint(selectedOrder)}
                          className="px-5 py-2.5 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl shadow-sm hover:bg-gray-50 hover:text-black flex items-center gap-2 transition-all"
                      >
                          <Printer size={18} /> In hóa đơn
                      </button>
                      
                      {selectedOrder.status !== 'completed' && selectedOrder.status !== 'cancelled' && (
                          <button 
                              onClick={() => { handleStatusChange(selectedOrder.id, 'completed'); setSelectedOrder({...selectedOrder, status: 'completed'}); }}
                              className="px-5 py-2.5 bg-green-600 text-white font-bold rounded-xl shadow-lg shadow-green-500/20 hover:bg-green-700 flex items-center gap-2 transition-all"
                          >
                              <CheckCircle size={18} /> Hoàn tất đơn
                          </button>
                      )}
                  </div>

              </div>
          </div>
      )}

    </div>
  );
};
