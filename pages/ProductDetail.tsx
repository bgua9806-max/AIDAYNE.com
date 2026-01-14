
import React, { useEffect, useState, useRef } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { Product, Variant, Review } from '../types';
import { 
  Star, ShieldCheck, Zap, ArrowLeft, Heart, 
  ChevronRight, Check, CheckCircle2, User, MessageCircle,
  Clock, Gift, Globe, Lock, PlayCircle, HelpCircle, ChevronDown, ShoppingCart, Sparkles, Share2, ArrowRight, Facebook, Copy, Terminal, FileText, Info, Edit3, LayoutList, AlignLeft, BookOpen, Menu, List, ChevronUp
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { PRODUCTS as FALLBACK_PRODUCTS } from '../constants';
import { ProductCard } from '../components/ProductCard';
import { MobileProductCard } from '../components/mobile/MobileProductCard';
import { slugify } from '../lib/utils';
import { SEO } from '../components/SEO';

const { useParams, Link, useNavigate } = ReactRouterDOM;

interface ProductDetailProps {
  addToCart: (product: Product) => void;
}

// Dynamic Theme Colors based on Category
const getCategoryTheme = (category: string = '') => {
    switch(category.toLowerCase()) {
        case 'entertainment': return { color: '#E50914', name: 'red' }; // Netflix Red
        case 'design': return { color: '#FF61F6', name: 'fuchsia' }; // Creative Purple/Pink
        case 'work': return { color: '#0078D4', name: 'blue' }; // Office Blue
        case 'ai': return { color: '#10A37F', name: 'emerald' }; // ChatGPT Green
        case 'security': return { color: '#00C853', name: 'green' }; // VPN Green
        case 'music': return { color: '#1DB954', name: 'green' }; // Spotify Green
        default: return { color: '#0071E3', name: 'blue' }; // Default Apple Blue
    }
};

export const ProductDetail: React.FC<ProductDetailProps> = ({ addToCart }) => {
  const { id: paramSlug } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
  const [mainImageSrc, setMainImageSrc] = useState<string>('');
  
  // UX State
  const [activeSection, setActiveSection] = useState('description');
  const [showStickyBar, setShowStickyBar] = useState(false);
  const [isDescExpanded, setIsDescExpanded] = useState(false); // For mobile expand
  const mainBuyBtnRef = useRef<HTMLButtonElement>(null);

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
             
             if (currentProduct.variants && currentProduct.variants.length > 0) {
                 setSelectedVariant(currentProduct.variants[0]);
             }

             let relatedSource = !error && allProducts ? allProducts : FALLBACK_PRODUCTS;
             const relatedData = relatedSource
                 .filter((p: Product) => p.category === currentProduct!.category && p.id !== currentProduct!.id)
                 .slice(0, 4)
                 .map((p: Product) => fillImage(p));

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

  // Scroll Listener for Sticky Bar and Spy
  useEffect(() => {
      const handleScroll = () => {
          // 1. Sticky Bar Logic
          if (mainBuyBtnRef.current) {
              const rect = mainBuyBtnRef.current.getBoundingClientRect();
              setShowStickyBar(rect.bottom < 0);
          }

          // 2. Scroll Spy Logic (Desktop Only)
          if (window.innerWidth >= 1024) {
              const sections = ['description', 'features', 'guide', 'reviews'];
              for (const section of sections) {
                  const element = document.getElementById(section);
                  if (element) {
                      const rect = element.getBoundingClientRect();
                      if (rect.top >= 0 && rect.top < 300) {
                          setActiveSection(section);
                          break;
                      } else if (rect.top < 0 && rect.bottom > 150) {
                          setActiveSection(section);
                          break;
                      }
                  }
              }
          }
      };

      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
  }, [product]);

  const scrollToSection = (id: string) => {
      const element = document.getElementById(id);
      if (element) {
          const offset = 100; // Header height + padding
          const bodyRect = document.body.getBoundingClientRect().top;
          const elementRect = element.getBoundingClientRect().top;
          const elementPosition = elementRect - bodyRect;
          const offsetPosition = elementPosition - offset;

          window.scrollTo({
              top: offsetPosition,
              behavior: 'smooth'
          });
          setActiveSection(id);
      }
  };

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
                  <div className="mt-2 w-1.5 h-1.5 rounded-full bg-[var(--theme-color)] shrink-0 opacity-70"></div>
                  <span className="text-gray-700 leading-relaxed font-medium">{trimmedLine.substring(1).trim()}</span>
               </div>
             );
          }
          if (trimmedLine.endsWith(':') || (trimmedLine === trimmedLine.toUpperCase() && trimmedLine.length < 50)) {
              return <h4 key={index} className="font-bold text-gray-900 text-lg mt-6 mb-2">{trimmedLine}</h4>;
          }
          return <p key={index} className="text-gray-600 leading-7 text-[16px]">{trimmedLine}</p>;
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

          setProduct({ ...product, reviews: updatedReviews, rating: newRating });
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
  const theme = getCategoryTheme(product.category);

  const handleAddToCart = () => {
      const productToAdd = {
          ...product,
          price: currentPrice,
          originalPrice: currentOriginalPrice,
          name: selectedVariant ? `${product.name} (${selectedVariant.name})` : product.name
      };
      addToCart(productToAdd);
  };

  // Schema Markup
  const productSchema = {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": product.name,
    "image": product.image,
    "description": product.description,
    "brand": { "@type": "Brand", "name": product.developer || "AIDAYNE" },
    "sku": product.id,
    "offers": {
      "@type": "Offer",
      "priceCurrency": "VND",
      "price": currentPrice,
      "availability": "https://schema.org/InStock"
    }
  };

  return (
    <div 
        className="min-h-screen bg-[#F5F5F7] pb-32 lg:pb-24 font-sans selection:text-white"
        style={{ '--theme-color': theme.color, 'selection-bg': theme.color } as React.CSSProperties}
    >
      <style>{`::selection { background-color: var(--theme-color); }`}</style>
      
      <SEO 
        title={`${product.name} - Giá Rẻ, Uy Tín`}
        description={product.description}
        image={product.image}
        type="product"
        schema={productSchema}
      />

      {/* --- MOBILE: FLOATING NAV & IMMERSIVE HEADER --- */}
      <div className="lg:hidden">
          {/* Top Nav Overlay */}
          <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3 pointer-events-none">
              <button 
                onClick={() => navigate(-1)} 
                className="w-10 h-10 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center text-gray-800 shadow-sm pointer-events-auto active:scale-90 transition-transform"
              >
                  <ArrowLeft size={20} />
              </button>
              <div className="flex gap-2 pointer-events-auto">
                  <button className="w-10 h-10 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center text-gray-800 shadow-sm active:scale-90 transition-transform">
                      <Share2 size={20} />
                  </button>
                  <Link to="/products" className="w-10 h-10 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center text-gray-800 shadow-sm active:scale-90 transition-transform">
                      <ShoppingCart size={20} />
                  </Link>
              </div>
          </div>

          {/* Product Image (Immersive) */}
          <div className="relative w-full aspect-square bg-white">
              <img 
                  src={mainImageSrc} 
                  alt={product.name}
                  className="w-full h-full object-contain p-8"
              />
              <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#F5F5F7] to-transparent"></div>
          </div>
      </div>

      {/* Dynamic Ambient Background (Desktop Only) */}
      <div className="hidden lg:block absolute top-0 left-0 right-0 h-[800px] overflow-hidden z-0 pointer-events-none">
          <div 
            className="absolute top-[-20%] left-[10%] w-[70%] h-[100%] blur-[120px] rounded-full mix-blend-multiply opacity-20"
            style={{ backgroundColor: theme.color }}
          ></div>
          <div className="absolute top-[-10%] right-[10%] w-[50%] h-[80%] bg-blue-500/10 blur-[120px] rounded-full mix-blend-multiply"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 lg:pt-32">
        
        {/* Breadcrumb (Desktop) */}
        <nav className="hidden lg:flex items-center gap-2 text-sm font-medium text-gray-400 mb-8 overflow-x-auto no-scrollbar whitespace-nowrap">
           <Link to="/" className="hover:text-black transition-colors">Home</Link>
           <ChevronRight size={12} className="shrink-0 text-gray-300" />
           <Link to={`/products?category=${product.category}`} className="hover:text-black transition-colors capitalize">{product.category}</Link>
           <ChevronRight size={12} className="shrink-0 text-gray-300" />
           <span className="text-gray-900 font-semibold">{product.name}</span>
        </nav>

        {/* --- MAIN INFO SECTION --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start mb-8 lg:mb-16 -mt-10 lg:mt-0">
           
           {/* Left: Images (Desktop) */}
           <div className="hidden lg:block lg:col-span-7 xl:col-span-8 space-y-8 animate-fade-in-up">
              <div className="relative w-full aspect-[4/3] lg:aspect-[16/10] rounded-[2.5rem] overflow-hidden bg-white shadow-2xl border border-gray-100/50 group">
                 {/* Dynamic Glow */}
                 <div className="absolute inset-0 z-0 overflow-hidden">
                     <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-white opacity-100"></div>
                     <div 
                        className="absolute inset-0 opacity-10 blur-[100px] scale-150" 
                        style={{ backgroundColor: theme.color }}
                     ></div>
                 </div>

                 <div className="absolute inset-0 z-10 flex items-center justify-center p-8 lg:p-16">
                    <img 
                      src={mainImageSrc} 
                      alt={product.name} 
                      className="w-full h-full object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.15)] transition-transform duration-700 ease-out group-hover:scale-105" 
                    />
                 </div>

                 {/* Badges */}
                 <div className="absolute top-6 left-6 z-20 flex flex-col gap-2">
                      {product.isHot && (
                         <div className="bg-white/90 backdrop-blur-md text-red-600 px-4 py-2 rounded-full text-xs font-black shadow-lg shadow-red-500/10 flex items-center gap-1.5 border border-red-50 ring-1 ring-red-100 uppercase tracking-wide">
                             <Zap size={14} fill="currentColor" /> BEST SELLER
                         </div>
                      )}
                      {product.discount > 0 && (
                          <div 
                            className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-full text-xs font-black shadow-lg border border-gray-100"
                            style={{ color: theme.color }}
                          >
                              GIẢM {currentDiscount}%
                          </div>
                      )}
                 </div>
              </div>
           </div>

           {/* Right: Purchase Info (Mobile & Desktop) */}
           <div className="col-span-1 lg:col-span-5 xl:col-span-4 relative z-20">
              <div className="lg:sticky lg:top-28 space-y-6">
                 
                 {/* Main Info Card */}
                 <div className="bg-white rounded-[2rem] p-6 lg:p-8 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)] border border-gray-100 relative overflow-hidden animate-fade-in-up">
                    <div className="mb-6 lg:mb-8">
                        <div className="flex items-center gap-2 mb-3">
                             <span className="px-2.5 py-1 rounded-lg bg-gray-100 text-gray-600 text-[10px] font-bold uppercase tracking-wider border border-gray-200">{product.category}</span>
                             {product.rating >= 4.5 && (
                                <div className="flex items-center gap-1 text-[10px] font-bold text-yellow-600 bg-yellow-100/50 px-2.5 py-1 rounded-lg border border-yellow-100">
                                    <Star size={10} fill="currentColor" /> {product.rating}
                                </div>
                             )}
                        </div>
                        <h1 className="text-2xl lg:text-3xl font-extrabold text-gray-900 leading-tight mb-2 lg:mb-4 tracking-tight">{product.name}</h1>
                        <div className="flex items-end gap-3">
                           <span className="text-4xl lg:text-5xl font-extrabold text-gray-900 tracking-tighter" style={{ color: theme.color }}>
                              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(currentPrice)}
                           </span>
                        </div>
                        {currentDiscount > 0 && (
                            <span className="text-sm lg:text-lg text-gray-400 line-through font-medium block mt-1">
                                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(currentOriginalPrice)}
                            </span>
                        )}
                    </div>

                    <div className="w-full h-px bg-gray-100 mb-6"></div>

                    {/* Variant Selector (Improved for Mobile) */}
                    {product.variants && product.variants.length > 0 && (
                        <div className="mb-8">
                           <label className="text-xs font-extrabold text-gray-400 uppercase tracking-widest mb-3 block">Chọn gói dịch vụ</label>
                           <div className="flex flex-wrap gap-2 lg:flex-col lg:gap-3">
                              {product.variants.map(v => (
                                 <button 
                                   key={v.id}
                                   onClick={() => setSelectedVariant(v)}
                                   className={`
                                      flex-shrink-0 flex items-center justify-between p-3 lg:p-4 rounded-xl lg:rounded-2xl border-2 transition-all relative overflow-hidden group text-left
                                      ${selectedVariant?.id === v.id 
                                        ? 'bg-gray-50 border-current shadow-sm' 
                                        : 'bg-white border-gray-100 hover:border-gray-200'
                                      }
                                   `}
                                   style={{ 
                                      borderColor: selectedVariant?.id === v.id ? theme.color : '',
                                      minWidth: '100px' // For mobile chips
                                   }}
                                 >
                                    <div className="relative z-10 flex flex-col">
                                        <span className={`font-bold text-xs lg:text-sm ${selectedVariant?.id === v.id ? 'text-gray-900' : 'text-gray-700'}`}>{v.name}</span>
                                    </div>
                                    <span className="hidden lg:block relative z-10 font-bold text-gray-900 ml-4">
                                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v.price)}
                                    </span>
                                 </button>
                              ))}
                           </div>
                        </div>
                    )}

                    {/* Buy Actions (Desktop Only) */}
                    <div className="hidden lg:block space-y-3">
                       <button 
                          ref={mainBuyBtnRef}
                          onClick={handleAddToCart}
                          className="w-full py-4 text-white font-bold rounded-2xl text-lg hover:shadow-xl transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
                          style={{ backgroundColor: theme.color, boxShadow: `0 10px 25px -5px ${theme.color}40` }}
                       >
                          <ShoppingCart size={20} /> Thêm vào giỏ hàng
                       </button>
                       <div className="grid grid-cols-2 gap-3">
                            <button className="py-3 bg-white text-gray-700 font-bold rounded-2xl border border-gray-200 hover:bg-gray-50 transition-all flex items-center justify-center gap-2 text-sm">
                                <Share2 size={18} /> Chia sẻ
                            </button>
                            <button className="py-3 bg-white text-gray-700 font-bold rounded-2xl border border-gray-200 hover:bg-gray-50 transition-all flex items-center justify-center gap-2 text-sm">
                                <Heart size={18} /> Yêu thích
                            </button>
                       </div>
                    </div>

                    <div className="hidden lg:flex mt-6 pt-6 border-t border-gray-100 items-center justify-center gap-2 text-xs text-gray-500 font-medium">
                        <Lock size={12} className="text-green-500" />
                        Thanh toán an toàn SSL 256-bit
                    </div>
                 </div>
              </div>
           </div>
        </div>

        {/* --- SCROLL SPY CONTENT SECTION (Mobile Collapsible, Desktop Tabs) --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:mt-20 relative">
            
            {/* Sticky Table of Contents (Left - Desktop) */}
            <div className="hidden lg:block lg:col-span-3">
                <div className="sticky top-32 pl-2">
                    <h3 className="font-extrabold text-gray-900 mb-6 uppercase text-xs tracking-widest flex items-center gap-2">
                        <List size={14} /> Mục lục
                    </h3>
                    <div className="space-y-1 border-l-2 border-gray-200">
                        {['description', 'features', 'guide', 'reviews'].map((section) => (
                            <button
                                key={section}
                                onClick={() => scrollToSection(section)}
                                className={`block w-full text-left pl-4 py-2 text-sm font-medium transition-all relative ${activeSection === section ? 'text-gray-900 font-bold' : 'text-gray-500 hover:text-gray-800'}`}
                            >
                                {activeSection === section && (
                                    <div 
                                        className="absolute left-[-2px] top-0 bottom-0 w-[2px] transition-all duration-300" 
                                        style={{ backgroundColor: theme.color }}
                                    ></div>
                                )}
                                {section === 'description' && 'Thông tin chi tiết'}
                                {section === 'features' && 'Tính năng nổi bật'}
                                {section === 'guide' && 'Hướng dẫn kích hoạt'}
                                {section === 'reviews' && 'Đánh giá khách hàng'}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Main Content (Right) */}
            <div className="col-span-12 lg:col-span-9 space-y-12 lg:space-y-20">
                
                {/* 1. Description (Mobile Collapsible) */}
                <section id="description" className="scroll-mt-32 animate-fade-in-up">
                    <h2 className="text-xl lg:text-3xl font-extrabold text-gray-900 mb-4 lg:mb-8 flex items-center gap-3">
                        <Info size={28} style={{ color: theme.color }} /> Thông tin chi tiết
                    </h2>
                    
                    <div className={`relative bg-white rounded-[2rem] p-6 lg:p-12 shadow-sm border border-gray-100 overflow-hidden ${!isDescExpanded ? 'max-h-[300px] lg:max-h-none' : ''}`}>
                        {/* Sapo */}
                        <div className="mb-6 lg:mb-10 p-6 lg:p-8 rounded-3xl border border-dashed border-gray-200 bg-gray-50/50">
                            <div className="text-gray-800 font-medium leading-relaxed whitespace-pre-line text-base lg:text-lg">
                                {product.description}
                            </div>
                        </div>
                        {/* HTML Content */}
                        {product.content && (
                            <div className="text-gray-700 leading-8 text-[15px] lg:text-[17px] product-content-viewer">
                                {product.content.includes('<') && product.content.includes('>') ? (
                                    <div dangerouslySetInnerHTML={{ __html: product.content }} />
                                ) : (
                                    renderFormattedText(product.content)
                                )}
                            </div>
                        )}

                        {/* Mobile Expand Gradient */}
                        <div className={`lg:hidden absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent flex items-end justify-center pb-4 ${isDescExpanded ? 'hidden' : 'block'}`}>
                            <button 
                               onClick={() => setIsDescExpanded(true)}
                               className="px-6 py-2 bg-white shadow-md rounded-full text-sm font-bold text-gray-700 flex items-center gap-1 border border-gray-100"
                            >
                                Xem thêm <ChevronDown size={14} />
                            </button>
                        </div>
                    </div>
                    {isDescExpanded && (
                        <div className="flex justify-center mt-4 lg:hidden">
                            <button 
                               onClick={() => { setIsDescExpanded(false); document.getElementById('description')?.scrollIntoView({ behavior: 'smooth' }); }}
                               className="text-sm font-bold text-gray-500 flex items-center gap-1"
                            >
                                Thu gọn <ChevronUp size={14} />
                            </button>
                        </div>
                    )}
                </section>

                {/* 2. Features */}
                {product.features && product.features.length > 0 && (
                    <section id="features" className="scroll-mt-32">
                        <h2 className="text-xl lg:text-3xl font-extrabold text-gray-900 mb-4 lg:mb-8 flex items-center gap-3">
                            <LayoutList size={28} style={{ color: theme.color }} /> Tính năng nổi bật
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {product.features.map((feature, idx) => (
                                <div key={idx} className="bg-white p-6 rounded-2xl border border-gray-100 flex items-center gap-4 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
                                    <div 
                                        className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover:scale-110"
                                        style={{ backgroundColor: `${theme.color}15`, color: theme.color }}
                                    >
                                        <Check size={20} strokeWidth={3} />
                                    </div>
                                    <span className="font-bold text-gray-800 text-sm lg:text-base leading-tight">{feature}</span>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* 3. Activation Guide */}
                <section id="guide" className="scroll-mt-32">
                    <h2 className="text-xl lg:text-3xl font-extrabold text-gray-900 mb-4 lg:mb-8 flex items-center gap-3">
                        <Terminal size={28} style={{ color: theme.color }} /> Hướng dẫn sử dụng
                    </h2>
                    {product.activationGuide ? (
                        <div className="bg-[#1E1E1E] rounded-[2rem] p-6 lg:p-10 text-gray-300 font-mono text-sm lg:text-base leading-relaxed shadow-2xl relative overflow-hidden group">
                            <div className="absolute top-0 left-0 w-full h-12 bg-[#2D2D2D] flex items-center px-6 gap-2 border-b border-white/5">
                                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                <div className="ml-auto text-xs text-gray-500 font-sans font-bold uppercase tracking-wider">Guide.md</div>
                            </div>
                            <div className="mt-8 whitespace-pre-wrap pl-4 border-l-2 border-gray-600/50">
                                {product.activationGuide}
                            </div>
                            <button 
                                onClick={() => {navigator.clipboard.writeText(product.activationGuide || ''); alert('Đã sao chép hướng dẫn!')}}
                                className="absolute top-3 right-4 text-gray-400 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-all" 
                                title="Sao chép"
                            >
                                <Copy size={18} />
                            </button>
                        </div>
                    ) : (
                        <div className="text-center py-12 lg:py-16 bg-white rounded-[2rem] border border-gray-100 shadow-sm">
                            <div 
                                className="w-16 h-16 lg:w-20 lg:h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-gray-200"
                                style={{ backgroundColor: `${theme.color}15`, color: theme.color }}
                            >
                                <Zap size={28} fill="currentColor" />
                            </div>
                            <h3 className="font-bold text-gray-900 text-lg lg:text-xl">Kích hoạt tự động</h3>
                            <p className="text-gray-500 mt-2 max-w-md mx-auto text-sm lg:text-base">Thông tin sẽ được gửi qua email ngay sau khi thanh toán.</p>
                        </div>
                    )}
                </section>

                {/* 4. Reviews */}
                <section id="reviews" className="scroll-mt-32">
                    <div className="flex items-center justify-between mb-6 lg:mb-8">
                        <h2 className="text-xl lg:text-3xl font-extrabold text-gray-900 flex items-center gap-3">
                            <MessageCircle size={28} style={{ color: theme.color }} /> Đánh giá
                        </h2>
                        <button 
                            onClick={() => setShowReviewForm(!showReviewForm)}
                            className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 lg:px-5 lg:py-2.5 rounded-xl font-bold text-xs lg:text-sm hover:bg-black transition-all shadow-lg active:scale-95"
                        >
                            <Edit3 size={14} /> <span className="hidden sm:inline">Viết đánh giá</span>
                        </button>
                    </div>

                    {showReviewForm && (
                        <div className="mb-10 bg-white rounded-3xl p-6 lg:p-8 border border-gray-100 shadow-lg animate-fade-in-up">
                            <form onSubmit={handleSubmitReview} className="space-y-6">
                                {/* Form content same as before */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-700">Tên hiển thị</label>
                                        <input 
                                            type="text" 
                                            required 
                                            value={reviewForm.name} 
                                            onChange={(e) => setReviewForm({...reviewForm, name: e.target.value})}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:border-transparent font-medium"
                                            style={{ '--tw-ring-color': theme.color } as React.CSSProperties}
                                            placeholder="VD: Nguyễn Văn A"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-700">Đánh giá</label>
                                        <select 
                                            value={reviewForm.rating}
                                            onChange={(e) => setReviewForm({...reviewForm, rating: Number(e.target.value)})}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:border-transparent font-medium"
                                            style={{ '--tw-ring-color': theme.color } as React.CSSProperties}
                                        >
                                            <option value="5">⭐⭐⭐⭐⭐ Tuyệt vời</option>
                                            <option value="4">⭐⭐⭐⭐ Tốt</option>
                                            <option value="3">⭐⭐⭐ Tạm được</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700">Nội dung</label>
                                    <textarea 
                                        required
                                        rows={3}
                                        value={reviewForm.comment}
                                        onChange={(e) => setReviewForm({...reviewForm, comment: e.target.value})}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:border-transparent font-medium resize-none"
                                        style={{ '--tw-ring-color': theme.color } as React.CSSProperties}
                                        placeholder="Chia sẻ trải nghiệm..."
                                    ></textarea>
                                </div>
                                <div className="flex justify-end gap-3">
                                    <button type="button" onClick={() => setShowReviewForm(false)} className="px-6 py-2.5 rounded-xl font-bold text-gray-500 hover:bg-gray-100">Hủy</button>
                                    <button 
                                        type="submit" 
                                        disabled={isSubmittingReview}
                                        className="px-8 py-2.5 text-white font-bold rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-50"
                                        style={{ backgroundColor: theme.color }}
                                    >
                                        {isSubmittingReview ? 'Đang gửi...' : 'Gửi đánh giá'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {product.reviews && product.reviews.length > 0 ? (
                        <>
                            {/* Desktop: Vertical Grid */}
                            <div className="hidden lg:grid grid-cols-1 gap-6">
                                {product.reviews.map((review) => (
                                    <div key={review.id} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col sm:flex-row gap-5">
                                        <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg text-white shrink-0 shadow-md" style={{ backgroundColor: theme.color }}>
                                            {review.user.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="font-bold text-gray-900 text-lg">{review.user}</div>
                                                <span className="text-xs font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded">{review.date}</span>
                                            </div>
                                            <div className="flex items-center gap-1 mb-3">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star key={i} size={16} fill={i < review.rating ? "#FBBF24" : "none"} stroke={i < review.rating ? "none" : "#E5E7EB"} />
                                                ))}
                                            </div>
                                            <p className="text-gray-600 leading-relaxed font-medium">"{review.comment}"</p>
                                            <div className="mt-3 flex items-center gap-2 text-xs font-bold text-green-600 bg-green-50 w-fit px-2 py-1 rounded">
                                                <CheckCircle2 size={12} /> Đã mua: {review.purchasedType || 'Gói mặc định'}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Mobile: Horizontal Swipe Cards */}
                            <div className="lg:hidden flex overflow-x-auto gap-4 pb-6 -mx-4 px-4 snap-x snap-mandatory no-scrollbar">
                                {product.reviews.map((review) => (
                                    <div key={review.id} className="snap-center bg-white p-5 rounded-[1.5rem] border border-gray-100 shadow-sm flex flex-col gap-3 min-w-[280px] max-w-[280px]">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm text-white shrink-0 shadow-md" style={{ backgroundColor: theme.color }}>
                                                {review.user.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <div className="font-bold text-gray-900 text-sm truncate w-32">{review.user}</div>
                                                <div className="flex items-center gap-0.5">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star key={i} size={10} fill={i < review.rating ? "#FBBF24" : "none"} stroke={i < review.rating ? "none" : "#E5E7EB"} />
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                        <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">"{review.comment}"</p>
                                        <div className="mt-auto text-[10px] font-bold text-gray-400">
                                            {review.date}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className="text-center py-16 bg-white rounded-[2rem] border border-dashed border-gray-200">
                            <p className="text-gray-500 font-medium">Chưa có đánh giá nào.</p>
                        </div>
                    )}
                </section>

            </div>
        </div>

        {/* RELATED PRODUCTS */}
        {relatedProducts.length > 0 && (
           <div className="mt-16 lg:mt-24 max-w-7xl mx-auto border-t border-gray-200 pt-12 lg:pt-16">
              <div className="flex items-center justify-between mb-6 lg:mb-10">
                  <h2 className="text-xl lg:text-3xl font-extrabold text-gray-900 tracking-tight">Sản phẩm tương tự</h2>
                  <Link to="/products" className="text-xs lg:text-sm font-bold text-gray-500 hover:text-primary transition-colors flex items-center gap-1">
                      Xem tất cả <ChevronRight size={16} />
                  </Link>
              </div>
              
              {/* Desktop Grid */}
              <div className="hidden lg:grid grid-cols-2 md:grid-cols-4 gap-6">
                 {relatedProducts.map(p => (
                    <ProductCard key={p.id} product={p} onAddToCart={addToCart} />
                 ))}
              </div>

              {/* Mobile Horizontal Snap */}
              <div className="lg:hidden flex overflow-x-auto snap-x snap-mandatory gap-4 pb-4 no-scrollbar -mx-4 px-4">
                  {relatedProducts.map((p) => (
                      <MobileProductCard key={p.id} product={p} onAddToCart={addToCart} />
                  ))}
              </div>
           </div>
        )}
      </div>

      {/* --- SMART STICKY ACTION BAR (IMPROVED FOR MOBILE) --- */}
      <div 
        className={`fixed bottom-[72px] lg:bottom-0 left-0 right-0 z-40 lg:z-50 bg-white/80 backdrop-blur-xl border-t border-gray-200 shadow-[0_-5px_30px_rgba(0,0,0,0.1)] transition-transform duration-300 ease-in-out ${showStickyBar ? 'translate-y-0' : 'translate-y-full lg:translate-y-full'}`}
      >
         <div className="max-w-7xl mx-auto px-4 py-3 lg:py-4 flex items-center justify-between gap-3 lg:gap-4">
             {/* Left: Product Info (Desktop) */}
             <div className="hidden sm:flex items-center gap-3">
                 <img src={mainImageSrc} alt="" className="w-12 h-12 rounded-lg object-cover bg-gray-100 border border-gray-200" />
                 <div>
                     <div className="font-bold text-gray-900 text-sm line-clamp-1">{product.name}</div>
                     <div className="text-xs text-gray-500">{product.category}</div>
                 </div>
             </div>

             {/* Right: Price & Button (Mobile Optimized) */}
             <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                 <div className="flex flex-col items-start lg:items-end">
                     <span className="text-base lg:text-lg font-extrabold text-gray-900">
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(currentPrice)}
                     </span>
                     {currentDiscount > 0 && (
                         <span className="text-[10px] lg:text-xs text-gray-400 line-through font-medium">
                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(currentOriginalPrice)}
                         </span>
                     )}
                 </div>
                 <button 
                    onClick={handleAddToCart}
                    className="flex-1 lg:flex-none px-6 py-3 lg:px-8 lg:py-3 text-white font-bold rounded-xl shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 text-sm lg:text-base"
                    style={{ backgroundColor: theme.color, boxShadow: `0 5px 20px -5px ${theme.color}60` }}
                 >
                    <ShoppingCart size={18} /> Mua ngay
                 </button>
             </div>
         </div>
      </div>

    </div>
  );
};
