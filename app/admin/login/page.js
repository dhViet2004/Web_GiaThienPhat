'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, User, Lock } from 'lucide-react';

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');
    
    // Simulate API Call Auth
    if (username === 'admin' && password === 'admin') {
      // Set simple cookie valid for 1 day
      document.cookie = "admin_token=true; path=/; max-age=86400";
      router.push('/admin');
      router.refresh(); // Refresh root to ensure Layout UI updates (like sidebar links, though not strictly required here)
    } else {
      setError('SAI THÔNG TIN ĐĂNG NHẬP');
    }
  };

  return (
    <div className="min-h-screen flex font-sans bg-white">
      {/* Left Column: Image & Branding */}
      <div className="hidden lg:flex w-1/2 bg-black relative items-center justify-center overflow-hidden">
        <img 
          src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=2075&auto=format&fit=crop" 
          alt="Gia Thinh Phat Architecture" 
          className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-overlay filter grayscale-[50%]"
        />
        <div className="relative z-10 text-white text-center p-12 max-w-lg">
           <h2 className="text-6xl font-black uppercase tracking-tighter mb-6 leading-none select-none">
            GIA THỊNH PHÁT
           </h2>
           <p className="tracking-[0.3em] text-[10px] uppercase text-gray-300 select-none">
            Architecture & Management Panel
           </p>
        </div>
        <div className="absolute inset-0 pointer-events-none border-[20px] border-black/20 mix-blend-overlay"></div>
      </div>

      {/* Right Column: Form */}
      <div className="w-full lg:w-1/2 bg-gray-50 flex items-center justify-center p-8 md:p-16 xl:p-24 relative flex-col">
        
        {/* Back Link */}
        <button 
          onClick={() => router.push('/')}
          className="absolute top-8 left-8 text-[10px] font-bold uppercase tracking-[0.2em] flex items-center gap-2 hover:opacity-50 transition-opacity text-black"
        >
          Trang Chủ
        </button>

        <div className="w-full max-w-sm">
          <div className="mb-16">
            <h1 className="text-4xl font-black uppercase tracking-tighter text-black mb-4">
              ĐĂNG NHẬP <br/> QUẢN TRỊ
            </h1>
            <p className="text-xs text-gray-500 uppercase tracking-widest leading-relaxed">
              Vui lòng nhập thông tin xác thực để truy cập vào Bảng Điều Khiển Hệ Thống.
            </p>
          </div>
          
          <form onSubmit={handleLogin} className="flex flex-col gap-8">
            <div className="group relative">
              <label className="text-[9px] uppercase tracking-[0.2em] text-gray-400 mb-2 block font-bold transition-colors group-focus-within:text-black">
                Tên tài khoản
              </label>
              <div className="relative">
                <div className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-black transition-colors">
                  <User size={18} strokeWidth={2} />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-transparent border-b border-gray-200 focus:border-black transition-all rounded-none outline-none py-3 pl-8 text-lg text-black font-bold uppercase placeholder:text-gray-200"
                  placeholder="YOUR USERNAME"
                  required
                />
              </div>
            </div>

            <div className="group relative">
              <label className="text-[9px] uppercase tracking-[0.2em] text-gray-400 mb-2 block font-bold transition-colors group-focus-within:text-black">
                Mật khẩu
              </label>
              <div className="relative">
                <div className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-black transition-colors">
                  <Lock size={18} strokeWidth={2} />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-transparent border-b border-gray-200 focus:border-black transition-all rounded-none outline-none py-3 pl-8 text-lg text-black font-bold placeholder:text-gray-200 tracking-widest"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="text-red-500 text-[10px] font-bold uppercase tracking-widest mt-2 p-4 bg-red-50/50 border-l-2 border-red-500">
                {error}
              </div>
            )}

            <button 
              type="submit"
              className="mt-8 group relative overflow-hidden bg-black text-white px-8 py-5 uppercase text-[10px] tracking-[0.25em] font-black hover:bg-gray-900 transition-colors w-full flex items-center justify-between shadow-xl shadow-black/10"
            >
              <span className="relative z-10">ĐĂNG NHẬP VÀO HỆ THỐNG</span>
              <ArrowRight size={16} strokeWidth={3} className="relative z-10 group-hover:translate-x-2 transition-transform duration-300" />
            </button>
            <p className="text-center text-[9px] text-gray-400 mt-6 tracking-widest uppercase">
              Chỉ dành cho ban quản trị GTP
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
