import { Inter } from 'next/font/google';
import '../globals.css';
import Link from 'next/link';

const inter = Inter({ subsets: ['latin'], weight: ['300', '400', '700'] });

export const metadata = {
  title: 'GTP ADMIN | PROJECT MANAGEMENT',
  description: 'Admin Portal for Gia Thinh Phat Architecture',
};

export default function AdminLayout({ children }) {
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
                DASHBOARD
              </Link>
              <Link 
                href="/admin/projects/new" 
                className="p-4 hover:bg-gray-50 border border-transparent hover:border-gray-200 transition-colors"
              >
                + NEW PROJECT
              </Link>
              <Link 
                href="/admin/categories" 
                className="p-4 hover:bg-gray-50 border border-transparent hover:border-gray-200 transition-colors"
              >
                CATEGORIES
              </Link>
              <Link 
                href="/admin/settings" 
                className="p-4 hover:bg-gray-50 border border-transparent hover:border-gray-200 transition-colors"
              >
                SETTINGS
              </Link>
            </nav>

            <div className="auto p-8 border-t border-gray-200 text-gray-400 font-light text-xs">
              © {new Date().getFullYear()} GIA THINH PHAT
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
