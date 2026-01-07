import React, { useEffect, useState } from 'react';
import { Search, Mail, Phone, Calendar, User, MoreHorizontal, Shield } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Customer } from '../../types';

export const AdminCustomers: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const { data, error } = await supabase
          .from('customers')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data) {
          setCustomers(data);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchCustomers();
  }, []);

  const filteredCustomers = customers.filter(c => 
    (c.full_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (c.email?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
         <div>
            <h1 className="text-2xl font-extrabold text-gray-900">Khách hàng</h1>
            <p className="text-sm text-gray-500">Danh sách người dùng đã đăng ký tài khoản.</p>
         </div>
         <div className="bg-white px-4 py-2 rounded-xl border border-gray-100 shadow-sm flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
            <span className="text-sm font-bold text-gray-700">{customers.length} Thành viên</span>
         </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
         <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Tìm kiếm theo tên hoặc email..." 
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
                     <th className="p-6">Thành viên</th>
                     <th className="p-6">Liên hệ</th>
                     <th className="p-6">Ngày tham gia</th>
                     <th className="p-6">Vai trò</th>
                     <th className="p-6 text-right"></th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-gray-100">
                  {loading ? (
                    <tr><td colSpan={5} className="p-8 text-center">Đang tải danh sách...</td></tr>
                  ) : filteredCustomers.map((customer) => (
                     <tr key={customer.id} className="hover:bg-gray-50/80 transition-colors">
                        <td className="p-6">
                           <div className="flex items-center gap-4">
                              {customer.avatar_url ? (
                                <img src={customer.avatar_url} alt="" className="w-12 h-12 rounded-full object-cover border border-gray-200" />
                              ) : (
                                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                                   <User size={20} />
                                </div>
                              )}
                              <div>
                                 <div className="font-bold text-gray-900 text-sm">{customer.full_name || 'Chưa đặt tên'}</div>
                                 <div className="text-xs text-gray-400 font-mono mt-1">ID: {customer.id.slice(0, 8)}...</div>
                              </div>
                           </div>
                        </td>
                        <td className="p-6">
                           <div className="space-y-1">
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                 <Mail size={14} className="text-gray-400" /> {customer.email}
                              </div>
                              {customer.phone && (
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                   <Phone size={14} className="text-gray-400" /> {customer.phone}
                                </div>
                              )}
                           </div>
                        </td>
                        <td className="p-6">
                           <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Calendar size={14} className="text-gray-400" />
                              {new Date(customer.created_at).toLocaleDateString('vi-VN')}
                           </div>
                        </td>
                        <td className="p-6">
                           {customer.email.includes('admin') ? (
                              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-bold border border-purple-200">
                                 <Shield size={12} /> Admin
                              </span>
                           ) : (
                              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-bold border border-blue-100">
                                 <User size={12} /> Member
                              </span>
                           )}
                        </td>
                        <td className="p-6 text-right">
                           <button className="text-gray-400 hover:text-gray-900 p-2 rounded-lg hover:bg-gray-100 transition-colors">
                              <MoreHorizontal size={20} />
                           </button>
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>
            {!loading && filteredCustomers.length === 0 && (
               <div className="p-12 text-center text-gray-500">Chưa có khách hàng nào đăng ký.</div>
            )}
         </div>
      </div>
    </div>
  );
};