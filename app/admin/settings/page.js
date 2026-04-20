'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Save, User, Lock } from 'lucide-react';

export default function AdminSettings() {
  const [form, setForm] = useState({ email: '', password: '', name: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const router = useRouter();

  useEffect(() => {
    loadAdmin();
  }, []);

  const loadAdmin = async () => {
    try {
      const res = await fetch('/api/admin/settings');
      const data = await res.json();
      if (data.admin) {
        setForm({
          email: data.admin.email || '',
          password: data.admin.password || '',
          name: data.admin.name || ''
        });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Không thể tải thông tin' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage({ type: 'error', text: data.error || 'Lỗi khi lưu' });
        return;
      }

      setMessage({ type: 'success', text: 'Lưu thành công!' });
    } catch (err) {
      setMessage({ type: 'error', text: 'Lỗi kết nối server' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <p className="text-gray-500 uppercase tracking-widest text-sm">Đang tải...</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-12">
        <h1 className="text-4xl font-black uppercase tracking-tighter text-black mb-4">
          CÀI ĐẶT TÀI KHOẢN
        </h1>
        <p className="text-xs text-gray-500 uppercase tracking-widest">
          Cập nhật thông tin đăng nhập quản trị
        </p>
      </div>

      {message.text && (
        <div className={`mb-8 p-4 text-xs font-bold uppercase tracking-widest ${
          message.type === 'success' 
            ? 'bg-green-50 text-green-600 border-l-2 border-green-500' 
            : 'bg-red-50 text-red-600 border-l-2 border-red-500'
        }`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-8">
        <div className="group relative">
          <label className="text-[9px] uppercase tracking-[0.2em] text-gray-400 mb-2 block font-bold">
            Tên hiển thị
          </label>
          <div className="relative">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-black transition-colors">
              <User size={18} strokeWidth={2} />
            </div>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full bg-transparent border-b border-gray-200 focus:border-black transition-all rounded-none outline-none py-3 pl-8 text-lg text-black font-bold placeholder:text-gray-200"
              placeholder="TÊN CỦA BẠN"
            />
          </div>
        </div>

        <div className="group relative">
          <label className="text-[9px] uppercase tracking-[0.2em] text-gray-400 mb-2 block font-bold">
            Email đăng nhập
          </label>
          <div className="relative">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-black transition-colors">
              <User size={18} strokeWidth={2} />
            </div>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full bg-transparent border-b border-gray-200 focus:border-black transition-all rounded-none outline-none py-3 pl-8 text-lg text-black font-bold placeholder:text-gray-200"
              placeholder="EMAIL@EXAMPLE.COM"
              required
            />
          </div>
        </div>

        <div className="group relative">
          <label className="text-[9px] uppercase tracking-[0.2em] text-gray-400 mb-2 block font-bold">
            Mật khẩu
          </label>
          <div className="relative">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-black transition-colors">
              <Lock size={18} strokeWidth={2} />
            </div>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full bg-transparent border-b border-gray-200 focus:border-black transition-all rounded-none outline-none py-3 pl-8 text-lg text-black font-bold placeholder:text-gray-200 tracking-widest"
              placeholder="••••••••"
              required
            />
          </div>
        </div>

        <button 
          type="submit"
          disabled={saving}
          className="mt-8 group relative overflow-hidden bg-black text-white px-8 py-5 uppercase text-[10px] tracking-[0.25em] font-black hover:bg-gray-900 transition-colors w-full flex items-center justify-between shadow-xl shadow-black/10 disabled:opacity-50"
        >
          <span className="relative z-10">
            {saving ? 'ĐANG LƯU...' : 'LƯU THAY ĐỔI'}
          </span>
          <Save size={16} strokeWidth={3} className="relative z-10 group-hover:translate-x-2 transition-transform duration-300" />
        </button>
      </form>
    </div>
  );
}
