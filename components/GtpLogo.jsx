'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import gsap from 'gsap';

export default function GtpLogo({ onHoverStart, onHoverEnd }) {
  const containerRef = useRef(null);

  const handleMouseEnter = () => {
    if (!containerRef.current) return;
    const tl = gsap.timeline();
    const letters = containerRef.current.querySelectorAll('.gtp-letter');
    const burgers = containerRef.current.querySelectorAll('.gtp-burger');
    
    // Fade out letter strokes
    tl.to(letters, { 
      opacity: 0, 
      scaleY: 0, 
      transformOrigin: 'center center', 
      duration: 0.3, 
      ease: 'power2.inOut', 
      stagger: 0.02 
    }, 0);
    // Expand burger lines
    tl.to(burgers, { 
      scaleX: 1, 
      opacity: 1, 
      duration: 0.4, 
      ease: 'power3.inOut', 
      stagger: 0.05 
    }, 0.1);

    if (onHoverStart) onHoverStart();
  };

  const handleMouseLeave = () => {
    if (!containerRef.current) return;
    const tl = gsap.timeline();
    const letters = containerRef.current.querySelectorAll('.gtp-letter');
    const burgers = containerRef.current.querySelectorAll('.gtp-burger');

    // Collapse burger lines
    tl.to(burgers, { 
      scaleX: 0, 
      opacity: 0, 
      duration: 0.3, 
      ease: 'power2.inOut', 
      stagger: 0.02 
    }, 0);
    // Reveal letter strokes
    tl.to(letters, { 
      opacity: 1, 
      scaleY: 1, 
      duration: 0.4, 
      ease: 'back.out(1.5)', 
      stagger: 0.02 
    }, 0.1);

    if (onHoverEnd) onHoverEnd();
  };

  return (
    <div 
      ref={containerRef}
      className="relative z-[1002] h-[14px] w-[32px] cursor-pointer md:h-[18px] md:w-[38px] lg:h-[24px] lg:w-[42px] group transition-opacity duration-500 hover:opacity-100 opacity-90"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 216 97.08" className="w-full h-full overflow-visible pointer-events-none">
        
        {/* Letter G */}
        <rect className="gtp-letter" x="0" y="0" width="60" height="12" fill="black" />
        <rect className="gtp-letter" x="0" y="85.08" width="60" height="12" fill="black" />
        <rect className="gtp-letter" x="0" y="0" width="12" height="97.08" fill="black" />
        <rect className="gtp-letter" x="48" y="42.54" width="12" height="54.54" fill="black" />
        <rect className="gtp-letter" x="24" y="42.54" width="36" height="12" fill="black" />

        {/* Letter T */}
        <rect className="gtp-letter" x="78" y="0" width="60" height="12" fill="black" />
        <rect className="gtp-letter" x="102" y="0" width="12" height="97.08" fill="black" />

        {/* Letter P */}
        <rect className="gtp-letter" x="156" y="0" width="60" height="12" fill="black" />
        <rect className="gtp-letter" x="156" y="42.54" width="60" height="12" fill="black" />
        <rect className="gtp-letter" x="156" y="0" width="12" height="97.08" fill="black" />
        <rect className="gtp-letter" x="204" y="0" width="12" height="54.54" fill="black" />

        {/* Hamburger Lines (Hidden initially) */}
        <rect className="gtp-burger" x="0" y="0" width="216" height="12" fill="black" style={{ transformOrigin: '0% 50%', transform: 'scaleX(0)', opacity: 0 }} />
        <rect className="gtp-burger" x="0" y="42.54" width="216" height="12" fill="black" style={{ transformOrigin: '0% 50%', transform: 'scaleX(0)', opacity: 0 }} />
        <rect className="gtp-burger" x="0" y="85.08" width="216" height="12" fill="black" style={{ transformOrigin: '0% 50%', transform: 'scaleX(0)', opacity: 0 }} />
      </svg>
    </div>
  );
}
