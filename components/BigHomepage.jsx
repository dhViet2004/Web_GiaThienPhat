'use client';

import { Search, Building2, Trees, Sofa } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import GtpLogo from './GtpLogo';
import ProjectsFeed from './ProjectsFeed';
import SidebarMenu from './SidebarMenu';

// Sample Data Structure
const projects = [];

export default function BigHomepage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [navVisible, setNavVisible] = useState(false);

  useEffect(() => {
    const handleIntroComplete = () => setNavVisible(true);
    window.addEventListener("introAnimationComplete", handleIntroComplete);
    // Fallback if intro isn't run or is already complete
    const fallbackTimer = setTimeout(() => setNavVisible(true), 3500); 

    return () => {
      window.removeEventListener("introAnimationComplete", handleIntroComplete);
      clearTimeout(fallbackTimer);
    };
  }, []);

  return (
    <div className="min-h-screen bg-white text-black font-sans selection:bg-black selection:text-white pb-32">
      {/* HEADER */}
      <header className={`fixed top-0 left-0 w-full z-[900] flex justify-between items-start px-[35px] pt-[25px] pb-4 bg-transparent transition-opacity duration-[1500ms] ${navVisible ? 'opacity-100' : 'opacity-0'}`}>
        {/* Logo acting as Hamburger Menu trigger on Mobile, Home Link on Desktop */}
        <div className="w-1/4 flex items-start">
          <div className="md:hidden">
            <button 
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-0 bg-transparent border-none outline-none relative z-[1001]"
              aria-label="Toggle Sidebar Menu"
            >
              <GtpLogo />
            </button>
          </div>
          <div className="hidden md:block">
            <Link href="/" className="hover:opacity-70 transition-opacity">
              <GtpLogo />
            </Link>
          </div>
        </div>

        {/* Navigation (Desktop Only) */}
        <nav className="hidden md:flex w-2/4 justify-center gap-10 lg:gap-14 mt-1">
          {['Landscape', 'Engineering', 'Architecture', 'Products'].map((item) => (
            <Link 
              key={item} 
              href={`#${item.toLowerCase()}`} 
              className="relative group text-[#888888] text-[11px] font-light tracking-[0.2em] uppercase hover:text-black transition-colors duration-300"
            >
              {item}
              <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-black transition-all duration-300 group-hover:w-full" />
            </Link>
          ))}
        </nav>

        {/* Search */}
        <div className="w-1/4 flex justify-end mt-1">
          <button className="flex items-center hover:opacity-50 transition-opacity">
            <Search strokeWidth={1} size={22} className="text-black" />
          </button>
        </div>
      </header>

      <SidebarMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />

      <ProjectsFeed />
    </div>
  );
}
