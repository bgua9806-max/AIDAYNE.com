
import React, { useEffect, useState } from 'react';
import { Hero } from '../components/Hero';
import { CategoryBar } from '../components/CategoryBar';
import { ProductCard } from '../components/ProductCard';
import { MobileProductCard } from '../components/mobile/MobileProductCard';
import { FlashSale } from '../components/FlashSale';
import { PRODUCTS as FALLBACK_PRODUCTS } from '../constants';
import { Product } from '../types';
import { ArrowRight } from 'lucide-react';
import * as ReactRouterDOM from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { SEO } from '../components/SEO';

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
          // Merge logic
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
  
  // Logic lọc sản phẩm
  const hotCandidates = products.filter(p => p.isHot || p.rating >= 4.9);
  const hotProducts = Array.from(new Map<string, Product>(hotCandidates.map((item) => [item.id, item])).values()).slice(0, 10);
  
  const newProducts = products.filter(p => p.isNew || (typeof p.id === 'string' && parseInt(p.id) > 8));

  const homeSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "AIDAYNE.com",
    "url": window.location.origin,
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${window.location.origin}/products?q={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <main className="min-h-screen bg-[#F2F2F7] pb-24">
      <SEO 
        title="AIDAYNE.com - Bản Quyền Phần Mềm & AI Tools Giá Rẻ" 
        description="Mua bản quyền ChatGPT Plus, Netflix, Youtube Premium, Adobe, Windows, Office giá rẻ, bảo hành trọn đời. Uy tín, giao hàng tự động 24/7."
        schema={homeSchema}
      />
      <Hero />
      <CategoryBar />
      
      {/* Flash Sale Section */}
      <FlashSale addToCart={addToCart} />

      {/* Best Sellers Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12 lg:mb-20">
        <div className="flex items-end justify-between mb-4 lg:mb-8">
          <div>
            <h2 className="text-xl sm:text-3xl font-bold text-gray-900 tracking-tight">Sản phẩm nổi bật</h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-1 lg:mt-2 font-medium">Được cộng đồng tin dùng nhiều nhất</p>
          </div>
          
          <Link to="/products?sort=default" className="flex items-center gap-1 text-sm font-bold text-primary hover:text-primary-hover transition-colors ml-2">
              <span className="hidden sm:inline">Xem tất cả</span> <ArrowRight size={16} />
          </Link>
        </div>
        
        {/* DESKTOP GRID */}
        {loading ? (
             <div className="hidden lg:grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 lg:gap-6">
               {[1,2,3,4,5].map(i => (
                 <div key={i} className="h-[350px] bg-gray-200 rounded-3xl animate-pulse"></div>
               ))}
             </div>
        ) : (
             <div className="hidden lg:grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 lg:gap-6">
                  {hotProducts.map((product) => (
                    <ProductCard key={`hot-${product.id}`} product={product} onAddToCart={addToCart} />
                  ))}
             </div>
        )}

        {/* MOBILE HORIZONTAL SNAP CAROUSEL */}
        <div className="lg:hidden flex overflow-x-auto snap-x snap-mandatory gap-4 pb-4 no-scrollbar -mx-4 px-4">
            {loading ? (
                [1,2,3].map(i => <div key={i} className="flex-shrink-0 w-[160px] h-[240px] bg-gray-200 rounded-[1.5rem] animate-pulse snap-center"></div>)
            ) : hotProducts.map((product) => (
                <MobileProductCard key={`mob-hot-${product.id}`} product={product} onAddToCart={addToCart} />
            ))}
        </div>
      </section>

      {/* Promo Banner */}
      <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 mb-12 lg:mb-20">
        <div className="relative rounded-[2rem] lg:rounded-[2.5rem] overflow-hidden bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-xl shadow-red-500/20">
           <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
           <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-black/10 rounded-full blur-3xl pointer-events-none"></div>
           
           <div className="relative z-10 p-6 md:p-16 flex flex-row items-center justify-between gap-4 md:gap-10">
             <div className="flex-1 max-w-xl text-left">
               <span className="inline-block bg-white/20 backdrop-blur-md px-3 py-1 lg:px-4 lg:py-1.5 rounded-full text-[10px] lg:text-xs font-bold mb-3 lg:mb-6 border border-white/20 uppercase tracking-wide">
                  Tháng Vàng Ưu Đãi
               </span>
               <h3 className="text-xl md:text-5xl font-extrabold mb-2 lg:mb-6 leading-tight">
                  Adobe Creative <br className="hidden md:block"/> Cloud
               </h3>
               <p className="text-red-100 mb-4 lg:mb-8 text-xs md:text-lg font-medium max-w-[200px] md:max-w-full">
                  Giảm tới <span className="text-white font-bold text-lg md:text-2xl">70%</span> trọn bộ bản quyền.
               </p>
               <Link to="/products?category=design" className="inline-flex items-center gap-1 bg-white text-red-600 px-4 py-2 lg:px-10 lg:py-4 rounded-full font-bold text-xs lg:text-base hover:bg-gray-50 transition-colors shadow-lg hover:scale-105 transform duration-200">
                  Khám phá <span className="hidden sm:inline">ngay</span>
               </Link>
             </div>
             <div className="relative flex-shrink-0">
               <img 
                  src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/Creative_Cloud.svg/2101px-Creative_Cloud.svg.png" 
                  alt="Adobe" 
                  className="w-24 h-24 md:w-72 md:h-72 object-contain relative z-10 drop-shadow-2xl animate-pulse-slow" 
               />
             </div>
           </div>
        </div>
      </section>

      {/* New Arrivals Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-4 lg:mb-8">
           <div>
            <h2 className="text-xl sm:text-3xl font-bold text-gray-900 tracking-tight">Mới cập nhật</h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-1 lg:mt-2 font-medium">Công nghệ mới nhất thị trường</p>
          </div>
          <Link to="/products?sort=newest" className="flex items-center gap-1 text-sm font-bold text-primary hover:text-primary-hover transition-colors">
            <span className="hidden sm:inline">Xem tất cả</span> <ArrowRight size={16} />
          </Link>
        </div>
        
        {/* DESKTOP GRID */}
        {loading ? (
           <div className="hidden lg:grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 lg:gap-6">
              {[1,2,3,4,5].map(i => <div key={i} className="h-[350px] bg-gray-200 rounded-3xl animate-pulse"></div>)}
           </div>
        ) : (
          <div className="hidden lg:grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 lg:gap-6">
            {newProducts.map((product) => (
              <ProductCard key={`new-${product.id}`} product={product} onAddToCart={addToCart} />
            ))}
          </div>
        )}

        {/* MOBILE HORIZONTAL SNAP CAROUSEL */}
        <div className="lg:hidden flex overflow-x-auto snap-x snap-mandatory gap-4 pb-4 no-scrollbar -mx-4 px-4">
            {loading ? (
                [1,2,3].map(i => <div key={i} className="flex-shrink-0 w-[160px] h-[240px] bg-gray-200 rounded-[1.5rem] animate-pulse snap-center"></div>)
            ) : newProducts.map((product) => (
                <MobileProductCard key={`mob-new-${product.id}`} product={product} onAddToCart={addToCart} />
            ))}
        </div>
      </section>
    </main>
  );
}
