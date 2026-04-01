'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, Trees, Sofa, LayoutTemplate, Video, ImageIcon, Loader2 } from 'lucide-react';
import { apiGet } from '@/lib/api';

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

export default function ProjectDetailPage({ params }) {
  const { slug: projectId } = React.use(params);
  const router = useRouter();
  
  const scrollRef = useRef(null);
  const mainImageCardRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [projectData, setProjectData] = useState(null);
  const [prevProject, setPrevProject] = useState(null);
  const [nextProject, setNextProject] = useState(null);
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

  // Fetch project data
  useEffect(() => {
    if (!projectId) return;
    
    setIsLoading(true);
    apiGet(`/api/projects/${projectId}`)
      .then(data => {
        if (data.error) {
          setIsLoading(false);
          return;
        }
        setProjectData(data.project || data);
        setPrevProject(data.previousProject || (data.previousProjectId ? { _id: data.previousProjectId } : null));
        setNextProject(data.nextProject || (data.nextProjectId ? { _id: data.nextProjectId } : null));
        setIsLoading(false);
      })
      .catch(err => {
        console.error('Error fetching project:', err);
        setIsLoading(false);
      });
  }, [projectId]);

  // Get data from blocks array
  const description = projectData ? getTextBlock(projectData) : '';
  const sliderImages = projectData ? getSliderImages(projectData) : [];
  const projectYear = projectData ? getProjectYear(projectData) : '';
  
  // Get all image blocks
  let allImageUrls = [];
  if (projectData?.blocks && Array.isArray(projectData.blocks)) {
    projectData.blocks.forEach(block => {
      if (block.type === 'image' && block.url) {
        allImageUrls.push({ url: block.url, caption: block.caption });
      }
    });
  }
  
  if (projectData?.sliderGallery && Array.isArray(projectData.sliderGallery)) {
    projectData.sliderGallery.forEach(url => {
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
    dragState.current.velocity *= 0.95;
    animationRef.current = requestAnimationFrame(applyInertia);
  }, []);

  const handleMouseDown = useCallback((e) => {
    if (e.button !== 0) return;
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

  const handleMouseMove = useCallback((e) => {
    if (!isDragging) return;
    const container = scrollRef.current;
    if (!container) return;
    const deltaX = e.pageX - dragState.current.startX;
    const deltaY = e.pageY - dragState.current.startY;
    if (!dragState.current.movedX) {
      if (Math.abs(deltaX) > 10 || Math.abs(deltaY) > 10) {
        dragState.current.movedX = Math.abs(deltaX) > Math.abs(deltaY);
        if (!dragState.current.movedX) setIsVerticalSwipe(true);
      }
    }
    if (!isVerticalSwipe && dragState.current.movedX) {
      const walk = (e.pageX - dragState.current.startX) * 1.2;
      container.scrollLeft = dragState.current.scrollLeft - walk;
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

  const handleMouseUp = useCallback(() => {
    if (!isDragging) return;
    const container = scrollRef.current;
    if (container) {
      container.style.cursor = 'grab';
      container.style.userSelect = '';
    }
    setIsDragging(false);
    if (isVerticalSwipe) {
      const deltaY = dragState.current.startY - (dragState.current.lastY || dragState.current.startY);
      if (deltaY < -50 && prevProject?._id) {
        router.push(`/projects/${prevProject._id}`);
      } else if (deltaY > 50 && nextProject?._id) {
        router.push(`/projects/${nextProject._id}`);
      } else if (Math.abs(deltaY) > 80) {
        router.push('/');
      }
    } else {
      if (Math.abs(dragState.current.velocity) > 1) {
        applyInertia();
      }
    }
    setIsVerticalSwipe(false);
  }, [isDragging, isVerticalSwipe, prevProject, nextProject, router, applyInertia]);

  const handleMouseLeave = useCallback(() => {
    if (isDragging) handleMouseUp();
  }, [isDragging, handleMouseUp]);

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
    if (!dragState.current.movedX) {
      if (Math.abs(deltaX) > 10 || Math.abs(deltaY) > 10) {
        dragState.current.movedX = Math.abs(deltaX) > Math.abs(deltaY);
        if (!dragState.current.movedX) setIsVerticalSwipe(true);
      }
    }
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

  // Wheel handler for navigation
  useEffect(() => {
    const handleWheel = (e) => {
      const container = scrollRef.current;
      if (!container) return;
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
      const atStart = container.scrollLeft <= 0;
      const atEnd = container.scrollLeft + container.clientWidth >= container.scrollWidth - 2;
      if (!isDragging) {
        if (atEnd && e.deltaY > 0 && nextProject?._id) {
          router.push(`/projects/${nextProject._id}`);
          return;
        }
        if (atStart && e.deltaY < 0 && prevProject?._id) {
          router.push(`/projects/${prevProject._id}`);
          return;
        }
      }
      if (Math.abs(e.deltaY) > 3 && !isDragging) {
        router.push('/');
      }
    };
    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => window.removeEventListener('wheel', handleWheel);
  }, [isDragging, prevProject, nextProject, router]);

  // Cleanup on unmount
  useEffect(() => {
    return () => { stopInertia(); };
  }, [stopInertia]);

  // Center the cover image in viewport on load
  const centerMainImageInViewport = useCallback(() => {
    const scrollEl = scrollRef.current;
    const card = mainImageCardRef.current;
    if (!scrollEl || !card) return;
    const cardRect = card.getBoundingClientRect();
    const scrollRect = scrollEl.getBoundingClientRect();
    const targetX = scrollRect.left + scrollRect.width / 2;
    const cardCenterX = cardRect.left + cardRect.width / 2;
    const delta = cardCenterX - targetX;
    scrollEl.scrollLeft = Math.max(0, scrollEl.scrollLeft + delta);
  }, []);

  useEffect(() => {
    if (isLoading || !projectData) return;
    const scrollEl = scrollRef.current;
    if (!scrollEl) return;
    const initialScroll = Math.min(80, scrollEl.scrollWidth - scrollEl.clientWidth);
    scrollEl.scrollLeft = initialScroll;
    requestAnimationFrame(() => { centerMainImageInViewport(); });
  }, [projectId, isLoading, centerMainImageInViewport]);

  if (isLoading || !projectData) {
    return (
      <div className="fixed inset-0 z-100 bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-black" />
          <span className="text-xs uppercase tracking-[0.2em] text-gray-500">Loading project details...</span>
        </div>
      </div>
    );
  }

  const ProjectIcon = IconMap[projectData.general?.icon] || Building2;

  return (
    <div className="fixed inset-0 z-[100] bg-white text-black overflow-hidden font-sans">
      
      {/* Close button */}
      <Link href="/" className="fixed top-8 right-8 z-[200] cursor-pointer text-black hover:opacity-50 transition-opacity p-2">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </Link>

      {/* Horizontal scroll container */}
      <div 
        ref={scrollRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="absolute inset-0 h-screen w-screen overflow-x-auto overflow-y-hidden scrollbar-hidden img-sync-height"
        style={{ 
          cursor: 'grab',
          scrollBehavior: 'auto',
          WebkitOverflowScrolling: 'touch'
        }}
      >
        <div className="h-full flex flex-nowrap items-center gap-[20px] lg:gap-[30px] pl-[20px] lg:pl-[35px] pr-[20px] lg:pr-[35px]">

          {/* LEADING SPACER */}
          <div className="shrink-0 w-[clamp(0px,6vw,48px)]" aria-hidden />

          {/* CARD 1: Title + Icon + location + meta */}
          <div className="h-full flex flex-col justify-center shrink-0 w-[min(220px,50vw)] lg:w-[320px] pointer-events-none select-none text-right">
            <div className="size-[38px] lg:size-[50px] bg-black text-white flex items-center justify-end ml-auto mb-6">
              <ProjectIcon size={24} strokeWidth={1.5} />
            </div>
            <h1 className="text-xl lg:text-3xl font-bold uppercase tracking-tighter leading-none break-words w-full">
              {projectData.general?.title || 'Untitled Project'}
            </h1>
            <p className="mt-2 text-[10px] lg:text-[12px] text-[#797979] uppercase tracking-[0.3em] font-medium mb-8">
              {projectData.general?.location || ''}
            </p>
            <div className="flex flex-col gap-4 items-end">
              <div>
                <h4 className="text-[9px] text-[#797979] uppercase tracking-widest mb-1">Client</h4>
                <p className="text-[11px] text-black uppercase font-bold tracking-wider">{projectData.general?.client || 'N/A'}</p>
              </div>
              <div>
                <h4 className="text-[9px] text-[#797979] uppercase tracking-widest mb-1">Typology</h4>
                <p className="text-[11px] text-black uppercase font-bold tracking-wider">{projectData.general?.typology || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* CARD 2: Cover image — căn giữa viewport */}
          <div
            ref={mainImageCardRef}
            className="h-full flex items-center shrink-0 w-[min(70vw,320px)] lg:w-[500px] pointer-events-none select-none"
          >
            <div
              className="relative z-0 shrink-0 w-auto shadow-sm overflow-hidden flex items-center justify-center"
              style={{ height: 'var(--img-h)' }}
            >
              <Image
                src={projectData.general?.coverImage || '/placeholder.jpg'}
                alt="Cover"
                width={0}
                height={0}
                sizes="(max-width: 1024px) 70vw, 500px"
                style={{ width: 'auto', height: '100%', maxWidth: '100%' }}
                priority
                draggable={false}
                className="object-contain select-none pointer-events-none max-h-full w-auto max-w-full mx-auto"
              />
            </div>
          </div>

          {/* CARD 3a: Description + first gallery image PAIRED */}
          {descPairedWithFirstImage && firstGalleryBlock && (
            <div className="h-full flex items-center shrink-0 w-[min(90vw,420px)] lg:w-[450px] gap-x-4 lg:gap-x-6 pointer-events-none select-none">
              <div
                className="shrink-0 w-[290px] min-w-0 text-[13px] leading-[1.6] text-black uppercase tracking-tight opacity-80 pr-1 self-center"
              >
                <h3 className="text-[10px] lg:text-[11px] font-bold uppercase tracking-[0.2em] text-[#797979] mb-3">DESCRIPTION</h3>
                <p className="whitespace-pre-wrap wrap-anywhere break-all">{normalizeDescriptionText(description)}</p>
              </div>
              <div
                className="relative z-0 shrink-0 w-auto shadow-sm overflow-hidden flex items-center justify-center"
                style={{ height: 'var(--img-h)' }}
              >
                {firstGalleryBlock.url && (
                  <Image
                    src={firstGalleryBlock.url}
                    alt={firstGalleryBlock.caption || 'Gallery 1'}
                    width={0}
                    height={0}
                    sizes="50vw"
                    style={{ width: 'auto', height: '100%', maxWidth: '100%' }}
                    draggable={false}
                    className="object-contain select-none pointer-events-none max-h-full w-auto max-w-full mx-auto"
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

          {/* CARD 3b: Description alone (no paired first image) */}
          {description && !descPairedWithFirstImage && (
            <div className="h-full flex items-center shrink-0 w-[min(300px,75vw)] lg:w-[320px] pointer-events-none select-none">
              <div className="w-full text-[13px] leading-[1.6] text-black uppercase tracking-tight opacity-80">
                <h3 className="text-[10px] lg:text-[11px] font-bold uppercase tracking-[0.2em] text-[#797979] mb-3">DESCRIPTION</h3>
                <p className="whitespace-pre-wrap wrap-anywhere break-all">{normalizeDescriptionText(description)}</p>
              </div>
            </div>
          )}

          {/* CARD 4: Slider */}
          {sliderImages.length > 0 && (
            <div
              className="h-full flex items-center shrink-0 w-[min(75vw,340px)] lg:w-[500px] shadow-sm bg-gray-50 pointer-events-auto cursor-pointer"
              onClick={() => setActiveSlide((prev) => (prev + 1) % sliderImages.length)}
            >
              <div
                className="relative z-0 shrink-0 w-auto shadow-sm overflow-hidden flex items-center justify-center"
                style={{ height: 'var(--img-h)' }}
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeSlide}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.6 }}
                    className="relative w-auto h-full flex items-center justify-center"
                  >
                    <Image
                      src={sliderImages[activeSlide]}
                      alt={`Slide ${activeSlide + 1}`}
                      width={0}
                      height={0}
                      sizes="(max-width: 1024px) 75vw, 500px"
                      style={{ width: 'auto', height: '100%', maxWidth: '100%' }}
                      draggable={false}
                      className="object-contain select-none pointer-events-none max-h-full w-auto max-w-full mx-auto"
                    />
                  </motion.div>
                </AnimatePresence>
                <div className="absolute bottom-6 right-6 text-[10px] font-bold tracking-widest bg-white px-3 py-1.5 uppercase">
                  {activeSlide + 1} / {sliderImages.length}
                </div>
              </div>
            </div>
          )}

          {/* CARD 5: Gallery images */}
          {galleryImageBlocks.map((block, idx) => (
            <div
              key={`gallery-${descPairedWithFirstImage ? idx + 1 : idx}`}
              className="h-full flex items-center shrink-0 w-auto max-w-[min(75vw,500px)] lg:max-w-[500px] pointer-events-none select-none"
            >
              <div
                className="relative z-0 shrink-0 w-auto shadow-sm overflow-hidden flex items-center justify-center"
                style={{ height: 'var(--img-h)' }}
              >
                {block.url && (
                  <Image
                    src={block.url}
                    alt={block.caption || `Gallery ${idx + 1}`}
                    width={0}
                    height={0}
                    sizes="(max-width: 1024px) 75vw, 500px"
                    style={{ width: 'auto', height: '100%', maxWidth: '100%' }}
                    draggable={false}
                    className="object-contain select-none pointer-events-none max-h-full w-auto max-w-full mx-auto"
                  />
                )}
                {block.caption && (
                  <div className="absolute bottom-4 left-4 bg-black/70 text-white text-[10px] px-2 py-1 uppercase tracking-wider">
                    {block.caption}
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* CARD 6: Status + Year */}
          <div className="h-full flex flex-col justify-center shrink-0 w-[min(180px,45vw)] lg:w-[240px] gap-8 pointer-events-none select-none">
            <div>
              <h4 className="text-[9px] text-[#797979] uppercase tracking-widest mb-3 border-b border-gray-100 pb-2">Status</h4>
              <p className="text-[11px] text-black uppercase font-bold tracking-wider">{projectData.general?.status || 'Completed'}</p>
            </div>
            <div>
              <h4 className="text-[9px] text-[#797979] uppercase tracking-widest mb-3 border-b border-gray-100 pb-2">Year</h4>
              <p className="text-[11px] text-black uppercase font-bold tracking-wider">{projectYear}</p>
            </div>
          </div>

          {/* End spacer */}
          <div className="shrink-0 w-[5vw]" />
        </div>
      </div>

      {/* Drag indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-[150] pointer-events-none opacity-40">
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-black">
          <span className="w-8 h-px bg-black"></span>
          <span>Kéo ngang để xem</span>
          <span className="w-8 h-px bg-black"></span>
        </div>
      </div>

      <style jsx global>{`
        .scrollbar-hidden::-webkit-scrollbar { display: none; }
        .scrollbar-hidden { -ms-overflow-style: none; scrollbar-width: none; }
        .img-sync-height {
          --img-h: min(36vh, 220px);
        }
        .img-sync-height > div {
          height: 100%;
        }
        @media (min-width: 640px) {
          .img-sync-height {
            --img-h: min(42vh, 300px);
          }
        }
        @media (min-width: 768px) {
          .img-sync-height {
            --img-h: min(48vh, 360px);
          }
        }
        @media (min-width: 1024px) {
          .img-sync-height {
            --img-h: min(52vh, 440px);
          }
        }
        @media (min-width: 1280px) {
          .img-sync-height {
            --img-h: min(58vh, 500px);
          }
        }
      `}</style>
    </div>
  );
}
