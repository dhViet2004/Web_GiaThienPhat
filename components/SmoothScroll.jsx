'use client';

import { ReactLenis } from 'lenis/react';
import { usePathname } from 'next/navigation';
import { useRef, useEffect, useCallback } from 'react';

export function SmoothScroll({ children }) {
  const pathname = usePathname();
  const lenisRef = useRef(null);
  const isDragging = useRef(false);
  const startY = useRef(0);
  const startScrollTop = useRef(0);
  const pointerId = useRef(null);

  // Tắt hoàn toàn Lenis Smooth Scroll ở thư mục /admin để tránh 
  // xung đột CSS dẫn tới hiện tượng lưới nền chớp giật liên tục.
  if (pathname && pathname.startsWith('/admin')) {
    return <>{children}</>;
  }

  const handlePointerDown = useCallback((e) => {
    if (pointerId.current !== null) return;
    if (e.button !== undefined && e.button !== 0) return;

    pointerId.current = e.pointerId;
    isDragging.current = true;
    startY.current = e.clientY;
    startScrollTop.current = window.scrollY;

    if (lenisRef.current) {
      lenisRef.current.stop();
    }
    document.body.style.cursor = 'grabbing';
    document.body.style.userSelect = 'none';
  }, []);

  const handlePointerMove = useCallback((e) => {
    if (!isDragging.current || e.pointerId !== pointerId.current) return;
    const deltaY = startY.current - e.clientY;
    window.scrollTo(0, startScrollTop.current + deltaY);
  }, []);

  const handlePointerUp = useCallback((e) => {
    if (e.pointerId !== pointerId.current) return;
    pointerId.current = null;
    isDragging.current = false;
    document.body.style.cursor = '';
    document.body.style.userSelect = '';

    if (lenisRef.current) {
      lenisRef.current.start();
    }
  }, []);

  const handlePointerCancel = useCallback((e) => {
    if (e.pointerId !== pointerId.current) return;
    pointerId.current = null;
    isDragging.current = false;
    document.body.style.cursor = '';
    document.body.style.userSelect = '';

    if (lenisRef.current) {
      lenisRef.current.start();
    }
  }, []);

  useEffect(() => {
    document.addEventListener('pointermove', handlePointerMove);
    document.addEventListener('pointerup', handlePointerUp);
    document.addEventListener('pointercancel', handlePointerCancel);
    return () => {
      document.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('pointerup', handlePointerUp);
      document.removeEventListener('pointercancel', handlePointerCancel);
    };
  }, [handlePointerMove, handlePointerUp, handlePointerCancel]);

  return (
    <ReactLenis
      root
      ref={lenisRef}
      options={{ lerp: 0.1 }}
      onPointerDown={handlePointerDown}
    >
      {children}
    </ReactLenis>
  );
}