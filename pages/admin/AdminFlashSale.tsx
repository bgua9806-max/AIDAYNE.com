
import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Clock, X, Search, Zap } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Product } from '../../types';
import { PRODUCTS as FALLBACK_PRODUCTS } from '../../constants';

interface FlashSaleItem {
  id: string;
  product_id: string;
  discount_percent: number;
  quantity_total: number;
  quantity_sold: number;
  end_time: string;
  is_active: boolean;
  product?: Product; // Joined product data
}

export const AdminFlashSale: React.FC = () => {
  const [flashSales, setFlashSales] = useState<FlashSaleItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]); // For selection
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const initialForm: Partial<FlashSaleItem> = {
    product_id: '',
    discount_percent: 50,
    quantity_total: 100,
    quantity_sold: 0,
    end_time: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16), // Default +2 days
    is_active: true
  };
  
  const [formData, setFormData] = useState(initialForm);

  // Fetch Data
  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Flash Sales
      const { data: salesData, error: salesError } = await supabase
        .from('flash_sales')
        .select('*')
        .order('created_at', { ascending: false });

      // 2. Fetch All Products from DB
      const { data: prodData } = await supabase
        .from('products')
        .select('*');

      // 3. Kết hợp DB Products và Fallback Products (Smart Merge)
      const dbProducts = prodData || [];
      const dbIds = new Set(dbProducts.map(p => p.id));
      
      const fallbackOnly = FALLBACK_PRODUCTS.filter(fp => !dbIds.has(fp.id));
      
      const enhancedDbProducts = dbProducts.map(p => {
          const fallback = FALLBACK_PRODUCTS.find(fp => fp.id === p.id);
          if (!p.image && fallback?.image) {
              return { ...p, image: fallback.image };
          }
          return p;
      });

      const allProducts = [...enhancedDbProducts, ...fallbackOnly];

      setProducts(allProducts);

      if (!salesError && salesData) {
        // Map product info vào sales
        const joinedSales = salesData.map((sale: any) => ({
           ...sale,
           product: allProducts.find((p: any) => p.id === sale.product_id)
        }));
        setFlashSales(joinedSales);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id: string) => {
    if (window.confirm('Xóa sản phẩm này khỏi Flash Sale?')) {
      const { error } = await supabase.from('flash_sales').delete().eq('id', id);
      if (!error) {
         setFlashSales(prev => prev.filter(item => item.id !== id));
      } else {
          alert("Lỗi xóa: " + error.message);
      }
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.product_id) return alert('Vui lòng chọn sản phẩm');

    const payload = {
       product_id: formData.product_id,
       discount_percent: Number(formData.discount_percent),
       quantity_total: Number(formData.quantity_total),
       quantity_sold: Number(formData.quantity_sold),
       end_time: formData.end_time,
       is_active: formData.is_active
    };

    const { error } = await supabase.from('flash_sales').insert([payload]);
    
    if (!error) {
       setIsModalOpen(false);
       fetchData();
    } else {
       alert('Lỗi: ' + error.message);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    let value: any = e.target.value;
    
    if (e.target.type === 'checkbox') {
        value = (e.target as HTMLInputElement).checked;
    } else if (e.target.type === 'number') {
        value = Number(e.target.value);
    }
    
    setFormData({ ...formData, [e.target.name]: value });
  };

  return (
    <div className="space-y-6 animate-fade-in relative">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
         <div>
            <h1 className="text-2xl font-extrabold text-gray-900">Quản lý Flash Sale</h1>
            <p className="text-sm text-gray-500">Thiết lập các khung giờ và sản phẩm giảm giá sốc.</p>
         </div>
         <button 
            onClick={() => { setFormData(initialForm); setIsModalOpen(true); }}
            className="flex items-center gap-2 bg-orange-500 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-orange-500/20 hover:bg-orange-600 transition-all hover:scale-105"
         >
            <Plus size={20} /> Thêm Slot
         </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         {loading ? (
             [1,2,3].map(i => <div key={i} className="h-48 bg-gray-100 rounded-[2rem] animate-pulse"></div>)
         ) : flashSales.map((item) => (
             <div key={item.id} className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all relative overflow-hidden group">
                {/* Background Pattern */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-orange-50 rounded-bl-[100%] -mr-10 -mt-10 transition-transform group-hover:scale-110"></div>
                
                <div className="relative z-10">
                   <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                         <div className="w-14 h-14 rounded-2xl bg-gray-100 border border-gray-200 overflow-hidden bg-white">
                            <img 
                                src={item.product?.image || 'https://via.placeholder.com/100?text=No+Img'} 
                                alt="" 
                                className="w-full h-full object-cover" 
                            />
                         </div>
                         <div className="min-w-0 flex-1">
                            <div className="font-bold text-gray-900 line-clamp-1" title={item.product?.name}>{item.product?.name || 'ID không tồn tại'}</div>
                            <div className="text-xs text-gray-500 font-mono truncate max-w-[120px]">ID: {item.product_id}</div>
                         </div>
                      </div>
                      <div className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-lg shadow-md shadow-red-500/30 flex-shrink-0">
                         -{item.discount_percent}%
                      </div>
                   </div>

                   <div className="space-y-3 mb-6">
                      <div className="flex justify-between text-sm">
                         <span className="text-gray-500">Đã bán</span>
                         <span className="font-bold text-gray-900">{item.quantity_sold} / {item.quantity_total}</span>
                      </div>
                      {/* Progress Bar */}
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                         <div className="h-full bg-gradient-to-r from-orange-400 to-red-500" style={{ width: `${(item.quantity_sold / item.quantity_total) * 100}%` }}></div>
                      </div>
                      
                      <div className="flex items-center gap-2 text-xs font-medium text-gray-500 bg-gray-50 p-2 rounded-lg">
                         <Clock size={14} />
                         Kết thúc: {new Date(item.end_time).toLocaleString('vi-VN')}
                      </div>
                   </div>

                   <button 
                      onClick={() => handleDelete(item.id)}
                      className="w-full py-2.5 rounded-xl border border-gray-200 text-gray-500 font-bold text-sm hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-colors flex items-center justify-center gap-2"
                   >
                      <Trash2 size={16} /> Xóa Slot này
                   </button>
                </div>
             </div>
         ))}
      </div>

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
           <div className="bg-white rounded-[2rem] w-full max-w-lg overflow-hidden relative z-10 shadow-2xl animate-fade-in-up">
              <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between">
                 <h3 className="text-xl font-extrabold text-gray-900">Thiết lập Flash Sale</h3>
                 <button onClick={() => setIsModalOpen(false)}><X size={24} className="text-gray-400 hover:text-gray-900" /></button>
              </div>
              
              <form onSubmit={handleSave} className="p-8 space-y-5">
                 <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Chọn sản phẩm</label>
                    <div className="relative">
                       <select 
                          name="product_id" 
                          required 
                          value={formData.product_id} 
                          onChange={handleChange}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl appearance-none font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary"
                       >
                          <option value="">-- Chọn sản phẩm --</option>
                          {products.map(p => (
                             <option key={p.id} value={p.id}>{p.name} - {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p.price)}</option>
                          ))}
                       </select>
                       <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-5">
                    <div>
                       <label className="block text-sm font-bold text-gray-700 mb-2">Giảm giá (%)</label>
                       <input type="number" name="discount_percent" required min="1" max="99" value={formData.discount_percent} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-bold" />
                    </div>
                    <div>
                       <label className="block text-sm font-bold text-gray-700 mb-2">Số lượng bán</label>
                       <input type="number" name="quantity_total" required min="1" value={formData.quantity_total} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-bold" />
                    </div>
                 </div>

                 <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Thời gian kết thúc</label>
                    <input type="datetime-local" name="end_time" required value={formData.end_time} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-medium" />
                 </div>

                 <div className="pt-4 flex gap-3">
                    <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200">Hủy</button>
                    <button type="submit" className="flex-1 py-3 bg-primary text-white rounded-xl font-bold shadow-lg shadow-red-500/20 hover:bg-primary-hover flex items-center justify-center gap-2">
                       <Zap size={18} /> Xác nhận
                    </button>
                 </div>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};
