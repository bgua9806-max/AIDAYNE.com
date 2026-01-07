import React from 'react';
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from 'lucide-react';
import * as ReactRouterDOM from 'react-router-dom';

const { Link } = ReactRouterDOM;

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#111111] text-gray-400 pt-20 pb-10 text-sm border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          
          {/* Brand */}
          <div className="space-y-6">
             <Link to="/" className="flex items-center gap-3">
                <span className="font-extrabold text-3xl text-white tracking-tighter">
                  AIDAYNE<span className="text-primary">.com</span>
                </span>
              </Link>
            <p className="text-gray-500 leading-relaxed max-w-xs">
              Nền tảng cung cấp bản quyền phần mềm & giải trí số 1 Việt Nam. Uy tín - Tốc độ - Bảo mật.
            </p>
            <div className="flex gap-4">
              <a href="https://facebook.com" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-primary transition-colors text-white hover:-translate-y-1 duration-300"><Facebook size={18} /></a>
              <a href="https://instagram.com" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-primary transition-colors text-white hover:-translate-y-1 duration-300"><Instagram size={18} /></a>
              <a href="https://twitter.com" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-primary transition-colors text-white hover:-translate-y-1 duration-300"><Twitter size={18} /></a>
            </div>
          </div>

          {/* Column 2 */}
          <div>
            <h3 className="text-white font-bold mb-6 text-sm uppercase tracking-widest">Về chúng tôi</h3>
            <ul className="space-y-4">
              <li><Link to="/contact" className="hover:text-white hover:translate-x-1 inline-block transition-all">Giới thiệu</Link></li>
              <li><Link to="/blog" className="hover:text-white hover:translate-x-1 inline-block transition-all">Điều khoản sử dụng</Link></li>
              <li><Link to="/blog" className="hover:text-white hover:translate-x-1 inline-block transition-all">Chính sách bảo mật</Link></li>
              <li><Link to="/contact" className="hover:text-white hover:translate-x-1 inline-block transition-all">Tuyển dụng</Link></li>
            </ul>
          </div>

          {/* Column 3 */}
          <div>
            <h3 className="text-white font-bold mb-6 text-sm uppercase tracking-widest">Hỗ trợ khách hàng</h3>
            <ul className="space-y-4">
              <li><Link to="/contact" className="hover:text-white hover:translate-x-1 inline-block transition-all">Trung tâm trợ giúp</Link></li>
              <li><Link to="/blog" className="hover:text-white hover:translate-x-1 inline-block transition-all">Hướng dẫn mua hàng</Link></li>
              <li><Link to="/contact" className="hover:text-white hover:translate-x-1 inline-block transition-all">Chính sách bảo hành</Link></li>
              <li><Link to="/order-lookup" className="hover:text-white hover:translate-x-1 inline-block transition-all">Kiểm tra đơn hàng</Link></li>
            </ul>
          </div>

          {/* Column 4 */}
          <div>
            <h3 className="text-white font-bold mb-6 text-sm uppercase tracking-widest">Liên hệ</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-4 group cursor-default">
                <MapPin size={20} className="text-gray-600 group-hover:text-primary transition-colors mt-0.5" />
                <span className="group-hover:text-gray-300 transition-colors">Tầng 3, Tòa nhà TechHub, Quận 1, TP. Hồ Chí Minh</span>
              </li>
              <li className="flex items-center gap-4 group">
                <Phone size={20} className="text-gray-600 group-hover:text-primary transition-colors" />
                <a href="tel:0374770023" className="group-hover:text-gray-300 transition-colors">0374770023</a>
              </li>
              <li className="flex items-center gap-4 group">
                <Mail size={20} className="text-gray-600 group-hover:text-primary transition-colors" />
                <a href="mailto:support@aidayne.com" className="group-hover:text-gray-300 transition-colors">support@aidayne.com</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-xs text-gray-600">© 2024 AIDAYNE.com. All rights reserved.</p>
          <div className="flex gap-3 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
             {/* Payment Icons Placeholder - Visual only */}
             <div className="h-8 w-12 bg-white/10 rounded flex items-center justify-center text-[8px] text-gray-500">VISA</div>
             <div className="h-8 w-12 bg-white/10 rounded flex items-center justify-center text-[8px] text-gray-500">MOMO</div>
             <div className="h-8 w-12 bg-white/10 rounded flex items-center justify-center text-[8px] text-gray-500">ZALO</div>
          </div>
        </div>
      </div>
    </footer>
  );
};