
import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Edit, Trash2, X, Save, Image as ImageIcon, Layers, FileText, Monitor, ShieldCheck, List, DollarSign, Package, AlertCircle, CheckSquare, Square, Eye, EyeOff } from 'lucide-react';
import { CATEGORIES } from '../../constants';
import { Product, Variant } from '../../types';
import { supabase } from '../../lib/supabase';

export const AdminProducts: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  
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
    isActive: true,
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

  // --- BULK ACTIONS LOGIC ---
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.checked) {
          const allIds = new Set(filteredProducts.map(p => p.id));
          setSelectedIds(allIds);
      } else {
          setSelectedIds(new Set());
      }
  };

  const handleSelectOne = (id: string) => {
      const newSelected = new Set(selectedIds);
      if (newSelected.has(id)) {
          newSelected.delete(id);
      } else {
          newSelected.add(id);
      }
      setSelectedIds(newSelected);
  };

  const handleBulkDelete = async () => {
      if (selectedIds.size === 0) return;
      if (window.confirm(`Bạn có chắc muốn xóa ${selectedIds.size} sản phẩm đã chọn?`)) {
          const ids = Array.from(selectedIds);
          const { error } = await supabase.from('products').delete().in('id', ids);
          
          if (!error) {
              setProducts(prev => prev.filter(p => !selectedIds.has(p.id)));
              setSelectedIds(new Set());
          } else {
              alert('Lỗi xóa: ' + error.message);
          }
      }
  };

  const handleBulkToggleStatus = async (status: boolean) => {
      if (selectedIds.size === 0) return;
      const ids = Array.from(selectedIds);
      
      // Optimistic UI
      setProducts(prev => prev.map(p => selectedIds.has(p.id) ? { ...p, isActive: status } : p));
      
      const { error } = await supabase.from('products').update({ isActive: status }).in('id', ids);
      if (error) {
          alert('Lỗi cập nhật: ' + error.message);
          fetchProducts(); // Revert
      } else {
          setSelectedIds(new Set());
      }
  };

  // --- CRUD ACTIONS ---
  const handleAddNew = () => {
    setIsEditing(false);
    setFormData({ ...initialFormState, isActive: true });
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
    
    // Sanitize payload
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
    } catch (error: any) {
        console.error("Save error:", error);
        const errorMessage = error?.message || error?.error_description || JSON.stringify(error);
        alert('Lỗi khi lưu sản phẩm: ' + errorMessage);
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
      const newVar: Variant = { id: Math.random().toString(), name: 'Gói mới', price: 0, originalPrice: 0, stock: 10, sku: '' };
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

  // Calculate total stock for a product
  const getTotalStock = (p: Product) => {
      if (!p.variants || p.variants.length === 0) return 0;
      return p.variants.reduce((sum, v) => sum + (v.stock || 0), 0);
  };

  return (
    <div className="space-y-6 animate-fade-in relative pb-24">
      {/* Floating Bulk Action Bar */}
      {selectedIds.size > 0 && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-gray-900 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-6 animate-fade-in-up">
              <span className="font-bold text-sm">{selectedIds.size} đã chọn</span>
              <div className="h-4 w-px bg-gray-700"></div>
              <div className="flex gap-2">
                  <button onClick={() => handleBulkToggleStatus(true)} className="flex items-center gap-1.5 hover:text-green-400 transition-colors text-xs font-bold"><Eye size={16}/> Hiện</button>
                  <button onClick={() => handleBulkToggleStatus(false)} className="flex items-center gap-1.5 hover:text-gray-400 transition-colors text-xs font-bold"><EyeOff size={16}/> Ẩn</button>
                  <button onClick={handleBulkDelete} className="flex items-center gap-1.5 hover:text-red-500 transition-colors text-xs font-bold ml-2"><Trash2 size={16}/> Xóa</button>
              </div>
              <button onClick={() => setSelectedIds(new Set())} className="ml-2 p-1 hover:bg-white/20 rounded-full"><X size={14}/></button>
          </div>
      )}

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
                     <th className="p-6 w-10">
                         <div className="flex items-center justify-center">
                             <input 
                                type="checkbox" 
                                onChange={handleSelectAll} 
                                checked={filteredProducts.length > 0 && selectedIds.size === filteredProducts.length}
                                className="w-4 h-4 rounded border-gray-300 accent-primary cursor-pointer"
                             />
                         </div>
                     </th>
                     <th className="p-6">Sản phẩm</th>
                     <th className="p-6">Kho hàng</th>
                     <th className="p-6">Giá cơ bản</th>
                     <th className="p-6 text-center">Trạng thái</th>
                     <th className="p-6 text-right">Hành động</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-gray-100">
                  {loading ? (
                    <tr><td colSpan={6} className="p-6 text-center">Đang tải dữ liệu...</td></tr>
                  ) : filteredProducts.map((product) => {
                     const stock = getTotalStock(product);
                     const isLowStock = stock < 10;
                     
                     return (
                     <tr key={product.id} className={`hover:bg-gray-50/80 transition-colors group ${selectedIds.has(product.id) ? 'bg-blue-50/30' : 'bg-white'}`}>
                        <td className="p-6">
                            <div className="flex items-center justify-center">
                                <input 
                                    type="checkbox" 
                                    checked={selectedIds.has(product.id)}
                                    onChange={() => handleSelectOne(product.id)}
                                    className="w-4 h-4 rounded border-gray-300 accent-primary cursor-pointer"
                                />
                            </div>
                        </td>
                        <td className="p-6">
                           <div className="flex items-center gap-4">
                              <div className="relative">
                                  <img src={product.image || 'https://via.placeholder.com/150'} alt="" className="w-16 h-16 rounded-xl object-cover bg-gray-100 shadow-sm border border-gray-100" />
                                  {product.isHot && <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full shadow-sm">HOT</span>}
                              </div>
                              <div>
                                 <div className="font-bold text-gray-900 text-sm line-clamp-1 w-48" title={product.name}>{product.name}</div>
                                 <span className="text-[10px] font-bold text-gray-500 uppercase bg-gray-100 px-2 py-0.5 rounded mt-1 inline-block">
                                    {product.category}
                                 </span>
                              </div>
                           </div>
                        </td>
                        <td className="p-6">
                           <div className="flex flex-col gap-1">
                               <div className="flex items-center gap-2">
                                   <Package size={14} className="text-gray-400"/>
                                   <span className="font-bold text-sm text-gray-700">{stock}</span>
                               </div>
                               {isLowStock && (
                                   <span className="flex items-center gap-1 text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded w-fit">
                                       <AlertCircle size={10} /> Sắp hết
                                   </span>
                               )}
                           </div>
                        </td>
                        <td className="p-6">
                           <div className="font-bold text-gray-900">
                              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price)}
                           </div>
                        </td>
                        <td className="p-6 text-center">
                           <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold border ${product.isActive !== false ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-50 text-gray-500 border-gray-200'}`}>
                              {product.isActive !== false ? 'Hiển thị' : 'Đang ẩn'}
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
                  )})}
               </tbody>
            </table>
         </div>
      </div>

       {/* MODAL EDITOR - FIXED LAYOUT & IMPROVED UX */}
       {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
           {/* Backdrop */}
           <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
           
           {/* Modal Layout: Pure Flex Column with Fixed Height Constraints */}
           <div className="bg-white rounded-[2rem] w-full max-w-5xl h-[90vh] max-h-[900px] flex flex-col relative z-10 shadow-2xl animate-fade-in-up overflow-hidden">
              
              {/* 1. Header (Fixed, no shrink) */}
              <div className="px-8 py-5 border-b border-gray-100 flex items-center justify-between bg-white shrink-0 z-20">
                 <div>
                    <h3 className="text-xl font-extrabold text-gray-900">{isEditing ? 'Sửa sản phẩm' : 'Thêm sản phẩm mới'}</h3>
                    <p className="text-xs text-gray-500">Điền đầy đủ thông tin chi tiết.</p>
                 </div>
                 <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X size={24} className="text-gray-400 hover:text-gray-900" /></button>
              </div>

              {/* 2. Tabs (Fixed, no shrink) */}
              <div className="px-8 border-b border-gray-100 flex gap-8 shrink-0 bg-white z-20 overflow-x-auto no-scrollbar">
                 <button onClick={() => setActiveTab('general')} className={`py-4 text-sm font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === 'general' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-900'}`}><Layers size={16} /> Chung</button>
                 <button onClick={() => setActiveTab('variants')} className={`py-4 text-sm font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === 'variants' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-900'}`}><Package size={16} /> Gói & Kho</button>
                 <button onClick={() => setActiveTab('details')} className={`py-4 text-sm font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === 'details' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-900'}`}><List size={16} /> Chi tiết</button>
                 <button onClick={() => setActiveTab('media')} className={`py-4 text-sm font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === 'media' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-900'}`}><FileText size={16} /> Hướng dẫn</button>
              </div>

              {/* 3. Form Content (Scrollable Area, flex-1, min-h-0) */}
              <div className="p-8 overflow-y-auto bg-gray-50/50 flex-1 min-h-0 relative">
                 <form id="productForm" onSubmit={handleSave} className="space-y-6 pb-4">
                    
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
                          <div className="flex gap-4 p-4 bg-white rounded-xl border border-gray-200">
                              <label className="flex items-center gap-2 cursor-pointer bg-gray-50 px-3 py-2 rounded-lg hover:bg-gray-100 border border-gray-200">
                                  <input type="checkbox" name="isActive" checked={formData.isActive !== false} onChange={handleCheckboxChange} className="w-4 h-4 accent-primary" /> 
                                  <span className="font-bold text-sm text-gray-700">Hiển thị</span>
                              </label>
                              <label className="flex items-center gap-2 cursor-pointer bg-gray-50 px-3 py-2 rounded-lg hover:bg-gray-100 border border-gray-200">
                                  <input type="checkbox" name="isHot" checked={formData.isHot || false} onChange={handleCheckboxChange} className="w-4 h-4 accent-primary" /> 
                                  <span className="font-bold text-sm text-gray-700">HOT</span>
                              </label>
                              <label className="flex items-center gap-2 cursor-pointer bg-gray-50 px-3 py-2 rounded-lg hover:bg-gray-100 border border-gray-200">
                                  <input type="checkbox" name="isNew" checked={formData.isNew || false} onChange={handleCheckboxChange} className="w-4 h-4 accent-primary" /> 
                                  <span className="font-bold text-sm text-gray-700">Mới</span>
                              </label>
                          </div>
                       </div>
                    )}

                    {/* TAB: VARIANTS & INVENTORY */}
                    {activeTab === 'variants' && (
                        <div className="space-y-6 animate-fade-in">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h4 className="font-bold text-gray-800">Cấu hình gói & Kho hàng</h4>
                                    <p className="text-xs text-gray-500">Quản lý giá và số lượng tồn kho cho từng biến thể.</p>
                                </div>
                                <button type="button" onClick={addVariant} className="text-sm bg-primary/10 text-primary px-3 py-2 rounded-lg font-bold hover:bg-primary hover:text-white transition-colors flex items-center gap-1"><Plus size={16}/> Thêm gói</button>
                            </div>

                            {tempVariants.length === 0 ? (
                                <div className="text-center p-12 bg-white rounded-2xl border border-dashed border-gray-300 text-gray-500">
                                    Chưa có gói nào. Bấm "Thêm gói" để tạo các mức giá khác nhau (VD: 1 Tháng, 1 Năm...).
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {tempVariants.map((variant, index) => (
                                        <div key={variant.id} className="p-5 bg-white border border-gray-200 rounded-2xl shadow-sm relative group">
                                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button type="button" onClick={() => removeVariant(variant.id)} className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50"><X size={16} /></button>
                                            </div>
                                            
                                            <div className="grid grid-cols-12 gap-4">
                                                <div className="col-span-12 sm:col-span-4">
                                                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Tên gói</label>
                                                    <input 
                                                        type="text" 
                                                        placeholder="VD: 1 Năm" 
                                                        value={variant.name || ''}
                                                        onChange={(e) => updateVariant(variant.id, 'name', e.target.value)}
                                                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg font-bold text-sm"
                                                    />
                                                </div>
                                                <div className="col-span-6 sm:col-span-3">
                                                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Giá bán</label>
                                                    <input 
                                                        type="number" 
                                                        placeholder="0" 
                                                        value={variant.price}
                                                        onChange={(e) => updateVariant(variant.id, 'price', Number(e.target.value))}
                                                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg font-bold text-sm text-primary"
                                                    />
                                                </div>
                                                <div className="col-span-6 sm:col-span-2">
                                                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Tồn kho</label>
                                                    <input 
                                                        type="number" 
                                                        placeholder="0" 
                                                        value={variant.stock || 0}
                                                        onChange={(e) => updateVariant(variant.id, 'stock', Number(e.target.value))}
                                                        className={`w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg font-bold text-sm ${variant.stock && variant.stock < 10 ? 'text-red-500 bg-red-50 border-red-200' : 'text-gray-700'}`}
                                                    />
                                                </div>
                                                <div className="col-span-12 sm:col-span-3">
                                                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">SKU (Mã kho)</label>
                                                    <input 
                                                        type="text" 
                                                        placeholder="SKU-..." 
                                                        value={variant.sku || ''}
                                                        onChange={(e) => updateVariant(variant.id, 'sku', e.target.value)}
                                                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg font-mono text-xs text-gray-600"
                                                    />
                                                </div>
                                            </div>
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
                             <label className="block text-sm font-bold text-gray-700 mb-2">Tính năng nổi bật (Mỗi dòng 1 ý)</label>
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
                             <div className="flex gap-3 flex-wrap">
                                {['Windows', 'MacOS', 'iOS', 'Android', 'Web'].map(p => (
                                    <label key={p} className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-50">
                                        <input type="checkbox" value={p} checked={(formData.platforms || []).includes(p)} onChange={handlePlatformChange} className="accent-primary" /> 
                                        <span className="text-sm font-medium">{p}</span>
                                    </label>
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
                             <label className="block text-sm font-bold text-gray-700 mb-2">Hướng dẫn kích hoạt (Markdown)</label>
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

              {/* 4. Footer (Fixed Height, shrink-0) */}
              <div className="px-8 py-5 border-t border-gray-100 bg-white flex justify-end gap-3 shrink-0 z-20">
                 <button onClick={() => setIsModalOpen(false)} className="px-6 py-3 rounded-xl font-bold text-gray-600 hover:bg-gray-100 transition-colors">Hủy</button>
                 <button form="productForm" type="submit" className="px-6 py-3 bg-primary text-white rounded-xl font-bold shadow-lg shadow-red-500/20 hover:bg-primary-hover flex items-center gap-2"><Save size={18} /> Lưu sản phẩm</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};
