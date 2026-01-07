
import React, { useEffect, useState } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { Product, Variant } from '../types';
import { 
  Star, ShieldCheck, Zap, ArrowLeft, Heart, 
  ChevronRight, Check, CheckCircle2, User, MessageCircle,
  Clock, Gift, Globe, Lock, PlayCircle, HelpCircle, ChevronDown, ShoppingCart
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { PRODUCTS as FALLBACK_PRODUCTS } from '../constants';
import { ProductCard } from '../components/ProductCard';
import { slugify } from '../lib/utils';

const { useParams, Link } = ReactRouterDOM;

interface ProductDetailProps {
  addToCart: (product: Product) => void;
}

export const ProductDetail: React.FC<ProductDetailProps> = ({ addToCart }) => {
  const { id: paramSlug } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
  const [mainImageSrc, setMainImageSrc] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'desc' | 'guide'>('desc');

  // Helper function: Fallback image logic
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
      if (!paramSlug) return;
      setLoading(true);
      try {
        let currentProduct: Product | null = null;

        const { data: allProducts, error } = await supabase.from('products').select('*');
        
        if (!error && allProducts) {
            currentProduct = allProducts.find((p: Product) => {
                const pSlug = p.slug || slugify(p.name);
                return pSlug === paramSlug || String(p.id) === paramSlug;
            }) || null;
            
            if (currentProduct) {
                currentProduct = fillImage(currentProduct);
            }
        }

        if (!currentProduct) {
           currentProduct = FALLBACK_PRODUCTS.find(p => {
               const pSlug = slugify(p.name);
               return pSlug === paramSlug || String(p.id) === paramSlug;
           }) || null;
        }

        if (currentProduct) {
             setProduct(currentProduct);
             setMainImageSrc(currentProduct.image || 'https://placehold.co/600x400?text=No+Image');
             document.title = `${currentProduct.name} - AIDAYNE Store`;
             
             if (currentProduct.variants && currentProduct.variants.length > 0) {
                 setSelectedVariant(currentProduct.variants[0]);
             }

             let relatedSource = !error && allProducts ? allProducts : FALLBACK_PRODUCTS;
             const relatedData = relatedSource
                 .filter((p: Product) => p.category === currentProduct!.category && p.id !== currentProduct!.id)
                 .slice(0, 4)
                 .map((p: Product) => fillImage(p));

             if (relatedData.length < 4) {
                 const extra = relatedSource
                    .filter((p: Product) => p.isHot && p.id !== currentProduct!.id && !relatedData.find(r => r.id === p.id))
                    .slice(0, 4 - relatedData.length)
                    .map((p: Product) => fillImage(p));
                 relatedData.push(...extra);
             }
             setRelatedProducts(relatedData);
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
  }, [paramSlug]);

  const handleImageError = () => {
      setMainImageSrc('https://placehold.co/600x400?text=No+Image');
  };

  if (loading) return <div className="min-h-screen pt-32 flex items-center justify-center font-bold text-gray-400">Đang tải sản phẩm...</div>;

  if (!product) return (
      <div className="min-h-screen pt-32 flex flex-col items-center justify-center font-medium text-gray-500">
          <p className="text-xl font-bold mb-4">Không tìm thấy sản phẩm</p>
          <Link to="/products" className="bg-primary text-white px-6 py-2 rounded-xl">Xem tất cả sản phẩm</Link>
      </div>
  );

  const currentPrice = selectedVariant ? selectedVariant.price : product.price;
  const currentOriginalPrice = selectedVariant ? selectedVariant.originalPrice : product.originalPrice;
  const currentDiscount = Math.round(((currentOriginalPrice - currentPrice) / currentOriginalPrice) * 100);

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
    <div className="min-h-screen bg-[#F5F5F7] pb-32 lg:pb-24 font-sans selection:bg-primary selection:text-white">
      
      {/* Ambient Background Glow */}
      <div className="absolute top-0 left-0 right-0 h-[600px] overflow-hidden z-0 pointer-events-none">
          <div className="absolute top-[-20%] left-[20%] w-[60%] h-[100%] bg-blue-400/10 blur-[120px] rounded-full mix-blend-multiply"></div>
          <div className="absolute top-[-10%] right-[10%] w-[40%] h-[80%] bg-purple-400/10 blur-[120px] rounded-full mix-blend-multiply"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 lg:pt-28">
        
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm font-medium text-gray-500 mb-6 lg:mb-8 animate-fade-in overflow-x-auto no-scrollbar whitespace-nowrap">
           <Link to="/" className="hover:text-black transition-colors">Home</Link>
           <ChevronRight size={14} className="shrink-0 text-gray-400" />
           <Link to={`/products?category=${product.category}`} className="hover:text-black transition-colors capitalize">{product.category}</Link>
           <ChevronRight size={14} className="shrink-0 text-gray-400" />
           <span className="text-gray-900 font-semibold">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
           
           {/* LEFT COLUMN: Content (Image, Description, Reviews) */}
           <div className="lg:col-span-7 xl:col-span-8 space-y-8 lg:space-y-10 animate-fade-in-up">
              
              {/* Product Gallery & Hero */}
              <div className="bg-white rounded-[2rem] lg:rounded-[2.5rem] p-3 lg:p-4 shadow-sm border border-gray-100 overflow-hidden group">
                 <div className="relative aspect-[16/10] w-full rounded-[1.5rem] lg:rounded-[2rem] overflow-hidden bg-gray-50">
                    <img 
                      src={mainImageSrc} 
                      alt={product.name} 
                      onError={handleImageError}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                    />
                    {product.isHot && (
                        <div className="absolute top-3 left-3 lg:top-4 lg:left-4 bg-red-600 text-white px-2.5 py-1 lg:px-3 lg:py-1.5 rounded-full text-[10px] lg:text-xs font-bold shadow-lg shadow-red-500/30 flex items-center gap-1">
                            <Zap size={12} fill="currentColor" /> BEST SELLER
                        </div>
                    )}
                 </div>
              </div>

              {/* Mobile-only Header (Title & Price inside content flow for mobile readability) */}
              <div className="lg:hidden block space-y-3">
                   <div className="flex items-center gap-2 mb-1">
                         <span className="px-2 py-0.5 rounded-md bg-gray-100 text-gray-600 text-[10px] font-bold uppercase tracking-wider">{product.category}</span>
                         {product.rating >= 4.5 && (
                            <div className="flex items-center gap-1 text-[10px] font-bold text-yellow-500 bg-yellow-50 px-2 py-0.5 rounded-md">
                                <Star size={10} fill="currentColor" /> {product.rating}
                            </div>
                         )}
                   </div>
                   <h1 className="text-2xl font-extrabold text-gray-900 leading-tight">{product.name}</h1>
                   <div className="flex items-end gap-3">
                       <span className="text-3xl font-extrabold text-gray-900 tracking-tight">
                          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(currentPrice)}
                       </span>
                       <span className="text-base text-gray-400 line-through font-medium mb-1">
                          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(currentOriginalPrice)}
                       </span>
                   </div>
              </div>

              {/* Bento Grid Features */}
              <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4 px-2">Tại sao chọn dịch vụ này?</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 lg:gap-4">
                      <div className="bg-white p-4 lg:p-5 rounded-2xl lg:rounded-3xl border border-gray-100 shadow-sm flex flex-col items-center text-center gap-3 hover:shadow-md transition-shadow">
                          <div className="w-10 h-10 rounded-full bg-blue-50 text-primary flex items-center justify-center">
                              <ShieldCheck size={20} />
                          </div>
                          <div className="text-xs lg:text-sm font-bold text-gray-900">Bảo hành trọn đời</div>
                      </div>
                      <div className="bg-white p-4 lg:p-5 rounded-2xl lg:rounded-3xl border border-gray-100 shadow-sm flex flex-col items-center text-center gap-3 hover:shadow-md transition-shadow">
                          <div className="w-10 h-10 rounded-full bg-green-50 text-green-600 flex items-center justify-center">
                              <Clock size={20} />
                          </div>
                          <div className="text-xs lg:text-sm font-bold text-gray-900">Giao hàng tự động</div>
                      </div>
                      <div className="bg-white p-4 lg:p-5 rounded-2xl lg:rounded-3xl border border-gray-100 shadow-sm flex flex-col items-center text-center gap-3 hover:shadow-md transition-shadow">
                          <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center">
                              <Globe size={20} />
                          </div>
                          <div className="text-xs lg:text-sm font-bold text-gray-900">Không cần VPN</div>
                      </div>
                      <div className="bg-white p-4 lg:p-5 rounded-2xl lg:rounded-3xl border border-gray-100 shadow-sm flex flex-col items-center text-center gap-3 hover:shadow-md transition-shadow">
                          <div className="w-10 h-10 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center">
                              <User size={20} />
                          </div>
                          <div className="text-xs lg:text-sm font-bold text-gray-900">Tài khoản chính chủ</div>
                      </div>
                  </div>
              </div>

              {/* Mobile Variants Selection (Move here for flow) */}
              <div className="lg:hidden">
                 {product.variants && product.variants.length > 0 && (
                        <div className="mb-4">
                           <label className="text-xs font-extrabold text-gray-400 uppercase tracking-widest mb-3 block">Chọn gói dịch vụ</label>
                           <div className="space-y-3">
                              {product.variants.map(v => (
                                 <div 
                                   key={v.id}
                                   onClick={() => setSelectedVariant(v)}
                                   className={`cursor-pointer p-4 rounded-2xl border-2 flex items-center justify-between transition-all relative overflow-hidden group ${selectedVariant?.id === v.id ? 'border-primary bg-blue-50/30' : 'border-gray-100 bg-white hover:border-gray-200'}`}
                                 >
                                    <div className="relative z-10 flex flex-col">
                                        <span className={`font-bold text-sm ${selectedVariant?.id === v.id ? 'text-primary' : 'text-gray-900'}`}>{v.name}</span>
                                        {selectedVariant?.id === v.id && <span className="text-[10px] text-primary font-medium flex items-center gap-1"><Check size={10}/> Đã chọn</span>}
                                    </div>
                                    <span className={`relative z-10 font-bold ${selectedVariant?.id === v.id ? 'text-primary' : 'text-gray-900'}`}>
                                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v.price)}
                                    </span>
                                    {selectedVariant?.id === v.id && (
                                        <div className="absolute inset-0 border-2 border-primary rounded-2xl pointer-events-none"></div>
                                    )}
                                 </div>
                              ))}
                           </div>
                        </div>
                    )}
              </div>

              {/* Detailed Content Tabs */}
              <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
                  <div className="flex border-b border-gray-100">
                      <button 
                        onClick={() => setActiveTab('desc')}
                        className={`flex-1 py-5 text-sm font-bold text-center transition-colors ${activeTab === 'desc' ? 'text-primary bg-gray-50/80 border-b-2 border-primary' : 'text-gray-500 hover:text-gray-900'}`}
                      >
                          Thông tin chi tiết
                      </button>
                      <button 
                         onClick={() => setActiveTab('guide')}
                         className={`flex-1 py-5 text-sm font-bold text-center transition-colors ${activeTab === 'guide' ? 'text-primary bg-gray-50/80 border-b-2 border-primary' : 'text-gray-500 hover:text-gray-900'}`}
                      >
                          Hướng dẫn sử dụng
                      </button>
                  </div>
                  
                  <div className="p-6 lg:p-8">
                      {activeTab === 'desc' ? (
                          <div className="prose prose-gray max-w-none">
                              <p className="text-base lg:text-lg text-gray-600 leading-relaxed font-medium mb-6">{product.description}</p>
                              {product.features && product.features.length > 0 && (
                                <ul className="space-y-3 mb-6 list-none pl-0">
                                   {product.features.map((feature, idx) => (
                                      <li key={idx} className="flex items-start gap-3">
                                         <CheckCircle2 className="text-green-500 mt-1 shrink-0" size={18} />
                                         <span className="text-gray-700">{feature}</span>
                                      </li>
                                   ))}
                                </ul>
                              )}
                              {product.content && <div dangerouslySetInnerHTML={{ __html: product.content }} />}
                          </div>
                      ) : (
                          <div className="space-y-6">
                              {product.activationGuide ? (
                                  <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 whitespace-pre-line text-gray-700 leading-relaxed">
                                      {product.activationGuide}
                                  </div>
                              ) : (
                                  <div className="space-y-4">
                                      <div className="flex gap-4 items-start">
                                         <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm shrink-0">1</div>
                                         <div>
                                            <h4 className="font-bold text-gray-900">Thanh toán đơn hàng</h4>
                                            <p className="text-sm text-gray-500 mt-1">Hoàn tất thanh toán qua QR Code hoặc thẻ ATM.</p>
                                         </div>
                                      </div>
                                      <div className="w-px h-8 bg-gray-200 ml-4"></div>
                                      <div className="flex gap-4 items-start">
                                         <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm shrink-0">2</div>
                                         <div>
                                            <h4 className="font-bold text-gray-900">Nhận thông tin qua Email</h4>
                                            <p className="text-sm text-gray-500 mt-1">Hệ thống tự động gửi tài khoản/key ngay lập tức.</p>
                                         </div>
                                      </div>
                                      <div className="w-px h-8 bg-gray-200 ml-4"></div>
                                      <div className="flex gap-4 items-start">
                                         <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm shrink-0">3</div>
                                         <div>
                                            <h4 className="font-bold text-gray-900">Đăng nhập & Sử dụng</h4>
                                            <p className="text-sm text-gray-500 mt-1">Làm theo hướng dẫn đính kèm để kích hoạt.</p>
                                         </div>
                                      </div>
                                  </div>
                              )}
                              <div className="bg-blue-50 p-4 rounded-xl flex items-center gap-3 text-blue-700 text-sm font-medium">
                                 <HelpCircle size={20} />
                                 Cần hỗ trợ? Liên hệ ngay Zalo: 0374.770.023
                              </div>
                          </div>
                      )}
                  </div>
              </div>

              {/* Reviews */}
              <div>
                 <h3 className="text-2xl font-extrabold text-gray-900 mb-6">Đánh giá từ khách hàng</h3>
                 {product.reviews && product.reviews.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       {product.reviews.map((review) => (
                          <div key={review.id} className="bg-white p-6 rounded-[1.5rem] border border-gray-100 shadow-sm hover:shadow-md transition-all">
                             <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-600 font-bold">
                                   {review.user.charAt(0)}
                                </div>
                                <div>
                                   <div className="font-bold text-gray-900 text-sm">{review.user}</div>
                                   <div className="flex text-yellow-400 text-xs">
                                      {[...Array(5)].map((_, i) => (
                                          <Star key={i} size={12} fill={i < review.rating ? "currentColor" : "none"} stroke="currentColor" />
                                      ))}
                                   </div>
                                </div>
                             </div>
                             <p className="text-gray-600 text-sm line-clamp-3">"{review.comment}"</p>
                             <div className="mt-3 pt-3 border-t border-gray-50 text-xs text-gray-400">
                                {review.date} • {review.purchasedType}
                             </div>
                          </div>
                       ))}
                    </div>
                 ) : (
                    <div className="text-center p-12 bg-white rounded-[2rem] border border-dashed border-gray-200">
                       <MessageCircle className="mx-auto text-gray-300 mb-3" size={40} />
                       <p className="text-gray-500">Chưa có đánh giá nào cho sản phẩm này.</p>
                    </div>
                 )}
              </div>
           </div>

           {/* RIGHT COLUMN: Sticky Sidebar (Purchase Action) - DESKTOP ONLY */}
           <div className="hidden lg:block lg:col-span-5 xl:col-span-4 relative">
              <div className="sticky top-28 space-y-6">
                 
                 {/* Main Purchase Card */}
                 <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] p-6 sm:p-8 shadow-xl shadow-gray-200/50 border border-white/50 relative overflow-hidden animate-fade-in-up" style={{animationDelay: '0.1s'}}>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
                    
                    {/* Header Info */}
                    <div className="mb-6">
                        <div className="flex items-center gap-2 mb-2">
                             <span className="px-2 py-0.5 rounded-md bg-gray-100 text-gray-600 text-[10px] font-bold uppercase tracking-wider">{product.category}</span>
                             {product.rating >= 4.5 && (
                                <div className="flex items-center gap-1 text-[10px] font-bold text-yellow-500 bg-yellow-50 px-2 py-0.5 rounded-md">
                                    <Star size={10} fill="currentColor" /> {product.rating}
                                </div>
                             )}
                        </div>
                        <h1 className="text-2xl font-extrabold text-gray-900 leading-tight mb-4">{product.name}</h1>
                        <div className="flex items-end gap-3">
                           <span className="text-4xl font-extrabold text-gray-900 tracking-tight">
                              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(currentPrice)}
                           </span>
                           <span className="text-lg text-gray-400 line-through font-medium mb-1">
                              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(currentOriginalPrice)}
                           </span>
                        </div>
                        {currentDiscount > 0 && (
                           <div className="mt-2 text-xs font-bold text-green-600 flex items-center gap-1">
                              <span className="bg-green-100 px-2 py-0.5 rounded">Tiết kiệm {currentDiscount}%</span>
                              <span className="text-gray-400 font-medium">so với giá gốc</span>
                           </div>
                        )}
                    </div>

                    <div className="w-full h-px bg-gray-100 mb-6"></div>

                    {/* Variant Selector */}
                    {product.variants && product.variants.length > 0 && (
                        <div className="mb-8">
                           <label className="text-xs font-extrabold text-gray-400 uppercase tracking-widest mb-3 block">Chọn gói dịch vụ</label>
                           <div className="space-y-3">
                              {product.variants.map(v => (
                                 <div 
                                   key={v.id}
                                   onClick={() => setSelectedVariant(v)}
                                   className={`cursor-pointer p-4 rounded-2xl border-2 flex items-center justify-between transition-all relative overflow-hidden group ${selectedVariant?.id === v.id ? 'border-primary bg-blue-50/30' : 'border-gray-100 bg-white hover:border-gray-200'}`}
                                 >
                                    <div className="relative z-10 flex flex-col">
                                        <span className={`font-bold text-sm ${selectedVariant?.id === v.id ? 'text-primary' : 'text-gray-900'}`}>{v.name}</span>
                                        {selectedVariant?.id === v.id && <span className="text-[10px] text-primary font-medium flex items-center gap-1"><Check size={10}/> Đã chọn</span>}
                                    </div>
                                    <span className={`relative z-10 font-bold ${selectedVariant?.id === v.id ? 'text-primary' : 'text-gray-900'}`}>
                                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v.price)}
                                    </span>
                                    {selectedVariant?.id === v.id && (
                                        <div className="absolute inset-0 border-2 border-primary rounded-2xl pointer-events-none"></div>
                                    )}
                                 </div>
                              ))}
                           </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="space-y-3">
                       <button 
                          onClick={handleAddToCart}
                          className="w-full py-4 bg-gray-900 text-white font-bold rounded-2xl text-lg hover:bg-primary transition-all shadow-xl shadow-gray-900/10 hover:shadow-primary/30 flex items-center justify-center gap-2 active:scale-[0.98]"
                       >
                          Thêm vào giỏ hàng
                       </button>
                       <button className="w-full py-4 bg-white text-gray-900 font-bold rounded-2xl text-lg border-2 border-gray-100 hover:border-gray-300 hover:bg-gray-50 transition-all flex items-center justify-center gap-2">
                          <Heart size={20} className={product.isHot ? 'text-red-500 fill-red-500' : 'text-gray-400'} /> Yêu thích
                       </button>
                    </div>

                    {/* Trust Badges */}
                    <div className="mt-6 pt-6 border-t border-gray-100 grid grid-cols-2 gap-4">
                       <div className="flex items-center gap-2 text-xs font-medium text-gray-600">
                          <Zap size={16} className="text-yellow-500" />
                          <span>Giao hàng tự động</span>
                       </div>
                       <div className="flex items-center gap-2 text-xs font-medium text-gray-600">
                          <Lock size={16} className="text-green-500" />
                          <span>Thanh toán bảo mật</span>
                       </div>
                       <div className="flex items-center gap-2 text-xs font-medium text-gray-600">
                          <CheckCircle2 size={16} className="text-blue-500" />
                          <span>Bảo hành uy tín</span>
                       </div>
                       <div className="flex items-center gap-2 text-xs font-medium text-gray-600">
                          <MessageCircle size={16} className="text-purple-500" />
                          <span>Hỗ trợ 24/7</span>
                       </div>
                    </div>
                 </div>

                 {/* Help Card */}
                 <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex items-start gap-4">
                     <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-primary shrink-0">
                        <PlayCircle size={20} />
                     </div>
                     <div>
                        <h4 className="font-bold text-gray-900 text-sm">Bạn cần tư vấn?</h4>
                        <p className="text-xs text-gray-500 mt-1 mb-2">Chat ngay với đội ngũ hỗ trợ để được giải đáp mọi thắc mắc.</p>
                        <a href="https://zalo.me/0374770023" target="_blank" rel="noreferrer" className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
                           Chat Zalo ngay <ChevronRight size={12} />
                        </a>
                     </div>
                 </div>

              </div>
           </div>
        </div>

        {/* RELATED PRODUCTS */}
        {relatedProducts.length > 0 && (
           <div className="mt-24 max-w-7xl mx-auto">
              <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-extrabold text-gray-900">Sản phẩm tương tự</h2>
                  <Link to="/products" className="text-sm font-bold text-primary hover:underline">Xem tất cả</Link>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
                 {relatedProducts.map(p => (
                    <ProductCard key={p.id} product={p} onAddToCart={addToCart} />
                 ))}
              </div>
           </div>
        )}
      </div>

      {/* MOBILE STICKY BOTTOM BAR (New Feature for Mobile Optimization) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 p-3 bg-white border-t border-gray-100 shadow-[0_-5px_20px_rgba(0,0,0,0.05)] z-40 safe-area-bottom">
         <div className="flex gap-3 items-center">
             <div className="flex flex-col">
                 <span className="text-[10px] text-gray-500 font-bold uppercase">Tổng thanh toán</span>
                 <div className="flex items-baseline gap-2">
                     <span className="text-xl font-extrabold text-gray-900">
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(currentPrice)}
                     </span>
                     {currentDiscount > 0 && (
                        <span className="text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-bold">-{currentDiscount}%</span>
                     )}
                 </div>
             </div>
             <button 
                onClick={handleAddToCart}
                className="flex-1 py-3 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/30 active:scale-95 transition-transform flex items-center justify-center gap-2"
             >
                <ShoppingCart size={18} fill="currentColor" /> Mua ngay
             </button>
         </div>
      </div>
    </div>
  );
};
