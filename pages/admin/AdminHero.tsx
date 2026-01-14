
import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Save, X, Image as ImageIcon, ArrowUp, ArrowDown, AlertTriangle, Link as LinkIcon, Search } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { HeroSlide, Product } from '../../types';

export const AdminHero: React.FC = () => {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const initialFormState: HeroSlide = {
    id: '',
    title: '',
    subtitle: '',
    image: '',
    ctaText: 'Xem ngay',
    ctaLink: '/products',
    order: 1,
    isActive: true,
    textColor: 'white'
  };

  const [formData, setFormData] = useState<HeroSlide>(initialFormState);

  const fetchData = async () => {
    setLoading(true);
    setFetchError(null);
    try {
      // Fetch cả slides và products song song
      const [slidesRes, productsRes] = await Promise.all([
        supabase.from('hero_slides').select('*').order('order', { ascending: true }),
        supabase.from('products').select('id, name').order('created_at', { ascending: false })
      ]);
      
      if (slidesRes.error) throw slidesRes.error;
      if (slidesRes.data) setSlides(slidesRes.data);

      if (productsRes.data) setProducts(productsRes.data as Product[]);
      
    } catch (err: any) {
      console.error("Error fetching data:", err);
      if (err.code === '42P01') {
         setFetchError("Bảng dữ liệu 'hero_slides' chưa được tạo trong Supabase. Vui lòng chạy file SQL schema.");
      } else {
         setFetchError(err.message || "Không thể tải dữ liệu.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddNew = () => {
    setIsEditing(false);
    const nextOrder = slides.length > 0 ? Math.max(...slides.map(s => s.order)) + 1 : 1;
    setFormData({
      ...initialFormState,
      order: nextOrder
    });
    setIsModalOpen(true);
  };

  const handleEdit = (slide: HeroSlide) => {
    setIsEditing(true);
    setFormData(slide);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa Banner này không?')) {
      const { error } = await supabase.from('hero_slides').delete().eq('id', id);
      if (!error) {
        setSlides(slides.filter(s => s.id !== id));
      } else {
        alert("Lỗi khi xóa: " + (error?.message || 'Không rõ lỗi'));
      }
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const { id, ...payload } = formData;
    
    try {
      if (isEditing) {
        const { error } = await supabase.from('hero_slides').update(payload).eq('id', formData.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('hero_slides').insert([payload]);
        if (error) throw error;
      }
      setIsModalOpen(false);
      fetchData(); // Refresh data
    } catch (error: any) {
      const msg = error?.message || (typeof error === 'object' ? JSON.stringify(error) : String(error));
      alert("Lỗi lưu trữ: " + msg);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const value = e.target.type === 'number' ? Number(e.target.value) : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleProductSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const productId = e.target.value;
    if (productId) {
        setFormData(prev => ({
            ...prev,
            ctaLink: `/product/${productId}`
        }));
    }
  };

  const handleMove = async (index: number, direction: 'up' | 'down') => {
      const newSlides = [...slides];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      
      if (targetIndex < 0 || targetIndex >= newSlides.length) return;

      const currentSlide = newSlides[index];
      const targetSlide = newSlides[targetIndex];
      
      const tempOrder = currentSlide.order;
      currentSlide.order = targetSlide.order;
      targetSlide.order = tempOrder;

      newSlides[index] = targetSlide;
      newSlides[targetIndex] = currentSlide;
      
      setSlides(newSlides);

      try {
          await supabase.from('hero_slides').upsert([
              { id: currentSlide.id, order: currentSlide.order, title: currentSlide.title, subtitle: currentSlide.subtitle, image: currentSlide.image, ctaText: currentSlide.ctaText, ctaLink: currentSlide.ctaLink, isActive: currentSlide.isActive },
              { id: targetSlide.id, order: targetSlide.order, title: targetSlide.title, subtitle: targetSlide.subtitle, image: targetSlide.image, ctaText: targetSlide.ctaText, ctaLink: targetSlide.ctaLink, isActive: targetSlide.isActive }
          ]);
      } catch (err) {
          console.error("Error swapping slides", err);
          fetchData();
      }
  };

  return (
    <div className="space-y-6 animate-fade-in relative pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
         <div>
            <h1 className="text-2xl font-extrabold text-gray-900">Quản lý Banner</h1>
            <p className="text-sm text-gray-500">Thiết lập slide chạy trên trang chủ.</p>
         </div>
         <button 
            onClick={handleAddNew}
            className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-red-500/20 hover:bg-primary-hover transition-all hover:scale-105"
         >
            <Plus size={20} /> Thêm Slide
         </button>
      </div>

      {fetchError && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-center gap-3">
           <AlertTriangle size={20} />
           <span>{fetchError}</span>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6">
         {loading ? (
             <div className="text-center p-8 text-gray-500">Đang tải dữ liệu...</div>
         ) : slides.length === 0 && !fetchError ? (
             <div className="text-center p-12 bg-white rounded-3xl border border-dashed border-gray-300 text-gray-400">
                 Chưa có banner nào. Hãy thêm mới!
             </div>
         ) : slides.map((slide, index) => (
             <div key={slide.id} className="bg-white rounded-[2rem] p-4 shadow-sm border border-gray-100 flex flex-col md:flex-row gap-6 items-center hover:shadow-md transition-shadow group">
                 {/* Preview Image */}
                 <div className="w-full md:w-64 h-40 rounded-xl overflow-hidden bg-gray-100 border border-gray-200 relative shrink-0">
                    <img src={slide.image} alt={slide.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-white font-bold text-xs bg-black/50 px-2 py-1 rounded backdrop-blur-sm">Slide {slide.order}</span>
                    </div>
                 </div>

                 {/* Info */}
                 <div className="flex-1 w-full space-y-2">
                     <div className="flex items-center gap-2">
                        <span className="bg-gray-100 text-gray-500 text-xs font-bold px-2 py-1 rounded">#{slide.order}</span>
                        <h3 className="font-bold text-lg text-gray-900 line-clamp-1">{slide.title}</h3>
                     </div>
                     <p className="text-sm text-gray-500 line-clamp-1">{slide.subtitle}</p>
                     <div className="flex flex-wrap items-center gap-2 text-xs text-gray-400 mt-2">
                         <span className="bg-gray-50 px-2 py-1 rounded border border-gray-100 flex items-center gap-1">
                             <LinkIcon size={10} /> {slide.ctaLink}
                         </span>
                         <span className="bg-gray-50 px-2 py-1 rounded border border-gray-100">Color: {slide.textColor || 'white'}</span>
                     </div>
                 </div>

                 {/* Actions */}
                 <div className="flex items-center gap-2 self-end md:self-center">
                     <div className="flex flex-col gap-1 mr-4 border-r border-gray-100 pr-4">
                        <button disabled={index === 0} onClick={() => handleMove(index, 'up')} className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-900 disabled:opacity-30 transition-colors"><ArrowUp size={16} /></button>
                        <button disabled={index === slides.length - 1} onClick={() => handleMove(index, 'down')} className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-900 disabled:opacity-30 transition-colors"><ArrowDown size={16} /></button>
                     </div>
                     <button onClick={() => handleEdit(slide)} className="p-2 text-gray-400 hover:text-primary hover:bg-blue-50 rounded-xl transition-all" title="Chỉnh sửa"><Edit size={20} /></button>
                     <button onClick={() => handleDelete(slide.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all" title="Xóa"><Trash2 size={20} /></button>
                 </div>
             </div>
         ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
           <div className="bg-white rounded-[2rem] w-full max-w-lg overflow-hidden relative z-10 shadow-2xl animate-fade-in-up flex flex-col max-h-[90vh]">
              <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-white shrink-0">
                 <h3 className="text-xl font-extrabold text-gray-900">{isEditing ? 'Sửa Slide' : 'Thêm Slide Mới'}</h3>
                 <button onClick={() => setIsModalOpen(false)}><X size={24} className="text-gray-400 hover:text-gray-900" /></button>
              </div>
              
              <form onSubmit={handleSave} className="p-8 space-y-5 bg-gray-50/50 overflow-y-auto">
                 <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Tiêu đề lớn</label>
                    <input type="text" name="title" required value={formData.title} onChange={handleChange} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl font-bold focus:ring-2 focus:ring-primary/20 outline-none" />
                 </div>
                 
                 <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Mô tả phụ (Subtitle)</label>
                    <textarea name="subtitle" rows={2} required value={formData.subtitle} onChange={handleChange} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl font-medium resize-none focus:ring-2 focus:ring-primary/20 outline-none" />
                 </div>

                 <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Link Ảnh nền (URL)</label>
                    <div className="relative">
                        <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input type="text" name="image" required value={formData.image} onChange={handleChange} className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl font-medium focus:ring-2 focus:ring-primary/20 outline-none" />
                    </div>
                 </div>

                 {/* Product Selector for Link */}
                 <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100">
                    <label className="block text-sm font-bold text-gray-700 mb-2">Chọn sản phẩm liên kết (Tự động điền link)</label>
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <select 
                            onChange={handleProductSelect}
                            className="w-full pl-11 pr-8 py-3 bg-white border border-gray-200 rounded-xl font-medium focus:ring-2 focus:ring-primary/20 outline-none appearance-none cursor-pointer"
                            defaultValue=""
                        >
                            <option value="">-- Chọn sản phẩm --</option>
                            {products.map(p => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                            <ArrowDown size={14} className="text-gray-400" />
                        </div>
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-5">
                    <div>
                       <label className="block text-sm font-bold text-gray-700 mb-2">Nút bấm (Text)</label>
                       <input type="text" name="ctaText" value={formData.ctaText} onChange={handleChange} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none" />
                    </div>
                    <div>
                       <label className="block text-sm font-bold text-gray-700 mb-2">Link đích</label>
                       <input type="text" name="ctaLink" value={formData.ctaLink} onChange={handleChange} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none" />
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-5">
                    <div>
                       <label className="block text-sm font-bold text-gray-700 mb-2">Màu chữ</label>
                       <select name="textColor" value={formData.textColor || 'white'} onChange={handleChange} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none">
                          <option value="white">Trắng (Cho nền tối)</option>
                          <option value="black">Đen (Cho nền sáng)</option>
                       </select>
                    </div>
                    <div>
                       <label className="block text-sm font-bold text-gray-700 mb-2">Thứ tự hiển thị</label>
                       <input type="number" name="order" value={formData.order} onChange={handleChange} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none" />
                    </div>
                 </div>
                 
                 <div className="pt-4 flex gap-3">
                    <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors">Hủy</button>
                    <button type="submit" className="flex-1 py-3 bg-primary text-white rounded-xl font-bold shadow-lg shadow-red-500/20 hover:bg-primary-hover flex items-center justify-center gap-2 transition-colors">
                       <Save size={18} /> Lưu lại
                    </button>
                 </div>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};
