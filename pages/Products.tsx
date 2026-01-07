
import React, { useState, useEffect, useMemo } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { PRODUCTS as FALLBACK_PRODUCTS, CATEGORIES } from '../constants';
import { Product } from '../types';
import { ProductCard } from '../components/ProductCard';
import { Filter, ChevronDown, SlidersHorizontal, X, ArrowUpDown, Search } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { SEO } from '../components/SEO';
import { slugify } from '../lib/utils';

const { useLocation, useNavigate } = ReactRouterDOM;

interface ProductsPageProps {
  addToCart: (product: Product) => void;
}

export const ProductsPage: React.FC<ProductsPageProps> = ({ addToCart }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  
  const initialCategory = searchParams.get('category');
  const initialSort = searchParams.get('sort') || 'default';
  const initialSearch = searchParams.get('q') || '';

  // State
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory || 'all');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000000]);
  const [sortBy, setSortBy] = useState<string>(initialSort);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState(initialSearch);

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Fetch Products
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase.from('products').select('*');
        if (error) throw error;
        
        if (data && data.length > 0) {
            // Merge logic with Safe ID Comparison
            const enhancedData = data.map((p: Product) => {
                if (!p.image || (typeof p.image === 'string' && p.image.trim() === '')) {
                    const fallback = FALLBACK_PRODUCTS.find(fp => String(fp.id) === String(p.id));
                    return fallback ? { ...p, image: fallback.image } : p;
                }
                return p;
            });
            setProducts(enhancedData);
        } else {
            setProducts(FALLBACK_PRODUCTS);
        }
      } catch (err) {
        console.error(err);
        setProducts(FALLBACK_PRODUCTS);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Update state when URL changes
  useEffect(() => {
    if (initialCategory) setSelectedCategory(initialCategory);
    if (initialSort) setSortBy(initialSort);
  }, [initialCategory, initialSort]);

  // Filter Logic
  const filteredProducts = useMemo(() => {
    let result = products;

    // 1. Filter by Category FIRST (Strict Scope)
    if (selectedCategory !== 'all') {
      result = result.filter(p => p.category === selectedCategory);
    }

    // 2. Filter by Search (Smart Search with Vietnamese support)
    // "Chính xác" logic: Normalizes strings (removes accents) and splits query into tokens.
    // All tokens must exist in the product name/description/category.
    if (searchQuery && searchQuery.trim().length > 0) {
        const cleanQuery = slugify(searchQuery);
        // Split query into keywords (e.g. "tai-khoan-netflix" -> ["tai", "khoan", "netflix"])
        const queryTokens = cleanQuery.split('-').filter(t => t.length > 0);

        result = result.filter(p => {
            // Combine fields to search within
            const productContent = slugify(`${p.name} ${p.description} ${p.category}`);
            
            // Check if every token in the query appears in the product content
            return queryTokens.every(token => productContent.includes(token));
        });
    }

    // 3. Filter by Price
    result = result.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);

    // 4. Sort
    switch (sortBy) {
      case 'price-asc':
        return [...result].sort((a, b) => a.price - b.price);
      case 'price-desc':
        return [...result].sort((a, b) => b.price - a.price);
      case 'name-asc':
        return [...result].sort((a, b) => a.name.localeCompare(b.name));
      case 'newest':
          return [...result].sort((a, b) => (b.isNew === a.isNew) ? 0 : b.isNew ? 1 : -1);
      default: // Popularity / Sold
        return [...result].sort((a, b) => b.sold - a.sold);
    }
  }, [selectedCategory, priceRange, sortBy, searchQuery, products]);

  // Update URL when filters change
  const handleCategoryChange = (catId: string) => {
    setSelectedCategory(catId);
    const params = new URLSearchParams(location.search);
    if (catId === 'all') params.delete('category');
    else params.set('category', catId);
    navigate({ search: params.toString() });
    setIsMobileFilterOpen(false);
  };

  const clearFilters = () => {
    setSelectedCategory('all');
    setPriceRange([0, 5000000]);
    setSortBy('default');
    setSearchQuery('');
    navigate('/products');
  };

  const currentCategoryName = CATEGORIES.find(c => c.id === selectedCategory)?.name || 'Cửa hàng';

  return (
    <main className="min-h-screen bg-[#F2F2F7] pt-28 pb-20">
      
      <SEO 
        title={selectedCategory === 'all' ? "Tất cả sản phẩm - AIDAYNE Store" : `Mua ${currentCategoryName} bản quyền giá rẻ`}
        description={`Danh sách các sản phẩm ${currentCategoryName} tốt nhất. Bảo hành trọn đời, giá rẻ hơn gốc đến 70%.`}
      />

      {/* Header */}
      <div className="bg-white border-b border-gray-100 mb-8 sticky top-[70px] z-30 shadow-sm backdrop-blur-xl bg-white/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            <div className="flex items-center gap-2 text-sm text-gray-500">
               <span className="cursor-pointer hover:text-primary" onClick={() => navigate('/')}>Trang chủ</span>
               <span>/</span>
               <span className="font-bold text-gray-900">Tất cả sản phẩm</span>
               <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs font-bold ml-2">{filteredProducts.length}</span>
            </div>

            <div className="flex items-center gap-3">
              {/* Mobile Filter Trigger */}
              <button 
                className="md:hidden flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-xl text-sm font-bold text-gray-700"
                onClick={() => setIsMobileFilterOpen(true)}
              >
                <Filter size={16} /> Bộ lọc
              </button>

              {/* Sort Dropdown */}
              <div className="relative group">
                 <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-white border border-transparent hover:border-gray-200 rounded-xl transition-all cursor-pointer">
                    <ArrowUpDown size={14} className="text-gray-500" />
                    <select 
                      value={sortBy} 
                      onChange={(e) => setSortBy(e.target.value)}
                      className="bg-transparent text-sm font-bold text-gray-700 outline-none cursor-pointer appearance-none pr-4"
                    >
                      <option value="default">Phổ biến nhất</option>
                      <option value="newest">Mới nhất</option>
                      <option value="price-asc">Giá: Thấp đến Cao</option>
                      <option value="price-desc">Giá: Cao đến Thấp</option>
                      <option value="name-asc">Tên: A-Z</option>
                    </select>
                 </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Sidebar Filters (Desktop) */}
          <aside className="hidden lg:block w-64 flex-shrink-0 space-y-8">
            {/* Search Input in Sidebar for convenience */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
               <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Search size={18} /> Tìm kiếm
               </h3>
               <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Nhập tên sản phẩm..."
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
               />
            </div>

            {/* Categories */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <SlidersHorizontal size={18} /> Danh mục
              </h3>
              <ul className="space-y-2">
                <li 
                  onClick={() => handleCategoryChange('all')}
                  className={`flex items-center justify-between cursor-pointer px-3 py-2 rounded-lg text-sm font-medium transition-colors ${selectedCategory === 'all' ? 'bg-primary text-white shadow-lg shadow-red-500/30' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  <span>Tất cả</span>
                </li>
                {CATEGORIES.map((cat) => (
                  <li 
                    key={cat.id}
                    onClick={() => handleCategoryChange(cat.id)}
                    className={`flex items-center justify-between cursor-pointer px-3 py-2 rounded-lg text-sm font-medium transition-colors ${selectedCategory === cat.id ? 'bg-primary text-white shadow-lg shadow-red-500/30' : 'text-gray-600 hover:bg-gray-50'}`}
                  >
                    <div className="flex items-center gap-3">
                      <cat.icon size={16} />
                      {cat.name}
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Price Filter */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-900 mb-6">Khoảng giá</h3>
              <div className="px-2">
                 <input 
                  type="range" 
                  min="0" 
                  max="2000000" 
                  step="50000"
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
                  className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
                 />
                 <div className="flex justify-between mt-4 text-xs font-bold text-gray-500">
                    <span>0₫</span>
                    <span className="text-primary">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(priceRange[1])}</span>
                 </div>
              </div>
            </div>

             {/* Clear Filter */}
            {(selectedCategory !== 'all' || priceRange[1] !== 5000000 || searchQuery) && (
               <button 
                onClick={clearFilters}
                className="w-full py-3 rounded-xl border border-gray-200 text-gray-600 font-bold text-sm hover:bg-red-50 hover:text-primary hover:border-red-100 transition-all"
               >
                 Xóa bộ lọc
               </button>
            )}
          </aside>

          {/* Product Grid */}
          <div className="flex-1">
             {loading ? (
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                   {[1,2,3,4,5,6].map(i => <div key={i} className="h-80 bg-gray-200 rounded-3xl animate-pulse"></div>)}
                </div>
             ) : filteredProducts.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                  {filteredProducts.map((product) => (
                    <ProductCard key={product.id} product={product} onAddToCart={addToCart} />
                  ))}
                </div>
             ) : (
               <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                  <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-gray-300">
                     <Search size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Không tìm thấy sản phẩm</h3>
                  <p className="text-gray-500 mb-6">
                    {selectedCategory !== 'all' 
                        ? `Không có kết quả cho "${searchQuery}" trong danh mục "${currentCategoryName}".` 
                        : "Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm của bạn."}
                  </p>
                  <button onClick={clearFilters} className="px-6 py-2 bg-primary text-white rounded-full font-bold text-sm shadow-lg shadow-red-500/20">
                    Xóa bộ lọc
                  </button>
               </div>
             )}
          </div>

        </div>
      </div>

      {/* Mobile Filter Drawer */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setIsMobileFilterOpen(false)}></div>
          <div className="absolute inset-y-0 right-0 w-[85%] max-w-xs bg-white shadow-2xl flex flex-col">
             <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <h3 className="font-bold text-xl">Bộ lọc tìm kiếm</h3>
                <button onClick={() => setIsMobileFilterOpen(false)} className="p-2 bg-gray-50 rounded-full text-gray-500">
                   <X size={20} />
                </button>
             </div>
             
             <div className="flex-1 overflow-y-auto p-6 space-y-8">
                <div>
                   <h4 className="font-bold text-gray-900 mb-4 text-sm uppercase tracking-wider">Từ khóa</h4>
                   <input 
                      type="text" 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Tìm kiếm..."
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                   />
                </div>

                <div>
                  <h4 className="font-bold text-gray-900 mb-4 text-sm uppercase tracking-wider">Danh mục</h4>
                  <div className="flex flex-wrap gap-2">
                     <button 
                        onClick={() => handleCategoryChange('all')}
                        className={`px-4 py-2 rounded-xl text-sm font-bold border transition-all ${selectedCategory === 'all' ? 'bg-primary text-white border-primary' : 'bg-white border-gray-200 text-gray-600'}`}
                      >
                        Tất cả
                      </button>
                     {CATEGORIES.map((cat) => (
                        <button 
                          key={cat.id}
                          onClick={() => handleCategoryChange(cat.id)}
                          className={`px-4 py-2 rounded-xl text-sm font-bold border transition-all ${selectedCategory === cat.id ? 'bg-primary text-white border-primary' : 'bg-white border-gray-200 text-gray-600'}`}
                        >
                          {cat.name}
                        </button>
                     ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-gray-900 mb-4 text-sm uppercase tracking-wider">Giá tối đa</h4>
                  <input 
                    type="range" 
                    min="0" 
                    max="2000000" 
                    step="50000"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
                    className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
                   />
                   <div className="mt-2 font-bold text-primary text-right">
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(priceRange[1])}
                   </div>
                </div>
             </div>

             <div className="p-6 border-t border-gray-100 bg-gray-50">
                <button 
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="w-full py-3.5 bg-primary text-white font-bold rounded-xl shadow-lg shadow-red-500/20"
                >
                  Xem {filteredProducts.length} kết quả
                </button>
             </div>
          </div>
        </div>
      )}
    </main>
  );
};
