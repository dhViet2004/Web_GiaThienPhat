'use client';

import React, { useRef, useState, useEffect, useLayoutEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CustomEase } from 'gsap/CustomEase';
import { useGSAP } from '@gsap/react';
import { motion, AnimatePresence } from 'framer-motion';
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
  const coverImageUrl = project.general?.coverImage || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2070';

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
            <h1 className="text-lg sm:text-xl font-bold tracking-tighter leading-none break-words mb-1">
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

  // Define helpers first so they are available in hooks
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
  const coverImageUrl = project.general?.coverImage || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2070';

  const hasRightGalleryOrSlider =
    galleryImageBlocks.length > 0 || sliderImages.length > 0;

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
  // FIX: ResizeObserver xóa CSS var khi về Mobile thay vì chỉ skip
  useLayoutEffect(() => {
    const scrollEl = scrollRef.current;
    const mainImg = mainImageRef.current;
    if (!scrollEl || !mainImg) return;

    const applyMainImageHeight = () => {
      // Khi về mobile: xóa CSS var để CSS fallback của stylesheet có hiệu lực
      if (window.innerWidth < 1024) {
        scrollEl.style.removeProperty('--gallery-img-h');
        return;
      }
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
  // FIX: Xóa inline width khi về Mobile thay vì chỉ return
  useLayoutEffect(() => {
    const scrollEl = scrollRef.current;
    const introEl = introSlideRef.current;
    if (!scrollEl || !introEl) return;

    const sync = () => {
      if (window.innerWidth < 1024) {
        // Xóa inline style để Mobile dùng CSS classes tự nhiên (không bị width cố định của Desktop)
        introEl.style.width = '';
        return;
      }
      // NẾU KHÔNG CÓ DESCRIPTION, không set width cố định cho introEl để gallery trôi vào
      if (!description) {
        introEl.style.width = '';
        return;
      }
      const w = scrollEl.clientWidth;
      if (w > 0) introEl.style.width = `${w}px`;
    };
    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(scrollEl);
    return () => {
      ro.disconnect();
      // Cleanup: xóa inline style khi component unmount
      if (introEl) introEl.style.width = '';
    };
  }, [project?._id, description]);


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
          {/* Desktop: Giữ layout flex-row 3 cột cân bằng: flex-1 | auto | flex-1 */}
          <div
            ref={introSlideRef}
            data-intro-slide
            className="shrink-0 h-full flex flex-nowrap items-center justify-center min-w-0"
          >
            {/* ====== CARD 1: PROJECT INFO ====== */}
            {/* Mobile: card 85vw riêng | Desktop: flex-1 cột trái, text-right, nở theo chiều sâu */}
            {/* self-stretch: override items-center của parent — buộc CARD 1 luôn stretch full height */}
            {/* nếu không có self-stretch, items-center sẽ center CARD 1 theo content height */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5, ease: "easeOut" }}
              className="self-stretch shrink-0 flex flex-col justify-start w-[85vw] sm:w-[320px] lg:w-[calc((100vw-100vh)/2)] lg:min-w-0 order-2 lg:order-1 text-center lg:text-right select-none pointer-events-none pl-4 lg:pl-8 pr-4 lg:pr-6 pt-[min(10vh,60px)] lg:pt-0"
            >
              <h1 className="text-lg sm:text-xl lg:text-[18px] xl:text-[22px] font-normal text-black m-0 p-0 leading-[1.3] whitespace-normal w-full">
                {project.general?.title || 'Untitled Project'}
              </h1>
              <p className="mt-2 text-[10px] lg:text-[11px] text-[#797979] uppercase tracking-[0.3em] font-medium mb-8 lg:mb-12">
                {project.general?.location || ''}
              </p>
              <div className="flex flex-col gap-3 lg:gap-4 items-center lg:items-end">
                <div>
                  <h4 className="text-[10px] lg:text-[12px] text-[#797979] uppercase tracking-widest mb-1">Client</h4>
                  <p className="text-[10px] lg:text-[14px] text-black uppercase tracking-wider leading-none lg:max-w-[180px] break-words whitespace-normal">{project.general?.client || 'N/A'}</p>
                </div>
                <div>
                  <h4 className="text-[10px] lg:text-[12px] text-[#797979] uppercase tracking-widest mb-1">Typology</h4>
                  <p className="text-[10px] lg:text-[14px] text-black uppercase tracking-wider leading-none lg:max-w-[180px] break-words whitespace-normal">{project.general?.typology || 'N/A'}</p>
                </div>
                <div>
                  <h4 className="text-[10px] lg:text-[12px] text-[#797979] uppercase tracking-widest mb-1">Status</h4>
                  <p className="text-[10px] lg:text-[14px] text-black uppercase tracking-wider leading-none lg:max-w-[180px] break-words whitespace-normal">{project.general?.status || 'Completed'}</p>
                </div>
                <div>
                  <h4 className="text-[10px] lg:text-[12px] text-[#797979] uppercase tracking-widest mb-1">Year</h4>
                  <p className="text-[10px] lg:text-[14px] text-black uppercase tracking-wider leading-none lg:max-w-[180px] break-words whitespace-normal">{projectYear}</p>
                </div>
              </div>
            </motion.div>

            {/* ====== CARD 2: ẢNH CHÍNH ====== */}
            {/* Mobile: 85vw | Desktop: auto (ảnh tự co theo tỷ lệ, căn giữa bởi flex-1 hai bên) */}
            <div ref={mainImageRef} className="shrink-0 h-full order-1 lg:order-2 flex min-w-0 justify-center items-center w-[85vw] lg:w-[100vh]">
              {/* GSAP FLIP (trong useLayoutEffect) sẽ animate ảnh này từ vị trí thumbnail.
                  Không cần Framer Motion initial/animate — GSAP kiểm soát toàn bộ. */}
              <div
                className="big-project-image-box relative w-[85vw] h-auto aspect-[4/3] lg:w-[100vh] lg:h-[75vh] overflow-hidden flex items-center justify-center min-w-0 max-w-full"
                style={{ willChange: 'transform' }}
              >
                <Image
                  src={coverImageUrl}
                  alt="Cover"
                  fill
                  sizes="(max-width: 768px) 90vw, 64vh"
                  priority
                  draggable={false}
                  className="object-cover select-none pointer-events-none"
                  style={{ objectFit: 'cover' }}
                />
              </div>
            </div>

            {/* ====== CARD 3: DESCRIPTION / GALLERY IMAGE (Mobile: 85vw, Desktop: flex-1 cột phải) ====== */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6, ease: "easeOut" }}
              className={
                description
                  ? `shrink-0 h-full flex flex-col justify-center w-[85vw] sm:w-[280px] lg:w-[calc((100vw-100vh)/2)] lg:min-w-0 order-3 text-center lg:text-left select-none pointer-events-none pl-4 lg:pl-6 pr-4 lg:pr-8${hasRightGalleryOrSlider ? ' lg:mr-[35px]' : ''}`
                  : `shrink-0 h-full flex flex-col justify-center w-[85vw] sm:w-auto lg:w-auto lg:min-w-0 order-3 select-none pointer-events-none pl-[20px] lg:pl-[35px] pr-0 pt-0 lg:pt-0${hasRightGalleryOrSlider ? ' mr-[20px] lg:mr-[35px]' : ''}`
              }
            >
              {description ? (
                <div className="text-[13px] leading-[1.6] text-black tracking-tight opacity-80">
                  <p className="whitespace-pre-wrap break-words [overflow-wrap:anywhere]">{normalizeDescriptionText(description)}</p>
                </div>
              ) : (
                galleryImageBlocks.length > 0 && (
                  <div
                    className="relative z-0 shrink-0 w-auto shadow-sm overflow-hidden flex items-center justify-center max-w-[85vw] sm:max-w-none lg:max-w-none"
                    style={{ height: 'var(--gallery-img-h, clamp(200px, 45vh, 380px))', maxHeight: 'var(--gallery-img-h, 45vh)' }}
                  >
                    {galleryImageBlocks[0].url && (
                      <Image
                        src={galleryImageBlocks[0].url}
                        alt={galleryImageBlocks[0].caption || "Gallery 1"}
                        width={0}
                        height={0}
                        sizes="(max-width: 1024px) 85vw, var(--gallery-img-h, 50vh)"
                        style={{ width: 'auto', height: '100%', maxWidth: '85vw', maxHeight: 'var(--gallery-img-h, 45vh)' }}
                        draggable={false}
                        className="object-contain select-none pointer-events-none"
                      />
                    )}
                    {galleryImageBlocks[0].caption && (
                      <div className="absolute bottom-4 left-4 bg-black/70 text-white text-[10px] px-2 py-1 uppercase tracking-wider">
                        {galleryImageBlocks[0].caption}
                      </div>
                    )}
                  </div>
                )
              )}
            </motion.div>
          </div>


          {/* ===== PHẦN 2: KHỐI GALLERY IMAGES SLIDES ===== */}
          {/* Mobile: clamp height cố định. Desktop: đồng bộ với ảnh chính qua CSS variable */}

          {/* Gallery Images */}
          {(description ? galleryImageBlocks.slice(0, 6) : galleryImageBlocks.slice(1, 6)).map((block, idx) => (
            <div
              key={`gallery-${idx}`}
              className="h-full shrink-0 min-w-0 overflow-hidden flex items-center justify-center relative z-0 w-[85vw] sm:w-auto lg:flex lg:items-center mr-[20px] lg:mr-[35px]"
            >
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 + idx * 0.1 }}
                className="relative z-0 shrink-0 w-auto shadow-sm overflow-hidden flex items-center justify-center max-w-[85vw] sm:max-w-none lg:max-w-none"
                style={{ height: 'var(--gallery-img-h, clamp(200px, 45vh, 380px))', maxHeight: 'var(--gallery-img-h, 45vh)' }}
                data-gallery-card
              >
                {block.url && (
                  <Image
                    src={block.url}
                    alt={block.caption || `Gallery ${idx + 1}`}
                    width={0}
                    height={0}
                    sizes="(max-width: 1024px) 85vw, var(--gallery-img-h, 50vh)"
                    style={{ width: 'auto', height: '100%', maxWidth: '85vw', maxHeight: 'var(--gallery-img-h, 45vh)' }}
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
                style={{ height: 'var(--gallery-img-h, clamp(200px, 45vh, 380px))', maxHeight: 'var(--gallery-img-h, 45vh)' }}
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
                      style={{ width: 'auto', height: '100%', maxWidth: '85vw', maxHeight: 'var(--gallery-img-h, 45vh)' }}
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
export default function ProjectsFeed({ activeCategory: propActiveCategory, activeSubcategory: propActiveSubcategory }) {
  const containerRef = useRef(null);

  const [projects, setProjects] = useState([]);
  const [isInitialized, setIsInitialized] = useState(false);
  // Dùng Set để lưu danh sách các ID dự án đã được click mở rộng — giữ nguyên trạng thái khi cuộn dọc
  const [expandedProjectIds, setExpandedProjectIds] = useState(new Set());
  // Lazy initializer: đọc window.innerWidth ngay từ đầu (SSR-safe)
  // Tránh hydration mismatch và flash layout sai khi load trên Mobile
  const [isMobileView, setIsMobileView] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth < 1024;
  });
  // Ưu tiên props từ BigHomepage, fallback vào URL hash
  const [activeCategory, setActiveCategory] = useState(propActiveCategory || null);
  const [activeSubcategory, setActiveSubcategory] = useState(propActiveSubcategory || null);
  const expandedRef = useRef(new Set());
  // FLIP technique: lưu chiều cao thực tế của row TRƯỚC khi React re-render
  // để GSAP có thể animate từ giá trị đó lên 75vh một cách mượt mà
  const expandingFlipRef = useRef(null); // { id, fromHeight }
  const closingFlipRef = useRef(null);   // { id, fromHeight }

  // Detect mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => setIsMobileView(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Khi props thay đổi từ BigHomepage, cập nhật state
  useEffect(() => {
    if (propActiveCategory !== undefined) {
      setActiveCategory(propActiveCategory);
    }
    if (propActiveSubcategory !== undefined) {
      setActiveSubcategory(propActiveSubcategory);
    }
  }, [propActiveCategory, propActiveSubcategory]);

  // 监听 URL hash 变化来更新筛选分类和子分类 (chỉ khi không có props)
  useEffect(() => {
    // Nếu có props từ BigHomepage, bỏ qua URL hash
    if (propActiveCategory !== undefined && propActiveCategory !== null) return;
    
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
  }, [propActiveCategory]);

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

  // Preload các ảnh chi tiết của tất cả project dưới background để khi user click sẽ hiển thị ngay lập tức (instant)
  useEffect(() => {
    if (projects.length === 0) return undefined;

    // Trì hoãn 2 giây để ưu tiên các animation và tài nguyên quan trọng của trang chủ trước
    const timer = window.setTimeout(() => {
      projects.forEach((project) => {
        const urls = [];
        // Lấy ảnh cover chính (đã được load làm thumbnail nhưng thêm cho chắc chắn)
        if (project.general?.coverImage) urls.push(project.general.coverImage);
        
        // Lấy tất cả ảnh gallery tĩnh và ảnh slide trong blocks
        if (project.blocks && Array.isArray(project.blocks)) {
          project.blocks.forEach((block) => {
            if (block.type === 'image' && block.url) urls.push(block.url);
            if (block.type === 'slider' && Array.isArray(block.slides)) {
              block.slides.forEach((slide) => {
                if (slide.url) urls.push(slide.url);
              });
            }
          });
        }
        
        // Lấy tất cả ảnh sliderGallery dự phòng
        if (project.sliderGallery && Array.isArray(project.sliderGallery)) {
          project.sliderGallery.forEach((url) => {
            if (url) urls.push(url);
          });
        }

        // Lọc trùng lặp URL
        const uniqueUrls = Array.from(new Set(urls));
        
        // Tạo đối tượng Image để trình duyệt tải trước và lưu vào HTTP cache
        uniqueUrls.forEach((url) => {
          const img = new window.Image();
          img.src = url;
        });
      });
    }, 2000);

    return () => window.clearTimeout(timer);
  }, [projects]);

  // Giữ ref đồng bộ với state để GSAP ScrollTrigger không bị stale closure
  useEffect(() => {
    expandedRef.current = expandedProjectIds;
  }, [expandedProjectIds]);

  // BIG.DK: Khi expandedProjectIds thay đổi, chỉ cần refresh ScrollTrigger
  // để recalculate vị trí trigger sau khi layout thay đổi.
  // KHÔNG cần revealVisibleRows vì các row đã ở y:0 (không bị revert nữa).
  useEffect(() => {
    if (!isInitialized || projects.length === 0) return undefined;

    // Chờ CSS transition hoàn thành (0.78s) rồi mới refresh ScrollTrigger
    const refreshTimer = window.setTimeout(() => {
      ScrollTrigger.refresh();
    }, 800);

    return () => {
      window.clearTimeout(refreshTimer);
    };
  }, [expandedProjectIds.size, isInitialized, projects.length]);

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
    
    // BIG.DK: Đưa projects-scaler về scale 1 mượt mà khi mở chi tiết
    gsap.killTweensOf('.projects-scaler');
    gsap.to('.projects-scaler', {
      scale: 1,
      duration: 0.78,
      ease: 'power2.out',
      overwrite: 'auto',
    });

    const projectRow = document.getElementById(`project-${project._id}`);
    if (projectRow) {
      // FLIP Step 1: Đo cả chiều cao row và rect của thumbnail image TRƯỚC khi state thay đổi
      // Thumbnail rect dùng để GSAP FLIP image từ vị trí này đến vị trí expanded
      const thumbnailImageEl = projectRow.querySelector('.big-project-image-box');
      expandingFlipRef.current = {
        id: project._id,
        fromHeight: projectRow.getBoundingClientRect().height,
        thumbnailRect: thumbnailImageEl?.getBoundingClientRect() ?? null,
      };

      const scrollTriggerTarget = projectRow.querySelector('.project-row');
      const imageBlock = projectRow.querySelector('.project-image');
      const infoBlock = projectRow.querySelector('.project-info');
      // BIG.DK: Clear GSAP inline styles để CSS transition kiểm soát chuyển động
      if (imageBlock) gsap.set(imageBlock, { clearProps: 'all' });
      const thumbScaleEl = projectRow?.querySelector('.big-project-velocity-scale');
      if (thumbScaleEl) gsap.set(thumbScaleEl, { clearProps: 'transform' });
      const velocityCard = projectRow.querySelector('.velocity-card');
      if (velocityCard) gsap.set(velocityCard, { clearProps: 'transform' });
      if (infoBlock) gsap.set(infoBlock, { clearProps: 'all' });

      // Kill ScrollTrigger của row đang expand
      ScrollTrigger.getAll()
        .filter(trigger => trigger.trigger === projectRow || trigger.trigger === scrollTriggerTarget)
        .forEach(trigger => trigger.kill());
    }

    if (window.__lenis) window.__lenis.stop();
    window.setTimeout(() => {
      if (window.__lenis) window.__lenis.start();
    }, 800);

    // FLIP Step 2: Trigger React re-render → useLayoutEffect FLIP sẽ chạy sau
    setExpandedProjectIds(prev => {
      const next = new Set(prev);
      next.add(project._id);
      return next;
    });

  }, []);

  // Xóa project khỏi Set khi user click nút đóng (mobile / nút close inline)
  const handleCloseProject = useCallback((projectId) => {
    const projectRow = document.getElementById(`project-${projectId}`);
    if (projectRow) {
      closingFlipRef.current = {
        id: projectId,
        fromHeight: projectRow.getBoundingClientRect().height,
      };
    }
    
    // Tạm khóa scroll trong 800ms để hoạt ảnh đóng diễn ra mượt mà
    if (window.__lenis) window.__lenis.stop();
    window.setTimeout(() => {
      if (window.__lenis) window.__lenis.start();
    }, 800);

    setExpandedProjectIds(prev => {
      const next = new Set(prev);
      next.delete(projectId);
      return next;
    });
    window.history.pushState(null, '', '/');
  }, []);

  // FLIP Step 3: Chạy sau khi React đã commit DOM changes nhưng TRƯỚC browser paint
  // useLayoutEffect đảm bảo không có flash của trạng thái 75vh
  useLayoutEffect(() => {
    // --- Xử lý EXPAND ---
    if (expandingFlipRef.current) {
      const { id, fromHeight, thumbnailRect } = expandingFlipRef.current;
      expandingFlipRef.current = null;

      if (expandedProjectIds.has(id)) {
        const rowEl = document.getElementById(`project-${id}`);
        if (rowEl) {
          // Tại đây React đã render rowStyle = { height: '75vh' } vào DOM.
          // Đo targetH và imageRect TỪ ĐÂY để lấy giá trị chính xác TRƯỚC khi GSAP override.
          const targetH = rowEl.getBoundingClientRect().height;
          const imageEl = rowEl.querySelector('.big-project-image-box');
          const imageRect = imageEl?.getBoundingClientRect();

          // Đo tọa độ của phần tử cha định vị gần nhất (Containing Block) của imageEl
          // để định vị position: absolute một cách chính xác tuyệt đối.
          const offsetParent = imageEl.offsetParent || rowEl;
          const parentRect = offsetParent.getBoundingClientRect();

          // --- GSAP FLIP 1: Container height ---
          // GSAP lập tử set height = fromHeight trước browser paint
          gsap.fromTo(rowEl,
            { height: fromHeight, overflow: 'hidden' },
            {
              height: targetH,
              duration: 0.78,
              ease: 'customBIG',
              onComplete: () => {
                // Trả lại chiều cao 75vh responsive ban đầu thay vì xóa hoàn toàn làm sập height thành auto
                gsap.set(rowEl, { height: '75vh', clearProps: 'overflow' });
              },
            }
          );

          // --- GSAP FLIP 2: Image vị trí & kích thước ---
          // Sử dụng position: absolute để cùng hệ tọa độ và bộ rasterize với relative, tránh lệch 2px.
          if (imageEl && imageRect && thumbnailRect) {
            const dx = (thumbnailRect.left + thumbnailRect.width / 2) - (imageRect.left + imageRect.width / 2);
            const dy = (thumbnailRect.top + thumbnailRect.height / 2) - (imageRect.top + imageRect.height / 2);
            const scaleX = thumbnailRect.width / imageRect.width;
            const scaleY = thumbnailRect.height / imageRect.height;

            gsap.fromTo(imageEl,
              {
                position: 'absolute', // Sử dụng absolute thay vì fixed để tránh giật sub-pixel khi chuyển đổi layer compositor
                left: imageRect.left - parentRect.left,
                top: imageRect.top - parentRect.top,
                width: imageRect.width,
                height: imageRect.height,
                scaleX: scaleX,
                scaleY: scaleY,
                x: dx,
                y: dy,
                opacity: 1,
                transformOrigin: 'center center',
                zIndex: 100,
              },
              {
                scaleX: 1,
                scaleY: 1,
                x: 0,
                y: 0,
                opacity: 1,
                duration: 0.78,
                ease: 'customBIG',
                onComplete: () => gsap.set(imageEl, { clearProps: 'position,left,top,width,height,transform,opacity,zIndex' }),
              }
            );
          } else if (imageEl) {
            // Fallback: nếu không có thumbnailRect, chỉ fade in
            gsap.fromTo(imageEl, { opacity: 0 }, { opacity: 1, duration: 0.5 });
          }
        }
      }
    }

    // --- Xử lý CLOSE ---
    if (closingFlipRef.current) {
      const { id, fromHeight } = closingFlipRef.current;
      closingFlipRef.current = null;

      if (!expandedProjectIds.has(id)) {
        const rowEl = document.getElementById(`project-${id}`);
        if (rowEl) {
          // React đã render rowStyle = { height: 'auto' }
          // Đo chiều cao mới (sẽ là height:auto = thumbnail height)
          const toHeight = rowEl.getBoundingClientRect().height;
          gsap.fromTo(rowEl,
            { height: fromHeight, overflow: 'hidden' },
            {
              height: toHeight,
              duration: 0.78,
              ease: 'customBIG',
              onComplete: () => {
                gsap.set(rowEl, { clearProps: 'height,overflow' });
              },
            }
          );
        }
      }
    }
  }, [expandedProjectIds]);

  // BIG.DK: Scroll-reveal animation chỉ chạy 1 lần khi init hoặc khi danh sách project thay đổi.
  // QUAN TRỌNG: Không revert khi expandedProjectIds.size thay đổi — tránh jump y:150.
  // Khi một project expand, các row khác đã giữ nguyên y:0 và sẽ trượt xuống
  // mượt mà nhờ CSS transition trên rowStyle.
  useGSAP(() => {
    if (!isInitialized || projects.length === 0) return;

    const items = gsap.utils.toArray('.project-row');
    items.forEach((item) => {
      const imageBlock = item.querySelector('.project-image');
      const infoWrapper = item.querySelector('.project-info');

      if (imageBlock) {
        gsap.fromTo(imageBlock,
          { y: 80, opacity: 0 },
          {
            y: 0, opacity: 1, duration: 0.78, ease: 'customBIG', force3D: true, scrollTrigger: {
              trigger: item,
              start: 'top 95%',
              toggleActions: 'play none none none',
            }
          }
        );
      }
      if (infoWrapper) {
        gsap.fromTo(infoWrapper,
          { y: 60, opacity: 0 },
          {
            y: 0, opacity: 1, duration: 0.78, ease: 'customBIG', force3D: true, delay: 0.08, scrollTrigger: {
              trigger: item,
              start: 'top 95%',
              toggleActions: 'play none none none',
            }
          }
        );
      }
    });

  // Chỉ dependency vào isInitialized và projects.length — KHÔNG expandedProjectIds.size
  // để tránh re-trigger animation khi user click expand project
  }, { scope: containerRef, dependencies: [isInitialized, projects.length] });

  useEffect(() => {
    if (!isInitialized || projects.length === 0) return undefined;

    const container = containerRef.current;
    if (!container) return undefined;

    const scalerTarget = container.querySelector('.projects-scaler');
    if (!scalerTarget) return undefined;

    let restoreTimer = null;
    let rafId = null;
    let lastScrollY = window.scrollY;
    let lastTime = performance.now();
    let attachedLenis = null;
    let nativeScrollAttached = false;

    // Hàm tính toán phần trăm cuộn của trang để làm transformOrigin động (nhằm giữ tâm zoom luôn ở giữa màn hình hiện tại)
    const getScrollProgress = () => {
      const docH = document.documentElement.scrollHeight;
      const winH = window.innerHeight;
      if (docH <= winH) return 0;
      return window.scrollY / (docH - winH);
    };

    // Thiết lập scale mặc định là 1 và transformOrigin theo tiến trình cuộn hiện tại
    gsap.set(scalerTarget, {
      scale: 1,
      transformOrigin: `50% ${getScrollProgress() * 100}%`,
      force3D: true,
    });

    const restoreScale = () => {
      gsap.to(scalerTarget, {
        scale: 1,
        transformOrigin: `50% ${getScrollProgress() * 100}%`,
        duration: 1.5, // Hồi phục cực kỳ chậm rãi và mượt mà
        ease: 'power3.out', // power3.out tạo đường cong giảm tốc rất êm
        overwrite: 'auto',
      });
    };

    const applyVelocityScale = (velocity, isLenisVelocity = true) => {
      // 1. Chỉ chạy trên desktop (innerWidth >= 1024) giống big.dk
      if (window.innerWidth < 1024) {
        gsap.set(scalerTarget, { scale: 1 });
        return;
      }

      // 2. Cho phép nhún lò xo khi cuộn kể cả khi dự án đang mở rộng (đồng bộ với big.dk)

      const absVelocity = Math.abs(velocity || 0);
      if (absVelocity < 0.2) return;

      const progress = isLenisVelocity
        ? gsap.utils.clamp(0, 1, absVelocity / 44)
        : gsap.utils.clamp(0, 1, absVelocity / 6200);
      
      // Điều chỉnh lại độ nhúng tinh tế ở mức 12% để tránh giật đột ngột
      const shrinkAmount = 0.12;
      const targetScale = 1 - shrinkAmount * progress;

      if (restoreTimer) window.clearTimeout(restoreTimer);

      gsap.to(scalerTarget, {
        scale: targetScale,
        transformOrigin: `50% ${getScrollProgress() * 100}%`,
        duration: 0.8, // Tăng duration lên 0.8s để việc thu nhỏ diễn ra êm hơn
        ease: 'sine.out', // sine.out giúp chuyển đổi mượt mà, không bị gắt
        overwrite: 'auto',
      });

      restoreTimer = window.setTimeout(restoreScale, 200); // Giảm debounce xuống 200ms để bắt đầu đàn hồi sớm hơn và hòa quyện tốt hơn
    };

    const fallbackOnScroll = () => {
      const now = performance.now();
      const currentScrollY = window.scrollY;
      const dt = Math.max(16, now - lastTime);
      const velocity = ((currentScrollY - lastScrollY) / dt) * 1000;
      lastScrollY = currentScrollY;
      lastTime = now;
      applyVelocityScale(velocity, false);
    };

    const attachLenis = () => {
      const lenis = window.__lenis;
      if (lenis && typeof lenis.on === 'function') {
        const onLenisScroll = ({ velocity = 0, userData } = {}) => {
          if (userData?.projectOpened) {
            restoreScale();
            return;
          }
          applyVelocityScale(velocity, true);
        };
        lenis.on('scroll', onLenisScroll);
        attachedLenis = { lenis, onLenisScroll };
        return true;
      }
      return false;
    };

    if (!attachLenis()) {
      const waitForLenis = () => {
        if (attachLenis()) {
          if (nativeScrollAttached) {
            window.removeEventListener('scroll', fallbackOnScroll);
            nativeScrollAttached = false;
          }
          return;
        }
        rafId = requestAnimationFrame(waitForLenis);
      };
      rafId = requestAnimationFrame(waitForLenis);
      window.addEventListener('scroll', fallbackOnScroll, { passive: true });
      nativeScrollAttached = true;
    }

    return () => {
      if (restoreTimer) window.clearTimeout(restoreTimer);
      if (rafId) cancelAnimationFrame(rafId);
      if (nativeScrollAttached) window.removeEventListener('scroll', fallbackOnScroll);
      if (attachedLenis?.lenis && typeof attachedLenis.lenis.off === 'function') {
        attachedLenis.lenis.off('scroll', attachedLenis.onLenisScroll);
      }
      gsap.set(scalerTarget, { scale: 1 });
    };
  }, [isInitialized, projects.length, expandedProjectIds.size]);

  // FIX: Refresh GSAP ScrollTrigger khi resize để recalculate tọa độ trigger points
  useEffect(() => {
    const handleResize = () => {
      ScrollTrigger.refresh();
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // FIX ROOT CAUSE #1+3: Khi cross ngưỡng Mobile ↔ Desktop
  // - Xóa GSAP inline styles (clearProps) để Tailwind CSS có thể override (nguyên nhân chính phải reload)
  // - Đóng expanded projects để tránh layout conflict portal vs inline
  // - Dùng null sentinel để không trigger sai lúc mount đầu
  const prevIsMobileRef = useRef(null);
  useEffect(() => {
    if (prevIsMobileRef.current === null) {
      // Lần mount đầu: chỉ ghi nhận, không làm gì
      prevIsMobileRef.current = isMobileView;
      return;
    }
    if (prevIsMobileRef.current !== isMobileView) {
      prevIsMobileRef.current = isMobileView;
      // Xóa sạch GSAP inline styles để Tailwind CSS classes hoạt động đúng sau resize
      gsap.set('.velocity-card', { clearProps: 'all' });
      gsap.set('.project-image', { clearProps: 'all' });
      gsap.set('.project-info', { clearProps: 'all' });
      gsap.set('.big-project-velocity-scale', { clearProps: 'transform' });
      ScrollTrigger.refresh();
      if (expandedProjectIds.size > 0) {
        setExpandedProjectIds(new Set());
        window.history.pushState(null, '', '/');
      }
    }
  }, [isMobileView, expandedProjectIds.size]);

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

        .big-project-thumb-shell {
          width: 90vw;
          will-change: transform;
        }

        .big-project-velocity-scale {
          transform: scale(1);
          transform-origin: center center;
          will-change: transform;
        }

        /* BIG.DK: transition mượt mà cho ảnh và card khi layout thay đổi */
        .project-image,
        .velocity-card {
          transition: transform 0.78s cubic-bezier(0.45, 0, 0.55, 1),
                      opacity 0.78s cubic-bezier(0.45, 0, 0.55, 1);
        }

        @media (min-width: 640px) {
          .big-project-thumb-shell {
            width: 350px;
          }
        }

        @media (min-width: 1024px) {
          .big-project-thumb-shell {
            width: 48vh;
          }
        }
      `}</style>

      <div
        ref={containerRef}
        className="w-full bg-white relative pt-24 md:pt-[90px] pb-[20vh] overflow-hidden z-10"
      >
        <div
          className="projects-scaler origin-top will-change-transform"
          style={{
            transformOrigin: '50% 0%',
            transform: 'translate3d(0, 0, 0)',
          }}
        >
          <div className="flex flex-col items-center w-full transition-all duration-500">
            {projects
              .filter(p => {
                if (activeCategory && p.category !== activeCategory) return false;
                if (activeSubcategory && p.subcategory !== activeSubcategory) return false;
                return true;
              })
              .map((project, index) => {
                const isExpanded = expandedProjectIds.has(project._id);
                const isMobilePortal = isExpanded && isMobileView;
                // rowStyle: không dùng CSS transition vì GSAP (FLIP) điều khiển animation height
                const rowStyle = isMobilePortal
                  ? { height: 0, maxHeight: 0, overflow: 'visible' }
                  : isExpanded
                    ? {
                        height: '75vh',     // React's static target — GSAP animate TỚI ĐÂY
                        maxHeight: '75vh',
                        overflow: 'hidden', // GSAP sẽ override inline rồi clear sau khi xong
                        willChange: 'height',
                      }
                    : {
                        height: 'auto',
                        maxHeight: 'none',
                        overflow: 'visible',
                      };
                // Desktop expanded: w-full của containerRef (không bị max-w/px constraint)
                // Mobile expanded: placeholder vô hình (portal đảm nhận)
                // Collapsed: max-w + px + mx-auto được áp dụng trực tiếp trên item
                return (
                  <div
                    key={project._id || index}
                    id={`project-${project._id}`}
                    style={rowStyle}
                    className={`${isMobilePortal
                      ? 'relative w-full h-0 min-h-0 z-50 my-0 overflow-visible pointer-events-none'
                      : isExpanded
                        ? 'relative w-full z-50 mb-[26px] lg:mb-[29px]'  // Đồng bộ margin-bottom với collapsed, loại bỏ margin-top lệch
                        : 'relative w-full mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 max-w-[1800px] flex justify-center items-center max-w-[1600px] h-auto mb-[26px] lg:mb-[29px]'
                      }`}
                  >
                    {!isExpanded ? (
                      <div className="project-row w-full flex justify-center items-start group">
                        <div className="velocity-card relative flex flex-col md:inline-flex md:flex-row items-center">

                          {/* 1. COVER IMAGE WRAPPER */}
                          <div className="big-project-thumb-shell shrink-0 project-image overflow-hidden relative">
                            <div className="big-project-velocity-scale h-full w-full">
                              {/* Đã bỏ layoutId — tránh conflict với GSAP FLIP container animation. */}
                              <div
                                onClick={() => handleSelectProject(project)}
                                className="big-project-image-box relative w-full overflow-hidden cursor-pointer group"
                                style={{ aspectRatio: '4 / 3', willChange: 'transform' }}
                              >
                                <Image
                                  src={project.general?.coverImage || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2070'}
                                  alt={project.general?.title || 'Preview'}
                                  fill
                                  style={{ objectFit: 'cover' }}
                                  priority={index < 4}
                                  sizes="(max-width: 768px) 90vw, 64vh"
                                  className="object-cover"
                                />
                                <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                              </div>
                            </div>
                          </div>

                          {/* 1. KHỐI THÔNG TIN (Info Block) */}
                          <div
                            onClick={(e) => { e.preventDefault(); handleSelectProject(project); }}
                            // Đổi thành items-start để text và icon bằng nhau ở mép trên
                            className="project-info bottom-0 mt-[14px] flex items-start shrink-0 bg-white z-20 cursor-pointer w-[90vw] sm:w-auto md:absolute md:top-0 md:-left-[30px] md:mt-0 md:mr-[30px] md:max-w-[324px] md:-translate-x-full md:flex-col md:items-end md:text-right lg:-left-[44px] lg:mr-[44px]"
                          >
                            {/* Container chứa Tên và Địa điểm - Xóa bỏ justify-center */}
                            <div className="md:mt-[18px] md:ml-0 lg:mt-[24px]">

                              {/* TITLE: Thêm leading-[15px] và font-normal để ép sát khoảng cách dòng */}
                              <h3 className="text-[15px] leading-[15px] font-normal break-words m-0 p-0 text-black sm:text-[13px] sm:max-w-[30vw] md:text-[14px] md:max-w-[170px] lg:text-[18px] lg:leading-[20px] lg:max-w-none transition-opacity hover:opacity-70">
                                {project.general?.title}
                              </h3>

                              {/* LOCATION: Chỉnh lại margin-top và tracking */}
                              <p className="mt-[4px] text-[11px] text-[#797979] uppercase tracking-wider font-medium md:mt-[4px] md:text-[12px] lg:mt-[6px] lg:text-[15px]">
                                {project.general?.location}
                              </p>
                            </div>
                          </div>

                        </div>
                      </div>
                    ) : isMobileView ? null : (
                      // Desktop: inline trong feed, w-full = 100% containerRef = full viewport width
                      <InlineProjectDetail
                        project={project}
                        onClose={() => handleCloseProject(project._id)}
                        layoutId={`img-container-${project._id}`}
                        isLoading={false}
                      />
                    )}
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    </>
  );
}
