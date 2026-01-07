
import React, { useEffect, useState } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { PRODUCTS } from '../constants';
import { Product, BlogPost as BlogPostType } from '../types';
import { 
  ArrowLeft, Clock, Calendar, Share2, Facebook, Twitter, Linkedin, 
  Link as LinkIcon, ChevronRight, Star, User, ShoppingCart, Zap
} from 'lucide-react';
import { supabase } from '../lib/supabase';

const { useParams, Link } = ReactRouterDOM;

interface BlogPostProps {
  addToCart: (product: Product) => void;
}

export const BlogPost: React.FC<BlogPostProps> = ({ addToCart }) => {
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<BlogPostType | null>(null);
  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([]);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchPostAndRecommendations = async () => {
        if (!id) return;
        
        // 1. Fetch Blog Post
        const { data: blogData } = await supabase.from('blogs').select('*').eq('id', id).single();
        
        if (blogData) {
            setPost(blogData);
            
            // 2. Logic lấy danh sách sản phẩm đề xuất (3-4 sản phẩm)
            let productsToShow: Product[] = [];

            // Ưu tiên 1: Lấy các sản phẩm cùng danh mục với bài viết (dựa trên mapping đơn giản hoặc category field)
            // Ví dụ: Bài viết category 'AI' -> lấy sản phẩm category 'ai'
            const mapCategory: {[key: string]: string} = {
                'Công nghệ AI': 'ai',
                'Thủ thuật': 'work',
                'Đánh giá': 'entertainment',
                'Bảo mật': 'security'
            };
            
            const targetCategory = mapCategory[blogData.category] || 'software';

            // Fetch từ DB
            const { data: relatedDb } = await supabase
                .from('products')
                .select('*')
                .eq('category', targetCategory)
                .limit(4);

            if (relatedDb && relatedDb.length > 0) {
                 productsToShow = relatedDb;
            } else {
                 // Fallback: Lấy các sản phẩm HOT hoặc ngẫu nhiên từ constants
                 productsToShow = PRODUCTS.filter(p => p.isHot).slice(0, 4);
            }
            
            // Xử lý ảnh fallback cho sản phẩm
            const enhancedProducts = productsToShow.map(p => {
                if (!p.image) {
                     const fallback = PRODUCTS.find(fp => fp.id === p.id);
                     return fallback ? { ...p, image: fallback.image } : { ...p, image: 'https://via.placeholder.com/150' };
                }
                return p;
            });

            setRecommendedProducts(enhancedProducts);
        }
    };
    fetchPostAndRecommendations();

    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollTop;
      const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scroll = `${totalScroll / windowHeight}`;
      setScrollProgress(Number(scroll));
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [id]);

  if (!post) {
    return <div className="min-h-screen pt-32 text-center text-gray-500 font-medium">Đang tải bài viết...</div>;
  }

  // --- SMART CONTENT RENDERER ---
  // Hàm này xử lý hiển thị nội dung, hỗ trợ HTML tag từ Admin
  const renderContent = (content: string) => {
    if (!content) return null;

    // Nếu nội dung có thẻ HTML (do admin mới chèn), render trực tiếp
    return (
        <div 
            className="blog-content"
            dangerouslySetInnerHTML={{ __html: content.replace(/\n/g, '<br/>') }} 
        />
    );
  };

  return (
    <main className="min-h-screen bg-[#F5F5F7] pb-20 relative font-sans selection:bg-primary selection:text-white">
      
      {/* Reading Progress Bar */}
      <div className="fixed top-0 left-0 h-1 bg-gray-200 z-[60] w-full">
        <div 
          className="h-full bg-primary transition-all duration-150 ease-out shadow-[0_0_10px_rgba(0,113,227,0.5)]" 
          style={{ width: `${scrollProgress * 100}%` }}
        ></div>
      </div>

      {/* Top Navigation Bar */}
      <div className="pt-24 pb-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link 
          to="/blog" 
          className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-black transition-colors group"
        >
          <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center group-hover:border-black group-hover:text-black transition-all shadow-sm">
             <ArrowLeft size={16} />
          </div>
          Quay lại Newsroom
        </Link>
      </div>

      {/* Article Header */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center mb-16">
         <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-gray-200 shadow-sm mb-6 animate-fade-in">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
            <span className="text-xs font-bold uppercase tracking-wider text-gray-800">{post.category}</span>
         </div>
         
         <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 mb-8 leading-[1.1] tracking-tight animate-fade-in-up">
           {post.title}
         </h1>

         {/* Author Meta */}
         <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-500 font-bold mb-12 animate-fade-in-up" style={{animationDelay: '0.1s'}}>
            <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-gray-100 shadow-sm">
               <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white">
                  <User size={12} />
               </div>
               <span className="text-gray-900">{post.author}</span>
            </div>
            <div className="flex items-center gap-1.5">
               <Calendar size={16} className="text-gray-400" /> {post.date}
            </div>
            <div className="flex items-center gap-1.5">
               <Clock size={16} className="text-gray-400" /> {post.readTime} đọc
            </div>
         </div>

         {/* Hero Image */}
         <div className="relative w-full aspect-[21/9] rounded-[2rem] overflow-hidden shadow-2xl shadow-gray-200 group border-[4px] border-white animate-fade-in-up" style={{animationDelay: '0.2s'}}>
            <img 
              src={post.image || 'https://via.placeholder.com/800x400?text=No+Cover+Image'} 
              alt={post.title} 
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent pointer-events-none"></div>
         </div>
      </div>

      {/* Main Content Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 relative">
           
           {/* LEFT SIDEBAR: Share (Desktop) */}
           <div className="hidden lg:block lg:col-span-1">
              <div className="sticky top-32 flex flex-col items-center gap-6">
                 <div className="w-px h-12 bg-gray-200"></div>
                 <button className="p-3 rounded-full bg-white text-gray-400 hover:text-[#1877F2] hover:shadow-lg hover:shadow-blue-500/20 transition-all border border-gray-100">
                    <Facebook size={20} />
                 </button>
                 <button className="p-3 rounded-full bg-white text-gray-400 hover:text-black hover:shadow-lg transition-all border border-gray-100">
                    <Twitter size={20} />
                 </button>
                 <button 
                    className="p-3 rounded-full bg-white text-gray-400 hover:text-primary hover:shadow-lg hover:shadow-primary/20 transition-all border border-gray-100" 
                    onClick={() => {navigator.clipboard.writeText(window.location.href); alert('Link copied!')}}
                 >
                    <LinkIcon size={20} />
                 </button>
                 <div className="w-px h-full bg-gray-200 min-h-[100px]"></div>
              </div>
           </div>

           {/* MAIN ARTICLE CONTENT */}
           <div className="lg:col-span-7">
              {/* Styling for inserted HTML content */}
              <style>{`
                .blog-content h2 { font-size: 1.75rem; font-weight: 800; color: #111; margin-top: 2.5rem; margin-bottom: 1rem; letter-spacing: -0.02em; }
                .blog-content h3 { font-size: 1.4rem; font-weight: 700; color: #333; margin-top: 2rem; margin-bottom: 0.75rem; }
                .blog-content p { font-size: 1.125rem; line-height: 1.8; color: #4b5563; margin-bottom: 1.5rem; }
                .blog-content ul { list-style-type: disc; padding-left: 1.5rem; margin-bottom: 1.5rem; color: #4b5563; }
                .blog-content li { margin-bottom: 0.5rem; }
                .blog-content img { width: 100%; border-radius: 1.5rem; margin: 2rem 0; box-shadow: 0 10px 30px -10px rgba(0,0,0,0.1); border: 1px solid rgba(0,0,0,0.05); transition: transform 0.3s; }
                .blog-content img:hover { transform: scale(1.02); }
                .blog-content blockquote { border-left: 4px solid #0071E3; padding-left: 1.5rem; font-style: italic; font-size: 1.2rem; color: #333; background: #fff; padding: 1.5rem; border-radius: 0 1rem 1rem 0; margin: 2rem 0; }
                .blog-content strong { color: #111; font-weight: 700; }
                .drop-cap::first-letter { float: left; font-size: 3.5rem; line-height: 0.8; font-weight: 800; margin-right: 0.75rem; color: #0071E3; }
              `}</style>

              <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-sm border border-gray-100">
                  {/* Sapo */}
                  <p className="text-xl md:text-2xl font-medium text-gray-800 leading-relaxed mb-8 border-b border-gray-100 pb-8 drop-cap">
                     {post.excerpt}
                  </p>

                  {/* Body */}
                  <div className="blog-content">
                     {renderContent(post.content)}
                  </div>
              </div>
              
              <div className="mt-12 flex items-center justify-between p-6 bg-white rounded-3xl border border-gray-100 shadow-sm">
                 <span className="font-bold text-gray-900 text-lg">Bài viết này có hữu ích?</span>
                 <div className="flex gap-3">
                    <button className="flex items-center gap-2 px-5 py-2.5 bg-gray-50 rounded-full font-bold text-gray-600 hover:bg-green-50 hover:text-green-600 transition-all">
                       👍 Hữu ích
                    </button>
                    <button className="flex items-center gap-2 px-5 py-2.5 bg-gray-50 rounded-full font-bold text-gray-600 hover:bg-red-50 hover:text-red-600 transition-all">
                       👎 Không
                    </button>
                 </div>
              </div>
           </div>

           {/* RIGHT SIDEBAR: Recommended Tools */}
           <div className="lg:col-span-4">
              <div className="sticky top-32 space-y-6">
                
                <div className="bg-gradient-to-b from-gray-900 to-black rounded-[2rem] p-6 text-white shadow-xl">
                   <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-md">
                         <Zap size={20} className="text-yellow-400 fill-yellow-400" />
                      </div>
                      <div>
                         <h3 className="font-bold text-lg leading-none">Công cụ đề xuất</h3>
                         <p className="text-xs text-gray-400 mt-1">Dành riêng cho bài viết này</p>
                      </div>
                   </div>

                   <div className="space-y-4">
                      {recommendedProducts.map((prod) => (
                         <div key={prod.id} className="group flex items-center gap-4 bg-white/10 hover:bg-white/20 p-3 rounded-2xl border border-white/5 transition-all cursor-pointer">
                            <div className="w-14 h-14 rounded-xl bg-white overflow-hidden shrink-0">
                               <img src={prod.image} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                            </div>
                            <div className="flex-1 min-w-0">
                               <h4 className="font-bold text-sm truncate">{prod.name}</h4>
                               <div className="flex items-center gap-2 mt-1">
                                  <span className="text-xs font-bold text-green-400">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(prod.price)}</span>
                                  {prod.discount > 0 && <span className="text-[10px] text-gray-400 line-through">-{prod.discount}%</span>}
                               </div>
                            </div>
                            <button 
                               onClick={() => addToCart(prod)}
                               className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center hover:scale-110 transition-transform"
                            >
                               <ShoppingCart size={14} strokeWidth={2.5} />
                            </button>
                         </div>
                      ))}
                   </div>
                   
                   <Link to="/products" className="block text-center text-sm font-bold text-gray-400 hover:text-white mt-6 transition-colors">
                      Xem tất cả sản phẩm &rarr;
                   </Link>
                </div>

                {/* Newsletter Box */}
                <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 text-center">
                   <h3 className="font-bold text-gray-900 mb-2">Đừng bỏ lỡ ưu đãi!</h3>
                   <p className="text-sm text-gray-500 mb-4">Nhận mã giảm giá 50% hàng tuần.</p>
                   <div className="relative">
                      <input type="email" placeholder="Email của bạn" className="w-full pl-4 pr-10 py-3 bg-gray-50 rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-none" />
                      <button className="absolute right-2 top-2 p-1.5 bg-primary text-white rounded-lg hover:bg-primary-hover">
                         <ChevronRight size={16} />
                      </button>
                   </div>
                </div>

              </div>
           </div>
        </div>
      </div>
    </main>
  );
};
