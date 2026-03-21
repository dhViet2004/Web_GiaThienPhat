'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, Trees, Sofa, LayoutTemplate, Video, ImageIcon, Loader2 } from 'lucide-react';

const IconMap = {
  Building2: Building2,
  Trees: Trees,
  Sofa: Sofa,
  LayoutTemplate: LayoutTemplate,
  Video: Video,
  Image: ImageIcon
};

// Helper to get text blocks
function getTextBlock(project) {
  const textBlock = project.blocks?.find(b => b.type === 'text');
  return textBlock?.content || '';
}

// Helper to get slider images from slider blocks
function getSliderImages(project) {
  const sliderBlocks = project.blocks?.filter(b => b.type === 'slider');
  const images = [];
  const seenUrls = new Set();
  sliderBlocks.forEach(block => {
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

// Helper to get year from general or createdAt
function getProjectYear(project) {
  if (project.general?.year) return project.general.year;
  if (project.createdAt) {
    return new Date(project.createdAt).getFullYear().toString();
  }
  return '2024';
}

export default function ProjectDetailOverlay({ project, onClose, isLoading }) {
  const containerRef = useRef(null);
  const scrollRef = useRef(null);
  const [activeSlide, setActiveSlide] = useState(0);
  
  // Mouse drag state
  const [isDragging, setIsDragging] = useState(false);
  const [isVerticalSwipe, setIsVerticalSwipe] = useState(false);
  const dragState = useRef({
    startX: 0,
    startY: 0,
    scrollLeft: 0,
    velocity: 0,
    lastX: 0,
    lastTime: 0,
    movedX: false
  });
  
  // Inertia animation
  const animationRef = useRef(null);

  // Get data from blocks array
  const description = getTextBlock(project);
  const sliderImages = getSliderImages(project);
  const projectYear = getProjectYear(project);
  
  // Get all image blocks
  let allImageUrls = [];
  
  if (project.blocks && Array.isArray(project.blocks)) {
    project.blocks.forEach(block => {
      if (block.type === 'image' && block.url) {
        allImageUrls.push({ url: block.url, caption: block.caption });
      }
    });
  }
  
  if (project.sliderGallery && Array.isArray(project.sliderGallery)) {
    project.sliderGallery.forEach(url => {
      if (url) {
        allImageUrls.push({ url: url, caption: '' });
      }
    });
  }
  
  const seenUrls = new Set();
  const imageBlocks = allImageUrls.filter(img => {
    if (seenUrls.has(img.url)) return false;
    seenUrls.add(img.url);
    return true;
  });

  /** 首段描述 + 首张图合并为同一横向滑块时，避免重复渲染第一张图 */
  const descPairedWithFirstImage = Boolean(description && imageBlocks[0]);
  const galleryImageBlocks = descPairedWithFirstImage ? imageBlocks.slice(1) : imageBlocks;
  const firstGalleryBlock = imageBlocks[0];

  const normalizeDescriptionText = (text) =>
    String(text || '').replace(/\bDESCRITION\b/gi, 'DESCRIPTION');

  // Stop inertia animation
  const stopInertia = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
  }, []);

  // Apply inertia/momentum scroll
  const applyInertia = useCallback(() => {
    const container = scrollRef.current;
    if (!container || Math.abs(dragState.current.velocity) < 0.5) {
      dragState.current.velocity = 0;
      return;
    }

    container.scrollLeft -= dragState.current.velocity;
    dragState.current.velocity *= 0.95; // Friction

    animationRef.current = requestAnimationFrame(applyInertia);
  }, []);

  // Mouse down handler
  const handleMouseDown = useCallback((e) => {
    if (e.button !== 0) return; // Only left mouse button
    
    const container = scrollRef.current;
    if (!container) return;

    stopInertia();
    
    setIsDragging(true);
    setIsVerticalSwipe(false);
    dragState.current = {
      startX: e.pageX,
      startY: e.pageY,
      scrollLeft: container.scrollLeft,
      velocity: 0,
      lastX: e.pageX,
      lastTime: Date.now(),
      movedX: false
    };

    container.style.cursor = 'grabbing';
    container.style.userSelect = 'none';
  }, [stopInertia]);

  // Mouse move handler
  const handleMouseMove = useCallback((e) => {
    if (!isDragging) return;
    
    const container = scrollRef.current;
    if (!container) return;

    const deltaX = e.pageX - dragState.current.startX;
    const deltaY = e.pageY - dragState.current.startY;
    
    // Check if this is a horizontal or vertical swipe
    if (!dragState.current.movedX) {
      if (Math.abs(deltaX) > 10 || Math.abs(deltaY) > 10) {
        dragState.current.movedX = Math.abs(deltaX) > Math.abs(deltaY);
        if (!dragState.current.movedX) {
          setIsVerticalSwipe(true);
        }
      }
    }
    
    // Only handle horizontal scroll if not a vertical swipe
    if (!isVerticalSwipe && dragState.current.movedX) {
      const x = e.pageX - container.offsetLeft;
      const walk = (e.pageX - dragState.current.startX) * 1.2;
      container.scrollLeft = dragState.current.scrollLeft - walk;

      // Calculate velocity
      const now = Date.now();
      const dt = now - dragState.current.lastTime;
      if (dt > 0) {
        const dx = e.pageX - dragState.current.lastX;
        dragState.current.velocity = dx / dt * 16;
      }
      dragState.current.lastX = e.pageX;
      dragState.current.lastTime = now;
    }
  }, [isDragging, isVerticalSwipe]);

  // Mouse up handler
  const handleMouseUp = useCallback(() => {
    if (!isDragging) return;
    
    const container = scrollRef.current;
    if (container) {
      container.style.cursor = 'grab';
      container.style.userSelect = '';
    }
    
    setIsDragging(false);
    
    // Check if it was a vertical swipe
    if (isVerticalSwipe) {
      const deltaY = dragState.current.startY - (dragState.current.lastY || dragState.current.startY);
      // If swiped down significantly, close
      if (deltaY < -50 || (dragState.current.lastY - dragState.current.startY > 80)) {
        onClose();
      }
    } else {
      // Apply inertia for horizontal scroll
      if (Math.abs(dragState.current.velocity) > 1) {
        applyInertia();
      }
    }
    
    setIsVerticalSwipe(false);
  }, [isDragging, isVerticalSwipe, onClose, applyInertia]);

  // Mouse leave handler
  const handleMouseLeave = useCallback(() => {
    if (isDragging) {
      handleMouseUp();
    }
  }, [isDragging, handleMouseUp]);

  // Touch handlers for mobile
  const handleTouchStart = useCallback((e) => {
    if (e.touches.length !== 1) return;
    
    const container = scrollRef.current;
    if (!container) return;

    stopInertia();
    
    const touch = e.touches[0];
    setIsDragging(true);
    setIsVerticalSwipe(false);
    dragState.current = {
      startX: touch.clientX,
      startY: touch.clientY,
      scrollLeft: container.scrollLeft,
      velocity: 0,
      lastX: touch.clientX,
      lastTime: Date.now(),
      movedX: false
    };
  }, [stopInertia]);

  const handleTouchMove = useCallback((e) => {
    if (!isDragging || e.touches.length !== 1) return;
    
    const container = scrollRef.current;
    if (!container) return;

    const touch = e.touches[0];
    const deltaX = touch.clientX - dragState.current.startX;
    const deltaY = touch.clientY - dragState.current.startY;
    
    // Check if this is a horizontal or vertical swipe
    if (!dragState.current.movedX) {
      if (Math.abs(deltaX) > 10 || Math.abs(deltaY) > 10) {
        dragState.current.movedX = Math.abs(deltaX) > Math.abs(deltaY);
        if (!dragState.current.movedX) {
          setIsVerticalSwipe(true);
        }
      }
    }
    
    // Only handle horizontal scroll if not a vertical swipe
    if (!isVerticalSwipe && dragState.current.movedX) {
      const walk = (touch.clientX - dragState.current.startX) * 1.2;
      container.scrollLeft = dragState.current.scrollLeft - walk;

      const now = Date.now();
      const dt = now - dragState.current.lastTime;
      if (dt > 0) {
        const dx = touch.clientX - dragState.current.lastX;
        dragState.current.velocity = dx / dt * 16;
      }
      dragState.current.lastX = touch.clientX;
      dragState.current.lastTime = now;
    }
  }, [isDragging, isVerticalSwipe]);

  const handleTouchEnd = useCallback(() => {
    handleMouseUp();
  }, [handleMouseUp]);

  // Wheel handler for vertical scroll to close
  useEffect(() => {
    const handleWheel = (e) => {
      // Chỉ cần cuộn nhẹ là đóng overlay
      if (Math.abs(e.deltaY) > 3 && !isDragging) {
        onClose();
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => window.removeEventListener('wheel', handleWheel);
  }, [onClose, isDragging]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopInertia();
    };
  }, [stopInertia]);

  const coverImageUrl = project.general?.coverImage || '/placeholder.jpg';
  const ProjectIcon = IconMap[project.general?.icon] || Building2;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-[100] bg-white text-black overflow-hidden font-sans"
    >
      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 z-[200] bg-white flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-black" />
            <span className="text-xs uppercase tracking-[0.2em] text-gray-500">Loading project details...</span>
          </div>
        </div>
      )}

      {/* Horizontal scroll container with mouse drag */}
      <div 
        ref={scrollRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="absolute inset-0 h-screen w-screen overflow-x-auto overflow-y-hidden scrollbar-hidden"
        style={{ 
          cursor: 'grab',
          scrollBehavior: 'auto',
          WebkitOverflowScrolling: 'touch'
        }}
      >
        <div className="h-full flex flex-nowrap items-center gap-[5vw] lg:gap-16 pl-[5vw] pr-[5vw] lg:pr-[calc(50vw-57vh)]">
          
          {/* Smart Spacer */}
          <div 
            className="relative z-50 hidden lg:block h-px shrink-0 flex-[0_0_auto]" 
            style={{ width: 'calc(50vw - 57vh - 64px)' }} 
          />

          {/* BLOCK 1: COVER IMAGE & TITLE */}
          <div className="relative h-full flex flex-col justify-center flex-[0_0_auto] shrink-0 pt-[12vh] pb-[12vh] pointer-events-none select-none">
            {/* Title & Location */}
            <div className="absolute top-0 right-full mr-[30px] lg:mr-[44px] w-[300px] flex flex-col items-end text-right z-20 pt-[12vh]">
              <div className="size-[38px] lg:size-[50px] bg-black text-white flex items-center justify-center mb-6">
                <ProjectIcon size={24} strokeWidth={1.5} />
              </div>
              <h1 className="text-xl lg:text-3xl font-bold uppercase tracking-tighter leading-none m-0 p-0 break-words w-full">
                {project.general?.title || 'Untitled Project'}
              </h1>
              <p className="mt-2 text-[10px] lg:text-[12px] text-[#797979] uppercase tracking-[0.3em] font-medium mb-12">
                {project.general?.location || ''}
              </p>

              <div className="hidden lg:flex flex-col items-end w-full space-y-4">
                <div>
                  <h4 className="text-[9px] text-[#797979] uppercase tracking-widest mb-1">Client</h4>
                  <p className="text-[11px] text-black uppercase font-bold tracking-wider">{project.general?.client || 'N/A'}</p>
                </div>
                <div>
                  <h4 className="text-[9px] text-[#797979] uppercase tracking-widest mb-1">Typology</h4>
                  <p className="text-[11px] text-black uppercase font-bold tracking-wider">{project.general?.typology || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Main Cover Image with shared-element transition */}
            <motion.div
              layoutId={`project-image-${project._id}`}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="relative shrink-0 shadow-sm will-change-transform"
              style={{ aspectRatio: '3 / 2', height: '76vh', width: 'auto' }}
            >
              <Image
                src={coverImageUrl}
                alt="Cover"
                fill
                priority
                sizes="90vw"
                draggable={false}
                className="object-cover select-none pointer-events-none"
              />
            </motion.div>
          </div>

          {/* BLOCK 2: DESCRIPTION — 单独文本；或与首张图片合并为同一列（见下方） */}
          {description && !descPairedWithFirstImage && (
            <div className="h-full flex flex-col shrink-0 lg:pt-[12vh] lg:pb-[12vh] justify-start pt-[20vh] pointer-events-none select-none">
               <div className="w-[290px] min-w-0 max-w-[min(290px,85vw)] text-[13px] leading-[1.6] text-black uppercase tracking-tight opacity-80">
                 <h3 className="text-[10px] lg:text-[11px] font-bold uppercase tracking-[0.2em] text-[#797979] mb-3">DESCRIPTION</h3>
                 <p className="whitespace-pre-wrap break-words [overflow-wrap:anywhere] break-all">{normalizeDescriptionText(description)}</p>
               </div>
            </div>
          )}

          {/* 描述 + 首张图：内部 gap-x 须与上方轨道 gap 一致，否则「封面→文字」与「文字→图」视觉间距不对称 */}
          {descPairedWithFirstImage && firstGalleryBlock && (
            <div className="h-full flex flex-row flex-nowrap gap-x-[5vw] lg:gap-x-16 shrink-0 flex-[0_0_auto] items-center lg:pt-[12vh] lg:pb-[12vh] pt-[20vh] pointer-events-none select-none self-center isolate">
              {/* min-w-0 + break-all：避免长路径/无空格字符串溢出盖住右侧图片 */}
              <div className="w-[290px] min-w-0 max-w-[min(290px,42vw)] shrink-0 text-[13px] leading-[1.6] text-black uppercase tracking-tight opacity-80 pr-1">
                <h3 className="text-[10px] lg:text-[11px] font-bold uppercase tracking-[0.2em] text-[#797979] mb-3">DESCRIPTION</h3>
                <p className="whitespace-pre-wrap break-words [overflow-wrap:anywhere] break-all">{normalizeDescriptionText(description)}</p>
              </div>
              <div className="relative z-0 h-[76vh] aspect-[3/2] w-auto max-w-[min(90vw,960px)] shrink-0 shadow-sm overflow-hidden">
                {firstGalleryBlock.url && (
                  <Image
                    src={firstGalleryBlock.url}
                    alt={firstGalleryBlock.caption || 'Gallery 1'}
                    fill
                    sizes="90vw"
                    draggable={false}
                    className="object-cover"
                  />
                )}
                {firstGalleryBlock.caption && (
                  <div className="absolute bottom-4 left-4 bg-black/70 text-white text-[10px] px-2 py-1 uppercase tracking-wider">
                    {firstGalleryBlock.caption}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* BLOCK 3: SLIDER */}
          {sliderImages.length > 0 && (
            <div 
              className="relative h-[76vh] aspect-[3/2] flex-[0_0_auto] shrink-0 self-center overflow-hidden shadow-sm bg-gray-50 pointer-events-auto"
              onClick={() => setActiveSlide((prev) => (prev + 1) % sliderImages.length)}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeSlide}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.6 }}
                  className="absolute inset-0"
                >
                  <Image
                    src={sliderImages[activeSlide]}
                    alt={`Slide ${activeSlide + 1}`}
                    fill
                    sizes="90vw"
                    draggable={false}
                    className="object-cover select-none"
                  />
                </motion.div>
              </AnimatePresence>
              
              <div className="absolute bottom-6 right-6 text-[10px] font-bold tracking-widest bg-white px-3 py-1.5 uppercase">
                {activeSlide + 1} / {sliderImages.length}
              </div>
            </div>
          )}

          {/* BLOCK 4: GALLERY IMAGES */}
          {galleryImageBlocks.map((block, idx) => (
            <div key={`gallery-${descPairedWithFirstImage ? idx + 1 : idx}`} className="relative h-[76vh] aspect-[3/2] flex-[0_0_auto] shrink-0 self-center shadow-sm pointer-events-none select-none">
              {block.url && (
                <Image
                  src={block.url}
                  alt={block.caption || `Gallery ${idx + 1}`}
                  fill
                  sizes="90vw"
                  draggable={false}
                  className="object-cover"
                />
              )}
              {block.caption && (
                <div className="absolute bottom-4 left-4 bg-black/70 text-white text-[10px] px-2 py-1 uppercase tracking-wider">
                  {block.caption}
                </div>
              )}
            </div>
          ))}

          {/* Credits Block */}
          <div className="h-[76vh] self-center flex flex-col flex-wrap gap-x-12 gap-y-6 pt-12 pointer-events-none select-none shrink-0">
            <div className="w-[200px]">
              <h4 className="text-[9px] text-[#797979] uppercase tracking-widest mb-3 border-b border-gray-100 pb-2">Status</h4>
              <p className="text-[11px] text-black uppercase font-bold tracking-wider">{project.general?.status || 'Completed'}</p>
            </div>
            <div className="w-[200px]">
              <h4 className="text-[9px] text-[#797979] uppercase tracking-widest mb-3 border-b border-gray-100 pb-2">Year</h4>
              <p className="text-[11px] text-black uppercase font-bold tracking-wider">{projectYear}</p>
            </div>
          </div>

          {/* End spacer */}
          <div className="shrink-0 w-[5vw]" />
        </div>
      </div>

      {/* Drag indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50 pointer-events-none opacity-40">
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-black">
          <span className="w-8 h-px bg-black"></span>
          <span>Kéo để xem</span>
          <span className="w-8 h-px bg-black"></span>
        </div>
      </div>

      <style jsx global>{`
        .scrollbar-hidden::-webkit-scrollbar { display: none; }
        .scrollbar-hidden { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </motion.div>
  );
}
