
import React, { useEffect, useState } from 'react';
import { TrendingUp, Users, ShoppingBag, DollarSign, ArrowUpRight, ArrowDownRight, Package, Activity, RefreshCw, Calendar, Clock, ChevronRight } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Link } from 'react-router-dom';

const StatCard = ({ title, value, trend, trendValue, icon: Icon, color, loading }: any) => (
  <div className="bg-white rounded-[1.5rem] p-6 shadow-sm border border-gray-100 hover:shadow-soft transition-all group">
    <div className="flex items-center justify-between mb-4">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${color} group-hover:scale-110 transition-transform duration-300`}>
        <Icon size={24} />
      </div>
      {!loading && (
        <span className={`flex items-center text-xs font-bold px-2.5 py-1 rounded-lg border ${trend === 'up' ? 'text-green-600 bg-green-50 border-green-100' : 'text-red-600 bg-red-50 border-red-100'}`}>
          {trend === 'up' ? <ArrowUpRight size={14} className="mr-1"/> : <ArrowDownRight size={14} className="mr-1"/>}
          {trendValue}
        </span>
      )}
    </div>
    <h3 className="text-gray-500 text-sm font-bold uppercase tracking-wider mb-1">{title}</h3>
    {loading ? (
      <div className="h-8 w-32 bg-gray-100 rounded-lg animate-pulse mt-2"></div>
    ) : (
      <p className="text-3xl font-black text-gray-900 tracking-tight">{value}</p>
    )}
  </div>
);

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState({
    revenue: 0,
    orders: 0,
    products: 0,
    customers: 0
  });
  const [loading, setLoading] = useState(true);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [chartData, setChartData] = useState<{ date: string, value: number, height: string }[]>([]);
  const [lastHeartbeat, setLastHeartbeat] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      
      // 1. Fetch Basic Counts (Parallel)
      const [productsRes, customersRes, ordersRes] = await Promise.all([
        supabase.from('products').select('*', { count: 'exact', head: true }),
        supabase.from('customers').select('*', { count: 'exact', head: true }),
        supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(100) // Fetch last 100 orders for calc
      ]);

      // 2. Fetch Heartbeat
      const { data: hb } = await supabase.from('keep_alive').select('created_at').order('created_at', { ascending: false }).limit(1);
      if (hb && hb[0]) setLastHeartbeat(new Date(hb[0].created_at).toLocaleString('vi-VN'));

      const orders = ordersRes.data || [];
      
      // 3. Calculate Revenue (Only completed orders)
      const totalRevenue = orders
        .filter((o: any) => o.status === 'completed')
        .reduce((sum: number, o: any) => sum + (o.total || 0), 0);

      // 4. Set Stats
      setStats({
        revenue: totalRevenue,
        orders: orders.length, // Displaying fetched count, ideally should be total count from DB
        products: productsRes.count || 0,
        customers: customersRes.count || 0
      });

      // 5. Recent Orders
      setRecentOrders(orders.slice(0, 5));

      // 6. Process Chart Data (Last 7 Days Revenue)
      const days = 7;
      const chart: typeof chartData = [];
      const now = new Date();
      
      for (let i = days - 1; i >= 0; i--) {
          const d = new Date(now);
          d.setDate(d.getDate() - i);
          const dateStr = d.toLocaleDateString('en-GB'); // DD/MM/YYYY
          
          // Sum revenue for this day
          const dayRevenue = orders
            .filter((o: any) => 
                new Date(o.created_at).toLocaleDateString('en-GB') === dateStr && 
                o.status === 'completed'
            )
            .reduce((sum: number, o: any) => sum + (o.total || 0), 0);
            
          chart.push({
              date: dateStr.slice(0, 5), // DD/MM
              value: dayRevenue,
              height: '0%' // Will calculate below
          });
      }

      // Normalize heights
      const maxVal = Math.max(...chart.map(c => c.value)) || 1;
      const finalChart = chart.map(c => ({
          ...c,
          height: `${Math.max(Math.round((c.value / maxVal) * 100), 5)}%` // Min 5% height
      }));
      setChartData(finalChart);

    } catch (error) {
      console.error("Dashboard Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      
      {/* Top Banner */}
      <div className="bg-gray-900 rounded-[2rem] p-6 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
          
          <div className="flex items-center gap-5 relative z-10">
              <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-md border border-white/10 shadow-inner">
                  <Activity className="text-primary" size={32} />
              </div>
              <div>
                  <h3 className="text-xl font-bold">Hệ thống đang hoạt động ổn định</h3>
                  <div className="flex items-center gap-2 text-sm text-gray-400 mt-1">
                      <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_#22c55e]"></span>
                      <span>Database Heartbeat: <span className="text-white font-mono">{lastHeartbeat || 'Đang đồng bộ...'}</span></span>
                  </div>
              </div>
          </div>
          
          <div className="flex gap-3 relative z-10 w-full md:w-auto">
             <button 
                onClick={fetchStats} 
                className="flex-1 md:flex-none px-5 py-3 bg-white/10 hover:bg-white/20 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 border border-white/10 backdrop-blur-sm"
             >
                <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> 
                Làm mới
             </button>
          </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Tổng doanh thu" 
          value={new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(stats.revenue)}
          trend="up" trendValue="Thực tế"
          icon={DollarSign} 
          color="bg-green-100 text-green-600"
          loading={loading}
        />
        <StatCard 
          title="Đơn hàng" 
          value={stats.orders}
          trend="up" trendValue="Mới nhất"
          icon={ShoppingBag} 
          color="bg-blue-100 text-blue-600"
          loading={loading}
        />
        <StatCard 
          title="Khách hàng" 
          value={stats.customers}
          trend="up" trendValue="Thành viên"
          icon={Users} 
          color="bg-purple-100 text-purple-600"
          loading={loading}
        />
        <StatCard 
          title="Sản phẩm" 
          value={stats.products}
          trend="down" trendValue="Tồn kho"
          icon={Package} 
          color="bg-orange-100 text-orange-600"
          loading={loading}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* CHART SECTION */}
        <div className="lg:col-span-2 bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 flex flex-col h-[450px]">
           <div className="flex items-center justify-between mb-8">
              <div>
                  <h3 className="font-extrabold text-xl text-gray-900 flex items-center gap-2">
                      <TrendingUp size={24} className="text-primary"/> Biểu đồ doanh thu
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">Thống kê 7 ngày gần nhất (đơn hoàn thành)</p>
              </div>
              <div className="flex gap-2">
                  <span className="px-3 py-1 bg-gray-50 rounded-lg text-xs font-bold text-gray-500 border border-gray-100">7 Ngày</span>
              </div>
           </div>
           
           {/* Pure CSS Bar Chart */}
           <div className="flex-1 flex items-end justify-between gap-4 sm:gap-6 px-2 pb-2 border-b border-gray-100 relative">
              {/* Grid Lines Background */}
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-50">
                  <div className="border-t border-dashed border-gray-200 w-full h-px"></div>
                  <div className="border-t border-dashed border-gray-200 w-full h-px"></div>
                  <div className="border-t border-dashed border-gray-200 w-full h-px"></div>
              </div>

              {loading ? (
                  [...Array(7)].map((_, i) => (
                      <div key={i} className="w-full bg-gray-100 rounded-t-xl animate-pulse" style={{ height: `${Math.random() * 60 + 20}%` }}></div>
                  ))
              ) : chartData.length > 0 ? (
                  chartData.map((data, index) => (
                    <div key={index} className="w-full flex flex-col justify-end group relative h-full">
                       {/* Tooltip */}
                       <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-gray-900 text-white text-[10px] font-bold py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 shadow-lg">
                           {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(data.value)}
                       </div>
                       
                       {/* Bar */}
                       <div 
                        className="w-full bg-primary/10 rounded-t-xl relative overflow-hidden transition-all duration-500 hover:bg-primary/20 group-hover:shadow-[0_0_20px_rgba(0,113,227,0.3)]" 
                        style={{ height: data.height }}
                       >
                           <div className="absolute bottom-0 left-0 right-0 bg-primary h-1.5 opacity-50"></div>
                           <div className="absolute bottom-0 left-0 right-0 top-0 bg-gradient-to-t from-primary/40 to-transparent opacity-50"></div>
                       </div>
                       
                       {/* Label */}
                       <div className="text-center mt-3 text-xs font-bold text-gray-400 group-hover:text-primary transition-colors">
                           {data.date}
                       </div>
                    </div>
                  ))
              ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 font-medium italic">
                      Chưa có dữ liệu doanh thu
                  </div>
              )}
           </div>
        </div>

        {/* RECENT ORDERS */}
        <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 h-[450px] flex flex-col">
           <div className="flex items-center justify-between mb-6 shrink-0">
               <h3 className="font-extrabold text-xl text-gray-900">Đơn mới nhất</h3>
               <Link to="/admin/orders" className="text-primary hover:bg-primary/5 p-2 rounded-lg transition-colors">
                   <ChevronRight size={20} />
               </Link>
           </div>
           
           <div className="flex-1 overflow-y-auto -mx-2 px-2 custom-scrollbar space-y-4">
              {loading ? (
                  [...Array(5)].map((_, i) => <div key={i} className="h-16 bg-gray-50 rounded-xl animate-pulse"></div>)
              ) : recentOrders.length === 0 ? (
                  <div className="text-center py-10 text-gray-400">Chưa có đơn hàng nào.</div>
              ) : (
                  recentOrders.map((order) => (
                      <div key={order.id} className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-2xl transition-colors border border-transparent hover:border-gray-100 group">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-sm ${
                              order.status === 'completed' ? 'bg-green-500' : 
                              order.status === 'pending' ? 'bg-yellow-500' : 'bg-red-500'
                          }`}>
                              {order.customer_name ? order.customer_name.charAt(0).toUpperCase() : '#'}
                          </div>
                          <div className="flex-1 min-w-0">
                              <div className="font-bold text-gray-900 text-sm truncate">{order.customer_name || 'Khách lẻ'}</div>
                              <div className="text-xs text-gray-500 flex items-center gap-1">
                                  <Clock size={10} /> {new Date(order.created_at).toLocaleDateString('vi-VN')}
                              </div>
                          </div>
                          <div className="text-right">
                              <div className="font-extrabold text-primary text-sm">
                                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.total)}
                              </div>
                              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                  order.status === 'completed' ? 'text-green-600 bg-green-50' : 
                                  order.status === 'pending' ? 'text-yellow-600 bg-yellow-50' : 'text-red-600 bg-red-50'
                              }`}>
                                  {order.status === 'completed' ? 'Xong' : order.status === 'pending' ? 'Chờ' : 'Hủy'}
                              </span>
                          </div>
                      </div>
                  ))
              )}
           </div>
           
           <Link to="/admin/orders" className="mt-4 w-full py-3 bg-gray-50 text-gray-600 font-bold text-sm rounded-xl hover:bg-gray-100 transition-colors flex items-center justify-center gap-2 shrink-0">
               Xem tất cả đơn hàng
           </Link>
        </div>

      </div>
    </div>
  );
};
