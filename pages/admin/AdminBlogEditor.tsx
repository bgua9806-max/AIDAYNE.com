
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Settings, Globe, Image as ImageIcon, User, Clock, ChevronRight, X, Link as LinkIcon, Calendar } from 'lucide-react';
import { TipTapEditor } from '../../components/editor/TipTapEditor';
import { supabase } from '../../lib/supabase';
import { BlogPost } from '../../types';
import { slugify } from '../../lib/utils';

export const AdminBlogEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Form State
  const [post, setPost] = useState<Partial<BlogPost>>({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    category: 'Công nghệ AI',
    author: 'Admin',
    image: '',
    readTime: '5 phút',
    date: new Date().toISOString().split('T')[0], // Default YYYY-MM-DD for input type="date"
  });

  // Fetch Data if Editing
  useEffect(() => {
    if (id && id !== 'new') {
      const fetchPost = async () => {
        setLoading(true);
        const { data, error } = await supabase.from('blogs').select('*').eq('id', id).single();
        if (!error && data) {
          // Map DB snake_case to camelCase for state
          let formattedDate = data.date;
          if (data.date && data.date.includes('/')) {
             const parts = data.date.split('/');
             if (parts.length === 3) formattedDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
          }
          
          setPost({ 
              ...data, 
              readTime: data.read_time || data.readTime || data.readtime || '5 phút', // Handle various DB column names
              date: formattedDate 
          });
        }
        setLoading(false);
      };
      fetchPost();
    }
  }, [id]);

  // Auto-generate slug from title if slug is empty
  useEffect(() => {
      if (post.title && !post.slug && id === 'new') {
          setPost(prev => ({ ...prev, slug: slugify(post.title || '') }));
      }
  }, [post.title]);

  const handleChange = (field: keyof BlogPost, value: string) => {
    setPost(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!post.title) return alert('Vui lòng nhập tiêu đề bài viết');
    setSaving(true);

    try {
      // Format Date to DD/MM/YYYY for display consistency across app
      let displayDate = post.date;
      if (post.date && post.date.includes('-')) {
          const [year, month, day] = post.date.split('-');
          displayDate = `${day}/${month}/${year}`;
      }

      // Explicitly construct payload mapping to snake_case for better DB compatibility
      const payload = {
        title: post.title,
        slug: post.slug || slugify(post.title || ''),
        excerpt: post.excerpt,
        content: post.content || '',
        author: post.author,
        image: post.image,
        category: post.category,
        read_time: post.readTime || '5 phút', // Using snake_case for DB column
        date: displayDate,
      };

      if (id && id !== 'new') {
        const { error } = await supabase.from('blogs').update(payload).eq('id', id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('blogs').insert([payload]);
        if (error) throw error;
      }
      
      alert('Đã lưu bài viết thành công!');
      navigate('/admin/blog');
    } catch (error: any) {
      console.error("Save error full object:", error);
      
      let errorMessage = 'Lỗi không xác định';
      
      if (typeof error === 'string') {
          errorMessage = error;
      } else if (error && typeof error === 'object') {
          if (error.message) {
              errorMessage = error.message;
          } else if (error.error_description) {
              errorMessage = error.error_description;
          } else {
              try {
                  errorMessage = JSON.stringify(error);
              } catch (e) {
                  errorMessage = "Lỗi object không thể đọc được.";
              }
          }

          // User Friendly Mapping
          if (error.code === '42P01') {
              errorMessage = 'Chưa tạo bảng "blogs" trong Database. Vui lòng chạy lệnh SQL.';
          } else if (error.code === '42703') {
              errorMessage = 'Sai tên cột trong Database. Code đang gửi "read_time", hãy kiểm tra bảng.';
          }
      }
      
      alert('Lỗi khi lưu: ' + errorMessage);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-gray-500">Đang tải dữ liệu...</div>;
  }

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans flex flex-col">
      
      {/* 1. TOP BAR (Sticky) */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100 px-6 py-4 flex items-center justify-between transition-all">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/admin/blog')}
            className="p-2 -ml-2 text-gray-500 hover:text-black hover:bg-gray-100 rounded-full transition-colors"
            title="Quay lại"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex flex-col">
             <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
               {id === 'new' ? 'Viết bài mới' : 'Chỉnh sửa bài viết'}
             </span>
             <span className="text-sm font-semibold text-gray-900 truncate max-w-[200px] sm:max-w-xs">
                {post.title || 'Chưa có tiêu đề'}
             </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
           <button 
             onClick={() => setIsSettingsOpen(!isSettingsOpen)}
             className={`p-2.5 rounded-xl transition-all ${isSettingsOpen ? 'bg-gray-100 text-black' : 'text-gray-500 hover:bg-gray-50'}`}
             title="Cài đặt bài viết"
           >
             <Settings size={20} />
           </button>
           <div className="h-6 w-px bg-gray-200 mx-1"></div>
           <button 
             onClick={handleSave}
             disabled={saving}
             className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white font-bold rounded-full hover:bg-primary-hover shadow-lg shadow-primary/20 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
           >
             {saving ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
             ) : (
                <>
                  <Save size={18} />
                  <span>{id === 'new' ? 'Đăng bài' : 'Lưu thay đổi'}</span>
                </>
             )}
           </button>
        </div>
      </div>

      <div className="flex flex-1 relative overflow-hidden">
        
        {/* 2. MAIN EDITOR AREA (Centered) */}
        <div className={`flex-1 overflow-y-auto transition-all duration-300 ${isSettingsOpen ? 'mr-0 lg:mr-[400px]' : ''}`}>
           <div className="max-w-3xl mx-auto px-6 py-12 pb-32">
              
              {/* Massive Title Input */}
              <input 
                type="text" 
                placeholder="Tiêu đề bài viết..." 
                value={post.title}
                onChange={(e) => handleChange('title', e.target.value)}
                className="w-full text-4xl sm:text-5xl font-extrabold text-gray-900 placeholder-gray-200 border-none focus:ring-0 p-0 bg-transparent leading-tight mb-8"
              />

              {/* Tiptap Editor */}
              <TipTapEditor 
                content={post.content || ''} 
                onChange={(html) => handleChange('content', html)} 
              />
           </div>
        </div>

        {/* 3. SETTINGS SIDEBAR (Right, Fixed) */}
        <div 
          className={`
            fixed top-[73px] bottom-0 right-0 w-full sm:w-[400px] bg-white border-l border-gray-100 shadow-2xl sm:shadow-none transform transition-transform duration-300 ease-in-out z-40 overflow-y-auto
            ${isSettingsOpen ? 'translate-x-0' : 'translate-x-full'}
          `}
        >
           <div className="p-6 space-y-8">
              <div className="flex items-center justify-between">
                 <h3 className="font-extrabold text-lg text-gray-900 flex items-center gap-2">
                    <Settings size={20} /> Cấu hình bài viết
                 </h3>
                 <button onClick={() => setIsSettingsOpen(false)} className="sm:hidden p-2 bg-gray-50 rounded-full">
                    <X size={18} />
                 </button>
              </div>

              {/* SEO Preview */}
              <div className="space-y-3">
                 <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <Globe size={12} /> Google Preview
                 </h4>
                 <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm cursor-default hover:border-blue-200 transition-colors">
                    <div className="flex items-center gap-2 mb-1.5">
                        <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
                            <span className="font-bold text-[10px] text-gray-500">A</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[11px] text-gray-800 font-medium leading-none">AIDAYNE.com</span>
                            <span className="text-[10px] text-gray-500 leading-none mt-0.5">blog › {post.slug || 'slug-bai-viet'}</span>
                        </div>
                    </div>
                    <div className="text-lg text-[#1a0dab] font-medium hover:underline truncate font-sans">
                        {post.title || 'Tiêu đề bài viết sẽ hiện ở đây'}
                    </div>
                    <div className="text-xs text-[#4d5156] line-clamp-2 mt-1 font-sans leading-relaxed">
                        {post.excerpt || 'Mô tả ngắn (Meta Description) giúp tăng tỉ lệ click từ Google.'}
                    </div>
                 </div>
              </div>

              <div className="w-full h-px bg-gray-100"></div>

              {/* Form Fields */}
              <div className="space-y-5">
                 
                 {/* SLUG Field (Added) */}
                 <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Đường dẫn (Slug)</label>
                    <div className="relative group">
                       <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                       <input 
                         type="text" 
                         value={post.slug}
                         onChange={(e) => handleChange('slug', slugify(e.target.value))}
                         className="w-full pl-9 pr-3 py-3 bg-gray-50 border-none rounded-xl focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all font-medium text-sm text-gray-600"
                         placeholder="tieu-de-bai-viet"
                       />
                    </div>
                 </div>

                 <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Mô tả ngắn (Excerpt)</label>
                    <textarea 
                      rows={4}
                      value={post.excerpt}
                      onChange={(e) => handleChange('excerpt', e.target.value)}
                      placeholder="Tóm tắt nội dung để hiển thị trên thẻ bài viết..."
                      className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all font-medium text-sm resize-none"
                    ></textarea>
                 </div>

                 <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Danh mục</label>
                    <div className="relative">
                       <select 
                          value={post.category}
                          onChange={(e) => handleChange('category', e.target.value)}
                          className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all font-medium text-sm appearance-none cursor-pointer"
                       >
                          <option value="Công nghệ AI">Công nghệ AI</option>
                          <option value="Thủ thuật">Thủ thuật</option>
                          <option value="Đánh giá">Đánh giá</option>
                          <option value="Bảo mật">Bảo mật</option>
                          <option value="Tin tức">Tin tức</option>
                          <option value="Thiết kế">Thiết kế</option>
                       </select>
                       <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 rotate-90 pointer-events-none" size={16} />
                    </div>
                 </div>

                 <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Ảnh đại diện (URL)</label>
                    <div className="relative group">
                       <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary" size={18} />
                       <input 
                         type="text" 
                         value={post.image}
                         onChange={(e) => handleChange('image', e.target.value)}
                         placeholder="https://..."
                         className="w-full pl-11 pr-4 py-3 bg-gray-50 border-none rounded-xl focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all font-medium text-sm"
                       />
                    </div>
                    {post.image && (
                        <div className="mt-3 rounded-xl overflow-hidden border border-gray-100 shadow-sm aspect-video">
                            <img src={post.image} alt="Preview" className="w-full h-full object-cover" />
                        </div>
                    )}
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div>
                       <label className="block text-sm font-bold text-gray-700 mb-2">Tác giả</label>
                       <div className="relative group">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                          <input 
                             type="text" 
                             value={post.author}
                             onChange={(e) => handleChange('author', e.target.value)}
                             className="w-full pl-9 pr-3 py-3 bg-gray-50 border-none rounded-xl focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all font-medium text-sm"
                          />
                       </div>
                    </div>
                    <div>
                       <label className="block text-sm font-bold text-gray-700 mb-2">Thời gian đọc</label>
                       <div className="relative group">
                          <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                          <input 
                             type="text" 
                             value={post.readTime}
                             onChange={(e) => handleChange('readTime', e.target.value)}
                             className="w-full pl-9 pr-3 py-3 bg-gray-50 border-none rounded-xl focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all font-medium text-sm"
                          />
                       </div>
                    </div>
                 </div>

                 {/* Date Picker */}
                 <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Ngày đăng</label>
                    <div className="relative group">
                       <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                       <input 
                          type="date"
                          value={post.date} // Expects YYYY-MM-DD
                          onChange={(e) => handleChange('date', e.target.value)}
                          className="w-full pl-9 pr-3 py-3 bg-gray-50 border-none rounded-xl focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all font-medium text-sm"
                       />
                    </div>
                 </div>

              </div>

           </div>
        </div>

      </div>
    </div>
  );
};
