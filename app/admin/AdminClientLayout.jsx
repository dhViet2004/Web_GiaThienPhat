'use client';

import { Inter } from 'next/font/google';
import Link from 'next/link';
import LogoutButton from '../../components/LogoutButton';
import { usePathname } from 'next/navigation';

const inter = Inter({ subsets: ['latin'], weight: ['300', '400', '700'] });

export default function AdminClientLayout({ children }) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/admin/login';

  // If it's the login page, render without the sidebar and grid background
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
        {/* Sidebar */}
        <aside className="w-64 border-r border-gray-200 bg-white/80 backdrop-blur-md flex flex-col uppercase text-sm tracking-widest font-bold">
          <div className="p-8 border-b border-gray-200">
            <h1 className="text-2xl font-black tracking-tighter">GTP ADMIN</h1>
          </div>
          
          <nav className="flex-1 flex flex-col p-4 gap-2 text-xs">
            <Link
              href="/admin" 
              className="p-4 hover:bg-gray-50 border border-transparent hover:border-gray-200 transition-colors"
            >
              BẢNG ĐIỀU KHIỂN
            </Link>
            <Link 
              href="/admin/projects/new" 
              className="p-4 hover:bg-gray-50 border border-transparent hover:border-gray-200 transition-colors"
            >
              + THÊM DỰ ÁN MỚI
            </Link>
            <Link 
              href="/admin/categories" 
              className="p-4 hover:bg-gray-50 border border-transparent hover:border-gray-200 transition-colors"
            >
              DANH MỤC
            </Link>
            <Link 
              href="/admin/settings" 
              className="p-4 hover:bg-gray-50 border border-transparent hover:border-gray-200 transition-colors"
            >
              CÀI ĐẶT
            </Link>
            <div className="mt-auto">
              <LogoutButton />
            </div>
          </nav>

          <div className="auto p-8 border-t border-gray-200 text-gray-400 font-light text-xs">
            © {new Date().getFullYear()} GIA THIEN PHAT
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto w-full bg-white/50 backdrop-blur-sm">
          {children}
        </main>
      </div>
    </div>
  );
}
