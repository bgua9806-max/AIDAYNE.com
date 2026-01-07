
import React, { useState, useEffect, useRef } from 'react';
import { Search, ShoppingBag, Menu, X, User, ChevronDown, LayoutDashboard, LogOut, ArrowRight } from 'lucide-react';
import { CATEGORIES, PRODUCTS } from '../constants';
import * as ReactRouterDOM from 'react-router-dom';
import { Product } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { slugify } from '../lib/utils';

const { Link, useLocation, useNavigate } = ReactRouterDOM;

interface NavbarProps {
  cartCount: number;
  onOpenCart: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ cartCount, onOpenCart }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  
  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const isActive = (path: string) => location.pathname === path;

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.trim().length > 0) {
      const lowerQuery = query.toLowerCase();
      const filtered = PRODUCTS.filter(product => 
        product.name.toLowerCase().includes(lowerQuery) || 
        product.description.toLowerCase().includes(lowerQuery)
      ).slice(0, 5);
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (product: Product) => {
    navigate(`/product/${product.slug || slugify(product.name)}`);
    setSearchQuery('');
    setShowSuggestions(false);
    setIsMobileMenuOpen(false); // Close mobile menu if open
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (searchQuery.trim()) {
          navigate(`/products?q=${encodeURIComponent(searchQuery)}`);
          setIsMobileMenuOpen(false);
          setShowSuggestions(false);
      }
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <>
      {/* Floating Navbar Container */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-in-out ${scrolled ? 'pt-2 px-3 lg:px-4' : 'pt-0'}`}>
        <div className={`max-w-7xl mx-auto transition-all duration-500 ${scrolled ? 'glass rounded-2xl shadow-soft py-3 px-4 lg:px-6' : 'bg-transparent py-4 lg:py-6 px-4 sm:px-8'}`}>
          <div className="flex items-center justify-between gap-4">
            
            {/* Logo Area */}
            <div className="flex-shrink-0 flex items-center gap-6">
              <div className="flex items-center gap-3">
                <button 
                  className="lg:hidden p-2 -ml-2 text-gray-800 hover:text-primary transition-colors"
                  onClick={() => setIsMobileMenuOpen(true)}
                >
                  <Menu size={24} />
                </button>
                
                <Link to="/" className="flex items-center gap-1 group">
                  <span className="font-semibold text-xl tracking-tight text-gray-900">
                    AIDAYNE
                  </span>
                </Link>
              </div>

              {/* Desktop Nav Links */}
              <div className="hidden lg:flex items-center gap-1">
                 <button 
                  className="flex items-center gap-1.5 text-[13px] font-medium text-gray-600 hover:text-black px-3 py-2 rounded-lg transition-all"
                  onMouseEnter={() => setIsCategoryOpen(true)}
                  onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                 >
                   Store
                   <ChevronDown size={14} className={`opacity-50 transition-transform duration-300 ${isCategoryOpen ? 'rotate-180' : ''}`} />
                 </button>
                 <Link 
                  to="/blog" 
                  className={`text-[13px] font-medium px-3 py-2 rounded-lg transition-all ${isActive('/blog') ? 'text-black' : 'text-gray-600 hover:text-black'}`}
                 >
                   News
                 </Link>
                 <Link 
                   to="/contact" 
                   className={`text-[13px] font-medium px-3 py-2 rounded-lg transition-all ${isActive('/contact') ? 'text-black' : 'text-gray-600 hover:text-black'}`}
                 >
                   Contact
                 </Link>
                 <Link 
                   to="/order-lookup" 
                   className={`text-[13px] font-medium px-3 py-2 rounded-lg transition-all ${isActive('/order-lookup') ? 'text-black' : 'text-gray-600 hover:text-black'}`}
                 >
                   Check Order
                 </Link>
              </div>
            </div>

            {/* Search Bar - Center (Desktop Only) */}
            <div className="flex-1 max-w-md mx-auto hidden lg:block" ref={searchRef}>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search size={16} className="text-gray-400 group-focus-within:text-primary transition-colors" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onFocus={() => { if (searchQuery.trim().length > 0) setShowSuggestions(true); }}
                  className="block w-full pl-10 pr-4 py-2 bg-gray-100/80 border-transparent rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:bg-white focus:ring-2 focus:ring-primary/50 transition-all duration-300 text-sm"
                  placeholder="Search tools, accounts..."
                />
                
                {/* Suggestions */}
                {showSuggestions && searchQuery.trim().length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white/90 backdrop-blur-xl rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50">
                    {suggestions.length > 0 ? (
                      <div className="py-2">
                        <div className="px-4 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Suggestions</div>
                        {suggestions.map((product) => (
                          <div 
                            key={product.id}
                            onClick={() => handleSuggestionClick(product)}
                            className="px-4 py-3 hover:bg-blue-50/50 cursor-pointer flex items-center gap-3 border-b border-gray-50 last:border-0 transition-colors"
                          >
                            <img src={product.image} alt={product.name} className="w-10 h-10 rounded-lg object-cover bg-gray-100 shadow-sm" />
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-semibold text-gray-900 truncate">{product.name}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 text-center">
                        <p className="text-gray-500 text-xs">No results found.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-1 sm:gap-2">
              <Link to="/admin" className="hidden sm:flex items-center p-2 text-gray-500 hover:text-black transition-all" title="Admin">
                  <LayoutDashboard size={20} strokeWidth={1.5} />
              </Link>
              
              <div className="h-4 w-px bg-gray-300 hidden sm:block mx-1"></div>

              {user ? (
                 <button 
                    onClick={handleLogout}
                    className="hidden sm:block p-2 text-gray-500 hover:text-black transition-all"
                 >
                    <LogOut size={20} strokeWidth={1.5} />
                 </button>
              ) : (
                <Link to="/login" className="hidden sm:block p-2 text-gray-500 hover:text-black transition-all">
                  <User size={20} strokeWidth={1.5} />
                </Link>
              )}
              
              <button 
                onClick={onOpenCart}
                className="relative p-2 text-gray-800 hover:text-primary transition-all group"
              >
                <ShoppingBag size={20} strokeWidth={1.5} />
                {cartCount > 0 && (
                  <span className="absolute top-0 right-0 inline-flex items-center justify-center w-4 h-4 text-[10px] font-bold text-white bg-primary rounded-full shadow-sm">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Desktop Mega Menu */}
        <div 
          className={`hidden lg:block absolute top-full left-0 right-0 pt-2 transition-all duration-300 origin-top ${isCategoryOpen ? 'opacity-100 translate-y-0 visible' : 'opacity-0 -translate-y-4 invisible'}`}
          onMouseLeave={() => setIsCategoryOpen(false)}
        >
           <div className="max-w-7xl mx-auto px-4">
             <div className="glass rounded-2xl shadow-2xl p-8 border border-white/50">
               <div className="grid grid-cols-5 gap-6">
                  {CATEGORIES.slice(0, 5).map((cat) => (
                    <Link 
                      key={cat.id} 
                      to={`/products?category=${cat.id}`}
                      className="flex flex-col items-center gap-3 p-4 rounded-2xl hover:bg-white/60 transition-all group text-center"
                      onClick={() => setIsCategoryOpen(false)}
                    >
                      <div className="w-12 h-12 rounded-full bg-gray-100/50 text-gray-600 flex items-center justify-center group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all duration-300 shadow-sm">
                        <cat.icon size={22} strokeWidth={1.5} />
                      </div>
                      <span className="text-sm font-semibold text-gray-900">{cat.name}</span>
                    </Link>
                  ))}
               </div>
             </div>
           </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden animate-fade-in">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}></div>
          <div className="absolute inset-y-0 left-0 w-[85%] max-w-xs bg-white/95 backdrop-blur-xl shadow-2xl overflow-y-auto border-r border-white/20">
            <div className="p-6">
              <div className="flex items-center justify-between mb-8">
                 <span className="font-semibold text-xl tracking-tight text-gray-900">AIDAYNE</span>
                 <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 bg-gray-100 rounded-full text-gray-600">
                   <X size={20} />
                 </button>
              </div>

              {/* Mobile Search - Added as requested */}
              <div className="mb-8">
                  <form onSubmit={handleSearchSubmit} className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input 
                          type="text" 
                          placeholder="Tìm sản phẩm..." 
                          value={searchQuery}
                          onChange={handleSearchChange}
                          className="w-full pl-10 pr-4 py-3 bg-gray-100 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/50"
                      />
                      {searchQuery && (
                          <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 bg-primary text-white p-1 rounded-md">
                              <ArrowRight size={14} />
                          </button>
                      )}
                  </form>
                  {/* Mobile Suggestions */}
                  {suggestions.length > 0 && searchQuery && (
                      <div className="mt-2 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                          {suggestions.map(p => (
                              <div key={p.id} onClick={() => handleSuggestionClick(p)} className="flex items-center gap-3 p-3 border-b border-gray-50 last:border-0 active:bg-gray-50">
                                  <img src={p.image} alt="" className="w-8 h-8 rounded-md bg-gray-100 object-cover" />
                                  <span className="text-sm font-medium text-gray-900 truncate">{p.name}</span>
                              </div>
                          ))}
                      </div>
                  )}
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-4">Danh mục</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {CATEGORIES.map((cat) => (
                      <Link 
                        key={cat.id} 
                        to={`/products?category=${cat.id}`} 
                        className="flex flex-col items-center gap-2 p-3 rounded-xl bg-gray-50 hover:bg-blue-50 text-gray-700 transition-colors border border-transparent hover:border-blue-100"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <cat.icon size={20} className="text-primary" strokeWidth={1.5} />
                        <span className="text-xs font-medium text-center">{cat.name}</span>
                      </Link>
                    ))}
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-100 space-y-1">
                  <Link to="/order-lookup" onClick={() => setIsMobileMenuOpen(false)} className="block py-3 text-sm font-medium text-gray-900 hover:text-primary">Tra cứu đơn hàng</Link>
                  <Link to="/blog" onClick={() => setIsMobileMenuOpen(false)} className="block py-3 text-sm font-medium text-gray-900 hover:text-primary">Tin tức & Mẹo vặt</Link>
                  <Link to="/contact" onClick={() => setIsMobileMenuOpen(false)} className="block py-3 text-sm font-medium text-gray-900 hover:text-primary">Liên hệ hỗ trợ</Link>
                  
                  {!user ? (
                      <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="block py-3 text-sm font-bold text-primary mt-2">Đăng nhập / Đăng ký</Link>
                  ) : (
                      <button onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }} className="w-full text-left py-3 text-sm font-bold text-red-500 mt-2">Đăng xuất</button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
