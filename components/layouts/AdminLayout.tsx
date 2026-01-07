
import React, { useState } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  Bell, 
  Search,
  BookOpen,
  TicketPercent, 
  Zap,
  MonitorPlay // Icon for Hero Banner
} from 'lucide-react';

const { Link, useLocation, Outlet } = ReactRouterDOM;

export const AdminLayout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const location = useLocation();

  const MENU_ITEMS = [
    { path: '/admin/dashboard', icon: LayoutDashboard, label: 'Tổng quan' },
    { path: '/admin/products', icon: Package, label: 'Sản phẩm' },
    { path: '/admin/hero', icon: MonitorPlay, label: 'Quản lý Banner' }, // New Item
    { path: '/admin/orders', icon: ShoppingCart, label: 'Đơn hàng' },
    { path: '/admin/flash-sale', icon: Zap, label: 'Flash Sale' },
    { path: '/admin/promotions', icon: TicketPercent, label: 'Khuyến mãi' },
    { path: '/admin/blog', icon: BookOpen, label: 'Bài viết' },
    { path: '/admin/customers', icon: Users, label: 'Khách hàng' },
    { path: '/admin/settings', icon: Settings, label: 'Cài đặt' },
  ];

  return (
    <div className="min-h-screen bg-[#F5F5F7] flex text-gray-900 font-sans">
      
      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transition-transform duration-300 ease-in-out transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:relative lg:translate-x-0 shadow-soft lg:shadow-none`}
      >
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="h-20 flex items-center px-8 border-b border-gray-100">
             <span className="font-extrabold text-2xl tracking-tighter text-gray-900">
                AIDAYNE<span className="text-primary">Admin</span>
             </span>
             <button onClick={() => setIsSidebarOpen(false)} className="ml-auto lg:hidden text-gray-500">
               <X size={24} />
             </button>
          </div>

          {/* Nav */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {MENU_ITEMS.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-bold transition-all ${
                    isActive 
                      ? 'bg-primary text-white shadow-lg shadow-red-500/30' 
                      : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <item.icon size={20} strokeWidth={2} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* User Profile */}
          <div className="p-4 border-t border-gray-100">
            <div className="bg-gray-50 rounded-2xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-lg">
                AD
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-900 truncate">Administrator</p>
                <p className="text-xs text-gray-500 truncate">admin@aidayne.com</p>
              </div>
              <Link to="/login" className="text-gray-400 hover:text-red-500 transition-colors">
                <LogOut size={18} />
              </Link>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-20 bg-white/80 backdrop-blur-xl border-b border-gray-200 flex items-center justify-between px-6 lg:px-8 sticky top-0 z-40">
           <div className="flex items-center gap-4">
              <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                 <Menu size={24} />
              </button>
              <h2 className="text-xl font-bold text-gray-800 hidden sm:block">
                {MENU_ITEMS.find(i => i.path === location.pathname)?.label || 'Dashboard'}
              </h2>
           </div>

           <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center relative">
                 <Search size={18} className="absolute left-3 text-gray-400" />
                 <input 
                    type="text" 
                    placeholder="Tìm kiếm..." 
                    className="pl-10 pr-4 py-2.5 bg-gray-100 border-none rounded-xl text-sm focus:ring-2 focus:ring-primary/20 w-64 transition-all"
                 />
              </div>
              <button className="relative p-2.5 text-gray-500 hover:bg-gray-100 rounded-xl transition-colors">
                 <Bell size={20} />
                 <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
              </button>
           </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
           <Outlet />
        </main>
      </div>
    </div>
  );
};
