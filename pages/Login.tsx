
import React, { useState, useEffect } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowRight, ArrowLeft, CheckCircle, AlertCircle, ShieldCheck } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext'; // Import useAuth

const { Link, useNavigate } = ReactRouterDOM;

// Standard Google Logo SVG
const GoogleIcon = () => (
  <svg viewBox="0 0 48 48" width="22" height="22" xmlns="http://www.w3.org/2000/svg">
    <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
    <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
    <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
    <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
  </svg>
);

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  
  const navigate = useNavigate();
  const { user } = useAuth(); // Hook auth để kiểm tra trạng thái đăng nhập

  // --- QUAN TRỌNG: Tự động chuyển hướng nếu đã đăng nhập ---
  useEffect(() => {
    if (user) {
      if (user.email?.includes('admin')) {
         navigate('/admin/dashboard');
      } else {
         navigate('/');
      }
    }
  }, [user, navigate]);
  // --------------------------------------------------------

  const handleGoogleLogin = async () => {
    try {
      setError(null);
      setIsGoogleLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin, // Đảm bảo URL này khớp với Authorized Redirect URIs trên Google Console
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        }
      });
      if (error) throw error;
    } catch (err: any) {
      setError(err.message || 'Không thể kết nối với Google. Vui lòng thử lại.');
      setIsGoogleLoading(false);
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
        // Việc chuyển hướng sẽ do useEffect ở trên xử lý khi 'user' thay đổi
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
      setError(err.message || 'Đã có lỗi xảy ra. Vui lòng kiểm tra lại thông tin.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex">
      {/* Left Side - Visuals (Desktop) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-[#050507] overflow-hidden items-center justify-center">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
            <img 
              src="https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=2574&auto=format&fit=crop" 
              alt="Background" 
              className="w-full h-full object-cover opacity-40"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#050507] via-[#050507]/60 to-transparent"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-lg px-12">
           <Link to="/" className="inline-flex items-center gap-2 mb-8 group">
              <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/10 group-hover:bg-white group-hover:text-black transition-all duration-300 text-white">
                 <ArrowLeft size={18} />
              </div>
              <span className="font-semibold text-white/80 group-hover:text-white transition-colors">Về trang chủ</span>
           </Link>

           <h1 className="text-5xl font-extrabold text-white mb-6 leading-tight tracking-tight">
             Thế giới công nghệ <br/>
             <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">trong tầm tay bạn.</span>
           </h1>
           
           <p className="text-lg text-gray-400 mb-10 leading-relaxed">
             Truy cập kho phần mềm bản quyền, tài khoản Premium và công cụ AI hàng đầu với mức giá tối ưu nhất thị trường.
           </p>

           <div className="space-y-5">
              <div className="flex items-center gap-4 bg-white/5 backdrop-blur-sm p-4 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors">
                 <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 shrink-0">
                    <ShieldCheck size={20} />
                 </div>
                 <div>
                    <h4 className="text-white font-bold text-sm">Bảo hành trọn đời</h4>
                    <p className="text-gray-400 text-xs mt-0.5">Cam kết 1 đổi 1 trong suốt quá trình sử dụng.</p>
                 </div>
              </div>
              <div className="flex items-center gap-4 bg-white/5 backdrop-blur-sm p-4 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors">
                 <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
                    <CheckCircle size={20} />
                 </div>
                 <div>
                    <h4 className="text-white font-bold text-sm">Giao hàng tự động 24/7</h4>
                    <p className="text-gray-400 text-xs mt-0.5">Nhận tài khoản ngay lập tức qua Email.</p>
                 </div>
              </div>
           </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center p-6 sm:p-12 lg:p-24 bg-white relative">
        
        {/* Mobile Back Button */}
        <Link to="/" className="lg:hidden absolute top-6 left-6 p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-500">
           <ArrowLeft size={24} />
        </Link>

        <div className="w-full max-w-md mx-auto space-y-8 animate-fade-in-up">
          <div className="text-center lg:text-left">
            <h2 className="text-3xl lg:text-4xl font-extrabold text-gray-900 tracking-tight mb-3">
              {mode === 'login' ? 'Đăng nhập' : 'Tạo tài khoản'}
            </h2>
            <p className="text-gray-500 text-sm lg:text-base">
              {mode === 'login' ? 'Chào mừng bạn quay trở lại với AIDAYNE!' : 'Điền thông tin bên dưới để bắt đầu trải nghiệm.'}
            </p>
          </div>

          {/* Social Login - Prominent */}
          <button 
            onClick={handleGoogleLogin}
            disabled={isGoogleLoading}
            className="w-full flex items-center justify-center gap-3 py-3.5 px-4 bg-white border border-gray-200 rounded-2xl text-gray-700 font-bold hover:bg-gray-50 hover:border-gray-300 hover:shadow-md transition-all duration-300 group disabled:opacity-70 disabled:cursor-not-allowed h-14"
          >
            {isGoogleLoading ? (
               <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
            ) : (
               <>
                 <GoogleIcon />
                 <span className="group-hover:text-black transition-colors">Tiếp tục với Google</span>
               </>
            )}
          </button>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-gray-200 w-full absolute"></div>
            <span className="bg-white px-4 text-xs font-bold text-gray-400 uppercase tracking-wider relative z-10">
              Hoặc bằng Email
            </span>
          </div>

          {error && (
             <div className="p-4 bg-red-50 text-red-600 rounded-2xl flex items-start gap-3 text-sm font-medium border border-red-100 animate-pulse">
               <AlertCircle size={18} className="mt-0.5 shrink-0" /> 
               <span>{error}</span>
             </div>
           )}

          <form onSubmit={handleAuth} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Địa chỉ Email</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-primary transition-colors" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-11 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-medium text-base"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2 ml-1">
                <label className="block text-sm font-bold text-gray-700">Mật khẩu</label>
                {mode === 'login' && <Link to="/contact" className="text-xs font-bold text-primary hover:text-primary-hover hover:underline">Quên mật khẩu?</Link>}
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
                  className="block w-full pl-11 pr-12 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-medium text-base"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center cursor-pointer"
                >
                  {showPassword ? 
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-primary transition-colors" /> : 
                    <Eye className="h-5 w-5 text-gray-400 hover:text-primary transition-colors" />
                  }
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center gap-2 py-4 px-4 bg-gray-900 text-white font-bold rounded-2xl text-base shadow-xl shadow-gray-900/20 hover:bg-black hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed h-14"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  {mode === 'login' ? 'Đăng nhập' : 'Tạo tài khoản'} <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 font-medium">
            {mode === 'login' ? 'Chưa có tài khoản? ' : 'Đã có tài khoản? '}
            <button 
              onClick={() => {
                setMode(mode === 'login' ? 'signup' : 'login');
                setError(null);
                setEmail('');
                setPassword('');
              }} 
              className="text-primary font-bold hover:underline transition-all"
            >
              {mode === 'login' ? 'Đăng ký ngay' : 'Đăng nhập'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
