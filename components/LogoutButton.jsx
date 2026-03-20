'use client';

import { useRouter } from 'next/navigation';

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = () => {
    // Delete the cookie by setting it to an expired date
    document.cookie = "admin_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    router.push('/admin/login');
    router.refresh();
  };

  return (
    <button 
      onClick={handleLogout}
      className="p-4 text-left hover:bg-red-50 hover:text-red-700 font-bold border border-transparent hover:border-red-200 transition-colors w-full uppercase"
    >
      ĐĂNG XUẤT
    </button>
  );
}
