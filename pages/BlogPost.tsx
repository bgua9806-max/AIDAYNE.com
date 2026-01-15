
import React, { useEffect, useState } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { PRODUCTS, BLOG_POSTS } from '../constants';
import { Product, BlogPost as BlogPostType } from '../types';
import { 
  ArrowLeft, Clock, Calendar, Facebook, Twitter, 
  Link as LinkIcon, ChevronRight, User, ShoppingCart, Zap, Star, Share2, Home, ArrowUp
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { ProductCard } from '../components/ProductCard';
import { slugify } from '../lib/utils';
import { SEO } from '../components/SEO';

const { useParams, Link, useNavigate } = ReactRouterDOM;

interface BlogPostProps {
  addToCart: (product: Product) => void;
}

export const BlogPost: React.FC<BlogPostProps> = ({ addToCart }) => {
  const { id: paramSlug } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<BlogPostType | null>(null);
  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([]);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchPostAndRecommendations = async () => {
        if (!paramSlug) return;
        
        let foundPost: BlogPostType | null = null;

        const { data: allBlogs } = await supabase.from('blogs').select('*');
        
        if (allBlogs) {
            foundPost = allBlogs.find((b: BlogPostType) => {
                const bSlug = b.slug || slugify(b.title);
                return bSlug === paramSlug || String(b.id) === paramSlug;
            }) || null;
        }

        if (!foundPost) {
            foundPost = BLOG_POSTS.find(p => {
                const pSlug = slugify(p.title);
                return pSlug === paramSlug || String(p.id) === paramSlug;
            }) || null;
        }
        
        if (foundPost) {
            let enrichedPost = foundPost;
            if (!enrichedPost.image || enrichedPost.image.trim() === '') {
                 const fallback = BLOG_POSTS.find(p => String(p.id) === String(enrichedPost.id));
                 if (fallback) {
                    enrichedPost = { ...enrichedPost, image: fallback.image };
                 } else {
                    enrichedPost = { ...enrichedPost, image: 'https://placehold.co/1200x600?text=No+Cover+Image' };
                 }
            }
            setPost(enrichedPost);
            
            let productsToShow: Product[] = [];
            const mapCategory: {[key: string]: string} = {
                'Công nghệ AI': 'ai',
                'Thủ thuật': 'work',
                'Đánh giá': 'entertainment',
                'Bảo mật': 'security',
                'Thiết kế': 'design',
                'Tin tức': 'ai'
            };
            
            let targetCategory = mapCategory[enrichedPost.category] || 'work';
            
            const { data: relatedDb, error } = await supabase
                .from('products')
                .select('*')
                .eq('category', targetCategory)
                .limit(4);

            if (!error && relatedDb && relatedDb.length > 0) {
                 productsToShow = relatedDb;
            } else {
                 productsToShow = PRODUCTS.filter(p => p.isHot).slice(0, 4);
            }
            
            const enhancedProducts = productsToShow.map(p => {
                if (!p.image || (typeof p.image === 'string' && p.image.trim() === '')) {
                     const fallback = PRODUCTS.find(fp => String(fp.id) === String(p.id));
                     return fallback ? { ...p, image: fallback.image } : { ...p, image: 'https://placehold.co/400x400?text=No+Image' };
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
  }, [paramSlug]);

  if (!post) {
    return <div className="min-h-screen pt-32 text-center text-gray-500 font-medium">Đang tải bài viết...</div>;
  }

  const renderContent = (content: string) => {
    if (!content) return null;
    return (
        <div 
            className="blog-content prose prose-lg prose-headings:font-bold prose-headings:text-gray-900 prose-p:text-gray-600 prose-a:text-blue-600 max-w-none"
            dangerouslySetInnerHTML={{ __html: content }} 
        />
    );
  };

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": post.title,
    "image": post.image,
    "author": { "@type": "Person", "name": post.author },
    "publisher": { "@type": "Organization", "name": "AIDAYNE" },
    "datePublished": post.date
  };

  return (
    <main className="min-h-screen bg-white font-sans selection:bg-primary/20 selection:text-primary">
      <SEO title={post.title} description={post.excerpt} image={post.image} type="article" schema={articleSchema} />

      {/* ==============================================================
          MOBILE LAYOUT ( < 1024px )
          Focus: Immersive, Readable, Floating Actions
      ================================================================== */}
      <div className="lg:hidden pb-32">
         
         {/* 1. Progress Bar (Fixed Top) */}
         <div className="fixed top-0 left-0 h-1 z-[60] w-full bg-gray-100">
            <div className="h-full bg-blue-600 transition-all duration-100" style={{ width: `${scrollProgress * 100}%` }}></div>
         </div>

         {/* 2. Floating Header Actions */}
         <div className="fixed top-4 left-4 z-50">
            <button onClick={() => navigate('/blog')} className="w-10 h-10 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-lg border border-gray-100 text-gray-800 active:scale-90 transition-transform">
                <ArrowLeft size={20} />
            </button>
         </div>

         {/* 3. Immersive Header Image */}
         <div className="relative w-full aspect-[4/3]">
            <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent opacity-90 h-24 bottom-0 top-auto"></div>
         </div>

         {/* 4. Content Container */}
         <article className="px-5 -mt-6 relative z-10">
            {/* Meta */}
            <div className="flex items-center gap-3 mb-4">
                <span className="px-3 py-1 bg-gray-100 rounded-full text-[10px] font-extrabold uppercase tracking-wider text-gray-600">
                    {post.category}
                </span>
                <span className="text-gray-400 text-xs font-bold">• {post.readTime}</span>
            </div>

            {/* Title */}
            <h1 className="text-3xl font-black text-gray-900 leading-[1.15] mb-6 tracking-tight">
                {post.title}
            </h1>

            {/* Author */}
            <div className="flex items-center gap-3 border-b border-gray-100 pb-6 mb-6">
                <div className="w-10 h-10 rounded-full bg-gray-100 overflow-hidden">
                    <div className="w-full h-full flex items-center justify-center bg-blue-600 text-white font-bold">
                        {post.author.charAt(0)}
                    </div>
                </div>
                <div>
                    <div className="font-bold text-sm text-gray-900">{post.author}</div>
                    <div className="text-xs text-gray-500">{post.date}</div>
                </div>
            </div>

            {/* Sapo */}
            <p className="text-lg font-medium text-gray-800 leading-relaxed mb-8 italic pl-4 border-l-4 border-blue-600">
                {post.excerpt}
            </p>

            {/* Main Body (Styled for Mobile) */}
            <div className="prose prose-lg max-w-none prose-p:text-[1.125rem] prose-p:leading-8 prose-p:text-gray-700 prose-headings:font-bold prose-img:rounded-2xl prose-img:shadow-sm">
                <div dangerouslySetInnerHTML={{ __html: post.content }} />
            </div>
         </article>

         {/* 5. Sticky Bottom Action Bar */}
         <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
             <div className="bg-white/90 backdrop-blur-md border border-gray-200 shadow-2xl rounded-full px-6 py-3 flex items-center gap-8">
                <button onClick={() => {navigator.clipboard.writeText(window.location.href); alert('Đã sao chép link!')}} className="text-gray-500 hover:text-black">
                    <Share2 size={20} />
                </button>
                <div className="w-px h-6 bg-gray-300"></div>
                <button onClick={() => navigate('/')} className="text-gray-500 hover:text-blue-600">
                    <Home size={20} />
                </button>
                <div className="w-px h-6 bg-gray-300"></div>
                <button onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})} className="text-gray-500 hover:text-black">
                    <ArrowUp size={20} />
                </button>
             </div>
         </div>
      </div>

      {/* ==============================================================
          DESKTOP LAYOUT ( >= 1024px )
          Restored to Standard, Clean, Grid Layout
      ================================================================== */}
      <div className="hidden lg:block pt-32 pb-20 max-w-7xl mx-auto px-8">
         <div className="grid grid-cols-12 gap-12">
            
            {/* Main Column */}
            <div className="col-span-8">
                <Link to="/blog" className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-black mb-8">
                    <ArrowLeft size={16} /> Quay lại
                </Link>

                <div className="mb-8">
                    <span className="text-blue-600 font-bold uppercase text-xs tracking-wider mb-3 block">{post.category}</span>
                    <h1 className="text-5xl font-extrabold text-gray-900 leading-tight mb-6">{post.title}</h1>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                            <User size={16} /> {post.author}
                        </div>
                        <div>•</div>
                        <div>{post.date}</div>
                        <div>•</div>
                        <div>{post.readTime} đọc</div>
                    </div>
                </div>

                <div className="w-full aspect-[21/9] rounded-3xl overflow-hidden mb-12 bg-gray-100">
                    <img src={post.image} className="w-full h-full object-cover" />
                </div>

                <div className="bg-white rounded-3xl p-0">
                    <p className="text-xl text-gray-600 leading-relaxed font-medium mb-10 border-l-4 border-blue-500 pl-6 py-1">
                        {post.excerpt}
                    </p>
                    {renderContent(post.content)}
                </div>
            </div>

            {/* Sidebar Column */}
            <div className="col-span-4 space-y-8">
                <div className="sticky top-32">
                    <div className="bg-gray-50 rounded-3xl p-8 border border-gray-100">
                        <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                            <Zap size={20} className="text-yellow-500 fill-yellow-500" /> Sản phẩm gợi ý
                        </h3>
                        <div className="space-y-6">
                            {recommendedProducts.map(p => (
                                <div key={p.id} className="flex gap-4 items-start group cursor-pointer" onClick={() => navigate(`/product/${p.slug || slugify(p.name)}`)}>
                                    <div className="w-16 h-16 rounded-xl bg-white border border-gray-200 overflow-hidden flex-shrink-0">
                                        <img src={p.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900 text-sm line-clamp-2 leading-snug group-hover:text-blue-600 transition-colors">{p.name}</h4>
                                        <div className="text-blue-600 font-extrabold text-sm mt-1">
                                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p.price)}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

         </div>
      </div>

    </main>
  );
};
