import React, { useState, useEffect } from 'react';
import { Mail, Phone, MapPin, Clock, Send, MessageSquare, HelpCircle, ChevronDown, CheckCircle } from 'lucide-react';

export const Contact: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [formState, setFormState] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      setFormState({ name: '', email: '', subject: '', message: '' });
      setTimeout(() => setIsSuccess(false), 5000);
    }, 1500);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormState({ ...formState, [e.target.name]: e.target.value });
  };

  const FAQS = [
    {
      question: "Sau khi thanh toán bao lâu thì tôi nhận được tài khoản?",
      answer: "Hệ thống của chúng tôi hoạt động tự động 24/7. Thông thường, bạn sẽ nhận được thông tin tài khoản hoặc key kích hoạt qua Email ngay lập tức (trong vòng 30 giây - 5 phút) sau khi thanh toán thành công."
    },
    {
      question: "Chính sách bảo hành như thế nào?",
      answer: "AIDAYNE cam kết bảo hành trọn đời cho thời gian sử dụng gói dịch vụ. Nếu có lỗi phát sinh (mất premium, lỗi key...), chúng tôi sẽ đổi mới 1-1 ngay lập tức hoặc hoàn tiền theo thời gian chưa sử dụng."
    },
    {
      question: "Tôi có thể đăng nhập tài khoản trên nhiều thiết bị không?",
      answer: "Tùy thuộc vào loại tài khoản. Ví dụ: Netflix Premium hỗ trợ đăng nhập trên nhiều thiết bị nhưng chỉ xem đồng thời trên số lượng màn hình quy định (1 hoặc 4). Các key phần mềm như Windows/Office thường chỉ kích hoạt cho 1 PC."
    },
    {
      question: "Shop hỗ trợ những hình thức thanh toán nào?",
      answer: "Chúng tôi hỗ trợ chuyển khoản ngân hàng (VietQR - Tự động duyệt), Ví MoMo, ZaloPay và Thẻ tín dụng quốc tế (Visa/Mastercard)."
    }
  ];

  return (
    <main className="min-h-screen bg-[#F2F2F7] pt-28 pb-20">
      
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12 text-center">
        <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">
          Liên hệ & Hỗ trợ
        </h1>
        <p className="text-gray-500 text-lg max-w-2xl mx-auto">
          Đội ngũ AIDAYNE luôn sẵn sàng lắng nghe và giải đáp mọi thắc mắc của bạn 24/7.
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Contact Info */}
          <div className="lg:col-span-5 space-y-6">
             {/* Info Cards */}
             <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 space-y-8">
                <div className="flex items-start gap-4">
                   <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                      <Phone size={24} strokeWidth={2} />
                   </div>
                   <div>
                      <h3 className="font-bold text-gray-900 text-lg mb-1">Hotline / Zalo</h3>
                      <p className="text-gray-500 text-sm mb-2">Hỗ trợ kỹ thuật & Tư vấn mua hàng</p>
                      <a href="tel:0374770023" className="text-xl font-bold text-primary hover:underline">0374.770.023</a>
                   </div>
                </div>

                <div className="flex items-start gap-4">
                   <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center flex-shrink-0">
                      <Mail size={24} strokeWidth={2} />
                   </div>
                   <div>
                      <h3 className="font-bold text-gray-900 text-lg mb-1">Email hỗ trợ</h3>
                      <p className="text-gray-500 text-sm mb-2">Giải quyết khiếu nại & Hợp tác</p>
                      <a href="mailto:support@aidayne.com" className="text-lg font-bold text-gray-800 hover:text-primary transition-colors">support@aidayne.com</a>
                   </div>
                </div>

                <div className="flex items-start gap-4">
                   <div className="w-12 h-12 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center flex-shrink-0">
                      <Clock size={24} strokeWidth={2} />
                   </div>
                   <div>
                      <h3 className="font-bold text-gray-900 text-lg mb-1">Thời gian làm việc</h3>
                      <p className="text-gray-500 text-sm">Thứ 2 - Chủ Nhật</p>
                      <p className="font-bold text-gray-800">08:00 - 24:00</p>
                   </div>
                </div>

                <div className="flex items-start gap-4">
                   <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0">
                      <MapPin size={24} strokeWidth={2} />
                   </div>
                   <div>
                      <h3 className="font-bold text-gray-900 text-lg mb-1">Văn phòng</h3>
                      <p className="text-gray-500 text-sm leading-relaxed">
                        Tầng 3, Tòa nhà TechHub, Quận 1, TP. Hồ Chí Minh
                      </p>
                   </div>
                </div>
             </div>

             {/* Map Placeholder */}
             <div className="bg-gray-200 rounded-[2rem] overflow-hidden h-64 shadow-sm relative group">
                <img 
                  src="https://images.unsplash.com/photo-1524661135-423995f22d0b?w=800&auto=format&fit=crop&q=80" 
                  alt="Map" 
                  className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                   <button className="bg-white text-gray-900 font-bold py-2 px-6 rounded-full shadow-lg hover:scale-105 transition-transform flex items-center gap-2">
                      <MapPin size={18} className="text-primary" /> Xem bản đồ
                   </button>
                </div>
             </div>
          </div>

          {/* Right Column: Contact Form */}
          <div className="lg:col-span-7">
             <div className="bg-white rounded-[2rem] p-8 md:p-10 shadow-sm border border-gray-100 h-full">
                <div className="flex items-center gap-3 mb-8">
                   <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-primary">
                      <MessageSquare size={20} />
                   </div>
                   <h2 className="text-2xl font-bold text-gray-900">Gửi tin nhắn cho chúng tôi</h2>
                </div>

                {isSuccess ? (
                  <div className="h-full flex flex-col items-center justify-center text-center py-10 animate-fade-in-up">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-6">
                       <CheckCircle size={40} />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Gửi thành công!</h3>
                    <p className="text-gray-500 max-w-md">
                      Cảm ơn bạn đã liên hệ. Chúng tôi đã nhận được tin nhắn và sẽ phản hồi sớm nhất có thể qua email của bạn.
                    </p>
                    <button onClick={() => setIsSuccess(false)} className="mt-8 text-primary font-bold hover:underline">
                      Gửi tin nhắn khác
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                         <label className="text-sm font-bold text-gray-700 ml-1">Họ và tên</label>
                         <input 
                           type="text" 
                           name="name"
                           required
                           value={formState.name}
                           onChange={handleChange}
                           placeholder="Nhập họ tên của bạn"
                           className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
                         />
                      </div>
                      <div className="space-y-2">
                         <label className="text-sm font-bold text-gray-700 ml-1">Email</label>
                         <input 
                           type="email" 
                           name="email"
                           required
                           value={formState.email}
                           onChange={handleChange}
                           placeholder="name@example.com"
                           className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
                         />
                      </div>
                    </div>

                    <div className="space-y-2">
                       <label className="text-sm font-bold text-gray-700 ml-1">Chủ đề cần hỗ trợ</label>
                       <select 
                          name="subject"
                          value={formState.subject}
                          onChange={handleChange}
                          className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium text-gray-700"
                       >
                          <option value="" disabled>Chọn chủ đề</option>
                          <option value="support">Hỗ trợ kỹ thuật</option>
                          <option value="sales">Tư vấn mua hàng</option>
                          <option value="warranty">Bảo hành / Đổi trả</option>
                          <option value="other">Khác</option>
                       </select>
                    </div>

                    <div className="space-y-2">
                       <label className="text-sm font-bold text-gray-700 ml-1">Nội dung tin nhắn</label>
                       <textarea 
                         name="message"
                         required
                         rows={5}
                         value={formState.message}
                         onChange={handleChange}
                         placeholder="Mô tả chi tiết vấn đề bạn đang gặp phải..."
                         className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium resize-none"
                       ></textarea>
                    </div>

                    <button 
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-primary text-white font-bold py-4 rounded-xl shadow-lg shadow-red-500/20 hover:bg-primary-hover hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      ) : (
                        <>Gửi tin nhắn <Send size={18} /></>
                      )}
                    </button>
                  </form>
                )}
             </div>
          </div>

        </div>

        {/* FAQ Section */}
        <div className="mt-20 max-w-4xl mx-auto">
           <div className="text-center mb-10">
              <span className="inline-block bg-white border border-gray-200 px-4 py-1.5 rounded-full text-xs font-bold text-gray-500 mb-4 uppercase tracking-wider">
                FAQ
              </span>
              <h2 className="text-3xl font-extrabold text-gray-900">Câu hỏi thường gặp</h2>
           </div>

           <div className="space-y-4">
              {FAQS.map((faq, index) => (
                <div 
                  key={index} 
                  className={`bg-white rounded-2xl border transition-all duration-300 overflow-hidden ${activeFaq === index ? 'border-primary/30 shadow-md ring-2 ring-primary/5' : 'border-gray-100 shadow-sm hover:border-gray-200'}`}
                >
                  <button 
                    onClick={() => setActiveFaq(activeFaq === index ? null : index)}
                    className="w-full px-6 py-5 flex items-center justify-between text-left"
                  >
                    <span className="font-bold text-gray-900 text-lg flex items-center gap-3">
                       <HelpCircle size={20} className={activeFaq === index ? "text-primary" : "text-gray-400"} />
                       {faq.question}
                    </span>
                    <ChevronDown size={20} className={`text-gray-400 transition-transform duration-300 ${activeFaq === index ? 'rotate-180 text-primary' : ''}`} />
                  </button>
                  <div 
                    className={`px-6 overflow-hidden transition-all duration-300 ease-in-out ${activeFaq === index ? 'max-h-40 pb-6 opacity-100' : 'max-h-0 opacity-0'}`}
                  >
                    <p className="text-gray-600 leading-relaxed pl-8 border-l-2 border-gray-100 ml-2">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              ))}
           </div>
        </div>

      </div>
    </main>
  );
};