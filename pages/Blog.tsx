
import React, { useEffect, useState } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { Clock, ArrowRight, User, Sparkles, TrendingUp, ChevronRight, Search } from 'lucide-react';
import { BlogPost } from '../types';
import { supabase } from '../lib/supabase';
import { BLOG_POSTS as FALLBACK_POSTS } from '../constants';
import { slugify } from '../lib/utils';

const { Link } = ReactRouterDOM;

const CATEGORIES = [
  "All",
  "Công nghệ AI",
  "Thủ thuật",
  "Review",
  "Bảo mật",
  "Tin tức",
  "Design"
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
            // MERGE LOGIC: Nếu ảnh trong DB rỗng, lấy từ FALLBACK_POSTS
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

  // Filter Logic
  const filteredPosts = activeCategory === "All" 
    ? posts 
    : posts.filter(p => p.category === activeCategory);

  // Segmentation
  const featuredPost = filteredPosts[0];
  const trendingPosts = filteredPosts.slice(1, 6); // Next 5 posts
  const recentPosts = filteredPosts.slice(6); // The rest

  if (loading) return (
    <div className="min-h-screen pt-32 flex flex-col items-center justify-center bg-gray-50">
       <div className="w-8 h-8 border-4 border-gray-900 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <main className="min-h-screen bg-[#F9F9FB] pb-24">
      
      {/* 1. Header & Search Placeholders (Visual balance) */}
      <div className="pt-28 pb-4 px-5">
        <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-black text-gray-900 tracking-tighter">
              Discover
            </h1>
            <button className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-100 active:scale-90 transition-transform">
                <Search size={20} className="text-gray-600" />
            </button>
        </div>
        <p className="text-gray-500 font-medium text-sm">Insights for the modern creator.</p>
      </div>

      {/* 2. Sticky Glass Category Header */}
      <div className="sticky top-[72px] lg:top-[80px] z-30 bg-[#F9F9FB]/80 backdrop-blur-xl border-b border-gray-200/50 py-3 mb-6">
         <div className="flex overflow-x-auto no-scrollbar px-5 gap-3 snap-x">
            {CATEGORIES.map((cat) => (
                <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`
                        snap-start whitespace-nowrap px-5 py-2.5 rounded-full text-xs font-bold transition-all duration-300
                        ${activeCategory === cat 
                            ? 'bg-gray-900 text-white shadow-lg shadow-gray-900/20 scale-105' 
                            : 'bg-white text-gray-500 border border-gray-200/60 hover:border-gray-300'
                        }
                    `}
                >
                    {cat}
                </button>
            ))}
         </div>
      </div>

      <div className="max-w-7xl mx-auto lg:px-8">
        
        {/* 3. Immersive Hero Section (Vertical Card on Mobile) */}
        {featuredPost && (
          <div className="px-5 lg:px-0 mb-10 lg:mb-16">
             <Link to={`/blog/${featuredPost.slug || slugify(featuredPost.title)}`} className="group block relative">
                <div className="relative w-full aspect-[4/5] lg:aspect-[21/9] rounded-[2rem] overflow-hidden shadow-2xl shadow-gray-900/10">
                    <img 
                        src={featuredPost.image} 
                        alt={featuredPost.title}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-90 lg:via-black/20"></div>
                    
                    {/* Content Overlay */}
                    <div className="absolute bottom-0 left-0 p-6 lg:p-12 w-full">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-lg text-white/90 text-[10px] font-bold uppercase tracking-widest mb-4 border border-white/10">
                            <Sparkles size={10} /> Featured Story
                        </div>
                        <h2 className="text-2xl lg:text-5xl font-black text-white leading-tight mb-3 lg:mb-6 line-clamp-3">
                            {featuredPost.title}
                        </h2>
                        <div className="flex items-center gap-3 text-white/80 text-xs lg:text-sm font-medium">
                            <span>{featuredPost.author}</span>
                            <span className="w-1 h-1 rounded-full bg-white/50"></span>
                            <span>{featuredPost.readTime} đọc</span>
                        </div>
                    </div>
                </div>
             </Link>
          </div>
        )}

        {/* 4. "Trending Now" Horizontal Scroll */}
        {trendingPosts.length > 0 && (
            <div className="mb-10 lg:mb-16">
                <div className="px-5 lg:px-0 mb-5 flex items-center justify-between">
                    <h3 className="text-lg lg:text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <TrendingUp size={18} className="text-red-500" /> Trending Now
                    </h3>
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Swipe <ChevronRight size={12} className="inline"/></span>
                </div>
                
                <div className="flex overflow-x-auto gap-4 px-5 pb-8 lg:px-0 snap-x snap-mandatory no-scrollbar">
                    {trendingPosts.map((post) => (
                        <Link 
                            key={post.id} 
                            to={`/blog/${post.slug || slugify(post.title)}`}
                            className="snap-center flex-shrink-0 w-[240px] lg:w-[320px] group"
                        >
                            <div className="aspect-[3/4] rounded-3xl overflow-hidden mb-4 relative shadow-md">
                                <img 
                                    src={post.image} 
                                    alt={post.title}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                />
                                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur rounded-lg px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-gray-900">
                                    {post.category}
                                </div>
                            </div>
                            <h4 className="text-lg font-bold text-gray-900 leading-tight mb-1 group-hover:text-primary transition-colors line-clamp-2">
                                {post.title}
                            </h4>
                            <p className="text-xs text-gray-500 line-clamp-2">{post.excerpt}</p>
                        </Link>
                    ))}
                </div>
            </div>
        )}

        {/* 5. Minimal List View (Recent) */}
        {recentPosts.length > 0 && (
            <div className="px-5 lg:px-0">
                <div className="mb-6">
                    <h3 className="text-lg lg:text-2xl font-bold text-gray-900">Latest Articles</h3>
                </div>
                
                <div className="space-y-6 lg:grid lg:grid-cols-2 lg:gap-10 lg:space-y-0">
                    {recentPosts.map((post) => (
                        <Link 
                            key={post.id} 
                            to={`/blog/${post.slug || slugify(post.title)}`}
                            className="group flex gap-4 items-start py-4 border-b border-gray-100 last:border-0 lg:border-0"
                        >
                            {/* Text Side (2/3) */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-[10px] font-bold text-primary uppercase tracking-wider">{post.category}</span>
                                    <span className="text-[10px] text-gray-400">• {post.readTime}</span>
                                </div>
                                <h4 className="text-base lg:text-xl font-bold text-gray-900 leading-snug mb-2 group-hover:text-primary transition-colors line-clamp-2">
                                    {post.title}
                                </h4>
                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                    <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center text-[10px] font-bold overflow-hidden">
                                        {post.author.charAt(0)}
                                    </div>
                                    <span>{post.author}</span>
                                </div>
                            </div>

                            {/* Thumbnail Side (1/3) */}
                            <div className="w-24 h-24 lg:w-32 lg:h-32 rounded-2xl overflow-hidden bg-gray-100 flex-shrink-0 shadow-sm group-hover:shadow-md transition-all">
                                <img 
                                    src={post.image} 
                                    alt={post.title} 
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                />
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        )}

      </div>
    </main>
  );
};
