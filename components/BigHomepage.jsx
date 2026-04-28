'use client';

import { Search, Building2, Trees, Sofa } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import GtpLogo from './GtpLogo';
import ProjectsFeed from './ProjectsFeed';

// Sample Data Structure
const projects = [];

export default function BigHomepage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [navVisible, setNavVisible] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [hoveredCategory, setHoveredCategory] = useState(null);
  // 当前选中的分类和子分类（从 URL hash 同步）
  const [activeCategory, setActiveCategory] = useState(null);
  const [activeSubcategory, setActiveSubcategory] = useState(null);

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

  // 监听 URL hash 变化来同步 activeCategory 和 activeSubcategory
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.toLowerCase();
      if (!hash || hash === '#all') {
        setActiveCategory(null);
        setActiveSubcategory(null);
        return;
      }
      // Hash format: #category-subcategory hoặc #category
      const parts = hash.replace('#', '').split('-');
      const categoryMap = {
        'landscape': 'Landscape',
        'engineering': 'Engineering',
        'architecture': 'Architecture',
        'products': 'Products'
      };
      const category = categoryMap[parts[0]] || null;
      setActiveCategory(category);
      // Subcategory là phần còn lại của hash, viết hoa chữ cái đầu
      if (parts.length > 1) {
        const sub = parts.slice(1).map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
        setActiveSubcategory(sub);
      } else {
        setActiveSubcategory(null);
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigation = [
    { title: 'Landscape', sub: ['Public Space', 'Parks', 'Planning'] },
    { title: 'Engineering', sub: ['Structural', 'BIM', 'Green Tech'] },
    { title: 'Architecture', sub: ['Cultural', 'Residential', 'Office', 'Hospitality'] },
    { title: 'Products', sub: ['Furniture', 'Lighting', 'Installation'] },
  ];

  // 点击导航分类链接的处理函数
  const handleCategoryClick = (e, title) => {
    e.preventDefault();
    // 点击 category 本身 -> chỉ lọc theo category, clear subcategory
    window.history.pushState(null, '', `#${title.toLowerCase()}`);
    window.dispatchEvent(new Event('hashchange'));
    setActiveCategory(title);
    setActiveSubcategory(null);
  };

  // 点击 submenu item 的处理函数
  const handleSubcategoryClick = (e, categoryTitle, subcategory) => {
    e.preventDefault();
    e.stopPropagation();
    const subSlug = subcategory.toLowerCase().replace(/ /g, '-');
    window.history.pushState(null, '', `#${categoryTitle.toLowerCase()}-${subSlug}`);
    window.dispatchEvent(new Event('hashchange'));
    setActiveCategory(categoryTitle);
    setActiveSubcategory(subcategory);
    setHoveredCategory(null);
  };

  // Click outside to close submenu
  useEffect(() => {
    const handleClickOutside = (e) => {
      // Kiểm tra nếu click không nằm trong các nav menu (sidebar và category nav)
      const sidebarNav = document.querySelector('nav');
      const categoryNav = document.querySelectorAll('nav');
      let isInsideNav = false;
      
      // Kiểm tra click có nằm trong sidebar nav không
      if (sidebarNav && sidebarNav.contains(e.target)) {
        isInsideNav = true;
      }
      
      // Kiểm tra click có nằm trong category nav (submenu) không
      categoryNav.forEach((nav) => {
        if (nav.contains(e.target)) {
          isInsideNav = true;
        }
      });
      
      if (!isInsideNav) {
        setHoveredCategory(null);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <div className="min-h-screen bg-white text-black font-sans selection:bg-black selection:text-white pb-32">
      {/* HEADER */}
      <header className={`fixed top-0 left-0 w-full z-[900] bg-white transition-opacity duration-[1500ms] ${navVisible ? 'opacity-100' : 'opacity-0'}`}>
        <div className="relative flex justify-between items-center px-[20px] lg:px-[35px] pt-[22px] lg:pt-[24px] pb-4">
          
          {/* 1. Logo acting as Hamburger Menu trigger on Mobile, Home Link on Desktop */}
          <div className="w-1/4 flex items-start">
            {/* Mobile: Click to toggle sidebar */}
            <div className="md:hidden">
              <button 
                onClick={() => setMenuOpen(!menuOpen)}
                className="p-0 bg-transparent border-none outline-none relative z-[1001]"
                aria-label="Toggle Sidebar Menu"
              >
                <GtpLogo />
              </button>
            </div>

            {/* Desktop: Click logo to show dropdown menu */}
            <div className="hidden md:block">
              <button 
                onClick={() => setMenuOpen(!menuOpen)}
                className="p-0 bg-transparent border-none outline-none relative z-[1001] hover:opacity-70 transition-opacity"
                aria-label="Toggle Menu"
              >
                <GtpLogo />
              </button>
            </div>

            {/* Sidebar Menu - Slides from left when menuOpen */}
            <nav 
              className={`fixed top-0 bottom-0 left-0 z-10 flex flex-col gap-0.5 bg-white pt-[60px] pr-5 pl-[5vw] md:pl-[60px] lg:pl-[30px] transition-all duration-300 ${
                menuOpen 
                  ? 'translate-x-0 opacity-100 pointer-events-auto' 
                  : '-translate-x-full opacity-0 pointer-events-none'
              }`}
            >
              <Link 
                href="/"
                onClick={() => {
                  setMenuOpen(false);
                  window.location.href = '/';
                }}
                className="text-sm uppercase opacity-50 transition-opacity hover:opacity-100"
              >
                Projects
              </Link>
              <Link 
                href="/about"
                onClick={() => setMenuOpen(false)}
                className="text-sm uppercase opacity-50 transition-opacity hover:opacity-100"
              >
                About
              </Link>
              <Link 
                href="/credentials"
                onClick={() => setMenuOpen(false)}
                className="text-sm uppercase opacity-50 transition-opacity hover:opacity-100"
              >
                Credentials
              </Link>
            </nav>
          </div>

          {/* 2. Navigation (Desktop Only) */}
          <nav className="hidden md:flex absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 flex-row justify-center w-max gap-0 z-20">
            {navigation.map((cat) => (
              <div 
                key={cat.title}
                className="group relative px-5 py-1"
              >
                {/* Menu Item - Click để toggle submenu và filter theo category */}
                <button
                  onClick={() => {
                    // Toggle: nếu đang hover category này thì đóng, không thì mở và filter
                    if (hoveredCategory === cat.title) {
                      setHoveredCategory(null);
                    } else {
                      setHoveredCategory(cat.title);
                      setActiveCategory(cat.title);
                      setActiveSubcategory(null);
                    }
                  }}
                  className={`text-[11px] md:text-[14.5px] font-medium tracking-widest uppercase transition-colors duration-200 bg-transparent border-none cursor-pointer p-0 ${hoveredCategory === cat.title || activeCategory === cat.title ? 'text-black' : 'text-[#6b6b6b] hover:text-black'}`}
                >
                  {cat.title}
                </button>

                {/* Sub-menu - Hiện khi hoveredCategory === cat.title HOẶC activeCategory === cat.title */}
                <div 
                  className={`absolute top-[42px] left-1/2 -translate-x-1/2 z-30 bg-transparent flex-row justify-center pointer-events-auto ${
                    hoveredCategory === cat.title || activeCategory === cat.title ? 'flex' : 'hidden'
                  }`}
                >
                   {cat.sub.map((subItem) => (
                     <button
                       key={subItem}
                       onClick={(e) => handleSubcategoryClick(e, cat.title, subItem)}
                       className={`text-[10px] md:text-[12px] tracking-widest px-4 py-2 transition-colors whitespace-nowrap bg-transparent border-none cursor-pointer ${
                         activeSubcategory === subItem ? 'text-black font-bold' : 'text-[#6b6b6b] hover:text-black'
                       }`}
                     >
                       {subItem}
                     </button>
                   ))}
                </div>
              </div>
            ))}
          </nav>

          {/* 3. Search Bar (Right) */}
          <div className="absolute top-1/2 -translate-y-1/2 right-0 pr-[20px] lg:pr-[35px] z-50 flex items-center">
            <div className="relative flex items-center bg-white">
              {/* Search Icon */}
              <div className="px-2 cursor-pointer">
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
                className="w-[110px] xl:w-[200px] text-[11px] md:text-[13px] text-black uppercase tracking-widest placeholder:text-[#9e9e9e] placeholder:uppercase focus:outline-none bg-transparent mr-4 transition-all"
              />

              {/* Suggestion Box (Slide-in) */}
              <div 
                className={`absolute top-[40px] right-0 bg-white border-t border-gray-100 min-w-[220px] py-4 px-6 transition-all duration-300 ${
                  searchFocused 
                    ? 'opacity-100 translate-y-0 pointer-events-auto shadow-lg' 
                    : 'opacity-0 -translate-y-2 pointer-events-none'
                }`}
                onMouseEnter={() => setSearchFocused(true)}
                onMouseLeave={() => setSearchFocused(false)}
              >
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

      <ProjectsFeed activeCategory={activeCategory} activeSubcategory={activeSubcategory} />
    </div>
  );
}