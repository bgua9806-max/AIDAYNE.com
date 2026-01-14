
import React from 'react';
import { Home, LayoutGrid, Search, ShoppingBag, User } from 'lucide-react';
import * as ReactRouterDOM from 'react-router-dom';

const { Link, useLocation } = ReactRouterDOM;

interface BottomNavProps {
  cartCount: number;
  onOpenCart: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ cartCount, onOpenCart }) => {
  const location = useLocation();
  const path = location.pathname;

  const NavItem = ({ to, icon: Icon, label, isActive, onClick }: any) => (
    <Link 
      to={to || '#'} 
      onClick={onClick}
      className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-all duration-300 active:scale-90 ${
        isActive ? 'text-primary' : 'text-gray-400 hover:text-gray-600'
      }`}
    >
      <div className={`relative p-1.5 rounded-2xl transition-all duration-300 ${isActive ? 'bg-primary/10' : 'bg-transparent'}`}>
        <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
        {label === 'Cart' && cartCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white shadow-sm ring-2 ring-white">
            {cartCount}
          </span>
        )}
      </div>
    </Link>
  );

  return (
    <div className="fixed bottom-6 left-4 right-4 z-[90] lg:hidden animate-fade-in-up">
      <div className="h-[72px] bg-white/80 backdrop-blur-2xl border border-white/40 shadow-[0_20px_40px_-12px_rgba(0,0,0,0.1)] rounded-[2rem] flex items-center justify-between px-2 pb-1">
        <NavItem 
          to="/" 
          icon={Home} 
          isActive={path === '/'} 
        />
        <NavItem 
          to="/products" 
          icon={LayoutGrid} 
          isActive={path === '/products' && !location.search.includes('category')} 
        />
        {/* Search Action */}
        <div className="relative -top-6">
            <Link 
              to="/products" 
              className="flex items-center justify-center w-14 h-14 bg-gray-900 text-white rounded-full shadow-lg shadow-gray-900/30 active:scale-90 transition-transform border-[4px] border-[#F5F5F7]"
            >
               <Search size={24} />
            </Link>
        </div>
        
        <NavItem 
          to="#" 
          icon={ShoppingBag} 
          label="Cart"
          onClick={(e: any) => { e.preventDefault(); onOpenCart(); }}
        />
        <NavItem 
          to="/login" 
          icon={User} 
          isActive={path === '/login' || path.includes('/admin')} 
        />
      </div>
    </div>
  );
};
