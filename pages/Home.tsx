
import React, { useEffect, useState } from 'react';
import { Hero } from '../components/Hero';
import { CategoryBar } from '../components/CategoryBar';
import { ProductCard } from '../components/ProductCard';
import { FlashSale } from '../components/FlashSale';
import { PRODUCTS as FALLBACK_PRODUCTS } from '../constants';
import { Product } from '../types';
import { ArrowRight } from 'lucide-react';
import * as ReactRouterDOM from 'react-router-dom';
import { supabase } from '../lib/supabase';

const { Link } = ReactRouterDOM;

interface HomeProps {
  addToCart: (product: Product) => void;
}

export const Home: React.FC<HomeProps> = ({ addToCart }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch products from Supabase
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*');
        
        if (error) throw error;
        
        if (data && data.length > 0) {
          // Merge logic: If DB product has no image, try to find in FALLBACK_PRODUCTS using Safe ID comparison
          // Explicitly cast data to any[] to avoid 'unknown' type issues during mapping
          const enhancedData = (data as any[]).map((p: Product) => {
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
      } catch (error) {
        console.error('Error fetching products:', error);
        setProducts(FALLBACK_PRODUCTS);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);
  
  // Logic lọc sản phẩm (Fix Duplicate Logic)
  // Lấy tất cả sản phẩm HOT hoặc Rating cao
  const hotCandidates = products.filter(p => p.isHot || p.rating >= 4.9);
  // Loại bỏ trùng lặp dựa trên ID và giới hạn 10 sản phẩm
  // Explicitly type Map to <string, Product> to ensure values() returns Product iterator
  const hotProducts = Array.from(new Map<string, Product>(hotCandidates.map((item) => [item.id, item])).values()).slice(0, 10);
  
  const newProducts = products.filter(p => p.isNew || (typeof p.id === 'string' && parseInt(p.id) > 8));

  return (
    <main className="min-h-screen bg-[#F2F2F7] pb-24">
      <Hero />
      <CategoryBar />
      
      {/* Flash Sale Section */}
      <FlashSale addToCart={addToCart} />

      {/* Best Sellers Section - GRID LAYOUT */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">Sản phẩm nổi bật</h2>
            <p className="text-sm text-gray-500 mt-2 font-medium">Được cộng đồng tin dùng nhiều nhất tuần qua</p>
          </div>
          
          <Link to="/products?sort=default" className="hidden sm:flex items-center gap-1 text-sm font-bold text-primary hover:text-primary-hover transition-colors ml-2">
              Xem tất cả <ArrowRight size={16} />
          </Link>
        </div>
        
        {/* Grid Container instead of Scroll */}
        {loading ? (
             <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
               {[1,2,3,4,5].map(i => (
                 <div key={i} className="h-[350px] bg-gray-200 rounded-3xl animate-pulse"></div>
               ))}
             </div>
        ) : (
             <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                  {hotProducts.map((product) => (
                    <ProductCard key={`hot-${product.id}`} product={product} onAddToCart={addToCart} />
                  ))}
             </div>
        )}

         <Link to="/products?sort=default" className="sm:hidden flex justify-center w-full mt-8 py-3 text-sm font-bold text-gray-600 bg-white rounded-xl border border-gray-200 shadow-sm">
            Xem tất cả sản phẩm
          </Link>
      </section>

      {/* Promo Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
        <div className="relative rounded-[2.5rem] overflow-hidden bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-xl shadow-red-500/20">
           {/* Abstract shapes */}
           <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
           <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-black/10 rounded-full blur-3xl"></div>
           
           <div className="relative z-10 p-8 md:p-16 flex flex-col md:flex-row items-center justify-between gap-10">
             <div className="max-w-xl text-center md:text-left">
               <span className="inline-block bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-bold mb-6 border border-white/20 uppercase tracking-wide">Tháng Vàng Ưu Đãi</span>
               <h3 className="text-3xl md:text-5xl font-extrabold mb-6 leading-tight">Adobe Creative Cloud <br/> Giảm tới 70%</h3>
               <p className="text-red-100 mb-8 text-lg font-medium">Sở hữu trọn bộ Photoshop, AI, Premiere... bản quyền chính hãng chỉ với 150k/tháng.</p>
               <Link to="/products?category=design" className="inline-block bg-white text-red-600 px-10 py-4 rounded-full font-bold hover:bg-gray-50 transition-colors shadow-lg hover:scale-105 transform duration-200">Khám phá ngay</Link>
             </div>
             <div className="relative">
               <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/Creative_Cloud.svg/2101px-Creative_Cloud.svg.png" alt="Adobe" className="w-48 h-48 md:w-72 md:h-72 object-contain relative z-10 drop-shadow-2xl animate-pulse-slow" style={{animationDuration: '3s'}} />
             </div>
           </div>
        </div>
      </section>

      {/* New Arrivals Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
           <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">Mới cập nhật</h2>
            <p className="text-sm text-gray-500 mt-2 font-medium">Công nghệ và giải pháp mới nhất thị trường</p>
          </div>
          <Link to="/products?sort=newest" className="hidden sm:flex items-center gap-1 text-sm font-bold text-primary hover:text-primary-hover transition-colors">
            Xem tất cả <ArrowRight size={16} />
          </Link>
        </div>
        
        {loading ? (
           <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {[1,2,3,4,5].map(i => <div key={i} className="h-[350px] bg-gray-200 rounded-3xl animate-pulse"></div>)}
           </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {newProducts.map((product) => (
              <ProductCard key={`new-${product.id}`} product={product} onAddToCart={addToCart} />
            ))}
          </div>
        )}
        
         <Link to="/products?sort=newest" className="sm:hidden flex justify-center w-full mt-8 py-3 text-sm font-bold text-gray-600 bg-white rounded-xl border border-gray-200">
            Xem tất cả
          </Link>
      </section>
    </main>
  );
}
