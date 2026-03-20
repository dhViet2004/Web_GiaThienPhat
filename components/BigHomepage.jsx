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
  const [searchFocused, setSearchFocused] = useState(false);
  const [hoveredCategory, setHoveredCategory] = useState(null);

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

  const navigation = [
    { title: 'Landscape', sub: ['Public Space', 'Parks', 'Planning'] },
    { title: 'Engineering', sub: ['Structural', 'BIM', 'Green Tech'] },
    { title: 'Architecture', sub: ['Cultural', 'Residential', 'Office', 'Hospitality'] },
    { title: 'Products', sub: ['Furniture', 'Lighting', 'Installation'] },
  ];

  return (
    <div className="min-h-screen bg-white text-black font-sans selection:bg-black selection:text-white pb-32">
      {/* HEADER */}
      <header className={`fixed top-0 left-0 w-full z-[900] bg-white transition-opacity duration-[1500ms] ${navVisible ? 'opacity-100' : 'opacity-0'}`}>
        <div className="relative flex justify-between items-start px-[20px] lg:px-[35px] pt-[22px] lg:pt-[24px] pb-4">
          
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
          <nav className="hidden md:flex flex-row justify-center lg:w-[650px] xl:w-[788px] mx-auto gap-0 mt-1">
            {navigation.map((cat) => (
              <div 
                key={cat.title}
                className="group relative px-5 py-1"
                onMouseEnter={() => setHoveredCategory(cat.title)}
                onMouseLeave={() => setHoveredCategory(null)}
              >
                <Link 
                  href={`#${cat.title.toLowerCase()}`} 
                  className={`text-[11px] lg:text-[14.5px] font-medium tracking-widest uppercase transition-colors duration-200 ${hoveredCategory === cat.title ? 'text-black' : 'text-[#6b6b6b]'}`}
                >
                  {cat.title}
                </Link>

                {/* Sub-menu Reveal */}
                <div className={`hidden group-hover:flex lg:absolute lg:top-[44px] left-0 right-0 z-30 bg-white flex-row justify-center pb-2 pointer-events-auto w-screen lg:w-max lg:left-1/2 lg:-translate-x-1/2`}>
                   {cat.sub.map((subItem) => (
                     <Link 
                       key={subItem}
                       href={`#${subItem.toLowerCase().replace(' ', '-')}`}
                       className="text-[10px] lg:text-[12px] text-[#6b6b6b] hover:text-black uppercase tracking-widest px-4 py-1 transition-colors whitespace-nowrap"
                     >
                       {subItem}
                     </Link>
                   ))}
                </div>
              </div>
            ))}
          </nav>

          {/* Search Bar (BIG Style) */}
          <div className="absolute top-[22px] lg:top-[24px] right-0 lg:pr-[10px] z-30 flex items-center">
            <div className="relative flex items-center bg-white">
              {/* Search Icon (SVG Circle + Line) */}
              <div className="px-2 cursor-pointer peer">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="1.5" strokeLinecap="square">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </div>

              {/* Search Input */}
              <input 
                type="text"
                placeholder="SEARCH"
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                className="w-[110px] xl:w-[200px] text-[11px] lg:text-[13px] text-black uppercase tracking-widest placeholder:text-[#9e9e9e] placeholder:uppercase focus:outline-none bg-transparent mr-4"
              />

              {/* Suggestion Box (Slide-in) */}
              <div className={`absolute top-[40px] right-0 bg-white border-t border-gray-100 min-w-[200px] py-4 px-6 transition-transform duration-300 transform ${searchFocused ? 'translate-x-0 shadow-lg' : 'translate-x-full pointer-events-none'}`}>
                 <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-4">Suggestions</p>
                 <div className="flex flex-col gap-3">
                   {['All Projects', 'By Scale', 'By Typology', 'Search Map'].map(s => (
                     <span key={s} className="text-[11px] text-[#6b6b6b] hover:text-black cursor-pointer uppercase tracking-widest">{s}</span>
                   ))}
                 </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <SidebarMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />

      <ProjectsFeed />
    </div>
  );
}
