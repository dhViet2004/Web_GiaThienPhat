import { NextResponse } from 'next/server';

export function middleware(request) {
  const { pathname } = request.nextUrl;
  
  // Chỉ kiểm tra trên các route thuộc /admin
  const adminToken = request.cookies.get('admin_token');
  
  // Nếu đang truy cập /admin/login MÀ ĐÃ CÓ token -> Chuyển hướng vào trong
  if (pathname === '/admin/login') {
    if (adminToken) {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
    // Cho phép hiển thị trang login
    return NextResponse.next();
  }
  
  // Nếu đang truy cập các trang /admin/* khác (không phải login) MÀ KHÔNG CÓ token -> Đẩy ra login
  if (!adminToken) {
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  // Matcher chỉ áp dụng middleware này cho /admin và các route con của nó
  matcher: ['/admin/:path*'],
};
