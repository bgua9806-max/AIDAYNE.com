
import React, { useState, useEffect } from 'react';
import { Plus, Search, Star, Edit, Trash2, X, Save, MessageSquare, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Product, Review } from '../../types';

// Extend Review type to include product info for flat list display
interface AdminReview extends Review {
  productId: string;
  productName: string;
}

export const AdminReviews: React.FC = () => {
  const [flatReviews, setFlatReviews] = useState<AdminReview[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  const initialFormState = {
    id: '',
    productId: '', // Selected Product
    user: '',
    rating: 5,
    comment: '',
    date: new Date().toLocaleDateString('vi-VN'),
    purchasedType: ''
  };

  const [formData, setFormData] = useState(initialFormState);

  // Fetch all products and flatten reviews
  const fetchData = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, reviews')
        .order('created_at', { ascending: false });

      if (!error && data) {
        setProducts(data as Product[]);
        
        const flattened: AdminReview[] = [];
        data.forEach((p: any) => {
           if (p.reviews && Array.isArray(p.reviews)) {
               p.reviews.forEach((r: Review) => {
                   flattened.push({
                       ...r,
                       // Ép kiểu rating ngay khi lấy dữ liệu để đảm bảo an toàn
                       rating: Number(r.rating) || 5, 
                       productId: p.id,
                       productName: p.name
                   });
               });
           }
        });
        setFlatReviews(flattened);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddNew = () => {
    setIsEditing(false);
    setFormData({
        ...initialFormState,
        id: Math.random().toString(36).substr(2, 9),
        productId: products.length > 0 ? products[0].id : '',
        date: new Date().toLocaleDateString('en-GB') // DD/MM/YYYY format
    });
    setIsModalOpen(true);
  };

  const handleEdit = (review: AdminReview) => {
    setIsEditing(true);
    setFormData({
        id: review.id,
        productId: review.productId,
        user: review.user,
        rating: Number(review.rating) || 5,
        comment: review.comment,
        date: review.date,
        purchasedType: review.purchasedType || ''
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (review: AdminReview) => {
     if (window.confirm(`Xóa đánh giá của "${review.user}"?`)) {
         // Find product
         const product = products.find(p => p.id === review.productId);
         if (!product) return;

         const updatedReviews = (product.reviews || []).filter(r => r.id !== review.id);
         
         const { error } = await supabase
            .from('products')
            .update({ reviews: updatedReviews })
            .eq('id', review.productId);

         if (!error) {
             fetchData();
         } else {
             alert('Lỗi khi xóa: ' + error.message);
         }
     }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.productId) return alert("Vui lòng chọn sản phẩm");

    const product = products.find(p => p.id === formData.productId);
    if (!product) return alert("Sản phẩm không tồn tại");

    let updatedReviews = product.reviews ? [...product.reviews] : [];
    
    const newReviewData: Review = {
        id: formData.id,
        user: formData.user,
        rating: Number(formData.rating), // Ép kiểu số quan trọng
        comment: formData.comment,
        date: formData.date,
        purchasedType: formData.purchasedType
    };

    if (isEditing) {
        updatedReviews = updatedReviews.map(r => r.id === formData.id ? newReviewData : r);
    } else {
        // Add new to top
        updatedReviews = [newReviewData, ...updatedReviews];
    }

    const { error } = await supabase
        .from('products')
        .update({ reviews: updatedReviews })
        .eq('id', formData.productId);

    if (!error) {
        setIsModalOpen(false);
        fetchData();
    } else {
        alert('Lỗi lưu: ' + error.message);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    let value: string | number = e.target.value;
    // Ép kiểu đặc biệt cho Rating
    if (e.target.name === 'rating') {
        value = parseInt(e.target.value, 10);
    }
    setFormData({ ...formData, [e.target.name]: value });
  };

  const filteredReviews = flatReviews.filter(r => 
     r.user.toLowerCase().includes(searchTerm.toLowerCase()) || 
     r.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
     r.comment.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in relative pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
         <div>
            <h1 className="text-2xl font-extrabold text-gray-900">Quản lý Đánh giá</h1>
            <p className="text-sm text-gray-500">Xem và quản lý tất cả feedback từ khách hàng.</p>
         </div>
         <button 
            onClick={handleAddNew}
            className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-red-500/20 hover:bg-primary-hover transition-all hover:scale-105"
         >
            <Plus size={20} /> Tạo đánh giá ảo
         </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
         <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Tìm kiếm theo tên khách, tên sản phẩm..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-primary/20 text-sm font-medium"
            />
         </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
          {loading ? (
             <div className="text-center p-10 text-gray-500">Đang tải đánh giá...</div>
          ) : filteredReviews.length === 0 ? (
             <div className="text-center p-12 bg-white rounded-3xl border border-dashed border-gray-300">
                 <MessageSquare size={40} className="mx-auto text-gray-300 mb-4" />
                 <p className="text-gray-500 font-medium">Chưa có đánh giá nào.</p>
             </div>
          ) : (
             <div className="grid grid-cols-1 gap-4">
                 {filteredReviews.map((review) => (
                    <div key={`${review.productId}-${review.id}`} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all group">
                       <div className="flex flex-col sm:flex-row justify-between gap-4">
                          <div className="flex items-start gap-4">
                             <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-primary font-bold text-lg shrink-0">
                                {review.user.charAt(0).toUpperCase()}
                             </div>
                             <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <h4 className="font-bold text-gray-900">{review.user}</h4>
                                    <span className="text-xs text-gray-400">• {review.date}</span>
                                </div>
                                <div className="text-xs font-bold text-primary bg-primary/5 px-2 py-0.5 rounded inline-block mb-2">
                                    {review.productName} ({review.purchasedType || 'Gói mặc định'})
                                </div>
                                <div className="flex items-center gap-1 mb-2">
                                   {[1,2,3,4,5].map(star => {
                                      // Logic tô màu sao: Nếu star <= rating thì màu vàng, ngược lại màu xám
                                      const isFilled = star <= (Number(review.rating) || 0);
                                      return (
                                        <Star 
                                            key={star} 
                                            size={16} 
                                            fill={isFilled ? "#FBBF24" : "none"} 
                                            stroke={isFilled ? "#FBBF24" : "#D1D5DB"} 
                                        />
                                      );
                                   })}
                                </div>
                                <p className="text-gray-600 text-sm leading-relaxed">{review.comment}</p>
                             </div>
                          </div>

                          <div className="flex items-start gap-2 self-end sm:self-start opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                             <button onClick={() => handleEdit(review)} className="p-2 text-gray-400 hover:text-primary hover:bg-blue-50 rounded-lg transition-colors"><Edit size={18} /></button>
                             <button onClick={() => handleDelete(review)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={18} /></button>
                          </div>
                       </div>
                    </div>
                 ))}
             </div>
          )}
      </div>

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
           <div className="bg-white rounded-[2rem] w-full max-w-lg overflow-hidden relative z-10 shadow-2xl animate-fade-in-up">
              
              <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between">
                 <h3 className="text-xl font-extrabold text-gray-900">{isEditing ? 'Sửa đánh giá' : 'Thêm đánh giá mới'}</h3>
                 <button onClick={() => setIsModalOpen(false)}><X size={24} className="text-gray-400 hover:text-gray-900" /></button>
              </div>

              <form onSubmit={handleSave} className="p-8 space-y-5 bg-gray-50/50 overflow-y-auto max-h-[80vh]">
                 
                 {/* Product Selector */}
                 <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Sản phẩm</label>
                    <select 
                        name="productId" 
                        value={formData.productId} 
                        onChange={handleChange}
                        disabled={isEditing} 
                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl font-bold focus:ring-2 focus:ring-primary/20 outline-none disabled:bg-gray-100 disabled:text-gray-500"
                    >
                        <option value="">-- Chọn sản phẩm --</option>
                        {products.map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                    </select>
                 </div>

                 <div className="grid grid-cols-2 gap-5">
                     <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Tên khách hàng</label>
                        <input type="text" name="user" required value={formData.user} onChange={handleChange} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl font-medium focus:ring-2 focus:ring-primary/20 outline-none" />
                     </div>
                     <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Ngày đánh giá</label>
                        <input type="text" name="date" required value={formData.date} onChange={handleChange} placeholder="DD/MM/YYYY" className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl font-medium focus:ring-2 focus:ring-primary/20 outline-none" />
                     </div>
                 </div>

                 <div className="grid grid-cols-2 gap-5">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Số sao (1-5)</label>
                        <select name="rating" value={formData.rating} onChange={handleChange} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl font-medium focus:ring-2 focus:ring-primary/20 outline-none text-yellow-600">
                            <option value="5">⭐⭐⭐⭐⭐ (5)</option>
                            <option value="4">⭐⭐⭐⭐ (4)</option>
                            <option value="3">⭐⭐⭐ (3)</option>
                            <option value="2">⭐⭐ (2)</option>
                            <option value="1">⭐ (1)</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Gói đã mua</label>
                        <input type="text" name="purchasedType" value={formData.purchasedType} onChange={handleChange} placeholder="VD: 1 Năm, Vĩnh viễn..." className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl font-medium focus:ring-2 focus:ring-primary/20 outline-none" />
                    </div>
                 </div>

                 <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Nội dung bình luận</label>
                    <textarea name="comment" required rows={4} value={formData.comment} onChange={handleChange} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl font-medium focus:ring-2 focus:ring-primary/20 outline-none resize-none"></textarea>
                 </div>

                 <div className="pt-4 flex gap-3">
                    <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors">Hủy</button>
                    <button type="submit" className="flex-1 py-3 bg-primary text-white rounded-xl font-bold shadow-lg shadow-red-500/20 hover:bg-primary-hover flex items-center justify-center gap-2 transition-colors">
                       <Save size={18} /> Lưu đánh giá
                    </button>
                 </div>

              </form>
           </div>
        </div>
      )}
    </div>
  );
};
