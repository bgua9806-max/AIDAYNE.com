
import React, { useEffect, useState } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { Product, Variant } from '../types';
import { 
  Star, ShieldCheck, Zap, ArrowLeft, Heart, 
  ChevronRight, Check, CheckCircle2, User, MessageCircle
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
  const [mainImageSrc, setMainImageSrc] = useState<string>('');

  // Helper function: An toàn xử lý ảnh fallback
  const fillImage = (p: Product) => {
      if (!p.image || (typeof p.image === 'string' && p.image.trim() === '')) {
          const fallback = FALLBACK_PRODUCTS.find(fp => String(fp.id) === String(p.id));
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
           const found = FALLBACK_PRODUCTS.find(p => String(p.id) === String(id));
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
             const { data: relatedData, error: relatedError } = await supabase
                 .from('products')
                 .select('*')
                 .eq('category', currentProduct.category)
                 .neq('id', currentProduct.id)
                 .limit(4);
             
             if (!relatedError) {
                 if (relatedData && relatedData.length > 0) {
                     const filledRelated = relatedData.map(fillImage);
                     setRelatedProducts(filledRelated);
                 } else {
                     const { data: hotDb } = await supabase
                        .from('products')
                        .select('*')
                        .eq('isHot', true)
                        .neq('id', currentProduct.id)
                        .limit(4);
                     
                     if (hotDb) {
                         setRelatedProducts(hotDb.map(fillImage));
                     } else {
                         setRelatedProducts([]);
                     }
                 }
             } else {
                 const fallbackRelated = FALLBACK_PRODUCTS
                     .filter(p => p.category === currentProduct!.category && String(p.id) !== String(currentProduct!.id))
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

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
           
           {/* LEFT: Sticky Image & Trust Badges */}
           <div className="lg:col-span-7 sticky top-32">
              <div className="space-y-6">
                 <div className="aspect-[4/3] rounded-[2.5rem] overflow-hidden bg-white shadow-soft border border-gray-100 group relative">
                    <img 
                      src={mainImageSrc} 
                      alt={product.name} 
                      onError={handleImageError}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                    />
                    {product.isHot && (
                        <div className="absolute top-6 left-6 bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg shadow-red-500/30">
                            HOT SELLER
                        </div>
                    )}
                 </div>
                 
                 {/* Features Grid */}
                 <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white p-5 rounded-3xl border border-gray-100 flex items-start gap-3 shadow-sm hover:shadow-md transition-shadow">
                       <div className="w-10 h-10 rounded-full bg-blue-50 text-primary flex items-center justify-center shrink-0">
                          <ShieldCheck size={20} />
                       </div>
                       <div>
                          <h4 className="font-bold text-gray-900 text-sm">Bảo hành trọn đời</h4>
                          <p className="text-xs text-gray-500 mt-1">Lỗi 1 đổi 1 ngay lập tức</p>
                       </div>
                    </div>
                    <div className="bg-white p-5 rounded-3xl border border-gray-100 flex items-start gap-3 shadow-sm hover:shadow-md transition-shadow">
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

           {/* RIGHT: Content Scroll */}
           <div className="lg:col-span-5 flex flex-col gap-10">
              
              {/* 1. Main Info Block */}
              <div className="space-y-6">
                 <div>
                    <h1 className="text-3xl lg:text-5xl font-extrabold text-gray-900 tracking-tight leading-tight mb-4">{product.name}</h1>
                    <div className="flex items-center gap-4">
                       <div className="flex items-center gap-0.5 text-yellow-500">
                          {[1,2,3,4,5].map(s => <Star key={s} size={16} fill="currentColor" className="drop-shadow-sm" />)}
                       </div>
                       <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                       <span className="text-sm font-bold text-gray-500">{product.sold} đã bán</span>
                       <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                       <span className="text-sm font-bold text-green-600">Còn hàng</span>
                    </div>
                 </div>

                 {/* Price & Action */}
                 <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm">
                    <div className="flex items-baseline gap-3 mb-6">
                       <span className="text-4xl font-extrabold text-gray-900 tracking-tight">
                          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(currentPrice)}
                       </span>
                       <span className="text-lg text-gray-400 line-through font-medium">
                          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(currentOriginalPrice)}
                       </span>
                       {product.discount > 0 && (
                          <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-1 rounded-lg">-{product.discount}%</span>
                       )}
                    </div>

                    {/* Variants */}
                    {product.variants && product.variants.length > 0 && (
                        <div className="mb-6">
                           <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 block">Chọn gói</label>
                           <div className="space-y-3">
                              {product.variants.map(v => (
                                 <div 
                                   key={v.id}
                                   onClick={() => setSelectedVariant(v)}
                                   className={`cursor-pointer p-4 rounded-2xl border-2 flex items-center justify-between transition-all group ${selectedVariant?.id === v.id ? 'border-primary bg-blue-50/50' : 'border-gray-100 bg-gray-50 hover:border-gray-300 hover:bg-white'}`}
                                 >
                                    <span className={`font-bold transition-colors ${selectedVariant?.id === v.id ? 'text-primary' : 'text-gray-700 group-hover:text-black'}`}>{v.name}</span>
                                    <span className="font-bold text-gray-900">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v.price)}</span>
                                 </div>
                              ))}
                           </div>
                        </div>
                    )}

                    <div className="flex gap-4">
                       <button 
                          onClick={handleAddToCart}
                          className="flex-1 bg-gray-900 text-white h-14 rounded-2xl font-bold text-lg hover:bg-black shadow-xl shadow-gray-200 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
                       >
                          Thêm vào giỏ
                       </button>
                       <button className="h-14 w-14 rounded-2xl bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 hover:border-red-100 transition-colors">
                          <Heart size={24} />
                       </button>
                    </div>
                 </div>
              </div>

              {/* SEPARATOR */}
              <div className="h-px bg-gray-200 w-full"></div>

              {/* 2. Description Section */}
              <div className="animate-fade-in-up">
                  <h3 className="text-xl font-extrabold text-gray-900 mb-4 flex items-center gap-2">
                     Thông tin chi tiết
                  </h3>
                  <div className="text-gray-600 text-lg leading-relaxed space-y-4 font-medium">
                     <p>{product.description}</p>
                     
                     {product.features && product.features.length > 0 && (
                        <ul className="grid grid-cols-1 gap-3 mt-4">
                           {product.features.map((feature, idx) => (
                              <li key={idx} className="flex items-start gap-3">
                                 <CheckCircle2 className="text-green-500 mt-1 shrink-0" size={18} />
                                 <span className="text-gray-700">{feature}</span>
                              </li>
                           ))}
                        </ul>
                     )}
                     
                     {/* Render rich content if available */}
                     {product.content && (
                        <div className="mt-4 prose prose-gray max-w-none" dangerouslySetInnerHTML={{ __html: product.content }} />
                     )}
                  </div>
              </div>

              {/* 3. Activation Guide Section */}
              {(product.activationGuide || product.category) && (
                  <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm relative overflow-hidden">
                     <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-[4rem] -mr-8 -mt-8"></div>
                     <h3 className="text-xl font-extrabold text-gray-900 mb-6 relative z-10 flex items-center gap-2">
                        <Zap size={20} className="text-yellow-500" /> Hướng dẫn sử dụng
                     </h3>
                     
                     <div className="relative z-10">
                        {product.activationGuide ? (
                           <p className="text-gray-600 leading-relaxed whitespace-pre-line">{product.activationGuide}</p>
                        ) : (
                           <div className="space-y-4">
                              <div className="flex gap-4">
                                 <span className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-500 text-sm shrink-0">1</span>
                                 <p className="text-gray-600 mt-1">Sau khi thanh toán, hệ thống sẽ gửi tài khoản/key qua email của bạn.</p>
                              </div>
                              <div className="flex gap-4">
                                 <span className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-500 text-sm shrink-0">2</span>
                                 <p className="text-gray-600 mt-1">Đăng nhập vào trang chủ dịch vụ (ví dụ: netflix.com, spotify.com...).</p>
                              </div>
                              <div className="flex gap-4">
                                 <span className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-500 text-sm shrink-0">3</span>
                                 <p className="text-gray-600 mt-1">Nhập thông tin tài khoản được cấp và bắt đầu sử dụng.</p>
                              </div>
                           </div>
                        )}
                     </div>
                  </div>
              )}

              {/* 4. Reviews Section */}
              <div>
                 <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-extrabold text-gray-900 flex items-center gap-2">
                       Đánh giá từ khách hàng
                       <span className="text-sm font-normal text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{product.reviews?.length || 0}</span>
                    </h3>
                    {/* Placeholder for "Write Review" button */}
                 </div>

                 {product.reviews && product.reviews.length > 0 ? (
                    <div className="space-y-4">
                       {product.reviews.map((review) => (
                          <div key={review.id} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                             <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-3">
                                   <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center text-primary font-bold">
                                      {review.user.charAt(0)}
                                   </div>
                                   <div>
                                      <div className="font-bold text-gray-900 text-sm">{review.user}</div>
                                      <div className="text-xs text-gray-400">{review.date} • {review.purchasedType}</div>
                                   </div>
                                </div>
                                <div className="flex text-yellow-400">
                                   {[...Array(5)].map((_, i) => (
                                      <Star key={i} size={14} fill={i < review.rating ? "currentColor" : "none"} stroke={i < review.rating ? "none" : "currentColor"} className="text-gray-300" />
                                   ))}
                                </div>
                             </div>
                             <p className="text-gray-600 text-sm leading-relaxed">
                                {review.comment}
                             </p>
                          </div>
                       ))}
                    </div>
                 ) : (
                    <div className="text-center p-10 bg-white rounded-3xl border border-dashed border-gray-200">
                       <MessageCircle className="mx-auto text-gray-300 mb-3" size={32} />
                       <p className="text-gray-500 font-medium">Chưa có đánh giá nào.</p>
                       <p className="text-sm text-gray-400 mt-1">Hãy là người đầu tiên trải nghiệm sản phẩm này!</p>
                    </div>
                 )}
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
