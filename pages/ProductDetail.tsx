
import React, { useEffect, useState } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { Product, Variant, Review } from '../types';
import { 
  Star, ArrowLeft, Share2, ShoppingCart, 
  CheckCircle, ChevronRight, ShieldCheck, Zap, Info, 
  ChevronDown, ChevronUp, Check, Home, Search,
  BookOpen, MessageSquare, List, User
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { PRODUCTS as FALLBACK_PRODUCTS } from '../constants';
import { MobileProductCard } from '../components/mobile/MobileProductCard';
import { ProductCard } from '../components/ProductCard'; // Import for Desktop
import { slugify } from '../lib/utils';
import { SEO } from '../components/SEO';

const { useParams, Link, useNavigate } = ReactRouterDOM;

interface ProductDetailProps {
  addToCart: (product: Product) => void;
}

export const ProductDetail: React.FC<ProductDetailProps> = ({ addToCart }) => {
  const { id: paramSlug } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // Data State
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
  const [loading, setLoading] = useState(true);
  
  // UI State
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDescExpanded, setIsDescExpanded] = useState(false);
  // Removed activeTab state as we are moving to scroll layout

  // Fetch Data Logic
  const fetchProduct = async () => {
      setLoading(true);
      try {
        const { data: allProducts, error } = await supabase.from('products').select('*');
        let currentProduct: Product | null = null;

        if (!error && allProducts) {
            currentProduct = allProducts.find((p: Product) => {
                const pSlug = p.slug || slugify(p.name);
                return pSlug === paramSlug || String(p.id) === paramSlug;
            }) || null;
        }

        if (!currentProduct) {
           currentProduct = FALLBACK_PRODUCTS.find(p => {
               const pSlug = slugify(p.name);
               return pSlug === paramSlug || String(p.id) === paramSlug;
           }) || null;
        }

        if (currentProduct) {
             if (!currentProduct.image) {
                 const fallback = FALLBACK_PRODUCTS.find(fp => String(fp.id) === String(currentProduct!.id));
                 currentProduct.image = fallback?.image || 'https://placehold.co/600x600?text=No+Image';
             }

             // Nếu không có features trong DB, thử lấy từ fallback hoặc tạo giả
             if (!currentProduct.features || currentProduct.features.length === 0) {
                 const fallback = FALLBACK_PRODUCTS.find(fp => String(fp.id) === String(currentProduct!.id));
                 currentProduct.features = fallback?.features || [
                     'Bảo hành trọn đời sản phẩm',
                     'Hỗ trợ nâng cấp chính chủ',
                     'Kích hoạt nhanh trong 5 phút',
                     'Hỗ trợ đa nền tảng (PC, Mobile)'
                 ];
             }

             // Nếu không có reviews, tạo giả
             if (!currentProduct.reviews || currentProduct.reviews.length === 0) {
                 const fallback = FALLBACK_PRODUCTS.find(fp => String(fp.id) === String(currentProduct!.id));
                 currentProduct.reviews = fallback?.reviews || [];
             }

             setProduct(currentProduct);
             
             if (currentProduct.variants && currentProduct.variants.length > 0) {
                 setSelectedVariant(currentProduct.variants[0]);
             }

             const source = !error && allProducts ? allProducts : FALLBACK_PRODUCTS;
             const related = source
                 .filter((p: Product) => p.category === currentProduct!.category && p.id !== currentProduct!.id)
                 .slice(0, 6)
                 .map((p: Product) => !p.image ? {...p, image: 'https://placehold.co/400?text=No+Img'} : p);
             setRelatedProducts(related);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchProduct();
  }, [paramSlug]);

  useEffect(() => {
    const handleScroll = () => {
        setIsScrolled(window.scrollY > 50); // Tăng ngưỡng scroll để hiệu ứng mượt hơn
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleAddToCart = () => {
      if (!product) return;
      const price = selectedVariant ? selectedVariant.price : product.price;
      const originalPrice = selectedVariant ? selectedVariant.originalPrice : product.originalPrice;
      const name = selectedVariant ? `${product.name} (${selectedVariant.name})` : product.name;

      addToCart({
          ...product,
          price,
          originalPrice,
          name
      });
  };

  const copyToClipboard = () => {
      navigator.clipboard.writeText(window.location.href);
      alert('Đã sao chép liên kết!');
  };

  if (loading) return <div className="min-h-screen bg-white flex items-center justify-center"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>;

  if (!product) return <div className="min-h-screen flex items-center justify-center flex-col gap-4"><span>Không tìm thấy sản phẩm</span><Link to="/" className="text-primary font-bold">Về trang chủ</Link></div>;

  const currentPrice = selectedVariant ? selectedVariant.price : product.price;
  const currentOriginalPrice = selectedVariant ? selectedVariant.originalPrice : product.originalPrice;
  const discountPercent = Math.round(((currentOriginalPrice - currentPrice) / currentOriginalPrice) * 100);

  return (
    <div className="min-h-screen bg-[#F5F5F7] font-sans selection:bg-primary selection:text-white">
      <SEO title={product.name} description={product.description} image={product.image} />

      {/* --- MOBILE LAYOUT --- */}
      <div className="lg:hidden pb-32"> 
          
          {/* 1. Dynamic Glass Navbar (Mobile) */}
          <div 
            className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ease-in-out ${
                isScrolled 
                ? 'bg-white/90 backdrop-blur-xl shadow-sm border-b border-gray-200/50 py-2' 
                : 'bg-transparent py-4'
            }`}
          >
             <div className="px-4 flex items-center justify-between gap-4">
                 {/* Back Button */}
                 <button 
                    onClick={() => navigate(-1)} 
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                        isScrolled 
                        ? 'bg-transparent text-gray-800 hover:bg-gray-100' 
                        : 'bg-white/90 backdrop-blur-md shadow-lg text-gray-800 border border-white/50'
                    }`}
                 >
                    <ArrowLeft size={20} />
                 </button>

                 {/* Title (Fade In on Scroll) */}
                 <div 
                    className={`flex-1 text-center transition-all duration-300 transform ${
                        isScrolled 
                        ? 'opacity-100 translate-y-0 scale-100' 
                        : 'opacity-0 translate-y-2 scale-95 pointer-events-none'
                    }`}
                 >
                    <h1 className="font-bold text-gray-900 text-sm truncate px-2">{product.name}</h1>
                 </div>

                 {/* Action Buttons */}
                 <div className="flex gap-3">
                    <button 
                        onClick={() => navigate('/')}
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                            isScrolled 
                            ? 'bg-transparent text-gray-800 hover:bg-gray-100' 
                            : 'bg-white/90 backdrop-blur-md shadow-lg text-gray-800 border border-white/50'
                        }`}
                    >
                        <Home size={20} />
                    </button>
                    <button 
                        onClick={copyToClipboard}
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                            isScrolled 
                            ? 'bg-transparent text-gray-800 hover:bg-gray-100' 
                            : 'bg-white/90 backdrop-blur-md shadow-lg text-gray-800 border border-white/50'
                        }`}
                    >
                        <Share2 size={20} />
                    </button>
                 </div>
             </div>
          </div>

          {/* 2. Product Image Area */}
          <div className="bg-white w-full pt-24 pb-8 rounded-b-[2.5rem] shadow-sm mb-4 overflow-hidden relative">
              <div className="aspect-square w-full relative max-w-md mx-auto px-8">
                  <img 
                    src={product.image} 
                    alt={product.name} 
                    className="w-full h-full object-contain filter drop-shadow-xl"
                  />
                  {discountPercent > 0 && (
                      <div className="absolute bottom-0 left-8 bg-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-lg flex items-center gap-1 animate-pulse-slow">
                          <Zap size={12} fill="currentColor" /> Giảm {discountPercent}%
                      </div>
                  )}
              </div>
          </div>

          {/* 3. Main Info */}
          <div className="px-4 space-y-4">
              
              {/* Title & Price Card */}
              <div className="bg-white p-5 rounded-[1.5rem] shadow-sm">
                  <div className="flex items-start justify-between mb-2">
                      <span className="text-[10px] font-extrabold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full uppercase tracking-wider">
                          {product.category}
                      </span>
                      <div className="flex items-center gap-1 text-yellow-500 font-bold text-xs">
                          <Star size={14} fill="currentColor" /> {product.rating} ({product.reviews?.length || 0} đánh giá)
                      </div>
                  </div>
                  
                  <h1 className="text-xl font-black text-gray-900 mb-3 leading-snug">
                      {product.name}
                  </h1>

                  <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-black text-primary">
                          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(currentPrice)}
                      </span>
                      {discountPercent > 0 && (
                          <span className="text-sm text-gray-400 line-through font-medium">
                              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(currentOriginalPrice)}
                          </span>
                      )}
                  </div>
              </div>

              {/* Variants Selector */}
              {product.variants && product.variants.length > 0 && (
                  <div className="bg-white p-5 rounded-[1.5rem] shadow-sm">
                      <h3 className="text-xs font-extrabold text-gray-400 uppercase tracking-widest mb-3">Chọn gói dịch vụ</h3>
                      <div className="flex flex-wrap gap-2">
                          {product.variants.map((v) => {
                              const isActive = selectedVariant?.id === v.id;
                              return (
                                  <button
                                      key={v.id}
                                      onClick={() => setSelectedVariant(v)}
                                      className={`
                                          flex-grow px-4 py-3 rounded-xl border-2 text-sm font-bold transition-all relative overflow-hidden
                                          ${isActive 
                                              ? 'border-primary bg-primary/5 text-primary' 
                                              : 'border-gray-100 bg-gray-50 text-gray-600'
                                          }
                                      `}
                                  >
                                      <div className="flex justify-between items-center w-full gap-2">
                                          <span>{v.name}</span>
                                          {isActive && <CheckCircle size={16} fill="currentColor" />}
                                      </div>
                                  </button>
                              )
                          })}
                      </div>
                  </div>
              )}

              {/* Tính năng nổi bật */}
              {product.features && product.features.length > 0 && (
                  <div className="bg-white p-5 rounded-[1.5rem] shadow-sm">
                      <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                          <CheckCircle size={18} className="text-green-500" /> Tính năng nổi bật
                      </h3>
                      <div className="space-y-3">
                          {product.features.map((feature, idx) => (
                              <div key={idx} className="flex items-start gap-3">
                                  <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center shrink-0 mt-0.5">
                                      <Check size={12} className="text-green-600" strokeWidth={3} />
                                  </div>
                                  <span className="text-sm font-medium text-gray-700 leading-snug">{feature}</span>
                              </div>
                          ))}
                      </div>
                  </div>
              )}

              {/* BLOCK 1: MÔ TẢ */}
              <div className="bg-white p-5 rounded-[1.5rem] shadow-sm">
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <Info size={18} className="text-blue-500" /> Mô tả chi tiết
                  </h3>
                  <div className={`text-sm text-gray-600 leading-relaxed overflow-hidden transition-all ${isDescExpanded ? 'max-h-full' : 'max-h-[200px]'}`}>
                      <p className="whitespace-pre-line">{product.description}</p>
                      {product.content && <div className="mt-4 pt-4 border-t border-gray-100 prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: product.content }} />}
                  </div>
                  <button 
                      onClick={() => setIsDescExpanded(!isDescExpanded)}
                      className="w-full mt-3 py-2 text-xs font-bold text-primary bg-primary/5 rounded-lg flex items-center justify-center gap-1"
                  >
                      {isDescExpanded ? 'Thu gọn' : 'Xem thêm'} 
                      {isDescExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>
              </div>

              {/* BLOCK 2: HƯỚNG DẪN */}
              <div className="bg-white p-5 rounded-[1.5rem] shadow-sm">
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <BookOpen size={18} className="text-orange-500" /> Hướng dẫn sử dụng
                  </h3>
                  
                  <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex gap-3 mb-4">
                      <Info size={20} className="text-blue-600 shrink-0 mt-0.5" />
                      <p className="text-xs text-blue-800 font-medium leading-relaxed">
                          Sau khi thanh toán thành công, thông tin tài khoản hoặc Key kích hoạt sẽ được gửi tự động qua Email của bạn trong vòng 30 giây.
                      </p>
                  </div>
                  
                  <div className="text-sm text-gray-700 leading-relaxed">
                      {product.activationGuide ? (
                          <div className="markdown-body whitespace-pre-line">{product.activationGuide}</div>
                      ) : (
                          <div className="text-center text-gray-400 py-2 italic text-xs">
                              Hệ thống sẽ gửi hướng dẫn chi tiết qua email.
                          </div>
                      )}
                  </div>
              </div>

              {/* BLOCK 3: ĐÁNH GIÁ */}
              <div className="bg-white p-5 rounded-[1.5rem] shadow-sm">
                  <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
                      <MessageSquare size={18} className="text-purple-500" /> Đánh giá khách hàng
                  </h3>

                  <div className="flex items-center gap-4 mb-6">
                      <div className="text-center">
                          <div className="text-4xl font-black text-gray-900">{product.rating}</div>
                          <div className="flex items-center gap-0.5 text-yellow-400 justify-center my-1">
                              {[1,2,3,4,5].map(s => <Star key={s} size={12} fill={s <= Math.round(product.rating) ? "currentColor" : "none"} />)}
                          </div>
                          <div className="text-xs text-gray-400 font-bold">{product.reviews?.length || 0} lượt</div>
                      </div>
                      <div className="flex-1 space-y-1">
                          {[5,4,3,2,1].map(star => (
                              <div key={star} className="flex items-center gap-2 text-[10px] font-bold text-gray-500">
                                  <span className="w-2">{star}</span>
                                  <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                      <div className="h-full bg-yellow-400 rounded-full" style={{ width: star === 5 ? '80%' : star === 4 ? '15%' : '5%' }}></div>
                                  </div>
                              </div>
                          ))}
                      </div>
                  </div>

                  <div className="space-y-4">
                      {product.reviews && product.reviews.length > 0 ? (
                          product.reviews.map((review) => (
                              <div key={review.id} className="pb-4 border-b border-gray-50 last:border-0 last:pb-0">
                                  <div className="flex items-center justify-between mb-2">
                                      <div className="flex items-center gap-2">
                                          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 text-xs font-bold">
                                              {review.avatar ? <img src={review.avatar} className="w-full h-full rounded-full object-cover"/> : <User size={14}/>}
                                          </div>
                                          <div>
                                              <div className="text-xs font-bold text-gray-900">{review.user}</div>
                                              <div className="flex items-center gap-1 text-[10px] text-yellow-500">
                                                  {[...Array(5)].map((_, i) => <Star key={i} size={8} fill={i < review.rating ? "currentColor" : "none"} stroke={i < review.rating ? "none" : "currentColor"} />)}
                                              </div>
                                          </div>
                                      </div>
                                      <span className="text-[10px] text-gray-400">{review.date}</span>
                                  </div>
                                  {review.purchasedType && (
                                      <div className="inline-block px-2 py-0.5 bg-gray-50 text-gray-500 text-[10px] rounded font-medium mb-2">
                                          Đã mua: {review.purchasedType}
                                      </div>
                                  )}
                                  <p className="text-xs text-gray-600 leading-relaxed">{review.comment}</p>
                              </div>
                          ))
                      ) : (
                          <div className="text-center py-6">
                              <p className="text-gray-400 text-sm italic">Chưa có đánh giá nào.</p>
                          </div>
                      )}
                  </div>
              </div>

              {/* Related */}
              {relatedProducts.length > 0 && (
                  <div>
                      <h3 className="font-bold text-gray-900 mb-3 px-2">Có thể bạn thích</h3>
                      <div className="flex overflow-x-auto gap-3 pb-4 no-scrollbar -mx-4 px-4 snap-x snap-mandatory">
                          {relatedProducts.map(p => (
                              <MobileProductCard key={p.id} product={p} onAddToCart={addToCart} />
                          ))}
                      </div>
                  </div>
              )}
          </div>

          {/* 4. Fixed Bottom Action (Mobile) */}
          <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 pb-[env(safe-area-inset-bottom)]">
              <div className="p-3 flex items-center gap-3">
                  <div className="flex flex-col pl-2">
                      <span className="text-[10px] text-gray-500 font-bold">Tổng tiền</span>
                      <span className="text-lg font-black text-red-600 leading-none">
                          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(currentPrice)}
                      </span>
                  </div>
                  <div className="flex-1 flex gap-2 justify-end">
                      <button 
                          onClick={handleAddToCart}
                          className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-gray-900 active:scale-95 transition-transform"
                      >
                          <ShoppingCart size={24} />
                      </button>
                      <button 
                          onClick={() => { handleAddToCart(); navigate('/checkout'); }}
                          className="flex-1 bg-primary text-white font-bold rounded-xl text-base shadow-lg shadow-primary/20 active:scale-95 transition-transform"
                      >
                          Mua ngay
                      </button>
                  </div>
              </div>
          </div>
      </div>

      {/* --- DESKTOP LAYOUT (HIDDEN ON MOBILE) --- */}
      <div className="hidden lg:block pt-32 pb-20 max-w-7xl mx-auto px-8">
          <div className="grid grid-cols-2 gap-12">
              {/* Left: Image */}
              <div className="sticky top-32 self-start">
                  <div className="bg-white rounded-[2.5rem] p-12 shadow-sm border border-gray-100 aspect-square flex items-center justify-center relative overflow-hidden group">
                      <img src={product.image} className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105" />
                      {discountPercent > 0 && (
                          <div className="absolute top-6 left-6 bg-red-600 text-white font-bold px-4 py-2 rounded-xl shadow-lg">
                              -{discountPercent}%
                          </div>
                      )}
                  </div>
              </div>

              {/* Right: Info */}
              <div className="space-y-8">
                  <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-gray-100">
                      <div className="flex items-center gap-3 mb-4">
                          <span className="px-4 py-1.5 rounded-full bg-gray-100 text-gray-600 font-bold text-sm uppercase">{product.category}</span>
                          <div className="flex items-center gap-1 text-yellow-500 font-bold">
                              <Star size={16} fill="currentColor" /> {product.rating}
                          </div>
                      </div>
                      <h1 className="text-4xl font-black text-gray-900 mb-6 leading-tight">{product.name}</h1>
                      <div className="flex items-end gap-4 mb-8">
                          <span className="text-5xl font-black text-primary">
                              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(currentPrice)}
                          </span>
                          <span className="text-xl text-gray-400 line-through font-medium mb-1">
                              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(currentOriginalPrice)}
                          </span>
                      </div>

                      {product.variants && (
                          <div className="mb-8">
                              <label className="block text-sm font-bold text-gray-400 uppercase mb-3">Chọn gói dịch vụ</label>
                              <div className="flex flex-wrap gap-3">
                                  {product.variants.map(v => (
                                      <button
                                          key={v.id}
                                          onClick={() => setSelectedVariant(v)}
                                          className={`px-6 py-3 rounded-xl border-2 font-bold transition-all ${selectedVariant?.id === v.id ? 'border-primary bg-primary/5 text-primary' : 'border-gray-200 hover:border-gray-300'}`}
                                      >
                                          {v.name}
                                      </button>
                                  ))}
                              </div>
                          </div>
                      )}

                      <div className="flex gap-4">
                          <button onClick={handleAddToCart} className="flex-1 py-4 bg-primary text-white font-bold rounded-2xl shadow-xl shadow-primary/20 hover:bg-primary-hover hover:-translate-y-1 transition-all">
                              Thêm vào giỏ hàng
                          </button>
                          <button className="px-6 rounded-2xl border-2 border-gray-200 text-gray-600 hover:border-gray-300 transition-all">
                              <Share2 size={24} />
                          </button>
                      </div>
                  </div>

                  {/* Desktop Features Block */}
                  {product.features && product.features.length > 0 && (
                      <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-gray-100">
                          <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                              <CheckCircle size={20} className="text-green-500" /> Tính năng nổi bật
                          </h3>
                          <div className="grid grid-cols-2 gap-4">
                              {product.features.map((feature, idx) => (
                                  <div key={idx} className="flex items-start gap-3">
                                      <Check size={16} className="text-green-600 mt-1 shrink-0" strokeWidth={3} />
                                      <span className="text-gray-700 font-medium">{feature}</span>
                                  </div>
                              ))}
                          </div>
                      </div>
                  )}

                  {/* Desktop Description Block */}
                  <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-gray-100">
                      <h3 className="text-2xl font-bold mb-6 flex items-center gap-2"><Info size={24} className="text-blue-600"/> Mô tả chi tiết</h3>
                      <div className="prose prose-lg text-gray-600">
                          <p className="whitespace-pre-line">{product.description}</p>
                          {product.content && <div className="mt-4 pt-4 border-t border-gray-100" dangerouslySetInnerHTML={{ __html: product.content }} />}
                      </div>
                  </div>

                  {/* Desktop Guide Block */}
                  <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-gray-100">
                      <h3 className="text-2xl font-bold mb-6 flex items-center gap-2"><BookOpen size={24} className="text-orange-600"/> Hướng dẫn sử dụng</h3>
                      <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 flex items-center gap-4 mb-6">
                          <Info size={24} className="text-blue-600" />
                          <span className="text-blue-800 font-medium">Hệ thống gửi hướng dẫn tự động qua Email ngay sau khi thanh toán.</span>
                      </div>
                      <div className="prose prose-lg text-gray-600 whitespace-pre-line">
                          {product.activationGuide || "Đang cập nhật nội dung..."}
                      </div>
                  </div>

                  {/* Desktop Reviews Block */}
                  <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-gray-100">
                      <h3 className="text-2xl font-bold mb-6 flex items-center gap-2"><MessageSquare size={24} className="text-purple-600"/> Đánh giá ({product.reviews?.length || 0})</h3>
                      <div className="space-y-6">
                          {product.reviews && product.reviews.length > 0 ? (
                              product.reviews.map((review) => (
                                  <div key={review.id} className="border-b border-gray-100 last:border-0 pb-6 last:pb-0">
                                      <div className="flex items-center gap-3 mb-2">
                                          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-500">
                                              {review.user.charAt(0)}
                                          </div>
                                          <div>
                                              <div className="font-bold text-gray-900">{review.user}</div>
                                              <div className="flex items-center gap-1 text-yellow-400">
                                                  {[...Array(5)].map((_, i) => <Star key={i} size={12} fill={i < review.rating ? "currentColor" : "none"} stroke={i < review.rating ? "none" : "currentColor"} />)}
                                              </div>
                                          </div>
                                          <div className="ml-auto text-sm text-gray-400">{review.date}</div>
                                      </div>
                                      <p className="text-gray-600">{review.comment}</p>
                                  </div>
                              ))
                          ) : (
                              <div className="text-center text-gray-400 italic">Chưa có đánh giá nào.</div>
                          )}
                      </div>
                  </div>
              </div>
          </div>

          {/* Related Desktop - Full Width Below Main Content */}
          {relatedProducts.length > 0 && (
              <div className="mt-20 border-t border-gray-200 pt-16">
                  <h3 className="text-3xl font-extrabold text-gray-900 mb-10">Sản phẩm tương tự</h3>
                  <div className="grid grid-cols-4 gap-8">
                      {relatedProducts.slice(0,4).map(p => (
                          <ProductCard key={p.id} product={p} onAddToCart={addToCart} />
                      ))}
                  </div>
              </div>
          )}
      </div>

    </div>
  );
};
