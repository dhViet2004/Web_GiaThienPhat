'use client';

import { ReactLenis } from 'lenis/react';

export function SmoothScroll({ children }) {
  // Sử dụng thông số lerp cơ bản để cuộn mượt nhưng bám sát tốc độ lăn chuột thực tế
  return (
    <ReactLenis root options={{ lerp: 0.1 }}>
      {children}
    </ReactLenis>
  );
}
