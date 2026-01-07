import React, { useState, useEffect } from 'react';
import { Search, Package, Clock, CheckCircle, AlertCircle, Copy, ArrowRight, Truck } from 'lucide-react';
import * as ReactRouterDOM from 'react-router-dom';

const { Link } = ReactRouterDOM;

// Mock Order Data for demonstration
const MOCK_ORDER = {
  id: 'ADN88291',
  date: '15/03/2024 - 14:30',
  status: 'completed', // pending, processing, completed, cancelled
  customer: {
    name: 'Nguyễn Văn A',
    email: 'nguyen***@gmail.com'
  },
  items: [
    { name: 'Tài khoản Netflix Premium (1 tháng)', price: 69000, quantity: 1 },
    { name: 'Nâng cấp YouTube Premium', price: 29000, quantity: 1 }
  ],
  total: 98000,
  paymentMethod: 'Chuyển khoản QR',
  delivery: {
    key: 'NETFLIX-8829-KEY-XXXX',
    instruction: 'Vui lòng đăng nhập tại netflix.com với thông tin trên.'
  }
};

export const OrderLookup: React.FC = () => {
  const [orderId, setOrderId] = useState('');
  const [contact, setContact] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [orderData, setOrderData] = useState<typeof MOCK_ORDER | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setOrderData(null);
    setError('');

    // Simulate API Call
    setTimeout(() => {
      setIsLoading(false);
      if (orderId.trim().length > 0 && contact.trim().length > 0) {
        // For demo: Always return success if inputs are filled
        setOrderData(MOCK_ORDER); 
      } else {
        setError('Vui lòng nhập đầy đủ Mã đơn hàng và Email/SĐT.');
      }
    }, 1500);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Đã sao chép!');
  };

  return (
    <main className="min-h-screen bg-[#F2F2F7] pt-28 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">Tra cứu đơn hàng</h1>
          <p className="text-gray-500 max-w-2xl mx-auto">
            Nhập mã đơn hàng và thông tin liên hệ để kiểm tra trạng thái xử lý hoặc lấy lại Key/Tài khoản đã mua.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Search Form */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100">
              <form onSubmit={handleSearch} className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Mã đơn hàng</label>
                  <div className="relative">
                    <Package className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input 
                      type="text" 
                      value={orderId}
                      onChange={(e) => setOrderId(e.target.value.toUpperCase())}
                      placeholder="Ví dụ: ADN88291"
                      className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-medium uppercase transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Email hoặc Số điện thoại</label>
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input 
                      type="text" 
                      value={contact}
                      onChange={(e) => setContact(e.target.value)}
                      placeholder="Nhập thông tin mua hàng"
                      className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-medium transition-all"
                    />
                  </div>
                </div>

                {error && (
                  <div className="p-4 bg-red-50 text-red-600 rounded-xl flex items-center gap-3 text-sm font-medium">
                    <AlertCircle size={18} />
                    {error}
                  </div>
                )}

                <button 
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-primary text-white font-bold py-4 rounded-xl shadow-lg shadow-red-500/20 hover:bg-primary-hover hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  ) : (
                    <>Tra cứu ngay <ArrowRight size={20} /></>
                  )}
                </button>
              </form>
            </div>

            <div className="mt-6 bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 text-center">
               <p className="text-sm text-gray-500 mb-3">Gặp khó khăn khi tra cứu?</p>
               <button className="text-primary font-bold text-sm hover:underline">Liên hệ hỗ trợ Zalo</button>
            </div>
          </div>

          {/* Result Area */}
          <div className="lg:col-span-7">
            {orderData ? (
              <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 animate-fade-in-up">
                
                {/* Header Status */}
                <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-100">
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Đơn hàng #{orderData.id}</div>
                    <div className="text-sm font-medium text-gray-900">{orderData.date}</div>
                  </div>
                  <div className={`px-4 py-2 rounded-lg text-sm font-bold capitalize flex items-center gap-2 ${
                    orderData.status === 'completed' ? 'bg-green-100 text-green-700' :
                    orderData.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {orderData.status === 'completed' ? <CheckCircle size={16}/> : <Clock size={16}/>}
                    {orderData.status === 'completed' ? 'Hoàn thành' : 'Đang xử lý'}
                  </div>
                </div>

                {/* Products */}
                <div className="space-y-4 mb-8">
                  {orderData.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
                      <div>
                        <div className="font-bold text-gray-900">{item.name}</div>
                        <div className="text-xs text-gray-500 mt-1">Số lượng: {item.quantity}</div>
                      </div>
                      <div className="font-bold text-gray-900">
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price)}
                      </div>
                    </div>
                  ))}
                  <div className="flex justify-between items-center pt-4 px-4">
                    <span className="font-bold text-gray-500">Tổng thanh toán</span>
                    <span className="text-xl font-extrabold text-primary">
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(orderData.total)}
                    </span>
                  </div>
                </div>

                {/* Delivery Info / Keys */}
                {orderData.status === 'completed' && (
                  <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl p-6 text-white shadow-lg">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center text-green-400">
                        <Package size={20} />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">Thông tin bàn giao</h3>
                        <p className="text-xs text-gray-400">Đã gửi về email {orderData.customer.email}</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <div className="text-xs text-gray-400 mb-2 uppercase font-bold tracking-wider">Key / Tài khoản</div>
                        <div className="flex items-center gap-2 bg-white/10 rounded-lg p-3 border border-white/10">
                          <code className="flex-1 font-mono text-green-400 truncate">{orderData.delivery.key}</code>
                          <button 
                            onClick={() => copyToClipboard(orderData.delivery.key)}
                            className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-300 hover:text-white"
                            title="Sao chép"
                          >
                            <Copy size={16} />
                          </button>
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-400 mb-2 uppercase font-bold tracking-wider">Hướng dẫn</div>
                        <p className="text-sm text-gray-300 leading-relaxed bg-white/5 p-3 rounded-lg border border-white/5">
                          {orderData.delivery.instruction}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                
                {orderData.status !== 'completed' && (
                   <div className="bg-yellow-50 border border-yellow-100 rounded-2xl p-6 text-yellow-800 flex items-start gap-4">
                      <Clock className="flex-shrink-0 mt-1" size={20} />
                      <div>
                        <h4 className="font-bold mb-1">Đơn hàng đang được xử lý</h4>
                        <p className="text-sm opacity-90">Hệ thống đang kiểm tra thanh toán. Vui lòng đợi trong giây lát hoặc liên hệ Support nếu quá 15 phút chưa nhận được key.</p>
                      </div>
                   </div>
                )}

              </div>
            ) : (
              // Empty State Illustration
              <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-center p-8 bg-white rounded-[2rem] shadow-sm border border-gray-100 border-dashed">
                 <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                    <Search size={40} className="text-gray-300" />
                 </div>
                 <h3 className="text-xl font-bold text-gray-900 mb-2">Chưa có thông tin</h3>
                 <p className="text-gray-500 max-w-sm">
                   Kết quả tra cứu sẽ hiển thị tại đây sau khi bạn nhập mã đơn hàng.
                 </p>
              </div>
            )}
          </div>

        </div>
      </div>
    </main>
  );
};