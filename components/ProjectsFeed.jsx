'use client';

import React, { useRef, useState, useEffect, useLayoutEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CustomEase } from 'gsap/CustomEase';
import { useGSAP } from '@gsap/react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAnimation } from 'framer-motion';
import { X, Loader2 } from 'lucide-react';
import { apiGet } from '@/lib/api';

gsap.registerPlugin(ScrollTrigger, CustomEase);
CustomEase.create('customBIG', 'M0,0 C0.45,0 0.55,1 1,1');

// --- Mobile Project Detail (Không có animation phóng to ảnh) ---
const MobileProjectDetail = ({ project, onClose }) => {
  const [activeSlide, setActiveSlide] = useState(0);
  const scrollRef = useRef(null);
  const mainImageRef = useRef(null);
  const [galleryHeight, setGalleryHeight] = useState('clamp(200px, 45vh, 380px)');
  const [isDragging, setIsDragging] = useState(false);
  const dragState = useRef({ startX: 0, scrollLeft: 0, velocity: 0, lastX: 0, lastTime: 0 });
  const animationRef = useRef(null);

  const stopInertia = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
  }, []);

  const applyInertia = useCallback(() => {
    const container = scrollRef.current;
    if (!container || Math.abs(dragState.current.velocity) < 0.5) {
      dragState.current.velocity = 0;
      return;
    }
    container.scrollLeft -= dragState.current.velocity;
    dragState.current.velocity *= 0.95;
    animationRef.current = requestAnimationFrame(applyInertia);
  }, []);

  const handleTouchStart = useCallback((e) => {
    if (e.touches.length !== 1) return;
    const container = scrollRef.current;
    if (!container) return;
    stopInertia();
    setIsDragging(true);
    const touch = e.touches[0];
    dragState.current = {
      startX: touch.clientX,
      scrollLeft: container.scrollLeft,
      velocity: 0,
      lastX: touch.clientX,
      lastTime: Date.now()
    };
  }, [stopInertia]);

  const handleTouchMove = useCallback((e) => {
    if (!isDragging || e.touches.length !== 1) return;
    const container = scrollRef.current;
    if (!container) return;
    const touch = e.touches[0];
    const walk = (touch.clientX - dragState.current.startX) * 1.5;
    container.scrollLeft = dragState.current.scrollLeft - walk;
    const now = Date.now();
    const dt = now - dragState.current.lastTime;
    if (dt > 0) {
      const dx = touch.clientX - dragState.current.lastX;
      dragState.current.velocity = dx / dt * 16;
    }
    dragState.current.lastX = touch.clientX;
    dragState.current.lastTime = now;
  }, [isDragging]);

  const handleTouchEnd = useCallback(() => {
    if (!isDragging) return;
    const container = scrollRef.current;
    if (container) {
      container.style.cursor = 'grab';
      container.style.userSelect = '';
    }
    setIsDragging(false);
    if (Math.abs(dragState.current.velocity) > 1) applyInertia();
  }, [isDragging, applyInertia]);

  useEffect(() => { return () => stopInertia(); }, [stopInertia]);

  // Đồng bộ chiều cao gallery/slider với ảnh chính — ref phải bao quanh khối có kích thước đúng của ảnh (không dùng h-full của cột viewport)
  useLayoutEffect(() => {
    const el = mainImageRef.current;
    if (!el) return;

    const applyHeight = () => {
      const h = el.getBoundingClientRect().height;
      if (h > 0) {
        setGalleryHeight(`${Math.round(h)}px`);
      }
    };

    applyHeight();

    const ro = new ResizeObserver(() => {
      requestAnimationFrame(applyHeight);
    });
    ro.observe(el);

    return () => ro.disconnect();
  }, [project?._id, project?.general?.coverImage]);

  const description = getTextBlock(project);
  const sliderImages = getSliderImages(project);
  const projectYear = getProjectYear(project);

  let allImageUrls = [];
  if (project.blocks && Array.isArray(project.blocks)) {
    project.blocks.forEach(block => {
      if (block.type === 'image' && block.url) allImageUrls.push({ url: block.url, caption: block.caption });
    });
  }
  if (project.sliderGallery && Array.isArray(project.sliderGallery)) {
    project.sliderGallery.forEach(url => { if (url) allImageUrls.push({ url: url, caption: '' }); });
  }

  const seenUrls = new Set();
  const galleryImageBlocks = allImageUrls.filter(img => {
    if (seenUrls.has(img.url)) return false;
    seenUrls.add(img.url);
    return true;
  });

  const normalizeDescriptionText = (text) => String(text || '').replace(/\bDESCRITION\b/gi, 'DESCRIPTION');
  const coverImageUrl = project.general?.coverImage || '/placeholder.jpg';

  return (
    <div className="fixed inset-0 z-[100] bg-white flex flex-col overflow-hidden">
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-50 w-10 h-10 flex items-center justify-center bg-white/90 backdrop-blur-sm rounded-full shadow-md"
      >
        <X className="w-5 h-5" />
      </button>

      {/* Horizontal scroll container - lướt ngang để xem chi tiết */}
      <div
        ref={scrollRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="w-full h-full overflow-x-auto overflow-y-hidden scrollbar-hidden"
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
      >
        <div className="h-full flex flex-nowrap items-center">

          {/* ===== PHẦN 1: THÔNG TIN PROJECT ===== */}
          <div className="shrink-0 h-full flex flex-col justify-center w-[85vw] sm:w-[320px] min-w-0 px-4">
            <h1 className="text-lg sm:text-xl font-bold uppercase tracking-tighter leading-none break-words mb-1">
              {project.general?.title || 'Untitled Project'}
            </h1>
            <p className="text-[10px] text-[#797979] uppercase tracking-[0.3em] font-medium mb-6">
              {project.general?.location || ''}
            </p>
            <div className="flex flex-col gap-3 items-start">
              <div>
                <h4 className="text-[9px] text-[#797979] uppercase tracking-widest mb-1">Client</h4>
                <p className="text-[11px] text-black uppercase font-bold tracking-wider">{project.general?.client || 'N/A'}</p>
              </div>
              <div>
                <h4 className="text-[9px] text-[#797979] uppercase tracking-widest mb-1">Typology</h4>
                <p className="text-[11px] text-black uppercase font-bold tracking-wider">{project.general?.typology || 'N/A'}</p>
              </div>
              <div>
                <h4 className="text-[9px] text-[#797979] uppercase tracking-widest mb-1">Status</h4>
                <p className="text-[11px] text-black uppercase font-bold tracking-wider">{project.general?.status || 'Completed'}</p>
              </div>
              <div>
                <h4 className="text-[9px] text-[#797979] uppercase tracking-widest mb-1">Year</h4>
                <p className="text-[11px] text-black uppercase font-bold tracking-wider">{projectYear}</p>
              </div>
            </div>
            {description && (
              <div className="mt-6 text-[13px] leading-[1.6] text-black uppercase tracking-tight opacity-80">
                <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#797979] mb-2">DESCRIPTION</h3>
                <p className="whitespace-pre-wrap break-words [overflow-wrap:anywhere]">{normalizeDescriptionText(description)}</p>
              </div>
            )}
          </div>

          {/* ===== PHẦN 2: ẢNH CHÍNH ===== */}
          <div className="shrink-0 h-full flex items-center justify-center min-w-0 w-[85vw] sm:w-auto">
            <div
              ref={mainImageRef}
              className="relative inline-flex w-fit max-w-full items-center justify-center shadow-sm overflow-hidden"
              style={{ maxHeight: 'min(85dvh, 80vh)' }}
            >
              <Image
                src={coverImageUrl}
                alt="Cover"
                width={1920}
                height={1080}
                sizes="85vw"
                priority
                draggable={false}
                className="object-contain select-none pointer-events-none block h-auto w-auto max-w-full"
                style={{ maxHeight: 'min(85dvh, 80vh)', width: 'auto', height: 'auto' }}
              />
            </div>
          </div>

          {/* ===== PHẦN 3: GALLERY IMAGES ===== */}
          {galleryImageBlocks.slice(0, 6).map((block, idx) => (
            <div
              key={`gallery-${idx}`}
              className="shrink-0 h-full flex items-center justify-center min-w-0 mr-[20px]"
            >
              <div
                className="relative inline-flex w-fit max-w-[85vw] items-center justify-center shadow-sm overflow-hidden"
                style={{ height: galleryHeight }}
              >
                {block.url && (
                  <Image
                    src={block.url}
                    alt={block.caption || `Gallery ${idx + 1}`}
                    width={0}
                    height={0}
                    sizes="85vw"
                    className="block object-contain select-none pointer-events-none h-full w-auto max-w-[85vw]"
                    style={{ height: galleryHeight, width: 'auto', maxWidth: '85vw' }}
                    draggable={false}
                  />
                )}
                {block.caption && (
                  <div className="absolute bottom-3 left-3 max-w-[calc(100%-1.5rem)] bg-black/70 text-white text-[10px] px-2 py-1 uppercase tracking-wider">
                    {block.caption}
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* ===== PHẦN 4: SLIDER IMAGES ===== */}
          {sliderImages.length > 0 && (
            <div
              className="shrink-0 h-full flex items-center justify-center min-w-0 mr-[20px]"
              onClick={() => setActiveSlide((prev) => (prev + 1) % sliderImages.length)}
            >
              <div
                className="relative inline-flex w-fit max-w-[85vw] items-center justify-center shadow-sm overflow-hidden"
                style={{ height: galleryHeight }}
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeSlide}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.6 }}
                    className="relative inline-flex h-full w-fit max-w-[85vw] items-center justify-center"
                  >
                    <Image
                      src={sliderImages[activeSlide]}
                      alt={`Slide ${activeSlide + 1}`}
                      width={0}
                      height={0}
                      sizes="85vw"
                      className="block object-contain select-none pointer-events-none h-full w-auto max-w-[85vw]"
                      style={{ height: galleryHeight, width: 'auto', maxWidth: '85vw' }}
                      draggable={false}
                    />
                  </motion.div>
                </AnimatePresence>
                <div className="absolute bottom-6 right-6 text-[10px] font-bold tracking-widest bg-white px-3 py-1.5 uppercase shadow-sm">
                  {activeSlide + 1} / {sliderImages.length}
                </div>
              </div>
            </div>
          )}

          {/* Spacer */}
          <div className="shrink-0 w-[5vw]" />
        </div>
      </div>
    </div>
  );
};

// --- Helpers ---
function getTextBlock(project) {
  const textBlock = project.blocks?.find(b => b.type === 'text');
  return textBlock?.content || '';
}

function getSliderImages(project) {
  const sliderBlocks = project.blocks?.filter(b => b.type === 'slider');
  const images = [];
  const seenUrls = new Set();
  sliderBlocks?.forEach(block => {
    if (block.slides && block.slides.length > 0) {
      block.slides.forEach(slide => {
        if (slide.url && !seenUrls.has(slide.url)) {
          seenUrls.add(slide.url);
          images.push(slide.url);
        }
      });
    }
  });
  return images;
}

function getProjectYear(project) {
  if (project.general?.year) return project.general.year;
  if (project.createdAt) {
    return new Date(project.createdAt).getFullYear().toString();
  }
  return '2024';
}

// --- Inline Expanded Detail Component ---
const InlineProjectDetail = ({ project, onClose, isLoading, layoutId }) => {
  const scrollRef = useRef(null);
  const introSlideRef = useRef(null);
  const mainImageRef = useRef(null);
  const [activeSlide, setActiveSlide] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragState = useRef({ startX: 0, scrollLeft: 0, velocity: 0, lastX: 0, lastTime: 0 });
  const animationRef = useRef(null);

  const stopInertia = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
  }, []);

  const applyInertia = useCallback(() => {
    const container = scrollRef.current;
    if (!container || Math.abs(dragState.current.velocity) < 0.5) {
      dragState.current.velocity = 0;
      return;
    }
    container.scrollLeft -= dragState.current.velocity;
    dragState.current.velocity *= 0.95;
    animationRef.current = requestAnimationFrame(applyInertia);
  }, []);

  const handleMouseDown = useCallback((e) => {
    if (e.button !== 0) return;
    const container = scrollRef.current;
    if (!container) return;
    stopInertia();
    setIsDragging(true);
    dragState.current = {
      startX: e.pageX,
      scrollLeft: container.scrollLeft,
      velocity: 0,
      lastX: e.pageX,
      lastTime: Date.now()
    };
    container.style.cursor = 'grabbing';
    container.style.userSelect = 'none';
  }, [stopInertia]);

  const handleMouseMove = useCallback((e) => {
    if (!isDragging) return;
    const container = scrollRef.current;
    if (!container) return;
    const walk = (e.pageX - dragState.current.startX) * 1.5;
    container.scrollLeft = dragState.current.scrollLeft - walk;

    const now = Date.now();
    const dt = now - dragState.current.lastTime;
    if (dt > 0) {
      const dx = e.pageX - dragState.current.lastX;
      dragState.current.velocity = dx / dt * 16;
    }
    dragState.current.lastX = e.pageX;
    dragState.current.lastTime = now;
  }, [isDragging]);

  const handleMouseUp = useCallback(() => {
    if (!isDragging) return;
    const container = scrollRef.current;
    if (container) {
      container.style.cursor = 'grab';
      container.style.userSelect = '';
    }
    setIsDragging(false);
    if (Math.abs(dragState.current.velocity) > 1) applyInertia();
  }, [isDragging, applyInertia]);

  const handleMouseLeave = useCallback(() => {
    if (isDragging) handleMouseUp();
  }, [isDragging, handleMouseUp]);

  const handleTouchStart = useCallback((e) => {
    if (e.touches.length !== 1) return;
    const container = scrollRef.current;
    if (!container) return;
    stopInertia();
    setIsDragging(true);
    const touch = e.touches[0];
    dragState.current = {
      startX: touch.clientX,
      scrollLeft: container.scrollLeft,
      velocity: 0,
      lastX: touch.clientX,
      lastTime: Date.now()
    };
  }, [stopInertia]);

  const handleTouchMove = useCallback((e) => {
    if (!isDragging || e.touches.length !== 1) return;
    const container = scrollRef.current;
    if (!container) return;
    const touch = e.touches[0];
    const walk = (touch.clientX - dragState.current.startX) * 1.5;
    container.scrollLeft = dragState.current.scrollLeft - walk;
    const now = Date.now();
    const dt = now - dragState.current.lastTime;
    if (dt > 0) {
      const dx = touch.clientX - dragState.current.lastX;
      dragState.current.velocity = dx / dt * 16;
    }
    dragState.current.lastX = touch.clientX;
    dragState.current.lastTime = now;
  }, [isDragging]);

  const handleTouchEnd = useCallback(() => handleMouseUp(), [handleMouseUp]);

  useEffect(() => { return () => stopInertia(); }, [stopInertia]);

  // Desktop: Đồng bộ chiều cao ảnh gallery/slider với ảnh chính (BIG.DK style)
  useLayoutEffect(() => {
    if (typeof window === 'undefined' || window.innerWidth < 1024) return;

    const scrollEl = scrollRef.current;
    const mainImg = mainImageRef.current;
    if (!scrollEl || !mainImg) return;

    const applyMainImageHeight = () => {
      const h = mainImg.getBoundingClientRect().height;
      if (h > 0) {
        scrollEl.style.setProperty('--gallery-img-h', `${h}px`);
      }
    };

    applyMainImageHeight();

    const ro = new ResizeObserver(() => {
      requestAnimationFrame(applyMainImageHeight);
    });
    ro.observe(mainImg);

    return () => {
      ro.disconnect();
      if (scrollEl) scrollEl.style.removeProperty('--gallery-img-h');
    };
  }, [project?._id]);

  // Chiều rộng slide intro = vùng cuộn (trùng với max-w + px của feed/menu), không dùng 100vw để khỏi lệch so với header
  useLayoutEffect(() => {
    const scrollEl = scrollRef.current;
    const introEl = introSlideRef.current;
    if (!scrollEl || !introEl) return;

    // Desktop only: đồng bộ chiều rộng intro slide
    const sync = () => {
      // Chỉ sync trên desktop, mobile dùng fixed sizes
      if (window.innerWidth < 1024) return;
      const w = scrollEl.clientWidth;
      if (w > 0) introEl.style.width = `${w}px`;
    };
    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(scrollEl);
    return () => ro.disconnect();
  }, [project?._id]);

  const description = getTextBlock(project);
  const sliderImages = getSliderImages(project);
  const projectYear = getProjectYear(project);

  let allImageUrls = [];
  if (project.blocks && Array.isArray(project.blocks)) {
    project.blocks.forEach(block => {
      if (block.type === 'image' && block.url) allImageUrls.push({ url: block.url, caption: block.caption });
    });
  }
  if (project.sliderGallery && Array.isArray(project.sliderGallery)) {
    project.sliderGallery.forEach(url => { if (url) allImageUrls.push({ url: url, caption: '' }); });
  }

  const seenUrls = new Set();
  const galleryImageBlocks = allImageUrls.filter(img => {
    if (seenUrls.has(img.url)) return false;
    seenUrls.add(img.url);
    return true;
  });

  const normalizeDescriptionText = (text) => String(text || '').replace(/\bDESCRITION\b/gi, 'DESCRIPTION');
  const coverImageUrl = project.general?.coverImage || '/placeholder.jpg';

  const hasRightGalleryOrSlider =
    galleryImageBlocks.length > 0 || sliderImages.length > 0;

  return (
    <div className="relative w-full h-[100dvh] lg:h-full bg-white text-black font-sans flex flex-col overflow-hidden mobile-detail-layout">
      {isLoading && (
        <div className="absolute inset-0 z-[200] bg-white flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-black" />
            <span className="text-xs uppercase tracking-[0.2em] text-gray-500">Loading details...</span>
          </div>
        </div>
      )}

      {/* Horizontal Scroll Container */}
      <div 
        ref={scrollRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="w-full h-full overflow-x-auto overflow-y-hidden scrollbar-hidden gallery-scroll-area"
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
      >
        <div className="h-full flex flex-nowrap items-center">

          {/* ===== PHẦN 1: KHỐI INTRO SLIDE (100% màn hình) - Flexbox 20-60-20 ===== */}
          {/* Mobile: Tách Info, Ảnh, Description thành 3 cards ngang riêng biệt (BIG.DK style) */}
          {/* Desktop: Giữ layout flex-row 3 cột */}
          <div
            ref={introSlideRef}
            data-intro-slide
            className="shrink-0 h-full flex flex-nowrap items-center justify-center min-w-0"
          >
            {/* ====== CARD 1: PROJECT INFO (Mobile: 85vw, Desktop: flex-1) ====== */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.4, duration: 0.6, ease: "easeOut" }}
              className="shrink-0 h-full flex flex-col justify-center w-[85vw] sm:w-[320px] lg:flex-1 lg:min-w-0 lg:max-w-[340px] order-2 lg:order-1 text-center lg:text-right select-none pointer-events-none pl-4 lg:pl-8 pr-4 lg:pr-6"
            >
              <div className="mb-4 lg:mb-6"></div>
              <h1 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold uppercase tracking-tighter leading-none break-words w-full m-0 p-0">
                {project.general?.title || 'Untitled Project'}
              </h1>
              <p className="mt-2 text-[10px] lg:text-[12px] text-[#797979] uppercase tracking-[0.3em] font-medium mb-8 lg:mb-12">
                {project.general?.location || ''}
              </p>
              <div className="flex flex-col gap-3 lg:gap-4 items-center lg:items-end">
                <div>
                  <h4 className="text-[9px] text-[#797979] uppercase tracking-widest mb-1">Client</h4>
                  <p className="text-[11px] text-black uppercase font-bold tracking-wider">{project.general?.client || 'N/A'}</p>
                </div>
                <div>
                  <h4 className="text-[9px] text-[#797979] uppercase tracking-widest mb-1">Typology</h4>
                  <p className="text-[11px] text-black uppercase font-bold tracking-wider">{project.general?.typology || 'N/A'}</p>
                </div>
                <div>
                  <h4 className="text-[9px] text-[#797979] uppercase tracking-widest mb-1">Status</h4>
                  <p className="text-[11px] text-black uppercase font-bold tracking-wider">{project.general?.status || 'Completed'}</p>
                </div>
                <div>
                  <h4 className="text-[9px] text-[#797979] uppercase tracking-widest mb-1">Year</h4>
                  <p className="text-[11px] text-black uppercase font-bold tracking-wider">{projectYear}</p>
                </div>
              </div>
            </motion.div>

            {/* ====== CARD 2: ẢNH CHÍNH (Mobile: 85vw, Desktop: max-w-[60%]) ====== */}
            {/* Mobile: width cố định 85vw, Desktop: tự động theo nội dung */}
            <div ref={mainImageRef} className="shrink-0 h-full order-1 lg:order-2 flex min-w-0 justify-center items-center w-[85vw] sm:w-auto">
              <motion.div
                layoutId={layoutId}
                transition={{
                  type: "spring",
                  stiffness: 80,
                  damping: 35,
                  mass: 1,
                }}
                className="relative w-auto h-full flex items-center justify-center min-w-0 max-w-full"
              >
                <Image
                  src={coverImageUrl}
                  alt="Cover"
                  width={1920}
                  height={1080}
                  sizes="(max-width: 1024px) 85vw, 60vw"
                  priority
                  draggable={false}
                  className="object-contain select-none pointer-events-none w-auto h-full max-w-full max-h-full"
                  style={{ width: 'auto', height: '100%', maxWidth: '100%' }}
                />
              </motion.div>
            </div>

            {/* ====== CARD 3: DESCRIPTION (Mobile: 85vw, Desktop: flex-1) ====== */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className={`shrink-0 h-full flex flex-col justify-start w-[85vw] sm:w-[280px] lg:flex-1 lg:min-w-0 lg:max-w-[300px] order-3 text-center lg:text-left select-none pointer-events-none pl-4 lg:pl-6 pr-4 lg:pr-8${hasRightGalleryOrSlider ? ' lg:ml-4' : ''}`}
            >
              {description && (
                <div className="text-[13px] leading-[1.6] text-black uppercase tracking-tight opacity-80">
                  <h3 className="text-[10px] lg:text-[11px] font-bold uppercase tracking-[0.2em] text-[#797979] mb-3">DESCRIPTION</h3>
                  <p className="whitespace-pre-wrap break-words [overflow-wrap:anywhere]">{normalizeDescriptionText(description)}</p>
                </div>
              )}
            </motion.div>

          </div>

          {/* ===== PHẦN 2: KHỐI GALLERY IMAGES SLIDES ===== */}
          {/* Mobile: clamp height cố định. Desktop: đồng bộ với ảnh chính qua CSS variable */}

          {/* Gallery Images */}
          {galleryImageBlocks.slice(0, 6).map((block, idx) => (
            <div
              key={`gallery-${idx}`}
              className="h-full shrink-0 min-w-0 overflow-hidden flex items-center justify-center relative z-0 w-[85vw] sm:w-auto lg:flex lg:items-center mr-[20px] lg:mr-[35px]"
            >
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 + idx * 0.1 }}
                className="relative z-0 shrink-0 w-auto shadow-sm overflow-hidden flex items-center justify-center max-w-[85vw] sm:max-w-none lg:max-w-none"
                style={{ height: 'clamp(200px, 45vh, 380px)', maxHeight: '45vh' }}
                data-gallery-card
              >
                {block.url && (
                  <Image
                    src={block.url}
                    alt={block.caption || `Gallery ${idx + 1}`}
                    width={0}
                    height={0}
                    sizes="(max-width: 1024px) 85vw, var(--gallery-img-h, 50vh)"
                    style={{ width: 'auto', height: '100%', maxWidth: '85vw', maxHeight: '45vh' }}
                    draggable={false}
                    className="object-contain select-none pointer-events-none"
                  />
                )}
                {block.caption && (
                  <div className="absolute bottom-4 left-4 bg-black/70 text-white text-[10px] px-2 py-1 uppercase tracking-wider">{block.caption}</div>
                )}
              </motion.div>
            </div>
          ))}

          {/* Slider Images */}
          {sliderImages.length > 0 && (
            <div
              className="h-full shrink-0 min-w-0 overflow-hidden pointer-events-auto cursor-pointer pr-[20px] lg:pr-[35px] relative z-0 w-[85vw] sm:w-auto lg:flex lg:items-center"
              onClick={() => setActiveSlide((prev) => (prev + 1) % sliderImages.length)}
            >
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="relative z-0 shrink-0 w-auto shadow-sm overflow-hidden flex items-center justify-center max-w-[85vw] sm:max-w-none lg:max-w-none"
                style={{ height: 'clamp(200px, 45vh, 380px)', maxHeight: '45vh' }}
                data-gallery-card
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeSlide}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.6 }}
                    className="relative w-auto h-auto flex items-center justify-center"
                  >
                    <Image
                      src={sliderImages[activeSlide]}
                      alt={`Slide ${activeSlide + 1}`}
                      width={0}
                      height={0}
                      sizes="(max-width: 1024px) 85vw, var(--gallery-img-h, 50vh)"
                      style={{ width: 'auto', height: '100%', maxWidth: '85vw', maxHeight: '45vh' }}
                      draggable={false}
                      className="object-contain select-none pointer-events-none"
                    />
                  </motion.div>
                </AnimatePresence>
                <div className="absolute bottom-6 right-6 text-[10px] font-bold tracking-widest bg-white px-3 py-1.5 uppercase">
                  {activeSlide + 1} / {sliderImages.length}
                </div>
              </motion.div>
            </div>
          )}

          {/* Spacer at the end */}
          <div className="shrink-0 w-[5vw]" />

        </div>
      </div>
    </div>
  );
};

// --- Main Feed Component ---
export default function ProjectsFeed() {
  const containerRef = useRef(null);

  const [projects, setProjects] = useState([]);
  const [isInitialized, setIsInitialized] = useState(false);
  // Dùng Set để lưu danh sách các ID dự án đã được click mở rộng — giữ nguyên trạng thái khi cuộn dọc
  const [expandedProjectIds, setExpandedProjectIds] = useState(new Set());
  const [isMobileView, setIsMobileView] = useState(false);
  const [activeCategory, setActiveCategory] = useState(null);
  const [activeSubcategory, setActiveSubcategory] = useState(null);
  const expandedRef = useRef(new Set());

  // Detect mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => setIsMobileView(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // 监听 URL hash 变化来更新筛选分类和子分类
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

    // 初始化时读取 hash
    handleHashChange();

    // 监听 hash 变化
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Lấy data trực tiếp từ projects array (API đã trả đầy đủ blocks, general...)
  useEffect(() => {
    let mounted = true;
    const init = async () => {
      try {
        const data = await apiGet('/api/projects');
        if (!mounted) return;

        if (!data.error && Array.isArray(data)) {
          setProjects(data);
          // Khởi tạo project từ URL nếu có
          const pathParts = window.location.pathname.split('/');
          const projectUrlId = pathParts[pathParts.length - 1];
          const found = data.find(p => p._id === projectUrlId);
          if (found) {
            setExpandedProjectIds(prev => {
              const next = new Set(prev);
              next.add(found._id);
              return next;
            });
          }
        }
        setIsInitialized(true);
      } catch (err) {
        setIsInitialized(true);
      }
    };
    init();
    return () => { mounted = false; };
  }, []);

  // Giữ ref đồng bộ với state để GSAP ScrollTrigger không bị stale closure
  useEffect(() => {
    expandedRef.current = expandedProjectIds;
  }, [expandedProjectIds]);

  useEffect(() => {
    const handlePopState = () => {
      const pathParts = window.location.pathname.split('/');
      const projectUrlId = pathParts[pathParts.length - 1];
      if (projectUrlId && projects.find(p => p._id === projectUrlId)) {
        setExpandedProjectIds(prev => {
          const next = new Set(prev);
          next.add(projectUrlId);
          return next;
        });
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [projects]);

  // Click vào project → thêm ID vào Set (mở vĩnh viễn, không tự đóng khi cuộn)
  const handleSelectProject = useCallback((project) => {
    if (!project) return;

    window.history.pushState(null, '', `/projects/${project._id}`);
    gsap.killTweensOf('.velocity-card');
    gsap.set('.velocity-card', { scale: 1, y: 0 });

    setExpandedProjectIds(prev => {
      const next = new Set(prev);
      next.add(project._id);
      return next;
    });

    requestAnimationFrame(() => {
      const el = document.getElementById(`project-${project._id}`);
      if (el) el.scrollIntoView({ behavior: 'instant', block: 'center' });
    });
  }, []);

  // Xóa project khỏi Set khi user click nút đóng (mobile / nút close inline)
  const handleCloseProject = useCallback((projectId) => {
    setExpandedProjectIds(prev => {
      const next = new Set(prev);
      next.delete(projectId);
      return next;
    });
    window.history.pushState(null, '', '/');
  }, []);

  useGSAP(() => {
    if (!isInitialized || projects.length === 0) return;

    gsap.to('.projects-scaler', {
      scale: 0.95,
      y: '4vh',
      ease: 'none',
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1.2,
      }
    });

    ScrollTrigger.create({
      trigger: containerRef.current,
      start: 'top bottom',
      end: 'bottom top',
      onUpdate: (self) => {
        // Chỉ chạy velocity-card effect khi KHÔNG có project nào được mở rộng
        if (expandedRef.current.size > 0) return;

        const rawVelocity = typeof self.getVelocity === 'function' ? self.getVelocity() : 0;
        const velocity = Math.abs(rawVelocity);
        const targetCardScale = Math.max(0.97, 1 - velocity / 8000);
        const momentumY = gsap.utils.clamp(-80, 80, rawVelocity / 25);

        gsap.to('.velocity-card', {
          scale: targetCardScale,
          y: momentumY,
          duration: 0.8,
          ease: 'power3.out',
          overwrite: 'auto',
        });
      }
    });

    const items = gsap.utils.toArray('.project-row');
    items.forEach((item) => {
      const imageBlock = item.querySelector('.project-image');
      const infoWrapper = item.querySelector('.project-info');

      if (imageBlock) {
        gsap.fromTo(imageBlock,
          { y: 150, opacity: 0 },
          {
            y: 0, opacity: 1, duration: 0.8, ease: 'customBIG', force3D: true, scrollTrigger: {
              trigger: item,
              start: 'top 95%',
              toggleActions: 'play none none reverse',
              onLeaveBack: () => {
                gsap.to(imageBlock, {
                  y: 150, opacity: 0, duration: 1.4, ease: 'power2.inOut', force3D: true
                });
              }
            }
          }
        );
      }
      if (infoWrapper) {
        gsap.fromTo(infoWrapper,
          { y: 100, opacity: 0 },
          {
            y: 0, opacity: 1, duration: 0.8, ease: 'customBIG', force3D: true, delay: 0.1, scrollTrigger: {
              trigger: item,
              start: 'top 95%',
              toggleActions: 'play none none reverse',
              onLeaveBack: () => {
                gsap.to(infoWrapper, {
                  y: 100, opacity: 0, duration: 1.2, ease: 'power2.inOut', force3D: true, delay: 0.05
                });
              }
            }
          }
        );
      }
    });

  }, { scope: containerRef, dependencies: [isInitialized, projects.length] });

  if (!isInitialized) return <div className="w-full bg-white relative pt-36 pb-[30vh] overflow-hidden z-10" />;

  // Mobile: lấy project đầu tiên trong Set để hiển thị portal
  const mobileExpandedId = Array.from(expandedProjectIds)[0] || null;
  const mobileProject = mobileExpandedId ? projects.find(p => p._id === mobileExpandedId) : null;

  const mobileDetailPortal =
    typeof document !== 'undefined' &&
    mobileProject &&
    isMobileView &&
    createPortal(
      <MobileProjectDetail
        project={mobileProject}
        onClose={() => handleCloseProject(mobileProject._id)}
      />,
      document.body
    );

  return (
    <>
      {mobileDetailPortal}
      <style jsx global>{`
        .scrollbar-hidden::-webkit-scrollbar { display: none; }
        .scrollbar-hidden { -ms-overflow-style: none; scrollbar-width: none; }

        /* Mobile detail layout - BIG.DK style horizontal scroll */
        @media (max-width: 1023px) {
          .mobile-detail-layout {
            position: fixed !important;
            inset: 0 !important;
            height: 100dvh !important;
            width: 100vw !important;
            z-index: 100 !important;
          }
          .mobile-detail-layout .gallery-scroll-area {
            height: 100dvh !important;
            overflow-x: auto !important;
            overflow-y: hidden !important;
          }
          .mobile-detail-layout [data-intro-slide] {
            display: flex !important;
            flex-wrap: nowrap !important;
            height: 100% !important;
          }
          /* Ensure images maintain aspect ratio on mobile */
          .mobile-detail-layout img {
            object-fit: contain !important;
            max-width: 85vw !important;
            height: auto !important;
            max-height: 50vh !important;
          }
        }

        /* Desktop: Use CSS variable for gallery image height sync */
        @media (min-width: 1024px) {
          .gallery-scroll-area {
            --gallery-img-h: min(52vh, 440px);
          }
          .gallery-scroll-area [data-gallery-card] {
            height: var(--gallery-img-h) !important;
            max-height: var(--gallery-img-h) !important;
          }
          .gallery-scroll-area [data-gallery-card] img {
            height: var(--gallery-img-h) !important;
            max-height: var(--gallery-img-h) !important;
          }
        }
      `}</style>

      <div ref={containerRef} className="w-full bg-white relative pt-36 pb-[30vh] overflow-hidden z-10">
        <div className="w-full max-w-[1800px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16">
          <div className="projects-scaler origin-top will-change-transform" style={{ transformOrigin: '50% 0%', transform: 'translateZ(0)' }}>
            <div className="flex flex-col items-center w-full transition-all duration-500 gap-1 lg:gap-1">
              {/* Theo activeCategory và activeSubcategory để lọc */}
              {projects
                .filter(p => {
                  if (activeCategory && p.category !== activeCategory) return false;
                  if (activeSubcategory && p.subcategory !== activeSubcategory) return false;
                  return true;
                })
                .map((project, index) => {
                  // Kiểm tra project có trong Set mở rộng không
                  const isExpanded = expandedProjectIds.has(project._id);
                  // Mobile: portal hiển thị, nên không render inline
                  const isMobilePortal = isExpanded && isMobileView;

                  return (
                    <motion.div
                      key={project._id || index}
                      id={`project-${project._id}`}
                      layout={!isMobilePortal}
                      className={`transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${isMobilePortal
                          ? 'relative w-full h-0 min-h-0 z-50 my-0 overflow-visible pointer-events-none'
                          : isExpanded
                            ? 'relative w-full h-[75vh] md:h-[75vh] z-50 my-0'
                            : 'relative w-full flex justify-center items-center max-w-[1600px] h-auto my-2'
                        }`}
                      transition={{ type: "spring", bounce: 0.2, duration: 0.8 }}
                    >
                      {!isExpanded ? (
                        <div className="project-row w-full flex justify-center items-center group">
                          <div className="velocity-card relative flex flex-col md:inline-flex md:flex-row items-center">

                            {/* Left Info Desktop */}
                            <div className="hidden md:flex absolute top-0 right-full mr-[4px] lg:mr-[6px] w-[324px] project-info justify-end z-20">
                              <div className="relative w-full text-right flex flex-col items-end origin-right">
                                <div onClick={(e) => { e.preventDefault(); handleSelectProject(project); }} className="group/link cursor-pointer flex flex-col items-end">
                                  <div className="relative pr-2 lg:pr-5">
                                    <h2 className="text-[14px] lg:text-[18px] font-normal uppercase text-black m-0 p-0 leading-tight whitespace-nowrap">
                                      {project.general?.title}
                                    </h2>
                                    <span className="absolute -bottom-1 right-2 lg:right-5 h-px bg-black w-0 group-hover/link:w-full transition-all duration-400" style={{ left: 'auto' }}></span>
                                  </div>
                                  <p className="text-[#797979] text-[11px] lg:text-[12px] uppercase mt-[4px] lg:mt-[6px] pr-2 lg:pr-5">
                                    {project.general?.location}
                                  </p>
                                </div>
                              </div>
                            </div>

                            {/* Cover Image Wrapper with LayoutID */}
                            <div className="shrink-0 project-image overflow-hidden w-[80vw] sm:w-[300px] lg:w-[56vh] relative">
                              <motion.div
                                layoutId={`img-container-${project._id}`}
                                onClick={() => handleSelectProject(project)}
                                transition={{
                                  type: "spring",
                                  stiffness: 80,
                                  damping: 35,
                                  mass: 1,
                                }}
                                className="relative w-full cursor-pointer group"
                              >
                                <Image
                                  src={project.general?.coverImage || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2070'}
                                  alt={project.general?.title || 'Preview'}
                                  width={800}
                                  height={0}
                                  style={{ width: '100%', height: 'auto' }}
                                  priority={index < 4}
                                  sizes="(max-width: 768px) 90vw, 64vh"
                                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                              </motion.div>
                            </div>

                            {/* Mobile Info */}
                            <div className="flex md:hidden flex-col w-full mt-4 project-info px-2" onClick={() => handleSelectProject(project)}>
                              <div className="flex items-start gap-4 cursor-pointer">
                                <div>
                                  <h2 className="text-[15px] font-normal uppercase text-black leading-none">{project.general?.title}</h2>
                                  <p className="text-[#797979] text-[11px] uppercase mt-1">{project.general?.location}</p>
                                </div>
                              </div>
                            </div>

                          </div>
                        </div>
                      ) : isMobileView ? null : (
                        // Desktop inline detail: data đã có sẵn từ projects array → isLoading={false}
                        <InlineProjectDetail
                          project={project}
                          onClose={() => handleCloseProject(project._id)}
                          layoutId={`img-container-${project._id}`}
                          isLoading={false}
                        />
                      )}
                    </motion.div>
                  );
                })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
