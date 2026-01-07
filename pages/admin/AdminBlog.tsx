
import React, { useState, useEffect, useRef } from 'react';
import { Plus, Search, Filter, Edit, Trash2, Eye, Calendar, User, X, Save, Image as ImageIcon, Clock, AlignLeft, Bold, Italic, Heading1, Heading2, Link as LinkIcon, List } from 'lucide-react';
import { BlogPost } from '../../types';
import { supabase } from '../../lib/supabase';

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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
           {/* Backdrop */}
           <div 
             className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
             onClick={() => setIsModalOpen(false)}
           ></div>

           {/* Modal Content */}
           <div className="bg-white rounded-[2rem] w-full max-w-4xl max-h-[95vh] overflow-hidden flex flex-col relative z-10 shadow-2xl animate-fade-in-up">
              
              {/* Header */}
              <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-20">
                 <div>
                    <h3 className="text-xl font-extrabold text-gray-900">{isEditing ? 'Chỉnh sửa bài viết' : 'Viết bài mới'}</h3>
                    <p className="text-xs text-gray-500 mt-1">Sử dụng thanh công cụ để định dạng bài viết.</p>
                 </div>
                 <button 
                    onClick={() => setIsModalOpen(false)}
                    className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
                 >
                    <X size={24} />
                 </button>
              </div>

              {/* Form Body */}
              <div className="p-8 overflow-y-auto bg-gray-50/50">
                 <form id="blogForm" onSubmit={handleSave} className="space-y-6">
                    {/* Title */}
                    <div>
                       <label className="block text-sm font-bold text-gray-700 mb-2">Tiêu đề (Luôn In Đậm)</label>
                       <input 
                         type="text" 
                         name="title"
                         required
                         value={formData.title || ''}
                         onChange={handleChange}
                         placeholder="Nhập tiêu đề bài viết tại đây..."
                         className="w-full px-5 py-4 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-extrabold text-xl text-gray-900 shadow-sm"
                       />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       {/* Category */}
                       <div>
                          <label className="block text-sm font-bold text-gray-700 mb-2">Danh mục</label>
                          <select 
                             name="category"
                             value={formData.category}
                             onChange={handleChange}
                             className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
                          >
                             <option value="Công nghệ AI">Công nghệ AI</option>
                             <option value="Thủ thuật">Thủ thuật</option>
                             <option value="Đánh giá">Đánh giá</option>
                             <option value="Bảo mật">Bảo mật</option>
                             <option value="Tin tức">Tin tức</option>
                          </select>
                       </div>

                       {/* Read Time */}
                       <div>
                          <label className="block text-sm font-bold text-gray-700 mb-2">Thời gian đọc</label>
                          <div className="relative">
                             <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                             <input 
                               type="text" 
                               name="readTime"
                               value={formData.readTime || ''}
                               onChange={handleChange}
                               placeholder="VD: 5 phút"
                               className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
                             />
                          </div>
                       </div>
                    </div>

                    {/* Image URL */}
                    <div>
                       <label className="block text-sm font-bold text-gray-700 mb-2">Link ảnh bìa (URL)</label>
                       <div className="flex gap-4">
                          <div className="relative flex-1">
                             <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                             <input 
                               type="text" 
                               name="image"
                               required
                               value={formData.image || ''}
                               onChange={handleChange}
                               placeholder="https://example.com/image.jpg"
                               className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
                             />
                          </div>
                          {formData.image && (
                             <div className="w-12 h-12 rounded-lg bg-gray-200 overflow-hidden border border-gray-200 shrink-0">
                                <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                             </div>
                          )}
                       </div>
                    </div>

                    {/* Excerpt */}
                    <div>
                       <label className="block text-sm font-bold text-gray-700 mb-2">Mô tả ngắn (Sapo)</label>
                       <textarea 
                         name="excerpt"
                         rows={2}
                         required
                         value={formData.excerpt || ''}
                         onChange={handleChange}
                         placeholder="Đoạn tóm tắt ngắn gọn hiển thị ở danh sách..."
                         className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium resize-none shadow-sm"
                       ></textarea>
                    </div>

                    {/* Content (RICH TEXT SIMULATOR) */}
                    <div>
                       <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                          <AlignLeft size={18} /> Nội dung chi tiết
                       </label>
                       <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                          {/* Toolbar */}
                          <div className="flex items-center gap-1 p-2 border-b border-gray-100 bg-gray-50">
                              <button type="button" onClick={() => insertAtCursor('<b>', '</b>')} className="p-2 hover:bg-white hover:shadow-sm rounded-lg text-gray-600 transition-all" title="In đậm"><Bold size={18} /></button>
                              <button type="button" onClick={() => insertAtCursor('<i>', '</i>')} className="p-2 hover:bg-white hover:shadow-sm rounded-lg text-gray-600 transition-all" title="In nghiêng"><Italic size={18} /></button>
                              <div className="w-px h-5 bg-gray-300 mx-1"></div>
                              <button type="button" onClick={() => insertAtCursor('<h2>', '</h2>')} className="p-2 hover:bg-white hover:shadow-sm rounded-lg text-gray-600 transition-all" title="Tiêu đề H2"><Heading1 size={18} /></button>
                              <button type="button" onClick={() => insertAtCursor('<h3>', '</h3>')} className="p-2 hover:bg-white hover:shadow-sm rounded-lg text-gray-600 transition-all" title="Tiêu đề H3"><Heading2 size={18} /></button>
                              <div className="w-px h-5 bg-gray-300 mx-1"></div>
                              <button type="button" onClick={() => insertAtCursor('<ul>\n<li>', '</li>\n</ul>')} className="p-2 hover:bg-white hover:shadow-sm rounded-lg text-gray-600 transition-all" title="Danh sách"><List size={18} /></button>
                              <button type="button" onClick={handleInsertImage} className="p-2 hover:bg-white hover:shadow-sm rounded-lg text-gray-600 transition-all" title="Chèn Ảnh"><ImageIcon size={18} /></button>
                          </div>

                          <textarea 
                            ref={textareaRef}
                            name="content"
                            rows={15}
                            required
                            value={formData.content || ''}
                            onChange={handleChange}
                            placeholder={`Viết nội dung tại đây...\n\nSử dụng các nút trên để chèn ảnh và định dạng văn bản.`}
                            className="w-full px-6 py-5 bg-white border-none focus:outline-none transition-all font-sans text-base leading-relaxed resize-none"
                          ></textarea>
                       </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Author */}
                        <div>
                           <label className="block text-sm font-bold text-gray-700 mb-2">Tác giả</label>
                           <input 
                              type="text" 
                              name="author"
                              value={formData.author || ''}
                              onChange={handleChange}
                              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
                           />
                        </div>
                    </div>
                 </form>
              </div>

              {/* Footer Actions */}
              <div className="px-8 py-5 border-t border-gray-100 bg-white flex items-center justify-end gap-3 sticky bottom-0 z-20">
                 <button 
                    onClick={() => setIsModalOpen(false)}
                    className="px-6 py-3 rounded-xl font-bold text-gray-600 hover:bg-gray-100 transition-colors"
                 >
                    Hủy bỏ
                 </button>
                 <button 
                    form="blogForm"
                    type="submit"
                    className="px-6 py-3 bg-primary text-white rounded-xl font-bold shadow-lg shadow-red-500/20 hover:bg-primary-hover hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2"
                 >
                    <Save size={18} />
                    {isEditing ? 'Lưu thay đổi' : 'Đăng bài viết'}
                 </button>
              </div>

           </div>
        </div>
      )}
    </div>
  );
};
