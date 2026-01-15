
import React, { useEffect, useState } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { PRODUCTS, BLOG_POSTS } from '../constants';
import { Product, BlogPost as BlogPostType } from '../types';
import { 
  ArrowLeft, Clock, Calendar, Facebook, Twitter, 
  Link as LinkIcon, ChevronRight, User, ShoppingCart, Zap, Star, Share2, ArrowUp, Home
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
  const [showFloatingBar, setShowFloatingBar] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchPostAndRecommendations = async () => {
        if (!paramSlug) return;
        
        let foundPost: BlogPostType | null = null;

        // 1. Fetch Blog Post
        const { data: allBlogs } = await supabase.from('blogs').select('*');
        
        if (allBlogs) {
            foundPost = allBlogs.find((b: BlogPostType) => {
                const bSlug = b.slug || slugify(b.title);
                return bSlug === paramSlug || String(b.id) === paramSlug;
            }) || null;
        }

        // 2. Fallback to constant
        if (!foundPost) {
            foundPost = BLOG_POSTS.find(p => {
                const pSlug = slugify(p.title);
                return pSlug === paramSlug || String(p.id) === paramSlug;
            }) || null;
        }
        
        if (foundPost) {
            // Fix image fallback
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
            
            // 3. Recommendation Logic
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
      
      // Show floating bar after scrolling down a bit
      setShowFloatingBar(totalScroll > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [paramSlug]);

  if (!post) {
    return <div className="min-h-screen pt-32 text-center text-gray-500 font-medium">Đang tải bài viết...</div>;
  }

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
    <main className="min-h-screen bg-white font-sans selection:bg-primary/20 selection:text-primary pb-32">
      
      <SEO 
        title={post.title}
        description={post.excerpt}
        image={post.image}
        type="article"
        schema={articleSchema}
      />

      {/* 1. Reading Progress Bar (Fixed Top) */}
      <div className="fixed top-0 left-0 h-1.5 w-full z-[100] bg-transparent">
        <div 
          className="h-full bg-primary transition-all duration-100 ease-out" 
          style={{ width: `${scrollProgress * 100}%` }}
        ></div>
      </div>

      {/* 2. Top Navigation (Floating Glass) */}
      <div className="fixed top-4 left-4 z-50">
         <button 
            onClick={() => navigate('/blog')}
            className="w-10 h-10 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg border border-white/20 text-gray-900 active:scale-90 transition-all hover:bg-white"
         >
            <ArrowLeft size={20} />
         </button>
      </div>

      {/* 3. Immersive Header */}
      <header className="relative w-full">
         <div className="aspect-[4/3] lg:aspect-[21/9] w-full relative overflow-hidden">
            <img 
               src={post.image} 
               alt={post.title} 
               className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent opacity-90 h-32 bottom-0 top-auto"></div>
         </div>
      </header>

      {/* 4. Article Container */}
      <article className="max-w-3xl mx-auto px-6 -mt-12 relative z-10">
         
         {/* Meta & Title */}
         <div className="bg-white rounded-t-[2.5rem] pt-8 pb-6">
             <div className="flex items-center gap-3 mb-4">
                <span className="px-3 py-1 bg-gray-100 rounded-full text-[10px] font-extrabold uppercase tracking-wider text-gray-600">
                    {post.category}
                </span>
                <span className="text-gray-400 text-xs font-medium">• {post.readTime} read</span>
             </div>
             
             <h1 className="text-3xl md:text-5xl font-black text-gray-900 leading-[1.15] mb-6 tracking-tight">
                {post.title}
             </h1>

             <div className="flex items-center justify-between border-b border-gray-100 pb-8 mb-8">
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-full bg-gray-100 overflow-hidden">
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold">
                         {post.author.charAt(0)}
                      </div>
                   </div>
                   <div>
                      <div className="font-bold text-sm text-gray-900">{post.author}</div>
                      <div className="text-xs text-gray-500">{post.date}</div>
                   </div>
                </div>
                <div className="flex gap-2">
                   <button className="p-2 rounded-full text-gray-400 hover:bg-gray-100 hover:text-blue-600 transition-colors">
                      <Facebook size={20} />
                   </button>
                   <button 
                      className="p-2 rounded-full text-gray-400 hover:bg-gray-100 hover:text-black transition-colors"
                      onClick={() => {navigator.clipboard.writeText(window.location.href); alert('Đã sao chép liên kết!')}}
                   >
                      <LinkIcon size={20} />
                   </button>
                </div>
             </div>

             {/* Excerpt */}
             <p className="text-xl font-medium text-gray-700 leading-relaxed mb-10 italic border-l-4 border-primary pl-5">
                {post.excerpt}
             </p>

             {/* Main Content with Typography Upgrade */}
             <div 
                className="prose prose-lg prose-gray max-w-none 
                prose-headings:font-bold prose-headings:text-gray-900 prose-headings:tracking-tight
                prose-p:text-gray-800 prose-p:leading-8 prose-p:text-[1.125rem]
                prose-a:text-primary prose-a:no-underline prose-a:font-bold hover:prose-a:underline
                prose-img:rounded-3xl prose-img:shadow-lg prose-img:w-full prose-img:my-8
                prose-blockquote:border-l-primary prose-blockquote:bg-gray-50 prose-blockquote:py-2 prose-blockquote:rounded-r-xl
                "
                dangerouslySetInnerHTML={{ __html: post.content }}
             />
         </div>

      </article>

      {/* 5. Recommended Products Section */}
      {recommendedProducts.length > 0 && (
        <div className="mt-16 py-12 bg-gray-50 border-t border-gray-200">
           <div className="max-w-7xl mx-auto px-6">
              <div className="flex items-center gap-2 mb-8">
                 <Zap className="text-yellow-500 fill-yellow-500" />
                 <h3 className="text-2xl font-extrabold text-gray-900">Recommended Tools</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                 {recommendedProducts.map(p => (
                    <ProductCard key={p.id} product={p} onAddToCart={addToCart} />
                 ))}
              </div>
           </div>
        </div>
      )}

      {/* 6. Floating Bottom Action Bar */}
      <div 
        className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-40 transition-all duration-500 ${showFloatingBar ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}
      >
         <div className="bg-white/90 backdrop-blur-xl border border-white/20 shadow-2xl rounded-full px-6 py-3 flex items-center gap-6">
            <button 
               onClick={() => {navigator.clipboard.writeText(window.location.href); alert('Link copied!')}}
               className="flex flex-col items-center gap-1 text-gray-500 hover:text-gray-900 group"
            >
               <Share2 size={20} className="group-hover:scale-110 transition-transform" />
            </button>
            <div className="w-px h-8 bg-gray-200"></div>
            <Link to="/" className="flex flex-col items-center gap-1 text-gray-500 hover:text-primary group">
               <Home size={20} className="group-hover:scale-110 transition-transform" />
            </Link>
            <div className="w-px h-8 bg-gray-200"></div>
            <button 
               onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
               className="flex flex-col items-center gap-1 text-gray-500 hover:text-gray-900 group"
            >
               <ArrowUp size={20} className="group-hover:-translate-y-1 transition-transform" />
            </button>
         </div>
      </div>

    </main>
  );
};
