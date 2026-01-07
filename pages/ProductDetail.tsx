
import React, { useEffect, useState } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { Product, Variant, Review } from '../types';
import { 
  Star, ShieldCheck, Zap, ArrowLeft, Heart, 
  ChevronRight, Check, CheckCircle2, User, MessageCircle,
  Clock, Gift, Globe, Lock, PlayCircle, HelpCircle, ChevronDown, ShoppingCart, Sparkles, Share2, ArrowRight, Facebook, Copy, Terminal, FileText, Info, Edit3, LayoutList
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { PRODUCTS as FALLBACK_PRODUCTS } from '../constants';
import { ProductCard } from '../components/ProductCard';
import { slugify } from '../lib/utils';
import { SEO } from '../components/SEO';

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
  
  // Review Form State
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewForm, setReviewForm] = useState({ name: '', rating: 5, comment: '' });
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // Helper function: Fallback image logic
  const fillImage = (p: Product) => {
      if (!p.image || (typeof p.image === 'string' && p.image.trim() === '')) {
          const fallback = FALLBACK_PRODUCTS.find(fp => String(fp.id) === String(p.id));
          return fallback ? { ...p, image: fallback.image } : { ...p, image: 'https://placehold.co/600x400?text=No+Image' };
      }
      return p;
  };

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
             // Document Title handled by SEO component now
             
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

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchProductAndRelated();
  }, [paramSlug]);

  const handleImageError = () => {
      setMainImageSrc('https://placehold.co/600x400?text=No+Image');
  };

  const renderFormattedText = (text: string) => {
    if (!text) return null;
    const paragraphs = text.split('\n');
    return (
      <div className="space-y-4">
        {paragraphs.map((line, index) => {
          const trimmedLine = line.trim();
          if (!trimmedLine) return <br key={index} className="hidden md:block" />;
          if (trimmedLine.startsWith('-') || trimmedLine.startsWith('+') || trimmedLine.startsWith('*')) {
             return (
               <div key={index} className="flex items-start gap-3 pl-2">
                  <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary shrink-0"></div>
                  <span className="text-gray-700 leading-relaxed font-medium">{trimmedLine.substring(1).trim()}</span>
               </div>
             );
          }
          if (trimmedLine.endsWith(':') || (trimmedLine === trimmedLine.toUpperCase() && trimmedLine.length < 50)) {
              return <h4 key={index} className="font-bold text-gray-900 text-lg mt-4 mb-2">{trimmedLine}</h4>;
          }
          return <p key={index} className="text-gray-600 leading-7 text-[15px]">{trimmedLine}</p>;
        })}
      </div>
    );
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!product) return;
      setIsSubmittingReview(true);

      try {
          const newReview: Review = {
              id: Math.random().toString(36).substr(2, 9),
              user: reviewForm.name,
              rating: reviewForm.rating,
              comment: reviewForm.comment,
              date: new Date().toLocaleDateString('vi-VN'),
              purchasedType: selectedVariant ? selectedVariant.name : 'Gói mặc định'
          };

          const currentReviews = product.reviews || [];
          const updatedReviews = [newReview, ...currentReviews];
          
          // Calculate new average rating
          const totalStars = updatedReviews.reduce((sum, r) => sum + (Number(r.rating) || 0), 0);
          const newRating = Number((totalStars / updatedReviews.length).toFixed(1));

          const { error } = await supabase
              .from('products')
              .update({ 
                  reviews: updatedReviews,
                  rating: newRating 
              })
              .eq('id', product.id);

          if (error) throw error;

          // Optimistic Update
          setProduct({ 
              ...product, 
              reviews: updatedReviews,
              rating: newRating
          });
          
          setShowReviewForm(false);
          setReviewForm({ name: '', rating: 5, comment: '' });
          alert('Cảm ơn bạn đã đánh giá!');
      } catch (err: any) {
          alert('Lỗi khi gửi đánh giá: ' + err.message);
      } finally {
          setIsSubmittingReview(false);
      }
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

  // Generate Product Schema for Rich Snippets
  const productSchema = {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": product.name,
    "image": product.image,
    "description": product.description,
    "brand": {
      "@type": "Brand",
      "name": product.developer || "AIDAYNE"
    },
    "sku": product.id,
    "offers": {
      "@type": "Offer",
      "url": window.location.href,
      "priceCurrency": "VND",
      "price": currentPrice,
      "priceValidUntil": "2025-12-31",
      "availability": "https://schema.org/InStock",
      "itemCondition": "https://schema.org/NewCondition"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": product.rating,
      "reviewCount": (product.reviews?.length || 0) + 10 // Mock base + real
    },
    "review": product.reviews?.map(r => ({
        "@type": "Review",
        "author": { "@type": "Person", "name": r.user },
        "datePublished": r.date.split('/').reverse().join('-'),
        "reviewBody": r.comment,
        "reviewRating": { "@type": "Rating", "ratingValue": r.rating }
    }))
  };

  return (
    <div className="min-h-screen bg-[#F5F5F7] pb-32 lg:pb-24 font-sans selection:bg-primary selection:text-white">
      
      <SEO 
        title={`${product.name} - Giá Rẻ, Uy Tín, Bảo Hành Trọn Đời`}
        description={`Mua ${product.name} bản quyền giá chỉ ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(currentPrice)}. ${product.description}`}
        image={product.image}
        type="product"
        schema={productSchema}
      />

      {/* Premium Ambient Background */}
      <div className="absolute top-0 left-0 right-0 h-[800px] overflow-hidden z-0 pointer-events-none">
          <div className="absolute top-[-20%] left-[10%] w-[70%] h-[100%] bg-blue-500/5 blur-[120px] rounded-full mix-blend-multiply"></div>
          <div className="absolute top-[-10%] right-[10%] w-[50%] h-[80%] bg-purple-500/5 blur-[120px] rounded-full mix-blend-multiply"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 lg:pt-32">
        
        {/* Modern Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm font-medium text-gray-400 mb-8 animate-fade-in overflow-x-auto no-scrollbar whitespace-nowrap">
           <Link to="/" className="hover:text-black transition-colors">Home</Link>
           <ChevronRight size={12} className="shrink-0 text-gray-300" />
           <Link to={`/products?category=${product.category}`} className="hover:text-black transition-colors capitalize">{product.category}</Link>
           <ChevronRight size={12} className="shrink-0 text-gray-300" />
           <span className="text-gray-900 font-semibold">{product.name}</span>
        </nav>

        {/* TOP SECTION: GRID LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start mb-16">
           
           {/* LEFT COLUMN: Main Visuals & Features */}
           <div className="lg:col-span-7 xl:col-span-8 space-y-8 animate-fade-in-up">
              
              {/* === THE NEW PREMIUM IMAGE STAGE === */}
              {/* Using aspect-[4/3] or [16/10] for container, but containing the image properly to avoid cutting */}
              <div className="relative w-full aspect-[4/3] lg:aspect-[16/10] rounded-[2.5rem] overflow-hidden bg-white shadow-2xl border border-gray-100/50 group">
                 
                 {/* 1. Ambient Background Layer (Blurred & Zoomed) */}
                 <div className="absolute inset-0 z-0 overflow-hidden">
                     {/* Solid soft gradient base */}
                     <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-white opacity-100"></div>
                     {/* Dynamic blurred color extracted from image context (simulated here with the image itself) */}
                     <div 
                        className="absolute inset-0 opacity-20 blur-[80px] scale-150 transform transition-transform duration-[2s] group-hover:scale-125" 
                        style={{ 
                            backgroundImage: `url(${mainImageSrc})`, 
                            backgroundPosition: 'center', 
                            backgroundSize: 'cover' 
                        }}
                     ></div>
                 </div>

                 {/* 2. Main Image - Floating in Center (Object Contain - NO CROPPING) */}
                 <div className="absolute inset-0 z-10 flex items-center justify-center p-8 lg:p-16">
                    <img 
                      src={mainImageSrc} 
                      alt={product.name} 
                      onError={handleImageError}
                      className="w-full h-full object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.15)] transition-transform duration-700 ease-out group-hover:scale-105 group-hover:-translate-y-2" 
                    />
                 </div>

                 {/* 3. Badges Overlay */}
                 <div className="absolute top-6 left-6 z-20 flex flex-col gap-2">
                      {product.isHot && (
                         <div className="bg-white/90 backdrop-blur-md text-red-600 px-4 py-2 rounded-full text-xs font-black shadow-lg shadow-red-500/10 flex items-center gap-1.5 border border-red-50 ring-1 ring-red-100 uppercase tracking-wide">
                             <Zap size={14} fill="currentColor" /> BEST SELLER
                         </div>
                      )}
                      {product.discount > 0 && (
                          <div className="bg-white/90 backdrop-blur-md text-green-600 px-4 py-2 rounded-full text-xs font-black shadow-lg shadow-green-500/10 border border-green-50 ring-1 ring-green-100">
                              GIẢM {currentDiscount}%
                          </div>
                      )}
                 </div>

                 {/* 4. Action Overlay */}
                 <button className="absolute bottom-6 right-6 z-20 p-4 bg-white/80 backdrop-blur-xl rounded-full shadow-xl text-gray-400 hover:text-red-500 hover:bg-white transition-all hover:scale-110 active:scale-95 border border-white/50 group/heart">
                     <Heart size={24} className="group-hover/heart:fill-red-500 transition-colors" />
                 </button>
              </div>

              {/* Mobile Header Info (Only visible on small screens) */}
              <div className="lg:hidden block space-y-4 px-1">
                   <h1 className="text-3xl font-extrabold text-gray-900 leading-tight tracking-tight">{product.name}</h1>
                   <div className="flex items-center gap-3">
                         <span className="px-3 py-1 rounded-lg bg-gray-100 text-gray-600 text-xs font-bold uppercase tracking-wider border border-gray-200">{product.category}</span>
                         {product.rating >= 4.5 && (
                            <div className="flex items-center gap-1 text-xs font-bold text-yellow-600 bg-yellow-100/50 px-2.5 py-1 rounded-lg border border-yellow-100">
                                <Star size={12} fill="currentColor" /> {product.rating}
                            </div>
                         )}
                   </div>
                   <div className="flex items-end gap-3 mt-2">
                       <span className="text-4xl font-extrabold text-gray-900 tracking-tighter">
                          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(currentPrice)}
                       </span>
                       <span className="text-lg text-gray-400 line-through font-medium mb-1.5">
                          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(currentOriginalPrice)}
                       </span>
                   </div>
              </div>

              {/* Bento Grid Features */}
              <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-5 px-2 flex items-center gap-2">
                      <Sparkles size={18} className="text-primary" /> 
                      Đặc quyền VIP
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-white p-5 rounded-[1.5rem] border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex flex-col items-center text-center gap-3 hover:border-blue-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group cursor-default">
                          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                              <ShieldCheck size={24} strokeWidth={1.5} />
                          </div>
                          <div>
                             <div className="text-sm font-bold text-gray-900">Bảo hành trọn đời</div>
                             <div className="text-[10px] text-gray-500 mt-1 font-medium">1 đổi 1 nếu lỗi</div>
                          </div>
                      </div>
                      <div className="bg-white p-5 rounded-[1.5rem] border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex flex-col items-center text-center gap-3 hover:border-green-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group cursor-default">
                          <div className="w-12 h-12 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                              <Clock size={24} strokeWidth={1.5} />
                          </div>
                          <div>
                             <div className="text-sm font-bold text-gray-900">Giao tự động</div>
                             <div className="text-[10px] text-gray-500 mt-1 font-medium">Nhận ngay 24/7</div>
                          </div>
                      </div>
                      <div className="bg-white p-5 rounded-[1.5rem] border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex flex-col items-center text-center gap-3 hover:border-purple-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group cursor-default">
                          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                              <Globe size={24} strokeWidth={1.5} />
                          </div>
                          <div>
                             <div className="text-sm font-bold text-gray-900">Global Access</div>
                             <div className="text-[10px] text-gray-500 mt-1 font-medium">Không cần VPN</div>
                          </div>
                      </div>
                      <div className="bg-white p-5 rounded-[1.5rem] border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex flex-col items-center text-center gap-3 hover:border-orange-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group cursor-default">
                          <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                              <User size={24} strokeWidth={1.5} />
                          </div>
                          <div>
                             <div className="text-sm font-bold text-gray-900">Riêng tư 100%</div>
                             <div className="text-[10px] text-gray-500 mt-1 font-medium">Tài khoản chính chủ</div>
                          </div>
                      </div>
                  </div>
              </div>

              {/* Mobile Variants Selection */}
              <div className="lg:hidden">
                 {product.variants && product.variants.length > 0 && (
                        <div className="mb-4">
                           <label className="text-xs font-extrabold text-gray-400 uppercase tracking-widest mb-3 block">Chọn gói dịch vụ</label>
                           <div className="space-y-3">
                              {product.variants.map(v => (
                                 <div 
                                   key={v.id}
                                   onClick={() => setSelectedVariant(v)}
                                   className={`cursor-pointer p-4 rounded-2xl border-2 flex items-center justify-between transition-all relative overflow-hidden group ${selectedVariant?.id === v.id ? 'border-primary bg-blue-50/20' : 'border-gray-100 bg-white hover:border-gray-200'}`}
                                 >
                                    <div className="relative z-10 flex flex-col">
                                        <span className={`font-bold text-sm ${selectedVariant?.id === v.id ? 'text-primary' : 'text-gray-900'}`}>{v.name}</span>
                                        {selectedVariant?.id === v.id && <span className="text-[10px] text-primary font-medium flex items-center gap-1"><Check size={10}/> Đã chọn</span>}
                                    </div>
                                    <span className={`relative z-10 font-bold ${selectedVariant?.id === v.id ? 'text-primary' : 'text-gray-900'}`}>
                                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v.price)}
                                    </span>
                                 </div>
                              ))}
                           </div>
                        </div>
                    )}
              </div>
           </div>

           {/* RIGHT COLUMN: Sticky Sidebar (Desktop) */}
           <div className="hidden lg:block lg:col-span-5 xl:col-span-4 relative">
              <div className="sticky top-28 space-y-6">
                 
                 {/* Purchase Card */}
                 <div className="bg-white rounded-[2.5rem] p-8 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.08)] border border-gray-100 relative overflow-hidden animate-fade-in-up" style={{animationDelay: '0.1s'}}>
                    
                    {/* Header Info */}
                    <div className="mb-8">
                        <div className="flex items-center gap-2 mb-3">
                             <span className="px-2.5 py-1 rounded-lg bg-gray-100 text-gray-600 text-[10px] font-bold uppercase tracking-wider border border-gray-200">{product.category}</span>
                             {product.rating >= 4.5 && (
                                <div className="flex items-center gap-1 text-[10px] font-bold text-yellow-600 bg-yellow-100/50 px-2.5 py-1 rounded-lg border border-yellow-100">
                                    <Star size={10} fill="currentColor" /> {product.rating}
                                </div>
                             )}
                        </div>
                        <h1 className="text-3xl font-extrabold text-gray-900 leading-tight mb-4 tracking-tight">{product.name}</h1>
                        <div className="flex items-end gap-3">
                           <span className="text-5xl font-extrabold text-gray-900 tracking-tighter">
                              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(currentPrice)}
                           </span>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                             <span className="text-lg text-gray-400 line-through font-medium decoration-2">
                                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(currentOriginalPrice)}
                             </span>
                             {currentDiscount > 0 && (
                                <span className="text-xs font-bold text-white bg-green-500 px-2 py-0.5 rounded-full">
                                    Tiết kiệm {currentDiscount}%
                                </span>
                             )}
                        </div>
                    </div>

                    <div className="w-full h-px bg-gray-100 mb-6"></div>

                    {/* Variant Selector */}
                    {product.variants && product.variants.length > 0 && (
                        <div className="mb-8">
                           <label className="text-xs font-extrabold text-gray-400 uppercase tracking-widest mb-3 block flex justify-between">
                               <span>Chọn gói dịch vụ</span>
                               <span className="text-primary cursor-pointer hover:underline text-[10px] bg-blue-50 px-2 py-0.5 rounded">Chi tiết gói</span>
                           </label>
                           <div className="space-y-3">
                              {product.variants.map(v => (
                                 <div 
                                   key={v.id}
                                   onClick={() => setSelectedVariant(v)}
                                   className={`cursor-pointer p-4 rounded-2xl border-2 flex items-center justify-between transition-all relative overflow-hidden group ${selectedVariant?.id === v.id ? 'border-primary bg-blue-50/20 shadow-sm' : 'border-gray-100 bg-white hover:border-gray-200 hover:bg-gray-50'}`}
                                 >
                                    <div className="relative z-10 flex flex-col">
                                        <span className={`font-bold text-sm ${selectedVariant?.id === v.id ? 'text-primary' : 'text-gray-900'}`}>{v.name}</span>
                                        {selectedVariant?.id === v.id && <span className="text-[10px] text-primary font-medium flex items-center gap-1 mt-0.5"><Check size={10}/> Đã chọn</span>}
                                    </div>
                                    <span className={`relative z-10 font-bold ${selectedVariant?.id === v.id ? 'text-primary' : 'text-gray-900'}`}>
                                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v.price)}
                                    </span>
                                    {selectedVariant?.id === v.id && (
                                        <div className="absolute top-0 right-0 w-8 h-8 bg-primary rounded-bl-2xl flex items-center justify-center">
                                            <Check size={14} className="text-white mb-1 ml-1" />
                                        </div>
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
                          className="w-full py-4 bg-gray-900 text-white font-bold rounded-2xl text-lg hover:bg-black hover:shadow-xl hover:shadow-gray-900/20 transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
                       >
                          <ShoppingCart size={20} /> Thêm vào giỏ hàng
                       </button>
                       <div className="grid grid-cols-2 gap-3">
                            <button className="py-3 bg-white text-gray-700 font-bold rounded-2xl border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all flex items-center justify-center gap-2 text-sm">
                                <Share2 size={18} /> Chia sẻ
                            </button>
                            <button className="py-3 bg-white text-gray-700 font-bold rounded-2xl border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all flex items-center justify-center gap-2 text-sm">
                                <Heart size={18} className={product.isHot ? 'text-red-500 fill-red-500' : 'text-gray-400'} /> Yêu thích
                            </button>
                       </div>
                    </div>

                    {/* Footer Info */}
                    <div className="mt-6 pt-6 border-t border-gray-100 flex items-center justify-center gap-2 text-xs text-gray-500 font-medium">
                        <Lock size={12} className="text-green-500" />
                        Thanh toán an toàn SSL 256-bit
                    </div>
                 </div>

                 {/* Support Widget */}
                 <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden">
                     <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
                     <div className="relative z-10 flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm shrink-0">
                            <MessageCircle size={20} />
                        </div>
                        <div>
                            <h4 className="font-bold text-sm mb-1">Hỗ trợ trực tuyến</h4>
                            <p className="text-xs text-blue-100 leading-relaxed mb-3">Đội ngũ kỹ thuật sẵn sàng hỗ trợ bạn cài đặt và kích hoạt.</p>
                            <div className="flex gap-2">
                                <a href="https://zalo.me/0374770023" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs font-bold bg-white text-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors">
                                    Chat Zalo <ArrowRight size={12} />
                                </a>
                                <a href="https://www.facebook.com/profile.php?id=61552104173388&locale=vi_VN" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs font-bold bg-[#1877F2] text-white px-3 py-1.5 rounded-lg hover:bg-[#166fe5] transition-colors">
                                    <Facebook size={12} fill="currentColor" /> Chat FB
                                </a>
                            </div>
                        </div>
                     </div>
                 </div>

              </div>
           </div>
        </div>

        {/* BOTTOM SECTION: FULL WIDTH CONTENT (Tabs + Reviews) */}
        <div className="max-w-6xl mx-auto space-y-12">
            
            {/* Description Tabs - OPTIMIZED WIDE LAYOUT */}
            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden animate-fade-in-up" style={{animationDelay: '0.2s'}}>
                <div className="flex border-b border-gray-100 bg-gray-50/50">
                    <button 
                        onClick={() => setActiveTab('desc')}
                        className={`flex-1 md:flex-none px-8 md:px-12 py-6 text-sm md:text-base font-extrabold text-center transition-all relative flex items-center justify-center gap-2 ${activeTab === 'desc' ? 'text-primary bg-white shadow-[0_-2px_10px_rgba(0,0,0,0.02)]' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100/50'}`}
                    >
                        <FileText size={18} /> Thông tin chi tiết
                        {activeTab === 'desc' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-t-full mx-8"></div>}
                    </button>
                    <button 
                        onClick={() => setActiveTab('guide')}
                        className={`flex-1 md:flex-none px-8 md:px-12 py-6 text-sm md:text-base font-extrabold text-center transition-all relative flex items-center justify-center gap-2 ${activeTab === 'guide' ? 'text-primary bg-white shadow-[0_-2px_10px_rgba(0,0,0,0.02)]' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100/50'}`}
                    >
                        <Terminal size={18} /> Hướng dẫn kích hoạt
                        {activeTab === 'guide' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-t-full mx-8"></div>}
                    </button>
                </div>
                
                <div className="p-8 md:p-12 lg:p-16">
                    {activeTab === 'desc' ? (
                        <div className="prose prose-lg prose-gray max-w-none">
                            {/* Sapo Description */}
                            <div className="mb-10 p-8 bg-blue-50/30 rounded-3xl border border-blue-100/50">
                                <div className="flex gap-4">
                                    <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 shadow-sm border border-blue-200">
                                        <Info size={20} />
                                    </div>
                                    <div className="text-gray-800 font-medium leading-relaxed whitespace-pre-line text-lg pt-1.5">
                                        {product.description}
                                    </div>
                                </div>
                            </div>

                            {/* Features List - Full Width Grid */}
                            {product.features && product.features.length > 0 && (
                                <div className="mb-12">
                                    <h3 className="font-extrabold text-gray-900 text-2xl mb-6 flex items-center gap-3">
                                        <LayoutList className="text-primary" /> Tính năng nổi bật
                                    </h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {product.features.map((feature, idx) => (
                                            <div key={idx} className="bg-gray-50 p-5 rounded-2xl border border-gray-200/60 flex items-center gap-4 hover:border-primary/40 hover:bg-white hover:shadow-md transition-all duration-300 group">
                                                <div className="w-10 h-10 rounded-full bg-white text-green-500 flex items-center justify-center shrink-0 shadow-sm border border-gray-100 group-hover:scale-110 transition-transform">
                                                    <Check size={20} strokeWidth={3} />
                                                </div>
                                                <span className="font-bold text-gray-800 text-sm md:text-base leading-tight">{feature}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Main Content */}
                            {product.content && (
                                <div className="text-gray-700 leading-8 text-[16px] md:text-[17px] product-content-viewer">
                                    {product.content.includes('<') && product.content.includes('>') ? (
                                        <div dangerouslySetInnerHTML={{ __html: product.content }} />
                                    ) : (
                                        renderFormattedText(product.content)
                                    )}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="max-w-4xl mx-auto space-y-10">
                            <div className="text-center mb-8">
                                <h3 className="text-2xl font-extrabold text-gray-900 mb-3">Hướng dẫn kích hoạt sản phẩm</h3>
                                <p className="text-gray-500">Làm theo các bước bên dưới để sử dụng sản phẩm sau khi mua hàng.</p>
                            </div>

                            {product.activationGuide ? (
                                <div className="space-y-8">
                                    {/* Styled Code Block for Guide */}
                                    <div className="bg-[#1E1E1E] rounded-3xl p-8 text-gray-300 font-mono text-base leading-relaxed shadow-2xl border border-gray-800 relative overflow-hidden group">
                                        <div className="absolute top-0 left-0 w-full h-10 bg-[#2D2D2D] flex items-center px-5 gap-2 border-b border-gray-700">
                                            <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                                            <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                            <div className="ml-4 text-xs text-gray-500 font-sans font-bold uppercase tracking-wider">Console.log</div>
                                        </div>
                                        <div className="mt-8 whitespace-pre-wrap pl-2 border-l-2 border-gray-700">
                                            {product.activationGuide}
                                        </div>
                                        <button 
                                            onClick={() => {navigator.clipboard.writeText(product.activationGuide || ''); alert('Đã sao chép hướng dẫn!')}}
                                            className="absolute top-2 right-2 text-gray-400 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-all opacity-0 group-hover:opacity-100" title="Sao chép"
                                        >
                                            <Copy size={18} />
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="bg-yellow-50 p-6 rounded-2xl border border-yellow-100 flex gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-yellow-100 text-yellow-600 flex items-center justify-center shrink-0">
                                                <Info size={24} />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-yellow-900 mb-1">Lưu ý quan trọng</h4>
                                                <p className="text-sm text-yellow-800 leading-relaxed">
                                                    Nếu gặp khó khăn trong quá trình kích hoạt, vui lòng liên hệ bộ phận hỗ trợ kỹ thuật để được teamview/ultraview hỗ trợ trực tiếp.
                                                </p>
                                            </div>
                                        </div>
                                        <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 flex gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                                                <HelpCircle size={24} />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-blue-900 mb-1">Hỗ trợ 24/7</h4>
                                                <p className="text-sm text-blue-800 leading-relaxed mb-2">Đội ngũ kỹ thuật luôn sẵn sàng.</p>
                                                <a href="https://zalo.me/0374770023" target="_blank" rel="noreferrer" className="text-primary font-bold hover:underline inline-flex items-center gap-1">Chat Zalo ngay <ArrowRight size={14} /></a>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                                    <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm text-green-500">
                                        <Zap size={32} />
                                    </div>
                                    <h3 className="font-bold text-gray-900 text-lg">Kích hoạt tự động</h3>
                                    <p className="text-gray-500 mt-2 max-w-md mx-auto">Sản phẩm này sẽ được kích hoạt tự động và gửi thông tin qua email ngay sau khi thanh toán thành công.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Reviews Section - FULL WIDTH */}
            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-8 md:p-12 lg:p-16">
                 <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
                    <div>
                        <h3 className="text-3xl font-extrabold text-gray-900 mb-2">Đánh giá từ khách hàng</h3>
                        <p className="text-gray-500">Xem những người khác nói gì về sản phẩm này</p>
                    </div>
                    
                    <div className="flex items-center gap-6 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                        <div className="text-center px-2">
                            <span className="text-3xl font-extrabold text-gray-900 block">{product.rating}</span>
                            <div className="flex text-yellow-400 text-xs gap-0.5 justify-center mt-1">
                                {[...Array(5)].map((_,i) => <Star key={i} size={14} fill={i < Math.round(product.rating) ? "currentColor" : "none"} stroke={i < Math.round(product.rating) ? "none" : "currentColor"} />)}
                            </div>
                        </div>
                        <div className="h-10 w-px bg-gray-200"></div>
                        <div className="text-left px-2">
                            <span className="text-sm font-bold text-gray-900 block">{product.reviews?.length || 0} Nhận xét</span>
                            <span className="text-xs text-green-600 font-medium">100% Khách hàng hài lòng</span>
                        </div>
                        <button 
                            onClick={() => setShowReviewForm(!showReviewForm)}
                            className="hidden md:flex items-center gap-2 bg-gray-900 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-black transition-all shadow-lg shadow-gray-200 active:scale-95 ml-4"
                        >
                            <Edit3 size={16} /> Viết đánh giá
                        </button>
                    </div>
                    
                    {/* Mobile Button */}
                    <button 
                        onClick={() => setShowReviewForm(!showReviewForm)}
                        className="md:hidden w-full flex items-center justify-center gap-2 bg-gray-900 text-white px-5 py-3 rounded-xl font-bold hover:bg-black transition-all"
                    >
                        <Edit3 size={16} /> Viết đánh giá
                    </button>
                 </div>

                 {/* Review Form */}
                 {showReviewForm && (
                     <div className="mb-12 bg-gray-50 rounded-3xl p-8 border border-gray-100 animate-fade-in-up">
                         <form onSubmit={handleSubmitReview} className="space-y-6 max-w-3xl mx-auto">
                             <div className="flex flex-col md:flex-row gap-6">
                                 <div className="flex-1">
                                     <label className="block text-sm font-bold text-gray-700 mb-2">Tên hiển thị</label>
                                     <input 
                                        type="text" 
                                        required 
                                        value={reviewForm.name} 
                                        onChange={(e) => setReviewForm({...reviewForm, name: e.target.value})}
                                        className="w-full px-5 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-medium"
                                        placeholder="VD: Nguyễn Văn A"
                                     />
                                 </div>
                                 <div className="w-full md:w-48">
                                     <label className="block text-sm font-bold text-gray-700 mb-2">Đánh giá sao</label>
                                     <select 
                                        value={reviewForm.rating}
                                        onChange={(e) => setReviewForm({...reviewForm, rating: Number(e.target.value)})}
                                        className="w-full px-5 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-medium text-yellow-600 font-bold"
                                     >
                                         <option value="5">⭐⭐⭐⭐⭐ 5/5</option>
                                         <option value="4">⭐⭐⭐⭐ 4/5</option>
                                         <option value="3">⭐⭐⭐ 3/5</option>
                                         <option value="2">⭐⭐ 2/5</option>
                                         <option value="1">⭐ 1/5</option>
                                     </select>
                                 </div>
                             </div>
                             <div>
                                 <label className="block text-sm font-bold text-gray-700 mb-2">Nội dung đánh giá</label>
                                 <textarea 
                                    required
                                    rows={4}
                                    value={reviewForm.comment}
                                    onChange={(e) => setReviewForm({...reviewForm, comment: e.target.value})}
                                    className="w-full px-5 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-medium resize-none"
                                    placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm..."
                                 ></textarea>
                             </div>
                             <div className="flex justify-end gap-3 pt-2">
                                 <button type="button" onClick={() => setShowReviewForm(false)} className="px-6 py-3 text-gray-500 font-bold hover:bg-gray-200 rounded-xl transition-colors">Hủy bỏ</button>
                                 <button 
                                    type="submit" 
                                    disabled={isSubmittingReview}
                                    className="px-8 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary-hover transition-all shadow-lg shadow-primary/30 disabled:opacity-50 hover:-translate-y-1"
                                 >
                                     {isSubmittingReview ? 'Đang gửi...' : 'Gửi đánh giá'}
                                 </button>
                             </div>
                         </form>
                     </div>
                 )}
                 
                 {product.reviews && product.reviews.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
                       {product.reviews.map((review) => (
                          <div key={review.id} className="bg-gray-50 p-6 md:p-8 rounded-[2rem] border border-transparent hover:border-gray-200 hover:bg-white hover:shadow-xl hover:shadow-gray-100 transition-all duration-300 group">
                             <div className="flex justify-between items-start mb-5">
                                 <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-primary font-bold text-lg shadow-sm border border-gray-100">
                                        {review.user.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <div className="font-bold text-gray-900 text-base">{review.user}</div>
                                        <div className="text-xs text-green-600 flex items-center gap-1.5 font-bold mt-0.5 bg-green-50 px-2 py-0.5 rounded-full w-fit">
                                            <CheckCircle2 size={10} strokeWidth={3} /> Đã mua hàng
                                        </div>
                                    </div>
                                 </div>
                                 <div className="flex bg-white px-2 py-1 rounded-lg border border-gray-100 shadow-sm">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} size={14} fill={i < review.rating ? "#FBBF24" : "none"} stroke={i < review.rating ? "none" : "#E5E7EB"} />
                                    ))}
                                 </div>
                             </div>
                             <p className="text-gray-600 text-base leading-relaxed mb-6 font-medium">"{review.comment}"</p>
                             <div className="pt-4 border-t border-gray-200/60 text-xs font-bold text-gray-400 uppercase tracking-wider flex justify-between items-center">
                                <span>{review.purchasedType || 'Gói dịch vụ'}</span>
                                <span className="bg-white px-2 py-1 rounded border border-gray-100">{review.date}</span>
                             </div>
                          </div>
                       ))}
                    </div>
                 ) : (
                    <div className="text-center p-16 bg-gray-50 rounded-[2.5rem] border border-dashed border-gray-200">
                       <MessageCircle className="mx-auto text-gray-300 mb-4" size={48} />
                       <p className="text-gray-500 font-medium text-lg">Chưa có đánh giá nào cho sản phẩm này.</p>
                       <button onClick={() => setShowReviewForm(true)} className="mt-6 text-primary font-bold hover:underline">Hãy là người đầu tiên đánh giá!</button>
                    </div>
                 )}
            </div>

        </div>

        {/* RELATED PRODUCTS */}
        {relatedProducts.length > 0 && (
           <div className="mt-24 max-w-7xl mx-auto border-t border-gray-200 pt-16">
              <div className="flex items-center justify-between mb-10">
                  <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Sản phẩm tương tự</h2>
                  <Link to="/products" className="text-sm font-bold text-gray-500 hover:text-primary transition-colors flex items-center gap-1">
                      Xem tất cả <ChevronRight size={16} />
                  </Link>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                 {relatedProducts.map(p => (
                    <ProductCard key={p.id} product={p} onAddToCart={addToCart} />
                 ))}
              </div>
           </div>
        )}
      </div>

      {/* MOBILE STICKY BOTTOM BAR */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 p-3 bg-white/95 backdrop-blur-xl border-t border-gray-100 shadow-[0_-5px_20px_rgba(0,0,0,0.05)] z-40 safe-area-bottom">
         <div className="flex gap-3 items-center">
             <div className="flex flex-col">
                 <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Tổng cộng</span>
                 <div className="flex items-baseline gap-2">
                     <span className="text-xl font-extrabold text-gray-900">
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(currentPrice)}
                     </span>
                 </div>
             </div>
             <button 
                onClick={handleAddToCart}
                className="flex-1 py-3.5 bg-gray-900 text-white font-bold rounded-xl shadow-lg shadow-gray-900/20 active:scale-95 transition-transform flex items-center justify-center gap-2"
             >
                <ShoppingCart size={18} /> Mua ngay
             </button>
         </div>
      </div>
    </div>
  );
};
