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

  // Check if we should disable smooth scroll
  const isAdminOrCredentials = pathname && (pathname.startsWith('/admin') || pathname.startsWith('/credentials'));
  const getLenis = useCallback(() => lenisRef.current?.lenis || lenisRef.current, []);

  const handlePointerDown = useCallback((e) => {
    if (pointerId.current !== null) return;
    if (e.button !== undefined && e.button !== 0) return;

    pointerId.current = e.pointerId;
    isDragging.current = true;
    startY.current = e.clientY;
    startScrollTop.current = window.scrollY;

    const lenis = getLenis();
    if (lenis && typeof lenis.stop === 'function') {
      lenis.stop();
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

    const lenis = getLenis();
    if (lenis && typeof lenis.start === 'function') {
      lenis.start();
    }
  }, [getLenis]);

  const handlePointerCancel = useCallback((e) => {
    if (e.pointerId !== pointerId.current) return;
    pointerId.current = null;
    isDragging.current = false;
    document.body.style.cursor = '';
    document.body.style.userSelect = '';

    const lenis = getLenis();
    if (lenis && typeof lenis.start === 'function') {
      lenis.start();
    }
  }, [getLenis]);

  useEffect(() => {
    if (isAdminOrCredentials) return undefined;

    let rafId;
    const exposeLenis = () => {
      const lenis = getLenis();
      if (lenis && typeof lenis.start === 'function' && typeof lenis.stop === 'function') {
        window.__lenis = lenis;
        return;
      }
      rafId = requestAnimationFrame(exposeLenis);
    };

    exposeLenis();

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      if (window.__lenis === getLenis()) {
        delete window.__lenis;
      }
    };
  }, [getLenis, isAdminOrCredentials]);

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

  // Tắt Smooth Scroll ở thư mục /admin và /credentials để tránh xung đột
  if (isAdminOrCredentials) {
    return <>{children}</>;
  }

  return (
    <ReactLenis
      root
      ref={lenisRef}
      options={{
        duration: 0.72,
        wheelMultiplier: 2.6,
        touchMultiplier: 2.6,
        smoothWheel: true,
        syncTouch: true,
        syncTouchLerp: 0.075,
      }}
      onPointerDown={handlePointerDown}
    >
      {children}
    </ReactLenis>
  );
}
