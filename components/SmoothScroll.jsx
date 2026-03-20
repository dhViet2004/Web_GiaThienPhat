'use client';

import { ReactLenis } from 'lenis/react';
import { usePathname } from 'next/navigation';

export function SmoothScroll({ children }) {
  const pathname = usePathname();

  // Tắt hoàn toàn Lenis Smooth Scroll ở thư mục /admin để tránh 
  // xung đột CSS dẫn tới hiện tượng lưới nền chớp giật liên tục.
  if (pathname && pathname.startsWith('/admin')) {
    return <>{children}</>;
  }

  // Sử dụng thông số lerp cơ bản để cuộn mượt nhưng bám sát tốc độ lăn chuột thực tế
  return (
    <ReactLenis root options={{ lerp: 0.1 }}>
      {children}
    </ReactLenis>
  );
}
