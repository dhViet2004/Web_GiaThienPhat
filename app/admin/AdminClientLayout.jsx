'use client';

import { Inter } from 'next/font/google';
import Link from 'next/link';
import LogoutButton from '../../components/LogoutButton';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

const inter = Inter({ subsets: ['latin'], weight: ['300', '400', '700'] });

export default function AdminClientLayout({ children }) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/admin/login';
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { href: '/admin', label: 'BẢNG ĐIỀU KHIỂN' },
    { href: '/admin/projects/new', label: '+ THÊM DỰ ÁN MỚI' },
    { href: '/admin/credentials', label: 'HỒ SƠ NĂNG LỰC' },
    { href: '/admin/settings', label: 'CÀI ĐẶT' },
  ];

  const isActive = (href) => {
    if (href === '/admin') {
      return pathname === '/admin';
    }
    return pathname.startsWith(href);
  };

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  if (isLoginPage) {
    return (
      <div className={`${inter.className} bg-white text-black min-h-screen relative`}>
        {children}
      </div>
    );
  }

  return (
    <div className={`${inter.className} bg-white text-black min-h-screen relative`}>
      {/* Background Grid using CSS */}
      <div className="fixed inset-0 pointer-events-none z-0 grid-background" />

      <div className="relative z-10 flex min-h-screen">
        {/* Mobile Header */}
        <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-black tracking-tighter">GTP ADMIN</h1>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div
            className="lg:hidden fixed inset-0 z-40 bg-black/50"
            onClick={closeMobileMenu}
          />
        )}

        {/* Mobile Sidebar */}
        <aside className={`
          lg:hidden fixed top-0 left-0 h-full w-64 bg-white/95 backdrop-blur-md border-r border-gray-200 z-50
          transform transition-transform duration-300 ease-in-out flex flex-col uppercase text-sm tracking-widest font-bold
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <h1 className="text-xl font-black tracking-tighter">GTP ADMIN</h1>
            <button
              onClick={closeMobileMenu}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Close menu"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <nav className="flex-1 flex flex-col p-4 gap-2 text-xs overflow-y-auto">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeMobileMenu}
                className={`p-4 border transition-colors ${
                  isActive(item.href)
                    ? 'bg-black text-white border-black'
                    : 'hover:bg-gray-50 border-transparent hover:border-gray-200'
                }`}
              >
                {item.label}
              </Link>
            ))}
            <div className="mt-auto">
              <LogoutButton />
            </div>
          </nav>

          <div className="p-6 border-t border-gray-200 text-gray-400 font-light text-xs">
            © {new Date().getFullYear()} GIA THIEN PHAT
          </div>
        </aside>

        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex w-64 border-r border-gray-200 bg-white/80 backdrop-blur-md flex-col uppercase text-sm tracking-widest font-bold shrink-0 h-screen sticky top-0">
          <div className="p-8 border-b border-gray-200">
            <h1 className="text-2xl font-black tracking-tighter">GTP ADMIN</h1>
          </div>

          <nav className="flex-1 flex flex-col p-4 gap-2 text-xs overflow-y-auto">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`p-4 border transition-colors ${
                  isActive(item.href)
                    ? 'bg-black text-white border-black'
                    : 'hover:bg-gray-50 border-transparent hover:border-gray-200'
                }`}
              >
                {item.label}
              </Link>
            ))}
            <div className="mt-auto">
              <LogoutButton />
            </div>
          </nav>

          <div className="p-8 border-t border-gray-200 text-gray-400 font-light text-xs">
            © {new Date().getFullYear()} GIA THIEN PHAT
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto w-full bg-white/50 backdrop-blur-sm pt-14 lg:pt-0">
          {children}
        </main>
      </div>
    </div>
  );
}
