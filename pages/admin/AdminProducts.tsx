import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Edit, Trash2, X, Save, Image as ImageIcon, Layers, FileText, Monitor, ShieldCheck, List, DollarSign } from 'lucide-react';
import { CATEGORIES } from '../../constants';
import { Product, Variant } from '../../types';
import { supabase } from '../../lib/supabase';

export const AdminProducts: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'variants' | 'details' | 'media'>('general');
  
  const initialFormState: Product = {
    id: '',
    name: '',
    description: '',
    price: 0,
    originalPrice: 0,
    discount: 0,
    image: '',
    category: 'entertainment',
    rating: 5,
    sold: 0,
    isHot: false,
    isNew: false,
    platforms: [],
    features: [],
    activationGuide: '',
    version: '',
    developer: '',
    warrantyPolicy: '',
    variants: []
  };

  const [formData, setFormData] = useState<Product>(initialFormState);
  
  // Temporary state for text area inputs
  const [featuresInput, setFeaturesInput] = useState('');

  // Variants Input State (Temporary inside modal)
  const [tempVariants, setTempVariants] = useState<Variant[]>([]);

  // Fetch Products
  const fetchProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    if (!error && data) {
        setProducts(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // CRUD Actions
  const handleAddNew = () => {
    setIsEditing(false);
    setFormData({ ...initialFormState });
    setFeaturesInput('');
    setTempVariants([]);
    setActiveTab('general');
    setIsModalOpen(true);
  };

  const handleEdit = (product: Product) => {
    setIsEditing(true);
    setFormData(product);
    setFeaturesInput(product.features ? product.features.join('\n') : '');
    setTempVariants(product.variants || []);
    setActiveTab('general');
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này không?')) {
        const { error } = await supabase.from('products').delete().eq('id', id);
        if (!error) {
            setProducts(products.filter(p => p.id !== id));
        } else {
            alert('Lỗi khi xóa sản phẩm: ' + error.message);
        }
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Process derived data
    const discount = formData.originalPrice > formData.price 
        ? Math.round(((formData.originalPrice - formData.price) / formData.originalPrice) * 100) 
        : 0;
    
    const featuresArray = featuresInput.split('\n').filter(line => line.trim() !== '');

    const productData = { 
        ...formData,
        discount,
        features: featuresArray,
        variants: tempVariants // Save variants to DB (assuming JSONB column support)
    };
    
    // Sanitize payload: remove fields that might not exist in DB or shouldn't be updated directly
    const { id, created_at, reviews, ...payload } = productData as any;

    try {
        if (isEditing) {
            const { error } = await supabase.from('products').update(payload).eq('id', formData.id);
            if (error) throw error;
        } else {
            const { error } = await supabase.from('products').insert([payload]);
            if (error) throw error;
        }
        
        await fetchProducts();
        setIsModalOpen(false);
        alert('Lưu sản phẩm thành công!');
    } catch (error: any) {
        console.error("Save error:", error);
        // Ensure error is a string for alert
        const errorMessage = error?.message || error?.error_description || JSON.stringify(error);
        alert('Lỗi khi lưu sản phẩm: ' + errorMessage + '\nKiểm tra lại console để xem chi tiết.');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const value = e.target.type === 'number' ? Number(e.target.value) : e.target.value;
      setFormData({ ...formData, [e.target.name]: value });
  };
  
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData({ ...formData, [e.target.name]: e.target.checked });
  };

  const handlePlatformChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const platform = e.target.value;
      const currentPlatforms = formData.platforms || [];
      if (e.target.checked) {
          setFormData({ ...formData, platforms: [...currentPlatforms, platform] });
      } else {
          setFormData({ ...formData, platforms: currentPlatforms.filter(p => p !== platform) });
      }
  };

  // Variants Logic
  const addVariant = () => {
      const newVar: Variant = { id: Math.random().toString(), name: 'Gói mới', price: 0, originalPrice: 0 };
      setTempVariants([...tempVariants, newVar]);
  };

  const updateVariant = (id: string, field: keyof Variant, value: any) => {
      setTempVariants(tempVariants.map(v => v.id === id ? { ...v, [field]: value } : v));
  };

  const removeVariant = (id: string) => {
      setTempVariants(tempVariants.filter(v => v.id !== id));
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in relative">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
         <div>
            <h1 className="text-2xl font-extrabold text-gray-900">Sản phẩm</h1>
            <p className="text-sm text-gray-500">Quản lý kho hàng và thông tin chi tiết.</p>
         </div>
         <button 
            onClick={handleAddNew}
            className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-red-500/20 hover:bg-primary-hover transition-all hover:scale-105"
         >
            <Plus size={20} /> Thêm sản phẩm
         </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
         <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Tìm kiếm theo tên, danh mục..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-primary/20 text-sm font-medium"
            />
         </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
         <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
               <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500 font-bold">
                     <th className="p-6">Sản phẩm</th>
                     <th className="p-6">Danh mục</th>
                     <th className="p-6">Giá cơ bản</th>
                     <th className="p-6 text-center">Variants</th>
                     <th className="p-6 text-right">Hành động</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-gray-100">
                  {loading ? (
                    <tr><td colSpan={5} className="p-6 text-center">Đang tải dữ liệu...</td></tr>
                  ) : filteredProducts.map((product) => (
                     <tr key={product.id} className="hover:bg-gray-50/80 transition-colors group bg-white">
                        <td className="p-6">
                           <div className="flex items-center gap-4">
                              <img src={product.image || 'https://via.placeholder.com/150'} alt="" className="w-16 h-16 rounded-xl object-cover bg-gray-100 shadow-sm border border-gray-100" />
                              <div>
                                 <div className="font-bold text-gray-900 text-sm">{product.name}</div>
                                 <div className="text-xs text-gray-500 flex gap-2 mt-1">
                                     {product.isHot && <span className="bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded text-[10px] font-bold">HOT</span>}
                                 </div>
                              </div>
                           </div>
                        </td>
                        <td className="p-6">
                           <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-lg text-xs font-bold uppercase">
                              {product.category}
                           </span>
                        </td>
                        <td className="p-6">
                           <div className="font-bold text-gray-900">
                              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price)}
                           </div>
                        </td>
                        <td className="p-6 text-center">
                           <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-bold">
                              {product.variants?.length || 0} Gói
                           </span>
                        </td>
                        <td className="p-6 text-right">
                           <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button 
                                onClick={() => handleEdit(product)}
                                className="p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors" title="Sửa">
                                 <Edit size={18} />
                              </button>
                              <button 
                                onClick={() => handleDelete(product.id)}
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
           <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
           <div className="bg-white rounded-[2rem] w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col relative z-10 shadow-2xl animate-fade-in-up">
              
              {/* Header */}
              <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-20">
                 <div>
                    <h3 className="text-xl font-extrabold text-gray-900">{isEditing ? 'Sửa sản phẩm' : 'Thêm sản phẩm mới'}</h3>
                    <p className="text-xs text-gray-500">Điền đầy đủ thông tin chi tiết.</p>
                 </div>
                 <button onClick={() => setIsModalOpen(false)}><X size={24} className="text-gray-400 hover:text-gray-900" /></button>
              </div>

              {/* Tabs */}
              <div className="px-8 border-b border-gray-100 flex gap-8">
                 <button onClick={() => setActiveTab('general')} className={`py-4 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${activeTab === 'general' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-900'}`}><Layers size={16} /> Chung</button>
                 <button onClick={() => setActiveTab('variants')} className={`py-4 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${activeTab === 'variants' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-900'}`}><DollarSign size={16} /> Gói & Giá</button>
                 <button onClick={() => setActiveTab('details')} className={`py-4 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${activeTab === 'details' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-900'}`}><List size={16} /> Chi tiết</button>
                 <button onClick={() => setActiveTab('media')} className={`py-4 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${activeTab === 'media' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-900'}`}><FileText size={16} /> Hướng dẫn</button>
              </div>

              {/* Form Content */}
              <div className="p-8 overflow-y-auto bg-gray-50/50">
                 <form id="productForm" onSubmit={handleSave} className="space-y-6">
                    
                    {/* TAB: GENERAL */}
                    {activeTab === 'general' && (
                       <div className="space-y-6 animate-fade-in">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div className="col-span-1 md:col-span-2">
                                 <label className="block text-sm font-bold text-gray-700 mb-2">Tên sản phẩm</label>
                                 <input type="text" name="name" required value={formData.name || ''} onChange={handleChange} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl font-bold focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
                              </div>
                              
                              <div>
                                 <label className="block text-sm font-bold text-gray-700 mb-2">Giá hiển thị (VND)</label>
                                 <input type="number" name="price" required min="0" value={formData.price} onChange={handleChange} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
                              </div>
                              <div>
                                 <label className="block text-sm font-bold text-gray-700 mb-2">Giá gốc (VND)</label>
                                 <input type="number" name="originalPrice" min="0" value={formData.originalPrice} onChange={handleChange} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
                              </div>

                              <div>
                                 <label className="block text-sm font-bold text-gray-700 mb-2">Danh mục</label>
                                 <select name="category" value={formData.category} onChange={handleChange} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none">
                                    {CATEGORIES.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                                 </select>
                              </div>
                              <div>
                                 <label className="block text-sm font-bold text-gray-700 mb-2">Nhà phát triển</label>
                                 <input type="text" name="developer" value={formData.developer || ''} onChange={handleChange} placeholder="VD: Adobe, Microsoft" className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
                              </div>
                          </div>
                          <div>
                             <label className="block text-sm font-bold text-gray-700 mb-2">Mô tả ngắn</label>
                             <textarea name="description" required rows={3} value={formData.description || ''} onChange={handleChange} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"></textarea>
                          </div>
                          <div className="flex gap-8 p-4 bg-white rounded-xl border border-gray-200">
                              <label className="flex items-center gap-3 cursor-pointer"><input type="checkbox" name="isHot" checked={formData.isHot || false} onChange={handleCheckboxChange} className="w-5 h-5 accent-primary" /> <span className="font-bold text-gray-700">Sản phẩm HOT</span></label>
                              <label className="flex items-center gap-3 cursor-pointer"><input type="checkbox" name="isNew" checked={formData.isNew || false} onChange={handleCheckboxChange} className="w-5 h-5 accent-primary" /> <span className="font-bold text-gray-700">Sản phẩm Mới</span></label>
                          </div>
                       </div>
                    )}

                    {/* TAB: VARIANTS */}
                    {activeTab === 'variants' && (
                        <div className="space-y-6 animate-fade-in">
                            <div className="flex justify-between items-center">
                                <h4 className="font-bold text-gray-800">Cấu hình gói đăng ký</h4>
                                <button type="button" onClick={addVariant} className="text-sm bg-primary/10 text-primary px-3 py-1.5 rounded-lg font-bold hover:bg-primary hover:text-white transition-colors flex items-center gap-1"><Plus size={16}/> Thêm gói</button>
                            </div>

                            {tempVariants.length === 0 ? (
                                <div className="text-center p-8 bg-white rounded-2xl border border-dashed border-gray-300 text-gray-500">
                                    Chưa có gói nào. Bấm "Thêm gói" để tạo các mức giá khác nhau (VD: 1 Tháng, 1 Năm...).
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {tempVariants.map((variant) => (
                                        <div key={variant.id} className="flex flex-col sm:flex-row gap-3 p-4 bg-white border border-gray-200 rounded-xl shadow-sm items-start sm:items-center">
                                            <input 
                                                type="text" 
                                                placeholder="Tên gói (VD: 1 Năm)" 
                                                value={variant.name || ''}
                                                onChange={(e) => updateVariant(variant.id, 'name', e.target.value)}
                                                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg font-bold"
                                            />
                                            <div className="flex gap-2">
                                                <input 
                                                    type="number" 
                                                    placeholder="Giá bán" 
                                                    value={variant.price}
                                                    onChange={(e) => updateVariant(variant.id, 'price', Number(e.target.value))}
                                                    className="w-32 px-3 py-2 border border-gray-200 rounded-lg font-medium text-primary"
                                                />
                                                <input 
                                                    type="number" 
                                                    placeholder="Giá gốc" 
                                                    value={variant.originalPrice}
                                                    onChange={(e) => updateVariant(variant.id, 'originalPrice', Number(e.target.value))}
                                                    className="w-32 px-3 py-2 border border-gray-200 rounded-lg text-gray-500"
                                                />
                                            </div>
                                            <button type="button" onClick={() => removeVariant(variant.id)} className="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50"><Trash2 size={18} /></button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* TAB: DETAILS */}
                    {activeTab === 'details' && (
                       <div className="space-y-6 animate-fade-in">
                          <div>
                             <label className="block text-sm font-bold text-gray-700 mb-2">Chính sách bảo hành</label>
                             <input type="text" name="warrantyPolicy" value={formData.warrantyPolicy || ''} onChange={handleChange} placeholder="VD: Bảo hành trọn đời, lỗi 1 đổi 1" className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
                          </div>
                          <div>
                             <label className="block text-sm font-bold text-gray-700 mb-2">Tính năng nổi bật</label>
                             <textarea 
                                value={featuresInput}
                                onChange={(e) => setFeaturesInput(e.target.value)}
                                rows={6}
                                placeholder="- Tính năng 1&#10;- Tính năng 2"
                                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                             ></textarea>
                          </div>
                          <div>
                             <label className="block text-sm font-bold text-gray-700 mb-2">Nền tảng hỗ trợ</label>
                             <div className="flex gap-4 flex-wrap">
                                {['Windows', 'MacOS', 'iOS', 'Android', 'Web'].map(p => (
                                    <label key={p} className="flex items-center gap-2 p-2 bg-white rounded-lg border border-gray-200"><input type="checkbox" value={p} checked={(formData.platforms || []).includes(p)} onChange={handlePlatformChange} className="accent-primary" /> {p}</label>
                                ))}
                             </div>
                          </div>
                       </div>
                    )}

                    {/* TAB: MEDIA */}
                    {activeTab === 'media' && (
                       <div className="space-y-6 animate-fade-in">
                          <div>
                             <label className="block text-sm font-bold text-gray-700 mb-2">Link Ảnh đại diện</label>
                             <div className="flex gap-4">
                                <input type="text" name="image" required value={formData.image || ''} onChange={handleChange} className="flex-1 px-4 py-3 bg-white border border-gray-200 rounded-xl font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
                                {formData.image && <img src={formData.image} alt="Preview" className="w-16 h-16 rounded-lg object-cover bg-gray-200" />}
                             </div>
                             <p className="text-xs text-gray-500 mt-2">Dán đường dẫn ảnh (URL) vào ô trên. Hỗ trợ JPG, PNG, WebP.</p>
                          </div>
                          <div>
                             <label className="block text-sm font-bold text-gray-700 mb-2">Hướng dẫn kích hoạt</label>
                             <textarea 
                                name="activationGuide"
                                rows={10}
                                value={formData.activationGuide || ''}
                                onChange={handleChange}
                                placeholder="Nhập hướng dẫn sử dụng..."
                                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl font-mono text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                             ></textarea>
                          </div>
                       </div>
                    )}

                 </form>
              </div>

              {/* Footer */}
              <div className="px-8 py-5 border-t border-gray-100 bg-white flex justify-end gap-3 sticky bottom-0 z-20">
                 <button onClick={() => setIsModalOpen(false)} className="px-6 py-3 rounded-xl font-bold text-gray-600 hover:bg-gray-100 transition-colors">Hủy</button>
                 <button form="productForm" type="submit" className="px-6 py-3 bg-primary text-white rounded-xl font-bold shadow-lg shadow-red-500/20 hover:bg-primary-hover flex items-center gap-2"><Save size={18} /> Lưu sản phẩm</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};