import React, { useEffect, useState } from 'react';
import { TrendingUp, Users, ShoppingBag, DollarSign, ArrowUpRight, ArrowDownRight, Package } from 'lucide-react';
import { supabase } from '../../lib/supabase';

const StatCard = ({ title, value, trend, trendValue, icon: Icon, color, loading }: any) => (
  <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-soft transition-all">
    <div className="flex items-center justify-between mb-4">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${color}`}>
        <Icon size={24} />
      </div>
      {!loading && (
        <span className={`flex items-center text-xs font-bold px-2 py-1 rounded-lg ${trend === 'up' ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'}`}>
          {trend === 'up' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          {trendValue}
        </span>
      )}
    </div>
    <h3 className="text-gray-500 text-sm font-medium mb-1">{title}</h3>
    {loading ? (
      <div className="h-8 w-24 bg-gray-100 rounded animate-pulse"></div>
    ) : (
      <p className="text-2xl font-extrabold text-gray-900">{value}</p>
    )}
  </div>
);

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState({
    revenue: 0,
    orders: 0,
    products: 0,
    blogs: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Parallel fetching for maximum speed (mili-seconds load)
        const [ordersRes, productsRes, blogsRes] = await Promise.all([
          supabase.from('orders').select('total', { count: 'exact' }),
          supabase.from('products').select('id', { count: 'exact', head: true }),
          supabase.from('blogs').select('id', { count: 'exact', head: true })
        ]);

        // Calculate Revenue manually from orders
        const totalRevenue = ordersRes.data?.reduce((sum, order) => sum + (order.total || 0), 0) || 0;

        setStats({
          revenue: totalRevenue,
          orders: ordersRes.count || 0,
          products: productsRes.count || 0,
          blogs: blogsRes.count || 0
        });
      } catch (error) {
        console.error("Dashboard load error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Tổng doanh thu" 
          value={new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(stats.revenue)}
          trend="up" 
          trendValue="+12.5%" 
          icon={DollarSign} 
          color="bg-green-100 text-green-600"
          loading={loading}
        />
        <StatCard 
          title="Đơn hàng" 
          value={stats.orders}
          trend="up" 
          trendValue="+8.2%" 
          icon={ShoppingBag} 
          color="bg-blue-100 text-blue-600"
          loading={loading}
        />
        <StatCard 
          title="Bài viết Blog" 
          value={stats.blogs}
          trend="up" 
          trendValue="+2" 
          icon={Users} 
          color="bg-purple-100 text-purple-600"
          loading={loading}
        />
        <StatCard 
          title="Sản phẩm" 
          value={stats.products}
          trend="up" 
          trendValue="+5" 
          icon={Package} 
          color="bg-orange-100 text-orange-600"
          loading={loading}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart Section (Placeholder for visual) */}
        <div className="lg:col-span-2 bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100">
           <div className="flex items-center justify-between mb-8">
              <h3 className="font-bold text-lg text-gray-900">Biểu đồ tăng trưởng</h3>
              <select className="bg-gray-50 border-none text-sm font-bold rounded-xl px-4 py-2 text-gray-600 focus:ring-0">
                 <option>Tháng này</option>
              </select>
           </div>
           
           {/* Visual Chart Placeholder */}
           <div className="h-64 flex items-end justify-between gap-2 px-2">
              {[40, 65, 45, 80, 55, 90, 70, 85, 60, 75, 50, 95].map((h, i) => (
                <div key={i} className="w-full bg-gray-50 rounded-t-xl relative group">
                   <div 
                    className="absolute bottom-0 left-0 right-0 bg-primary rounded-t-xl transition-all duration-1000 group-hover:bg-primary-hover" 
                    style={{ height: `${h}%` }}
                   ></div>
                </div>
              ))}
           </div>
           <div className="flex justify-between mt-4 text-xs font-bold text-gray-400">
              <span>T1</span><span>T2</span><span>T3</span><span>T4</span><span>T5</span><span>T6</span>
              <span>T7</span><span>T8</span><span>T9</span><span>T10</span><span>T11</span><span>T12</span>
           </div>
        </div>

        {/* Recent Activity / Best Sellers */}
        <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100">
           <h3 className="font-bold text-lg text-gray-900 mb-6">Sản phẩm top đầu</h3>
           <div className="space-y-6">
              {[
                { name: 'Netflix Premium', sales: '2.4k', price: '69.000₫', img: 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=100&h=100&fit=crop' },
                { name: 'ChatGPT Plus', sales: '1.8k', price: '499.000₫', img: 'https://images.unsplash.com/photo-1694509748680-77a876779b63?w=100&h=100&fit=crop' },
                { name: 'Youtube Premium', sales: '1.2k', price: '29.000₫', img: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=100&h=100&fit=crop' },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-4">
                   <img src={item.img} alt={item.name} className="w-12 h-12 rounded-xl object-cover bg-gray-100" />
                   <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-gray-900 text-sm truncate">{item.name}</h4>
                      <p className="text-xs text-gray-500">{item.sales} đã bán</p>
                   </div>
                   <span className="font-bold text-primary text-sm">{item.price}</span>
                </div>
              ))}
           </div>
           <button className="w-full mt-8 py-3 rounded-xl border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors">
              Xem báo cáo chi tiết
           </button>
        </div>
      </div>
    </div>
  );
};
