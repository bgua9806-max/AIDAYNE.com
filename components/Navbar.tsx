
import React, { useState, useEffect, useRef } from 'react';
import { Search, ShoppingBag, Menu, X, User, ChevronDown, LayoutDashboard, LogOut, ArrowRight, MessageCircle, Facebook, Command, Clock, TrendingUp, CornerDownLeft, ChevronRight, Bell, Home, LayoutGrid, BookOpen, Phone, PackageCheck } from 'lucide-react';
import { CATEGORIES, PRODUCTS } from '../constants';
import * as ReactRouterDOM from 'react-router-dom';
import { Product } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { slugify } from '../lib/utils';
import { supabase } from '../lib/supabase';

const { Link, useLocation, useNavigate } = ReactRouterDOM;

interface NavbarProps {
  cartCount: number;
  onOpenCart: () => void;
  isSearchOpen: boolean;
  setIsSearchOpen: (isOpen: boolean) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ cartCount, onOpenCart, isSearchOpen, setIsSearchOpen }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  
  // Command Palette State
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [searchSource, setSearchSource] = useState<Product[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  
  const searchInputRef = useRef<HTMLInputElement>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  // Load Data & Events
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    
    // Keyboard Shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(!isSearchOpen);
      }
      if (e.key === 'Escape') {
        setIsSearchOpen(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('keydown', handleKeyDown);
    
    // Load Recent Searches
    const saved = localStorage.getItem('recent_searches');
    if (saved) setRecentSearches(JSON.parse(saved));

    // Fetch Products for Search
    const fetchSearchData = async () => {
        try {
            const { data } = await supabase.from('products').select('*');
            if (data && data.length > 0) {
                // Map to handle missing images
                const mapped = data.map((p: any) => {
                    if (!p.image) {
                        const fallback = PRODUCTS.find(fp => String(fp.id) === String(p.id));
                        return { ...p, image: fallback?.image || 'https://placehold.co/100?text=No+Img' };
                    }
                    return p;
                });
                setSearchSource(mapped);
            } else {
                setSearchSource(PRODUCTS);
            }
        } catch (e) {
            setSearchSource(PRODUCTS);
        }
    };
    fetchSearchData();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isSearchOpen, setIsSearchOpen]);

  // Focus input when modal opens
  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
      setSearchQuery('');
      setSuggestions([]);
      setSelectedIndex(0);
    }
  }, [isSearchOpen]);

  // Close mobile menu when route changes
  useEffect(() => {
      setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const isActive = (path: string) => location.pathname === path;
  
  // Check if current page is Product Detail to hide Navbar on Mobile
  const isProductPage = location.pathname.startsWith('/product/');

  // Search Logic
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    setSelectedIndex(0);

    if (query.trim().length > 0) {
      const cleanQuery = slugify(query);
      const filtered = searchSource.filter(product => {
        const pName = slugify(product.name);
        const pCat = slugify(product.category);
        return pName.includes(cleanQuery) || pCat.includes(cleanQuery);
      }).slice(0, 5); // Limit 5 results
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  };

  const saveRecentSearch = (term: string) => {
      if (!term.trim()) return;
      const newRecent = [term, ...recentSearches.filter(s => s !== term)].slice(0, 5);
      setRecentSearches(newRecent);
      localStorage.setItem('recent_searches', JSON.stringify(newRecent));
  };

  const handleProductSelect = (product: Product) => {
    navigate(`/product/${product.slug || slugify(product.name)}`);
    setIsSearchOpen(false);
    setIsMobileMenuOpen(false);
    saveRecentSearch(product.name);
  };

  const handleSearchSubmit = (e?: React.FormEvent) => {
      e?.preventDefault();
      if (suggestions.length > 0) {
          handleProductSelect(suggestions[selectedIndex]);
      } else if (searchQuery.trim()) {
          navigate(`/products?q=${encodeURIComponent(searchQuery)}`);
          setIsSearchOpen(false);
          saveRecentSearch(searchQuery);
      }
  };

  const handleKeyDownInInput = (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
          e.preventDefault();
          setSelectedIndex(prev => (prev + 1) % (suggestions.length || 1));
      } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          setSelectedIndex(prev => (prev - 1 + (suggestions.length || 1)) % (suggestions.length || 1));
      } else if (e.key === 'Enter') {
          handleSearchSubmit();
      }
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const trendingProducts = searchSource.filter(p => p.isHot).slice(0, 4);

  const MOBILE_MENU_ITEMS = [
      { path: '/', label: 'Trang chủ', icon: Home },
      { path: '/products', label: 'Cửa hàng', icon: LayoutGrid },
      { path: '/blog', label: 'Tin tức & Blog', icon: BookOpen }, // Blog is here
      { path: '/order-lookup', label: 'Tra cứu đơn hàng', icon: PackageCheck },
      { path: '/contact', label: 'Liên hệ hỗ trợ', icon: Phone },
  ];

  return (
    <>
      {/* 
        FLOATING NAVBAR DESIGN (ISLAND STYLE)
        - Always uses light/glass theme for best contrast with dark text.
        - Floats from top with padding.
        - Hidden on Mobile for Product Detail pages.
      */}
      <nav 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] 
        ${scrolled ? 'pt-2' : 'pt-4 lg:pt-6'}
        ${isProductPage ? 'hidden lg:block' : ''}
        `}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div 
            className={`
              flex items-center justify-between gap-4 rounded-2xl transition-all duration-500 border
              ${scrolled 
                ? 'bg-white/85 backdrop-blur-xl border-gray-200/60 shadow-lg shadow-gray-200/20 py-2.5 px-4 lg:px-6' 
                : 'bg-white/60 backdrop-blur-md border-white/40 shadow-sm py-3 px-5 lg:py-4 lg:px-8'
              }
            `}
          >
            
            {/* Logo Area */}
            <div className="flex-shrink-0 flex items-center gap-2 lg:gap-6">
              
              {/* Mobile Menu Trigger */}
              <button 
                onClick={() => setIsMobileMenuOpen(true)}
                className="lg:hidden p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-full active:scale-95 transition-all"
              >
                <Menu size={24} />
              </button>

              <div className="flex items-center gap-3">
                <Link to="/" className="flex items-center gap-1 group">
                  <span className="font-extrabold text-xl lg:text-xl tracking-tight text-gray-900">
                    AIDAYNE<span className="text-primary">.com</span>
                  </span>
                </Link>
              </div>

              {/* Desktop Nav Links */}
              <div className="hidden lg:flex items-center gap-1 ml-4">
                 <button 
                  className={`flex items-center gap-1.5 text-[13px] font-bold px-4 py-2 rounded-full transition-all ${isCategoryOpen ? 'bg-gray-100 text-black' : 'text-gray-600 hover:text-black hover:bg-gray-50'}`}
                  onMouseEnter={() => setIsCategoryOpen(true)}
                  onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                 >
                   Cửa hàng
                   <ChevronDown size={14} className={`opacity-50 transition-transform duration-300 ${isCategoryOpen ? 'rotate-180' : ''}`} />
                 </button>
                 <Link 
                  to="/blog" 
                  className={`text-[13px] font-bold px-4 py-2 rounded-full transition-all ${isActive('/blog') ? 'bg-black text-white shadow-md' : 'text-gray-600 hover:text-black hover:bg-gray-50'}`}
                 >
                   Tin tức
                 </Link>
                 <Link 
                   to="/contact" 
                   className={`text-[13px] font-bold px-4 py-2 rounded-full transition-all ${isActive('/contact') ? 'bg-black text-white shadow-md' : 'text-gray-600 hover:text-black hover:bg-gray-50'}`}
                 >
                   Liên hệ
                 </Link>
                 <Link 
                   to="/order-lookup" 
                   className={`text-[13px] font-bold px-4 py-2 rounded-full transition-all ${isActive('/order-lookup') ? 'bg-black text-white shadow-md' : 'text-gray-600 hover:text-black hover:bg-gray-50'}`}
                 >
                   Tra cứu đơn
                 </Link>
              </div>
            </div>

            {/* Smart Command Trigger (Desktop) */}
            <div className="flex-1 max-w-sm mx-auto hidden lg:block">
              <button 
                onClick={() => setIsSearchOpen(true)}
                className={`w-full flex items-center justify-between px-4 py-2.5 border rounded-xl text-sm transition-all duration-300 group
                  ${scrolled ? 'bg-gray-100/50 border-transparent hover:bg-white hover:border-gray-200' : 'bg-white border-gray-200 hover:border-primary/30 shadow-sm'}
                `}
              >
                <div className="flex items-center gap-3">
                   <Search size={16} className="text-gray-400 group-hover:text-primary transition-colors" />
                   <span className="font-medium text-gray-500 group-hover:text-gray-900">Tìm kiếm...</span>
                </div>
                <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-gray-100 border border-gray-200 text-[10px] font-bold text-gray-400 font-mono group-hover:bg-white group-hover:text-primary transition-colors">
                   <Command size={10} /> K
                </div>
              </button>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-1 sm:gap-2">
              
              {/* Desktop Actions */}
              <Link to="/admin" className="hidden lg:flex items-center p-2.5 text-gray-500 hover:text-black hover:bg-gray-100 rounded-full transition-all" title="Admin">
                  <LayoutDashboard size={20} strokeWidth={1.5} />
              </Link>
              
              <div className="h-5 w-px bg-gray-200 hidden lg:block mx-1"></div>

              {/* User / Login (Desktop) */}
              {user ? (
                 <button 
                    onClick={handleLogout}
                    className="hidden lg:block p-2.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-all"
                    title="Đăng xuất"
                 >
                    <LogOut size={20} strokeWidth={1.5} />
                 </button>
              ) : (
                <Link to="/login" className="hidden lg:block p-2.5 text-gray-500 hover:text-black hover:bg-gray-100 rounded-full transition-all" title="Đăng nhập">
                  <User size={20} strokeWidth={1.5} />
                </Link>
              )}
              
              {/* Cart (Desktop) */}
              <button 
                onClick={onOpenCart}
                className="hidden lg:block relative p-2.5 text-gray-800 hover:text-primary hover:bg-primary/5 rounded-full transition-all group"
              >
                <ShoppingBag size={20} strokeWidth={1.5} />
                {cartCount > 0 && (
                  <span className="absolute top-0 right-0 inline-flex items-center justify-center w-4 h-4 text-[9px] font-bold text-white bg-red-500 rounded-full shadow-sm ring-2 ring-white">
                    {cartCount}
                  </span>
                )}
              </button>

              {/* MOBILE ONLY ACTIONS */}
              <button className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-full active:scale-90 transition-all">
                 <Bell size={22} />
              </button>
            </div>
          </div>
        </div>

        {/* Desktop Mega Menu Dropdown */}
        <div 
          className={`hidden lg:block absolute top-full left-0 right-0 pt-4 transition-all duration-300 origin-top ${isCategoryOpen ? 'opacity-100 translate-y-0 visible' : 'opacity-0 -translate-y-4 invisible'}`}
          onMouseLeave={() => setIsCategoryOpen(false)}
        >
           <div className="max-w-7xl mx-auto px-4">
             <div className="bg-white/90 backdrop-blur-2xl rounded-[2rem] shadow-[0_20px_60px_-10px_rgba(0,0,0,0.1)] p-8 border border-white/50 ring-1 ring-gray-900/5">
               <div className="grid grid-cols-5 gap-6">
                  {CATEGORIES.slice(0, 5).map((cat) => (
                    <Link 
                      key={cat.id} 
                      to={`/products?category=${cat.id}`}
                      className="flex flex-col items-center gap-3 p-4 rounded-2xl hover:bg-white/80 transition-all group text-center border border-transparent hover:border-gray-100 hover:shadow-sm"
                      onClick={() => setIsCategoryOpen(false)}
                    >
                      <div className="w-14 h-14 rounded-full bg-gray-50 text-gray-600 flex items-center justify-center group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all duration-300 shadow-sm group-hover:shadow-lg group-hover:shadow-primary/30">
                        <cat.icon size={26} strokeWidth={1.5} />
                      </div>
                      <span className="text-sm font-bold text-gray-700 group-hover:text-black">{cat.name}</span>
                    </Link>
                  ))}
               </div>
             </div>
           </div>
        </div>
      </nav>

      {/* --- MOBILE MENU DRAWER --- */}
      <div 
        className={`fixed inset-0 z-[100] lg:hidden transition-all duration-300 ${isMobileMenuOpen ? 'visible' : 'invisible'}`}
      >
         {/* Backdrop */}
         <div 
            className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0'}`}
            onClick={() => setIsMobileMenuOpen(false)}
         ></div>

         {/* Drawer Panel */}
         <div 
            className={`absolute top-0 left-0 bottom-0 w-[85%] max-w-[320px] bg-white shadow-2xl transition-transform duration-300 ease-out flex flex-col ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}
         >
            {/* Header */}
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
               <span className="font-extrabold text-xl tracking-tight text-gray-900">
                  AIDAYNE<span className="text-primary">.com</span>
               </span>
               <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 bg-white rounded-full border border-gray-200 shadow-sm active:scale-95 transition-transform">
                  <X size={20} className="text-gray-500" />
               </button>
            </div>

            {/* Menu Links */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
               {MOBILE_MENU_ITEMS.map((item) => {
                  const active = isActive(item.path);
                  return (
                    <Link 
                        key={item.path}
                        to={item.path}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`flex items-center gap-4 p-4 rounded-2xl transition-all ${active ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'text-gray-700 hover:bg-gray-50'}`}
                    >
                        <item.icon size={22} strokeWidth={active ? 2.5 : 2} />
                        <span className={`text-base ${active ? 'font-bold' : 'font-medium'}`}>{item.label}</span>
                        {active && <ChevronRight size={18} className="ml-auto opacity-80" />}
                    </Link>
                  )
               })}
               
               {/* Admin Link (Mobile) */}
               <Link 
                  to="/admin"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-4 p-4 rounded-2xl text-gray-700 hover:bg-gray-50 transition-all mt-4 border-t border-gray-100"
               >
                  <LayoutDashboard size={22} />
                  <span className="font-medium">Quản trị viên</span>
               </Link>
            </div>

            {/* Footer */}
            <div className="p-6 bg-gray-50 border-t border-gray-100">
               {user ? (
                  <div className="flex items-center gap-3">
                     <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold">
                        {user.email?.charAt(0).toUpperCase()}
                     </div>
                     <div className="flex-1 min-w-0">
                        <div className="font-bold text-sm truncate">{user.email}</div>
                        <button onClick={handleLogout} className="text-xs text-red-500 font-bold hover:underline">Đăng xuất</button>
                     </div>
                  </div>
               ) : (
                  <Link 
                     to="/login"
                     onClick={() => setIsMobileMenuOpen(false)} 
                     className="flex items-center justify-center gap-2 w-full py-3 bg-gray-900 text-white font-bold rounded-xl active:scale-95 transition-transform"
                  >
                     <User size={18} /> Đăng nhập / Đăng ký
                  </Link>
               )}
            </div>
         </div>
      </div>

      {/* --- SMART COMMAND PALETTE (MODAL) --- */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4">
           {/* Backdrop */}
           <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={() => setIsSearchOpen(false)}></div>
           
           {/* Modal Panel */}
           <div className="relative w-full max-w-2xl bg-white/90 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/50 overflow-hidden flex flex-col animate-fade-in-up ring-1 ring-black/5">
              
              {/* Search Header */}
              <div className="flex items-center gap-4 p-5 border-b border-gray-200/50 bg-white/50">
                 <Search size={22} className="text-gray-400" />
                 <input 
                    ref={searchInputRef}
                    type="text" 
                    placeholder="Tìm kiếm phần mềm, tài khoản..." 
                    value={searchQuery}
                    onChange={handleSearchChange}
                    onKeyDown={handleKeyDownInInput}
                    className="flex-1 bg-transparent border-none text-xl font-medium text-gray-900 placeholder-gray-400 focus:ring-0 p-0"
                 />
                 <button 
                    onClick={() => setIsSearchOpen(false)}
                    className="px-2 py-1 bg-gray-200 rounded text-[10px] font-bold text-gray-500 uppercase tracking-wide hover:bg-gray-300 transition-colors"
                 >
                    Esc
                 </button>
              </div>

              {/* Content Body */}
              <div className="max-h-[60vh] overflow-y-auto p-2">
                 
                 {/* STATE 1: Search Results */}
                 {searchQuery.trim().length > 0 ? (
                    <div>
                        {suggestions.length > 0 ? (
                           <>
                              <div className="px-4 py-2 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Gợi ý sản phẩm</div>
                              {suggestions.map((p, idx) => (
                                 <div 
                                    key={p.id}
                                    onClick={() => handleProductSelect(p)}
                                    className={`flex items-center gap-4 p-3 rounded-2xl cursor-pointer transition-all ${idx === selectedIndex ? 'bg-primary text-white shadow-lg shadow-primary/30 scale-[1.01]' : 'hover:bg-gray-100 text-gray-900'}`}
                                 >
                                    <img src={p.image} alt="" className={`w-10 h-10 rounded-lg object-cover ${idx === selectedIndex ? 'bg-white/20' : 'bg-gray-100'}`} />
                                    <div className="flex-1 min-w-0">
                                       <div className="font-bold text-sm truncate">{p.name}</div>
                                       <div className={`text-xs ${idx === selectedIndex ? 'text-white/80' : 'text-gray-500'}`}>{p.category}</div>
                                    </div>
                                    <div className={`font-bold text-sm ${idx === selectedIndex ? 'text-white' : 'text-primary'}`}>
                                       {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p.price)}
                                    </div>
                                    {idx === selectedIndex && <CornerDownLeft size={16} className="text-white/70" />}
                                 </div>
                              ))}
                           </>
                        ) : (
                           <div className="py-12 text-center text-gray-500">
                              <p>Không tìm thấy kết quả nào cho "{searchQuery}"</p>
                           </div>
                        )}
                    </div>
                 ) : (
                    /* STATE 2: Zero State (Recent & Trending) */
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {/* Recent Searches */}
                        {recentSearches.length > 0 && (
                           <div className="p-2">
                              <h4 className="px-3 py-2 text-[11px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                 <Clock size={12} /> Gần đây
                              </h4>
                              {recentSearches.map((term, i) => (
                                 <div 
                                    key={i} 
                                    onClick={() => { setSearchQuery(term); handleSearchChange({ target: { value: term } } as any) }}
                                    className="px-3 py-2.5 rounded-xl hover:bg-gray-100 text-sm font-medium text-gray-600 cursor-pointer transition-colors flex items-center justify-between group"
                                 >
                                    {term}
                                    <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 text-gray-400 transition-opacity" />
                                 </div>
                              ))}
                           </div>
                        )}

                        {/* Trending */}
                        <div className="p-2">
                           <h4 className="px-3 py-2 text-[11px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                              <TrendingUp size={12} /> Xu hướng
                           </h4>
                           {trendingProducts.map(p => (
                              <div 
                                 key={p.id}
                                 onClick={() => handleProductSelect(p)}
                                 className="group flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-blue-50 cursor-pointer transition-colors"
                              >
                                 <div className="w-8 h-8 rounded-lg bg-gray-100 overflow-hidden shrink-0 border border-gray-100">
                                    <img src={p.image} alt="" className="w-full h-full object-cover" />
                                 </div>
                                 <div className="flex-1 min-w-0">
                                    <div className="font-bold text-xs text-gray-900 truncate group-hover:text-primary transition-colors">{p.name}</div>
                                 </div>
                                 <ChevronRight size={14} className="text-gray-300 group-hover:text-primary transition-colors" />
                              </div>
                           ))}
                        </div>
                    </div>
                 )}
              </div>
              
              {/* Footer */}
              <div className="bg-gray-50 border-t border-gray-200/60 px-5 py-3 flex items-center justify-between text-[10px] font-bold text-gray-400 uppercase tracking-wide">
                 <div className="flex gap-4">
                    <span><span className="bg-gray-200 px-1.5 py-0.5 rounded text-gray-600 mr-1">↑↓</span> Di chuyển</span>
                    <span><span className="bg-gray-200 px-1.5 py-0.5 rounded text-gray-600 mr-1">↵</span> Chọn</span>
                 </div>
                 <span>AIDAYNE Search</span>
              </div>
           </div>
        </div>
      )}
    </>
  );
};
