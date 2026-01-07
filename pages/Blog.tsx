
import React, { useEffect, useState } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { Clock, ArrowRight, User, Sparkles } from 'lucide-react';
import { BlogPost } from '../types';
import { supabase } from '../lib/supabase';
import { BLOG_POSTS as FALLBACK_POSTS } from '../constants';
import { slugify } from '../lib/utils';

const { Link } = ReactRouterDOM;

export const Blog: React.FC = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchPosts = async () => {
      try {
        const { data, error } = await supabase.from('blogs').select('*').order('created_at', { ascending: false });
        
        if (!error && data && data.length > 0) {
            // MERGE LOGIC: Nếu ảnh trong DB rỗng, lấy từ FALLBACK_POSTS
            const enhancedPosts = data.map((post: BlogPost) => {
                if (!post.image || post.image.trim() === '') {
                    // Tìm bài viết tương ứng trong file constants (so sánh ID dạng chuỗi)
                    const fallback = FALLBACK_POSTS.find(fp => String(fp.id) === String(post.id));
                    // Nếu tìm thấy fallback thì dùng ảnh fallback, không thì dùng placeholder
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

  if (loading) return <div className="min-h-screen pt-32 text-center font-bold text-gray-500">Đang tải tin tức...</div>;

  const featuredPost = posts[0];
  const regularPosts = posts.slice(1);

  return (
    <main className="min-h-screen bg-[#F2F2F7] pt-28 pb-24">
      
      {/* Blog Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-gray-200 shadow-sm mb-4">
            <Sparkles size={14} className="text-yellow-500 fill-yellow-500" />
            <span className="text-xs font-bold uppercase tracking-wide text-gray-600">Newsroom</span>
        </div>
        <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-6 tracking-tight leading-tight">
          Kiến thức & Công nghệ
        </h1>
        <p className="text-gray-500 text-lg md:text-xl max-w-2xl mx-auto font-medium leading-relaxed">
          Cập nhật xu hướng AI mới nhất, mẹo sử dụng phần mềm và các giải pháp tối ưu hóa công việc hàng ngày của bạn.
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Featured Post - Large Card */}
        {featuredPost && (
          <Link to={`/blog/${featuredPost.slug || slugify(featuredPost.title)}`} className="group block mb-16">
            <div className="bg-white rounded-[2.5rem] overflow-hidden shadow-soft border border-white/50 hover:shadow-2xl transition-all duration-500 grid grid-cols-1 md:grid-cols-2 relative z-10">
              <div className="relative overflow-hidden aspect-[16/10] md:aspect-auto h-full">
                <img 
                  src={featuredPost.image || 'https://placehold.co/1200x600?text=No+Image'} 
                  alt={featuredPost.title} 
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 ease-out" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              </div>
              <div className="p-8 md:p-12 lg:p-16 flex flex-col justify-center bg-white relative">
                <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                    <Sparkles size={120} />
                </div>
                <div className="flex items-center gap-3 mb-6 relative z-10">
                    <span className="bg-black text-white text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wide">
                      Tiêu điểm
                    </span>
                    <span className="bg-gray-100 text-gray-600 text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wide">
                      {featuredPost.category}
                    </span>
                </div>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-gray-900 mb-6 leading-[1.1] group-hover:text-primary transition-colors tracking-tight">
                  {featuredPost.title}
                </h2>
                <p className="text-gray-500 mb-8 line-clamp-3 text-lg leading-relaxed font-medium">
                  {featuredPost.excerpt}
                </p>
                <div className="flex items-center justify-between mt-auto pt-6 border-t border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 border border-gray-200">
                          <User size={18} />
                      </div>
                      <div>
                          <div className="text-sm font-bold text-gray-900">{featuredPost.author}</div>
                          <div className="text-xs text-gray-400 font-medium">{featuredPost.date}</div>
                      </div>
                    </div>
                    <span className="flex items-center gap-2 text-primary font-bold text-sm bg-primary/5 px-4 py-2 rounded-full group-hover:bg-primary group-hover:text-white transition-all">
                      Đọc tiếp <ArrowRight size={16} />
                    </span>
                </div>
              </div>
            </div>
          </Link>
        )}

        {/* Regular Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {regularPosts.map((post) => (
            <Link key={post.id} to={`/blog/${post.slug || slugify(post.title)}`} className="group flex flex-col bg-white rounded-[2rem] overflow-hidden shadow-sm border border-transparent hover:border-gray-200 hover:shadow-xl hover:-translate-y-2 transition-all duration-500">
              <div className="relative aspect-[16/10] overflow-hidden bg-gray-100">
                <img 
                  src={post.image || 'https://placehold.co/800x600?text=No+Image'} 
                  alt={post.title} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                />
                <div className="absolute top-4 left-4">
                   <span className="bg-white/90 backdrop-blur-md text-gray-900 text-[10px] font-bold px-3 py-1.5 rounded-full shadow-sm uppercase tracking-wide">
                      {post.category}
                   </span>
                </div>
              </div>
              <div className="p-6 flex flex-col flex-1">
                <div className="flex items-center gap-2 text-gray-400 text-xs font-bold mb-3 uppercase tracking-wide">
                   <Clock size={12} />
                   <span>{post.readTime} đọc</span>
                </div>
                {/* Title always bold as requested */}
                <h3 className="text-xl font-extrabold text-gray-900 mb-3 leading-snug group-hover:text-primary transition-colors line-clamp-2 tracking-tight">
                  {post.title}
                </h3>
                <p className="text-gray-500 text-sm line-clamp-2 mb-6 leading-relaxed font-medium">
                  {post.excerpt}
                </p>
                <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between">
                   <div className="flex items-center gap-2">
                       <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                           <User size={12} />
                       </div>
                       <span className="text-xs font-bold text-gray-600">{post.author}</span>
                   </div>
                   <span className="text-gray-300 group-hover:text-primary transition-colors">
                       <ArrowRight size={20} />
                   </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
};
