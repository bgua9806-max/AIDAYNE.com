import React, { useEffect, useState } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { Product, Variant } from '../types';
import { 
  Star, ShieldCheck, Zap, ArrowLeft, Heart, 
  ChevronRight
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { PRODUCTS as FALLBACK_PRODUCTS } from '../constants';
import { ProductCard } from '../components/ProductCard';

const { useParams, Link } = ReactRouterDOM;

interface ProductDetailProps {
  addToCart: (product: Product) => void;
}

export const ProductDetail: React.FC<ProductDetailProps> = ({ addToCart }) => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
  const [activeTab, setActiveTab] = useState<'info' | 'features' | 'reviews'>('info');
  const [mainImageSrc, setMainImageSrc] = useState<string>('');

  const fillImage = (p: Product) => {
      if (!p.image || p.image.trim() === '') {
          const fallback = FALLBACK_PRODUCTS.find(fp => fp.id === p.id);
          return fallback ? { ...p, image: fallback.image } : { ...p, image: 'https://placehold.co/600x400?text=No+Image' };
      }
      return p;
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchProductAndRelated = async () => {
      if (!id) return;
      setLoading(true);
      try {
        // 1. Fetch Main Product
        const { data: dbData, error } = await supabase.from('products').select('*').eq('id', id).single();
        let currentProduct: Product | null = null;

        if (!error && dbData) {
           currentProduct = fillImage(dbData);
        } else {
           const found = FALLBACK_PRODUCTS.find(p => p.id === id);
           if (found) {
               currentProduct = found;
           }
        }

        if (currentProduct) {
             setProduct(currentProduct);
             setMainImageSrc(currentProduct.image || 'https://placehold.co/600x400?text=No+Image');
             
             if (currentProduct.variants && currentProduct.variants.length > 0) {
                 setSelectedVariant(currentProduct.variants[0]);
             }

             // 2. Fetch Related Products from DB
             const { data: relatedData } = await supabase
                 .from('products')
                 .select('*')
                 .eq('category', currentProduct.category)
                 .neq('id', currentProduct.id)
                 .limit(4);
             
             if (relatedData && relatedData.length > 0) {
                 const filledRelated = relatedData.map(fillImage);
                 setRelatedProducts(filledRelated);
             } else {
                 // Fallback to constants if DB returns empty related
                 const fallbackRelated = FALLBACK_PRODUCTS
                     .filter(p => p.category === currentProduct!.category && p.id !== currentProduct!.id)
                     .slice(0, 4);
                 setRelatedProducts(fallbackRelated);
             }
        } else {
             setProduct(null);
        }

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProductAndRelated();
  }, [id]);

  const handleImageError = () => {
      setMainImageSrc('https://placehold.co/600x400?text=No+Image');
  };

  if (loading) return <div className="min-h-screen pt-32 flex items-center justify-center font-medium text-gray-500">Loading...</div>;

  if (!product) return null;

  const currentPrice = selectedVariant ? selectedVariant.price : product.price;
  const currentOriginalPrice = selectedVariant ? selectedVariant.originalPrice : product.originalPrice;

  const handleAddToCart = () => {
      const productToAdd = {
          ...product,
          price: currentPrice,
          originalPrice: currentOriginalPrice,
          name: selectedVariant ? `${product.name} (${selectedVariant.name})` : product.name
      };
      addToCart(productToAdd);
  };

  return (
    <div className="min-h-screen bg-[#F5F5F7] pt-24 pb-20">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm font-medium text-gray-500 mb-8">
           <Link to="/" className="hover:text-black transition-colors">Home</Link>
           <ChevronRight size={14} />
           <Link to={`/products?category=${product.category}`} className="hover:text-black transition-colors capitalize">{product.category}</Link>
           <ChevronRight size={14} />
           <span className="text-black">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
           
           {/* LEFT: Sticky Image */}
           <div className="lg:col-span-7">
              <div className="sticky top-32 space-y-6">
                 <div className="aspect-[4/3] rounded-[2.5rem] overflow-hidden bg-white shadow-soft border border-gray-100">
                    <img 
                      src={mainImageSrc} 
                      alt={product.name} 
                      onError={handleImageError}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" 
                    />
                 </div>
                 
                 {/* Features Grid */}
                 <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white p-5 rounded-3xl border border-gray-100 flex items-start gap-3 shadow-sm">
                       <div className="w-10 h-10 rounded-full bg-blue-50 text-primary flex items-center justify-center shrink-0">
                          <ShieldCheck size={20} />
                       </div>
                       <div>
                          <h4 className="font-bold text-gray-900 text-sm">Bảo hành trọn đời</h4>
                          <p className="text-xs text-gray-500 mt-1">Lỗi 1 đổi 1 ngay lập tức</p>
                       </div>
                    </div>
                    <div className="bg-white p-5 rounded-3xl border border-gray-100 flex items-start gap-3 shadow-sm">
                       <div className="w-10 h-10 rounded-full bg-green-50 text-green-600 flex items-center justify-center shrink-0">
                          <Zap size={20} />
                       </div>
                       <div>
                          <h4 className="font-bold text-gray-900 text-sm">Giao hàng tự động</h4>
                          <p className="text-xs text-gray-500 mt-1">Nhận ngay sau 5s</p>
                       </div>
                    </div>
                 </div>
              </div>
           </div>

           {/* RIGHT: Info */}
           <div className="lg:col-span-5">
              <div className="space-y-8">
                 <div>
                    <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 tracking-tight leading-tight mb-4">{product.name}</h1>
                    <div className="flex items-center gap-4">
                       <div className="flex items-center gap-1 text-yellow-500">
                          {[1,2,3,4,5].map(s => <Star key={s} size={16} fill="currentColor" />)}
                       </div>
                       <span className="text-sm font-medium text-gray-500">{product.sold} đã bán</span>
                    </div>
                 </div>

                 <div className="bg-white/60 backdrop-blur-md rounded-3xl p-6 border border-gray-200">
                    <p className="text-gray-600 leading-relaxed font-medium">{product.description}</p>
                 </div>

                 {/* Variants */}
                 {product.variants && product.variants.length > 0 && (
                    <div>
                       <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 block">Chọn gói</label>
                       <div className="space-y-3">
                          {product.variants.map(v => (
                             <div 
                               key={v.id}
                               onClick={() => setSelectedVariant(v)}
                               className={`cursor-pointer p-4 rounded-2xl border-2 flex items-center justify-between transition-all ${selectedVariant?.id === v.id ? 'border-primary bg-blue-50/50' : 'border-gray-200 bg-white hover:border-gray-300'}`}
                             >
                                <span className={`font-bold ${selectedVariant?.id === v.id ? 'text-primary' : 'text-gray-900'}`}>{v.name}</span>
                                <span className="font-bold text-gray-900">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v.price)}</span>
                             </div>
                          ))}
                       </div>
                    </div>
                 )}

                 {/* Price & Action */}
                 <div className="pt-6 border-t border-gray-200">
                    <div className="flex items-baseline gap-3 mb-6">
                       <span className="text-4xl font-extrabold text-gray-900 tracking-tight">
                          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(currentPrice)}
                       </span>
                       <span className="text-lg text-gray-400 line-through font-medium">
                          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(currentOriginalPrice)}
                       </span>
                    </div>

                    <div className="flex gap-4">
                       <button 
                          onClick={handleAddToCart}
                          className="flex-1 bg-primary text-white h-14 rounded-full font-bold text-lg hover:bg-primary-hover shadow-lg shadow-blue-500/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
                       >
                          Thêm vào giỏ
                       </button>
                       <button className="h-14 w-14 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-red-50 hover:text-red-500 transition-colors">
                          <Heart size={24} />
                       </button>
                    </div>
                 </div>

                 {/* Content Tabs */}
                 <div className="pt-8">
                     <div className="flex gap-6 border-b border-gray-200 mb-6">
                        {['info', 'features', 'reviews'].map((tab) => (
                           <button 
                              key={tab}
                              onClick={() => setActiveTab(tab as any)}
                              className={`pb-3 text-sm font-bold capitalize transition-colors border-b-2 ${activeTab === tab ? 'text-black border-black' : 'text-gray-400 border-transparent hover:text-gray-600'}`}
                           >
                              {tab === 'info' ? 'Chi tiết' : tab === 'features' ? 'Hướng dẫn' : 'Đánh giá'}
                           </button>
                        ))}
                     </div>
                     <div className="text-gray-600 leading-relaxed text-sm">
                        {activeTab === 'info' && <p>Nội dung chi tiết về {product.name}...</p>}
                        {activeTab === 'features' && <p>{product.activationGuide || 'Hướng dẫn sẽ được gửi kèm email.'}</p>}
                        {activeTab === 'reviews' && <p>Chưa có đánh giá nào.</p>}
                     </div>
                 </div>
              </div>
           </div>
        </div>

        {/* RELATED PRODUCTS SECTION */}
        {relatedProducts.length > 0 && (
           <div className="mt-24 border-t border-gray-200 pt-16">
              <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-8 tracking-tight">Có thể bạn cũng thích</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                 {relatedProducts.map(p => (
                    <ProductCard key={p.id} product={p} onAddToCart={addToCart} />
                 ))}
              </div>
           </div>
        )}
      </div>
    </div>
  );
};