import React, { useState } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowRight, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

const { Link, useNavigate } = ReactRouterDOM;

// Google Icon SVG Component for crisp rendering
const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
    <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
      <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z" />
      <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z" />
      <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.769 -21.864 51.959 -21.864 51.129 C -21.864 50.299 -21.734 49.489 -21.484 48.729 L -21.484 45.639 L -25.464 45.639 C -26.284 47.269 -26.754 49.129 -26.754 51.129 C -26.754 53.129 -26.284 54.989 -25.464 56.619 L -21.484 53.529 Z" />
      <path fill="#EA4335" d="M -14.754 43.749 C -12.984 43.749 -11.404 44.369 -10.154 45.579 L -6.904 42.329 C -8.964 40.409 -11.664 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.749 -14.754 43.749 Z" />
    </g>
  </svg>
);

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    try {
      setError(null);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        }
      });
      if (error) throw error;
    } catch (err: any) {
      setError(err.message || 'Lỗi kết nối với Google. Vui lòng thử lại sau.');
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        
        if (email.includes('admin')) {
           navigate('/admin/dashboard');
        } else {
           navigate('/');
        }
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        alert('Đăng ký thành công! Vui lòng kiểm tra email để xác nhận.');
        setMode('login');
      }
    } catch (err: any) {
      setError(err.message || 'Đã có lỗi xảy ra. Vui lòng kiểm tra lại.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex">
      {/* Left Side - Hero/Visual */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-black overflow-hidden">
        <img 
          src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop" 
          alt="Login Background" 
          className="absolute inset-0 w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
        
        <div className="relative z-10 p-16 flex flex-col justify-between h-full text-white">
          <Link to="/" className="flex items-center gap-2 group w-fit">
            <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/10 group-hover:bg-primary group-hover:border-primary transition-all">
               <ArrowLeft size={20} />
            </div>
            <span className="font-medium text-sm text-gray-300 group-hover:text-white transition-colors">Quay lại trang chủ</span>
          </Link>

          <div>
             <h1 className="text-5xl font-extrabold mb-6 leading-tight tracking-tight">
               Khai phá tiềm năng <br/>
               <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">Kỹ thuật số.</span>
             </h1>
             <p className="text-gray-400 text-lg leading-relaxed max-w-md mb-8">
               Truy cập hàng ngàn tài khoản bản quyền, phần mềm và công cụ AI hàng đầu thế giới với chi phí tối ưu nhất.
             </p>
             
             <div className="space-y-4">
                {[
                  "Bảo hành trọn đời sản phẩm",
                  "Giao hàng tự động trong 30 giây",
                  "Hỗ trợ kỹ thuật 24/7"
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <CheckCircle className="text-green-500" size={20} />
                    <span className="font-medium text-gray-200">{item}</span>
                  </div>
                ))}
             </div>
          </div>

          <div className="text-sm text-gray-500">
            © 2024 AIDAYNE.com. All rights reserved.
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 lg:p-24 bg-white relative">
        <div className="w-full max-w-md space-y-8">
          
          <div className="text-center lg:text-left">
            <Link to="/" className="lg:hidden inline-flex items-center gap-2 text-sm text-gray-500 mb-8 hover:text-primary">
               <ArrowLeft size={16} /> Quay lại
            </Link>
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              {mode === 'login' ? 'Chào mừng trở lại! 👋' : 'Tạo tài khoản mới 🚀'}
            </h2>
            <p className="mt-2 text-gray-500">
              {mode === 'login' ? 'Đăng nhập để tiếp tục trải nghiệm.' : 'Đăng ký nhanh chóng, dễ dàng.'}
            </p>
          </div>

          {/* Admin Hint for Demo */}
          <div className="p-3 bg-blue-50 text-blue-700 rounded-xl text-sm border border-blue-100 flex items-start gap-2">
             <AlertCircle size={16} className="mt-0.5 shrink-0" />
             <div>
               <strong>Gợi ý Demo:</strong> Để truy cập trang quản trị (Dashboard), vui lòng đăng nhập bằng email chứa từ "admin" (ví dụ: <em>admin@gmail.com</em>).
             </div>
          </div>

          {error && (
             <div className="p-4 bg-red-50 text-red-600 rounded-xl flex items-center gap-2 text-sm font-medium animate-pulse">
               <AlertCircle size={18} /> {error}
             </div>
           )}

          {/* Google Login Button */}
          <div className="space-y-4">
            <button 
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center gap-3 py-3.5 px-4 bg-white border border-gray-200 rounded-xl text-gray-700 font-bold hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm hover:shadow-md"
            >
              <GoogleIcon />
              <span>Tiếp tục với Google</span>
            </button>

            <div className="relative flex items-center justify-center">
              <div className="border-t border-gray-200 w-full absolute"></div>
              <span className="bg-white px-4 text-xs font-medium text-gray-400 uppercase relative z-10">Hoặc tiếp tục với Email</span>
            </div>
          </div>

          <form onSubmit={handleAuth} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Email</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-primary transition-colors" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-bold text-gray-700">Mật khẩu</label>
                {mode === 'login' && <Link to="/contact" className="text-sm font-bold text-primary hover:text-primary-hover">Quên mật khẩu?</Link>}
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-primary transition-colors" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={6}
                  className="block w-full pl-11 pr-12 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center"
                >
                  {showPassword ? 
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" /> : 
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                  }
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center gap-2 py-4 px-4 border border-transparent rounded-xl shadow-lg shadow-red-500/20 text-sm font-bold text-white bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-70 disabled:cursor-not-allowed transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  {mode === 'login' ? 'Đăng nhập' : 'Đăng ký'} <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-sm font-medium text-gray-500">
            {mode === 'login' ? 'Chưa có tài khoản? ' : 'Đã có tài khoản? '}
            <button 
              onClick={() => {
                setMode(mode === 'login' ? 'signup' : 'login');
                setError(null);
              }} 
              className="text-primary font-bold hover:underline"
            >
              {mode === 'login' ? 'Đăng ký ngay' : 'Đăng nhập ngay'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};