
import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Edit, Trash2, Calendar, User, Eye } from 'lucide-react';
import { BlogPost } from '../../types';
import { supabase } from '../../lib/supabase';
import { Link } from 'react-router-dom';

export const AdminBlog: React.FC = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

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

  const filteredPosts = posts.filter(post => 
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (post.author && post.author.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6 animate-fade-in relative pb-20">
      
      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
         <div>
            <h1 className="text-2xl font-extrabold text-gray-900">Quản lý bài viết</h1>
            <p className="text-sm text-gray-500">Đăng tải tin tức, mẹo vặt và hướng dẫn sử dụng.</p>
         </div>
         <Link 
            to="/admin/blog/new"
            className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-red-500/20 hover:bg-primary-hover transition-all hover:scale-105"
         >
            <Plus size={20} /> Viết bài mới
         </Link>
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
                              <Link 
                                to={`/admin/blog/edit/${post.id}`}
                                className="p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors" title="Chỉnh sửa">
                                 <Edit size={18} />
                              </Link>
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
    </div>
  );
};
