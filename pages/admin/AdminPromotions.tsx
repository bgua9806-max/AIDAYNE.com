import React, { useState, useEffect } from 'react';
import { Plus, Calendar, Tag, Edit, Trash2, CheckCircle, XCircle, Save, X, Clock, Search } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Promotion {
  id: string;
  name: string;
  code: string;
  discountPercent: number;
  startDate: string;
  endDate: string;
  status: 'active' | 'upcoming' | 'expired' | 'disabled';
  usageCount: number;
}

export const AdminPromotions: React.FC = () => {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  const initialFormState: Promotion = {
    id: '',
    name: '',
    code: '',
    discountPercent: 10,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'active',
    usageCount: 0
  };

  const [formData, setFormData] = useState<Promotion>(initialFormState);

  // Fetch Promotions
  const fetchPromotions = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('promotions').select('*').order('created_at', { ascending: false });
    if (!error && data) {
       setPromotions(data as Promotion[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPromotions();
  }, []);

  // CRUD Actions
  const handleAddNew = () => {
    setIsEditing(false);
    setFormData({ ...initialFormState, id: Math.random().toString() }); // Temp ID for new item
    setIsModalOpen(true);
  };

  const handleEdit = (promo: Promotion) => {
    setIsEditing(true);
    setFormData(promo);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa mã khuyến mãi này không?')) {
        // Optimistic UI
        setPromotions(prev => prev.filter(p => p.id !== id));
        
        const { error } = await supabase.from('promotions').delete().eq('id', id);
        if (error) {
            console.error('Delete failed:', error);
            fetchPromotions(); // Revert
        }
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsModalOpen(false);

    // Prepare data for DB (remove temp ID if inserting, keep real ID if updating)
    const { id, ...payload } = formData;
    const dbPayload = {
        name: formData.name,
        code: formData.code,
        discountPercent: formData.discountPercent,
        startDate: formData.startDate,
        endDate: formData.endDate,
        status: formData.status,
        usageCount: formData.usageCount
    };

    if (isEditing) {
        // Optimistic Update
        setPromotions(prev => prev.map(p => p.id === formData.id ? formData : p));
        
        const { error } = await supabase.from('promotions').update(dbPayload).eq('id', formData.id);
        if (error) console.error(error);
    } else {
        // Optimistic Insert
        setPromotions(prev => [formData, ...prev]);

        const { error } = await supabase.from('promotions').insert([dbPayload]);
        if (error) {
            console.error(error);
        } else {
            fetchPromotions(); // Refresh to get real ID
        }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const value = e.target.type === 'number' ? Number(e.target.value) : e.target.value;
      setFormData({ ...formData, [e.target.name]: value });
  };

  // Helper to determine status display
  const getStatusColor = (status: string, endDate: string) => {
      if (status === 'disabled') return 'bg-gray-100 text-gray-500';
      const now = new Date();
      const end = new Date(endDate);
      if (end < now) return 'bg-red-100 text-red-700'; // Expired
      return 'bg-green-100 text-green-700'; // Active
  };

  const getStatusLabel = (status: string, endDate: string) => {
      if (status === 'disabled') return 'Đã tắt';
      const now = new Date();
      const end = new Date(endDate);
      if (end < now) return 'Hết hạn';
      return 'Đang chạy';
  };

  const filteredPromotions = promotions.filter(p => 
      p.code.toLowerCase().includes(searchTerm.toLowerCase()) || 
      p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in relative">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
         <div>
            <h1 className="text-2xl font-extrabold text-gray-900">Mã khuyến mãi</h1>
            <p className="text-sm text-gray-500">Quản lý voucher và các chương trình giảm giá.</p>
         </div>
         <button 
            onClick={handleAddNew}
            className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-red-500/20 hover:bg-primary-hover transition-all hover:scale-105"
         >
            <Plus size={20} /> Tạo mã mới
         </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
         <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Tìm kiếm mã giảm giá..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-primary/20 text-sm font-medium"
            />
         </div>
      </div>

      {/* List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         {loading ? (
             [1,2,3].map(i => <div key={i} className="h-40 bg-gray-100 rounded-3xl animate-pulse"></div>)
         ) : filteredPromotions.map((promo) => (
             <div key={promo.id} className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 hover:shadow-hover transition-all group relative overflow-hidden">
                {/* Decoration */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-gray-50 rounded-bl-[4rem] -mr-4 -mt-4 transition-colors group-hover:bg-red-50"></div>

                <div className="flex justify-between items-start mb-6 relative z-10">
                   <div className="w-12 h-12 rounded-2xl bg-red-50 text-primary flex items-center justify-center font-bold text-xl border border-red-100">
                      %
                   </div>
                   <div className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(promo.status, promo.endDate)}`}>
                      {getStatusLabel(promo.status, promo.endDate)}
                   </div>
                </div>

                <h3 className="text-lg font-bold text-gray-900 mb-1">{promo.name}</h3>
                <div className="flex items-center gap-2 mb-4">
                   <Tag size={14} className="text-gray-400" />
                   <code className="text-sm font-mono font-bold text-gray-600 bg-gray-100 px-2 py-0.5 rounded">{promo.code}</code>
                </div>

                <div className="space-y-2 text-sm text-gray-500 mb-6">
                   <div className="flex items-center gap-2">
                      <Clock size={16} /> 
                      <span>{new Date(promo.startDate).toLocaleDateString('vi-VN')} - {new Date(promo.endDate).toLocaleDateString('vi-VN')}</span>
                   </div>
                   <div className="flex items-center gap-2">
                      <CheckCircle size={16} /> 
                      <span>Đã dùng: <strong>{promo.usageCount}</strong> lần</span>
                   </div>
                </div>

                <div className="flex items-center gap-2 pt-4 border-t border-gray-50">
                   <div className="text-2xl font-extrabold text-gray-900">-{promo.discountPercent}%</div>
                   <div className="ml-auto flex gap-2">
                      <button onClick={() => handleEdit(promo)} className="p-2 text-gray-400 hover:text-primary hover:bg-red-50 rounded-xl transition-all">
                         <Edit size={18} />
                      </button>
                      <button onClick={() => handleDelete(promo.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all">
                         <Trash2 size={18} />
                      </button>
                   </div>
                </div>
             </div>
         ))}
      </div>

      {/* Modal Form */}
      {isModalOpen && (
         <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
            <div className="bg-white rounded-[2rem] w-full max-w-lg overflow-hidden relative z-10 shadow-2xl animate-fade-in-up">
               <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-white">
                  <h3 className="text-xl font-extrabold text-gray-900">{isEditing ? 'Sửa khuyến mãi' : 'Tạo mã mới'}</h3>
                  <button onClick={() => setIsModalOpen(false)}><X size={24} className="text-gray-400 hover:text-gray-900" /></button>
               </div>
               
               <form onSubmit={handleSave} className="p-8 space-y-5">
                  <div>
                     <label className="block text-sm font-bold text-gray-700 mb-2">Tên chương trình</label>
                     <input type="text" name="name" required value={formData.name} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-bold" placeholder="VD: Siêu sale 11/11" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-5">
                     <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Mã Code</label>
                        <input type="text" name="code" required value={formData.code} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-mono uppercase" placeholder="SALE50" />
                     </div>
                     <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Giảm giá (%)</label>
                        <input type="number" name="discountPercent" required min="1" max="100" value={formData.discountPercent} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl" />
                     </div>
                  </div>

                  <div className="grid grid-cols-2 gap-5">
                     <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Ngày bắt đầu</label>
                        <input type="date" name="startDate" required value={formData.startDate} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl" />
                     </div>
                     <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Ngày kết thúc</label>
                        <input type="date" name="endDate" required value={formData.endDate} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl" />
                     </div>
                  </div>

                  <div>
                     <label className="block text-sm font-bold text-gray-700 mb-2">Trạng thái</label>
                     <select name="status" value={formData.status} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl">
                        <option value="active">Kích hoạt</option>
                        <option value="disabled">Tạm tắt</option>
                     </select>
                  </div>

                  <div className="pt-4 flex gap-3">
                     <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200">Hủy</button>
                     <button type="submit" className="flex-1 py-3 bg-primary text-white rounded-xl font-bold shadow-lg shadow-red-500/20 hover:bg-primary-hover flex items-center justify-center gap-2">
                        <Save size={18} /> Lưu mã
                     </button>
                  </div>
               </form>
            </div>
         </div>
      )}
    </div>
  );
};
