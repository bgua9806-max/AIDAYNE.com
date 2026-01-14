
import React, { useState, useEffect, useRef } from 'react';
import { Search, ShoppingBag, Menu, X, User, ChevronDown, LayoutDashboard, LogOut, ArrowRight, MessageCircle, Facebook, Command, Clock, TrendingUp, CornerDownLeft, ChevronRight, Bell } from 'lucide-react';
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
}

export const Navbar: React.FC<NavbarProps> = ({ cartCount, onOpenCart }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  
  // Command Palette State
  const [isCommandOpen, setIsCommandOpen] = useState(false);
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
    const handleScroll = () => setScrolled(window.scrollY > 10);
    
    // Keyboard Shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandOpen(prev => !prev);
      }
      if (e.key === 'Escape') {
        setIsCommandOpen(false);
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
  }, []);

  // Focus input when modal opens
  useEffect(() => {
    if (isCommandOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
      setSearchQuery('');
      setSuggestions([]);
      setSelectedIndex(0);
    }
  }, [isCommandOpen]);

  const isActive = (path: string) => location.pathname === path;

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
    setIsCommandOpen(false);
    setIsMobileMenuOpen(false);
    saveRecentSearch(product.name);
  };

  const handleSearchSubmit = (e?: React.FormEvent) => {
      e?.preventDefault();
      if (suggestions.length > 0) {
          handleProductSelect(suggestions[selectedIndex]);
      } else if (searchQuery.trim()) {
          navigate(`/products?q=${encodeURIComponent(searchQuery)}`);
          setIsCommandOpen(false);
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

  return (
    <>
      {/* Floating Navbar Container */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-in-out ${scrolled ? 'pt-0 lg:pt-2 px-0 lg:px-4' : 'pt-0'}`}>
        <div className={`max-w-7xl mx-auto transition-all duration-500 ${scrolled ? 'glass-dark lg:glass border-b border-white/10 lg:border-white/50 lg:rounded-2xl lg:shadow-soft py-3 px-4 lg:px-6' : 'bg-white/80 backdrop-blur-md lg:bg-transparent py-3 lg:py-6 px-4 sm:px-8 border-b border-gray-100 lg:border-none'}`}>
          <div className="flex items-center justify-between gap-4">
            
            {/* Logo Area */}
            <div className="flex-shrink-0 flex items-center gap-6">
              <div className="flex items-center gap-3">
                {/* Mobile Menu Trigger (Legacy) - Hidden on Mobile New Design */}
                <button 
                  className="hidden p-2 -ml-2 text-gray-800 hover:text-primary transition-colors"
                  onClick={() => setIsMobileMenuOpen(true)}
                >
                  <Menu size={24} />
                </button>
                
                <Link to="/" className="flex items-center gap-1 group">
                  <span className="font-extrabold text-xl lg:text-xl tracking-tight text-gray-900">
                    AIDAYNE<span className="text-primary">.com</span>
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

            {/* Smart Command Trigger (Desktop) */}
            <div className="flex-1 max-w-md mx-auto hidden lg:block">
              <button 
                onClick={() => setIsCommandOpen(true)}
                className="w-full flex items-center justify-between px-4 py-2.5 bg-gray-100/80 hover:bg-white border border-transparent hover:border-gray-200 rounded-xl text-sm text-gray-500 transition-all duration-300 group shadow-inner hover:shadow-sm"
              >
                <div className="flex items-center gap-3">
                   <Search size={16} className="text-gray-400 group-hover:text-primary transition-colors" />
                   <span className="font-medium group-hover:text-gray-900">Tìm kiếm sản phẩm...</span>
                </div>
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-white border border-gray-200 text-[10px] font-bold text-gray-400 font-mono">
                   <Command size={10} /> K
                </div>
              </button>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-1 sm:gap-2">
              
              {/* Desktop Actions */}
              <Link to="/admin" className="hidden lg:flex items-center p-2 text-gray-500 hover:text-black transition-all" title="Admin">
                  <LayoutDashboard size={20} strokeWidth={1.5} />
              </Link>
              
              <div className="h-4 w-px bg-gray-300 hidden lg:block mx-1"></div>

              {/* User / Login (Desktop) */}
              {user ? (
                 <button 
                    onClick={handleLogout}
                    className="hidden lg:block p-2 text-gray-500 hover:text-black transition-all"
                 >
                    <LogOut size={20} strokeWidth={1.5} />
                 </button>
              ) : (
                <Link to="/login" className="hidden lg:block p-2 text-gray-500 hover:text-black transition-all">
                  <User size={20} strokeWidth={1.5} />
                </Link>
              )}
              
              {/* Cart (Desktop) - Mobile cart is in BottomNav */}
              <button 
                onClick={onOpenCart}
                className="hidden lg:block relative p-2 text-gray-800 hover:text-primary transition-all group"
              >
                <ShoppingBag size={20} strokeWidth={1.5} />
                {cartCount > 0 && (
                  <span className="absolute top-0 right-0 inline-flex items-center justify-center w-4 h-4 text-[10px] font-bold text-white bg-primary rounded-full shadow-sm">
                    {cartCount}
                  </span>
                )}
              </button>

              {/* MOBILE ONLY ACTIONS */}
              <button className="lg:hidden p-2 text-gray-600 active:scale-90 transition-transform">
                 <Bell size={22} />
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

      {/* --- SMART COMMAND PALETTE (MODAL) --- */}
      {isCommandOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4">
           {/* Backdrop */}
           <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={() => setIsCommandOpen(false)}></div>
           
           {/* Modal Panel */}
           <div className="relative w-full max-w-2xl bg-white/80 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/50 overflow-hidden flex flex-col animate-fade-in-up">
              
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
                    onClick={() => setIsCommandOpen(false)}
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
