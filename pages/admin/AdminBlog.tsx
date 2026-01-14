
import React, { useState, useEffect, useRef } from 'react';
import { Plus, Search, Filter, Edit, Trash2, Eye, Calendar, User, X, Save, Image as ImageIcon, Clock, AlignLeft, Bold, Italic, Heading1, Heading2, Link as LinkIcon, List, Quote, Globe, ChevronLeft } from 'lucide-react';
import { BlogPost } from '../../types';
import { supabase } from '../../lib/supabase';
import { slugify } from '../../lib/utils';

export const AdminBlog: React.FC = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  // State for Modal & Form
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const initialFormState: BlogPost = {
    id: '',
    title: '',
    excerpt: '',
    content: '',
    author: 'Admin',
    date: new Date().toLocaleDateString('vi-VN'),
    image: '',
    category: 'Công nghệ AI',
    readTime: '5 phút',
    relatedProductId: ''
  };
  
  const [formData, setFormData] = useState<BlogPost>(initialFormState);

  // FETCH BLOGS
  const fetchBlogs = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('blogs').select('*').order('created_at', { ascending: false });
    if (!error && data) {
      setPosts(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  // Filter posts
  const filteredPosts = posts.filter(post => 
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (post.author && post.author.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // --- ACTIONS ---

  const handleAddNew = () => {
    setIsEditing(false);
    setFormData({
        ...initialFormState,
        date: new Date().toLocaleDateString('vi-VN'),
        author: 'Admin AIDAYNE'
    });
    setIsModalOpen(true);
  };

  const handleEdit = (post: BlogPost) => {
    setIsEditing(true);
    setFormData(post);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa bài viết này không?')) {
        setPosts(posts.filter(p => p.id !== id));
        const { error } = await supabase.from('blogs').delete().eq('id', id);
        if (error) {
            alert('Lỗi khi xóa: ' + error.message);
            fetchBlogs();
        }
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    const postData = {
        title: formData.title,
        excerpt: formData.excerpt,
        content: formData.content,
        author: formData.author,
        image: formData.image,
        category: formData.category,
        readTime: formData.readTime,
        date: formData.date
    };
    
    try {
        if (isEditing) {
            const { error } = await supabase.from('blogs').update(postData).eq('id', formData.id);
            if (error) throw error;
        } else {
            const { error } = await supabase.from('blogs').insert([postData]);
            if (error) throw error;
        }
        
        await fetchBlogs();
        setIsModalOpen(false);
        alert('Lưu bài viết thành công!');
    } catch (error: any) {
        console.error("Blog save error:", error);
        const errorMessage = error?.message || error?.error_description || JSON.stringify(error);
        alert('Lỗi khi lưu bài viết: ' + errorMessage);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // --- EDITOR TOOLBAR FUNCTIONS ---
  const insertAtCursor = (before: string, after: string = '') => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = textarea.value;
      const selectedText = text.substring(start, end);
      
      const newText = text.substring(0, start) + before + selectedText + after + text.substring(end);
      
      setFormData({ ...formData, content: newText });
      
      // Restore focus and cursor
      setTimeout(() => {
          textarea.focus();
          textarea.setSelectionRange(start + before.length, end + before.length);
      }, 0);
  };

  const handleInsertImage = () => {
      const url = prompt("Nhập đường dẫn ảnh (URL):");
      if (url) {
          insertAtCursor(`\n<img src="${url}" alt="image" />\n`);
      }
  };

  return (
    <div className="space-y-6 animate-fade-in relative">
      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
         <div>
            <h1 className="text-2xl font-extrabold text-gray-900">Quản lý bài viết</h1>
            <p className="text-sm text-gray-500">Đăng tải tin tức, mẹo vặt và hướng dẫn sử dụng.</p>
         </div>
         <button 
            onClick={handleAddNew}
            className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-red-500/20 hover:bg-primary-hover transition-all hover:scale-105"
         >
            <Plus size={20} /> Viết bài mới
         </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-4">
         <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Tìm kiếm bài viết..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-primary/20 text-sm font-medium"
            />
         </div>
      </div>

      {/* Table List */}
      <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
         <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
               <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500 font-bold">
                     <th className="p-6 w-[40%]">Tiêu đề bài viết</th>
                     <th className="p-6">Tác giả</th>
                     <th className="p-6">Danh mục</th>
                     <th className="p-6">Ngày đăng</th>
                     <th className="p-6 text-right">Hành động</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-gray-100">
                  {loading ? (
                     <tr><td colSpan={5} className="p-8 text-center">Đang tải dữ liệu...</td></tr>
                  ) : filteredPosts.map((post) => (
                     <tr key={post.id} className="hover:bg-gray-50/80 transition-colors group">
                        <td className="p-6">
                           <div className="flex items-center gap-4">
                              <img src={post.image || 'https://via.placeholder.com/150'} alt="" className="w-16 h-12 rounded-lg object-cover bg-gray-100 shadow-sm" />
                              <div className="min-w-0">
                                 <div className="font-bold text-gray-900 text-sm line-clamp-2 leading-snug">{post.title}</div>
                                 <div className="text-xs text-gray-500 mt-1 line-clamp-1">{post.excerpt}</div>
                              </div>
                           </div>
                        </td>
                        <td className="p-6">
                           <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                              <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                                <User size={12} />
                              </div>
                              {post.author}
                           </div>
                        </td>
                        <td className="p-6">
                           <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-lg text-xs font-bold uppercase border border-blue-100">
                              {post.category}
                           </span>
                        </td>
                        <td className="p-6 text-sm text-gray-500 font-medium">
                           <div className="flex items-center gap-1.5">
                             <Calendar size={14} className="text-gray-400" />
                             {post.date}
                           </div>
                        </td>
                        <td className="p-6 text-right">
                           <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button 
                                onClick={() => handleEdit(post)}
                                className="p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors" title="Chỉnh sửa">
                                 <Edit size={18} />
                              </button>
                              <button 
                                onClick={() => handleDelete(post.id)}
                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Xóa">
                                 <Trash2 size={18} />
                              </button>
                           </div>
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>

      {/* MODAL EDITOR */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
           {/* Backdrop */}
           <div 
             className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
             onClick={() => setIsModalOpen(false)}
           ></div>

           {/* Modal Content - Full Screen / Large */}
           <div className="bg-white rounded-[2rem] w-full max-w-[90vw] h-[90vh] overflow-hidden flex flex-col relative z-10 shadow-2xl animate-fade-in-up">
              
              {/* Header */}
              <div className="px-8 py-5 border-b border-gray-100 flex items-center justify-between bg-white shrink-0 z-20">
                 <div className="flex items-center gap-4">
                    <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><ChevronLeft size={24} className="text-gray-500" /></button>
                    <div>
                        <h3 className="text-xl font-extrabold text-gray-900">{isEditing ? 'Chỉnh sửa bài viết' : 'Viết bài mới'}</h3>
                        <p className="text-xs text-gray-500">Tự động lưu nháp...</p>
                    </div>
                 </div>
                 <div className="flex items-center gap-3">
                     <button 
                        onClick={() => setIsModalOpen(false)}
                        className="px-5 py-2.5 rounded-xl font-bold text-gray-600 hover:bg-gray-100 transition-colors"
                     >
                        Đóng
                     </button>
                     <button 
                        onClick={handleSave}
                        className="px-6 py-2.5 bg-primary text-white rounded-xl font-bold shadow-lg shadow-red-500/20 hover:bg-primary-hover flex items-center gap-2"
                     >
                        <Save size={18} />
                        {isEditing ? 'Lưu thay đổi' : 'Đăng bài'}
                     </button>
                 </div>
              </div>

              {/* Editor Body - Split View */}
              <div className="flex-1 overflow-hidden flex flex-col lg:flex-row bg-[#F9FAFB]">
                 
                 {/* LEFT: MAIN EDITOR */}
                 <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                     <div className="max-w-3xl mx-auto space-y-6">
                        {/* Title Input */}
                        <input 
                            type="text" 
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            placeholder="Tiêu đề bài viết..."
                            className="w-full bg-transparent border-none text-4xl font-extrabold text-gray-900 placeholder-gray-300 focus:ring-0 p-0 leading-tight"
                        />

                        {/* Toolbar - Sticky */}
                        <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border border-gray-200 rounded-xl p-1.5 flex items-center gap-1 shadow-sm w-fit">
                              <button type="button" onClick={() => insertAtCursor('<b>', '</b>')} className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 transition-all" title="In đậm"><Bold size={18} /></button>
                              <button type="button" onClick={() => insertAtCursor('<i>', '</i>')} className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 transition-all" title="In nghiêng"><Italic size={18} /></button>
                              <div className="w-px h-5 bg-gray-200 mx-1"></div>
                              <button type="button" onClick={() => insertAtCursor('<h2>', '</h2>')} className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 transition-all" title="Tiêu đề H2"><Heading1 size={18} /></button>
                              <button type="button" onClick={() => insertAtCursor('<h3>', '</h3>')} className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 transition-all" title="Tiêu đề H3"><Heading2 size={18} /></button>
                              <div className="w-px h-5 bg-gray-200 mx-1"></div>
                              <button type="button" onClick={() => insertAtCursor('<blockquote>', '</blockquote>')} className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 transition-all" title="Trích dẫn"><Quote size={18} /></button>
                              <button type="button" onClick={() => insertAtCursor('<ul>\n<li>', '</li>\n</ul>')} className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 transition-all" title="Danh sách"><List size={18} /></button>
                              <div className="w-px h-5 bg-gray-200 mx-1"></div>
                              <button type="button" onClick={() => insertAtCursor('<a href="url">', '</a>')} className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 transition-all" title="Link"><LinkIcon size={18} /></button>
                              <button type="button" onClick={handleInsertImage} className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 transition-all" title="Chèn Ảnh"><ImageIcon size={18} /></button>
                        </div>

                        {/* Content Textarea */}
                        <textarea 
                            ref={textareaRef}
                            name="content"
                            value={formData.content || ''}
                            onChange={handleChange}
                            placeholder="Bắt đầu viết nội dung tuyệt vời..."
                            className="w-full min-h-[60vh] bg-transparent border-none focus:ring-0 p-0 text-lg leading-relaxed text-gray-700 resize-none font-medium"
                        ></textarea>
                     </div>
                 </div>

                 {/* RIGHT: SETTINGS & SEO */}
                 <div className="w-full lg:w-[400px] border-l border-gray-200 bg-white overflow-y-auto p-6 space-y-8 custom-scrollbar shrink-0">
                     
                     {/* SEO Preview Card */}
                     <div className="space-y-3">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                            <Globe size={14} /> Google Search Preview
                        </h3>
                        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                            <div className="flex items-center gap-2 mb-1.5">
                                <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
                                    <span className="font-bold text-[10px] text-gray-500">A</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[11px] text-gray-800 font-medium leading-none">AIDAYNE.com</span>
                                    <span className="text-[10px] text-gray-500 leading-none mt-0.5">https://aidayne.com › blog › {slugify(formData.title || 'tieu-de-bai-viet').slice(0, 30)}...</span>
                                </div>
                            </div>
                            <div className="text-xl text-[#1a0dab] font-medium hover:underline cursor-pointer truncate font-sans">
                                {formData.title || 'Tiêu đề bài viết sẽ hiện ở đây'}
                            </div>
                            <div className="text-sm text-[#4d5156] line-clamp-2 mt-1 font-sans">
                                {formData.excerpt || 'Mô tả ngắn của bài viết (Meta Description) sẽ hiển thị ở đây. Hãy viết thật hấp dẫn để tăng tỉ lệ click.'}
                            </div>
                        </div>
                     </div>

                     <div className="w-full h-px bg-gray-100"></div>

                     {/* Settings */}
                     <div className="space-y-5">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Cấu hình bài viết</h3>
                        
                        <div>
                           <label className="block text-sm font-bold text-gray-700 mb-2">Mô tả ngắn (Sapo)</label>
                           <textarea 
                             name="excerpt"
                             rows={3}
                             value={formData.excerpt || ''}
                             onChange={handleChange}
                             className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium text-sm"
                           ></textarea>
                        </div>

                        <div>
                           <label className="block text-sm font-bold text-gray-700 mb-2">Danh mục</label>
                           <select 
                              name="category"
                              value={formData.category}
                              onChange={handleChange}
                              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all font-medium text-sm"
                           >
                              <option value="Công nghệ AI">Công nghệ AI</option>
                              <option value="Thủ thuật">Thủ thuật</option>
                              <option value="Đánh giá">Đánh giá</option>
                              <option value="Bảo mật">Bảo mật</option>
                              <option value="Tin tức">Tin tức</option>
                              <option value="Thiết kế">Thiết kế</option>
                           </select>
                        </div>

                        <div>
                           <label className="block text-sm font-bold text-gray-700 mb-2">Ảnh đại diện (URL)</label>
                           <div className="relative">
                               <input 
                                 type="text" 
                                 name="image"
                                 value={formData.image || ''}
                                 onChange={handleChange}
                                 className="w-full pl-4 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all font-medium text-sm truncate"
                               />
                               <div className="absolute right-2 top-2 w-8 h-8 rounded-lg bg-white border border-gray-200 overflow-hidden flex items-center justify-center">
                                   {formData.image ? <img src={formData.image} className="w-full h-full object-cover" /> : <ImageIcon size={14} className="text-gray-400" />}
                               </div>
                           </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                               <label className="block text-sm font-bold text-gray-700 mb-2">Tác giả</label>
                               <input 
                                  type="text" 
                                  name="author"
                                  value={formData.author}
                                  onChange={handleChange}
                                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all font-medium text-sm"
                               />
                            </div>
                            <div>
                               <label className="block text-sm font-bold text-gray-700 mb-2">Thời gian đọc</label>
                               <input 
                                  type="text" 
                                  name="readTime"
                                  value={formData.readTime}
                                  onChange={handleChange}
                                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all font-medium text-sm"
                               />
                            </div>
                        </div>
                     </div>

                 </div>
              </div>

           </div>
        </div>
      )}
    </div>
  );
};
