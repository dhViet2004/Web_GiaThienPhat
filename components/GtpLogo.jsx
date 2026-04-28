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
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 216 98" className="w-full h-full overflow-visible pointer-events-none">
        
        {/* Letter G */}
        <line className="gtp-letter" x1="0" y1="8" x2="60" y2="8" stroke="black" strokeWidth="16" />
        <line className="gtp-letter" x1="0" y1="90" x2="60" y2="90" stroke="black" strokeWidth="16" />
        <line className="gtp-letter" x1="8" y1="8" x2="8" y2="90" stroke="black" strokeWidth="16" />
        <line className="gtp-letter" x1="52" y1="49" x2="52" y2="90" stroke="black" strokeWidth="16" />
        <line className="gtp-letter" x1="26" y1="49" x2="60" y2="49" stroke="black" strokeWidth="16" />

        {/* Letter T */}
        <line className="gtp-letter" x1="78" y1="8" x2="138" y2="8" stroke="black" strokeWidth="16" />
        <line className="gtp-letter" x1="108" y1="8" x2="108" y2="90" stroke="black" strokeWidth="16" />

        {/* Letter P */}
        <line className="gtp-letter" x1="156" y1="8" x2="216" y2="8" stroke="black" strokeWidth="16" />
        <line className="gtp-letter" x1="156" y1="49" x2="216" y2="49" stroke="black" strokeWidth="16" />
        <line className="gtp-letter" x1="164" y1="8" x2="164" y2="90" stroke="black" strokeWidth="16" />
        <line className="gtp-letter" x1="208" y1="8" x2="208" y2="49" stroke="black" strokeWidth="16" />

        {/* Hamburger Lines (Hidden initially) */}
        <line className="gtp-burger" x1="0" y1="8" x2="216" y2="8" stroke="black" strokeWidth="16" style={{ transformOrigin: '0% 50%', transform: 'scaleX(0)', opacity: 0 }} />
        <line className="gtp-burger" x1="0" y1="49" x2="216" y2="49" stroke="black" strokeWidth="16" style={{ transformOrigin: '0% 50%', transform: 'scaleX(0)', opacity: 0 }} />
        <line className="gtp-burger" x1="0" y1="90" x2="216" y2="90" stroke="black" strokeWidth="16" style={{ transformOrigin: '0% 50%', transform: 'scaleX(0)', opacity: 0 }} />
      </svg>
    </div>
  );
}
