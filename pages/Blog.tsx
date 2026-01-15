
import React, { useEffect, useState } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { Clock, ArrowRight, User, Sparkles, TrendingUp, ChevronRight, Search, Hash } from 'lucide-react';
import { BlogPost } from '../types';
import { supabase } from '../lib/supabase';
import { BLOG_POSTS as FALLBACK_POSTS } from '../constants';
import { slugify } from '../lib/utils';

const { Link } = ReactRouterDOM;

const CATEGORIES = [
  "All", "Công nghệ AI", "Thủ thuật", "Review", "Bảo mật", "Tin tức", "Design"
];

export const Blog: React.FC = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchPosts = async () => {
      try {
        const { data, error } = await supabase.from('blogs').select('*').order('created_at', { ascending: false });
        
        if (!error && data && data.length > 0) {
            const enhancedPosts = data.map((post: BlogPost) => {
                if (!post.image || post.image.trim() === '') {
                    const fallback = FALLBACK_POSTS.find(fp => String(fp.id) === String(post.id));
                    return fallback 
                        ? { ...post, image: fallback.image } 
                        : { ...post, image: 'https://placehold.co/1200x600?text=No+Image' };
                }
                return post;
            });
            setPosts(enhancedPosts);
        } else {
            setPosts(FALLBACK_POSTS);
        }
      } catch (err) {
        console.error("Error fetching blog:", err);
        setPosts(FALLBACK_POSTS);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  const filteredPosts = activeCategory === "All" 
    ? posts 
    : posts.filter(p => p.category === activeCategory);

  const featuredPost = filteredPosts[0];
  const otherPosts = filteredPosts.slice(1);

  if (loading) return (
    <div className="min-h-screen pt-32 flex flex-col items-center justify-center bg-gray-50">
       <div className="w-8 h-8 border-4 border-gray-900 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <main className="min-h-screen bg-[#F9F9FB]">
      
      {/* =========================================
          MOBILE LAYOUT (Hiển thị < 1024px)
          Thiết kế: Magazine Style, Vertical Scroll
         ========================================= */}
      <div className="lg:hidden pb-24">
        
        {/* 1. Header Sticky */}
        <div className="pt-20 px-5 pb-2 bg-white sticky top-0 z-30 shadow-[0_4px_20px_-12px_rgba(0,0,0,0.1)]">
            <h1 className="text-2xl font-black text-gray-900 tracking-tight mb-3">Tạp chí công nghệ</h1>
            {/* Horizontal Categories */}
            <div className="flex overflow-x-auto no-scrollbar gap-2 pb-3 -mx-5 px-5">
                {CATEGORIES.map((cat) => (
                    <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={`
                            whitespace-nowrap px-4 py-2 rounded-full text-xs font-bold transition-all border
                            ${activeCategory === cat 
                                ? 'bg-black text-white border-black shadow-md' 
                                : 'bg-white text-gray-500 border-gray-200'
                            }
                        `}
                    >
                        {cat}
                    </button>
                ))}
            </div>
        </div>

        <div className="px-4 mt-6 space-y-8">
            
            {/* 2. Hero Story Card (Full Vertical Image) */}
            {featuredPost && (
                <Link to={`/blog/${featuredPost.slug || slugify(featuredPost.title)}`} className="block group relative w-full aspect-[3/4] rounded-[2rem] overflow-hidden shadow-xl">
                    <img 
                        src={featuredPost.image} 
                        alt={featuredPost.title}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80"></div>
                    
                    <div className="absolute bottom-0 left-0 p-6 w-full">
                        <span className="inline-block px-2 py-1 bg-red-600 text-white text-[10px] font-black uppercase mb-3 rounded">
                            Hot Story
                        </span>
                        <h2 className="text-2xl font-black text-white leading-tight mb-2 line-clamp-3">
                            {featuredPost.title}
                        </h2>
                        <div className="flex items-center gap-2 text-white/70 text-xs font-medium">
                            <span>{featuredPost.author}</span>
                            <span>•</span>
                            <span>{featuredPost.readTime} đọc</span>
                        </div>
                    </div>
                </Link>
            )}

            {/* 3. Trending Carousel (Swipe Horizontal) */}
            <div>
                <div className="flex items-center justify-between mb-4 px-1">
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <TrendingUp size={18} className="text-blue-600" /> Xu hướng
                    </h3>
                </div>
                <div className="flex overflow-x-auto gap-4 pb-4 -mx-4 px-4 snap-x snap-mandatory no-scrollbar">
                    {otherPosts.slice(0, 5).map((post) => (
                        <Link 
                            key={post.id} 
                            to={`/blog/${post.slug || slugify(post.title)}`}
                            className="snap-center flex-shrink-0 w-[260px] bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 block"
                        >
                            <div className="h-32 w-full overflow-hidden relative">
                                <img src={post.image} className="w-full h-full object-cover" />
                                <span className="absolute top-2 right-2 bg-black/60 backdrop-blur text-white text-[9px] px-2 py-1 rounded-full font-bold">
                                    {post.category}
                                </span>
                            </div>
                            <div className="p-4">
                                <h4 className="font-bold text-gray-900 text-sm line-clamp-2 mb-2 leading-snug">
                                    {post.title}
                                </h4>
                                <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">
                                    {post.date}
                                </span>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>

            {/* 4. Recent List (Minimal) */}
            <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4 px-1">Mới nhất</h3>
                <div className="space-y-6">
                    {otherPosts.slice(5).map((post) => (
                        <Link 
                            key={post.id} 
                            to={`/blog/${post.slug || slugify(post.title)}`}
                            className="flex gap-4 items-start pb-6 border-b border-gray-100 last:border-0"
                        >
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1.5">
                                    <span className="text-[10px] font-bold text-blue-600 uppercase">{post.category}</span>
                                </div>
                                <h4 className="text-base font-bold text-gray-900 leading-snug mb-2 line-clamp-2">
                                    {post.title}
                                </h4>
                                <div className="text-xs text-gray-400 flex items-center gap-1">
                                    <Clock size={10} /> {post.readTime}
                                </div>
                            </div>
                            <div className="w-24 h-24 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                                <img src={post.image} className="w-full h-full object-cover" />
                            </div>
                        </Link>
                    ))}
                </div>
            </div>

        </div>
      </div>

      {/* =========================================
          DESKTOP LAYOUT (Hiển thị >= 1024px)
          Thiết kế: Standard Grid, Clean
         ========================================= */}
      <div className="hidden lg:block pt-32 pb-24 max-w-7xl mx-auto px-8">
        
        {/* Header */}
        <div className="text-center mb-16">
            <h1 className="text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">Newsroom</h1>
            <p className="text-xl text-gray-500">Kiến thức, thủ thuật và tin tức công nghệ mới nhất.</p>
            
            {/* Desktop Categories */}
            <div className="flex items-center justify-center gap-2 mt-8">
                {CATEGORIES.map((cat) => (
                    <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={`px-5 py-2 rounded-full text-sm font-bold transition-all ${activeCategory === cat ? 'bg-black text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                    >
                        {cat}
                    </button>
                ))}
            </div>
        </div>

        {/* Featured Post (Landscape) */}
        {featuredPost && (
            <Link to={`/blog/${featuredPost.slug || slugify(featuredPost.title)}`} className="group block mb-16">
                <div className="grid grid-cols-2 gap-8 items-center bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 hover:shadow-xl transition-all">
                    <div className="aspect-[16/10] rounded-3xl overflow-hidden relative">
                        <img src={featuredPost.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    </div>
                    <div className="pr-8">
                        <div className="flex items-center gap-2 mb-4">
                            <span className="bg-red-50 text-red-600 px-3 py-1 rounded-full text-xs font-bold uppercase">Featured</span>
                            <span className="text-gray-400 text-sm">• {featuredPost.date}</span>
                        </div>
                        <h2 className="text-4xl font-extrabold text-gray-900 mb-6 leading-tight group-hover:text-blue-600 transition-colors">
                            {featuredPost.title}
                        </h2>
                        <p className="text-gray-600 text-lg mb-6 line-clamp-3">
                            {featuredPost.excerpt}
                        </p>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold">
                                {featuredPost.author.charAt(0)}
                            </div>
                            <div className="text-sm font-bold text-gray-900">{featuredPost.author}</div>
                        </div>
                    </div>
                </div>
            </Link>
        )}

        {/* Grid Posts */}
        <div className="grid grid-cols-3 gap-10">
            {otherPosts.map(post => (
                <Link key={post.id} to={`/blog/${post.slug || slugify(post.title)}`} className="group flex flex-col">
                    <div className="aspect-[16/10] rounded-3xl overflow-hidden mb-5 bg-gray-100 relative">
                        <img src={post.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-lg text-xs font-bold shadow-sm">
                            {post.category}
                        </div>
                    </div>
                    <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 mb-3 leading-snug group-hover:text-blue-600 transition-colors line-clamp-2">
                            {post.title}
                        </h3>
                        <p className="text-gray-500 text-sm line-clamp-2 mb-4">
                            {post.excerpt}
                        </p>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wide">
                        <Clock size={12} /> {post.readTime} đọc
                    </div>
                </Link>
            ))}
        </div>

      </div>
    </main>
  );
};
