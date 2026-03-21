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

  // Mouse down handler
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

  // Mouse move handler
  const handleMouseMove = useCallback((e) => {
    if (!isDragging) return;
    
    const container = scrollRef.current;
    if (!container) return;

    const deltaX = e.pageX - dragState.current.startX;
    const deltaY = e.pageY - dragState.current.startY;
    
    if (!dragState.current.movedX) {
      if (Math.abs(deltaX) > 10 || Math.abs(deltaY) > 10) {
        dragState.current.movedX = Math.abs(deltaX) > Math.abs(deltaY);
        if (!dragState.current.movedX) {
          setIsVerticalSwipe(true);
        }
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

  // Mouse up handler
  const handleMouseUp = useCallback(() => {
    if (!isDragging) return;
    
    const container = scrollRef.current;
    if (container) {
      container.style.cursor = 'grab';
      container.style.userSelect = '';
    }
    
    setIsDragging(false);
    
    if (isVerticalSwipe) {
      if (prevProject?._id) {
        router.push(`/projects/${prevProject._id}`);
      }
    } else {
      if (Math.abs(dragState.current.velocity) > 1) {
        applyInertia();
      }
    }
    
    setIsVerticalSwipe(false);
  }, [isDragging, isVerticalSwipe, prevProject, router, applyInertia]);

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
    
    if (!dragState.current.movedX) {
      if (Math.abs(deltaX) > 10 || Math.abs(deltaY) > 10) {
        dragState.current.movedX = Math.abs(deltaX) > Math.abs(deltaY);
        if (!dragState.current.movedX) {
          setIsVerticalSwipe(true);
        }
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
      
      // Allow natural horizontal scroll from trackpad
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
        return;
      }
      
      const atStart = container.scrollLeft <= 0;
      const atEnd = container.scrollLeft + container.clientWidth >= container.scrollWidth - 2;
      
      // Navigate to prev/next project based on scroll direction
      if (!isDragging) {
        if (atEnd && e.deltaY < 0 && nextProject?._id) {
          router.push(`/projects/${nextProject._id}`);
          return;
        }
        if (atStart && e.deltaY > 0 && prevProject?._id) {
          router.push(`/projects/${prevProject._id}`);
          return;
        }
      }
      
      // Any vertical scroll closes/returns
      if (Math.abs(e.deltaY) > 3 && !isDragging) {
        router.push('/');
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => window.removeEventListener('wheel', handleWheel);
  }, [isDragging, prevProject, nextProject, router]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopInertia();
    };
  }, [stopInertia]);

  if (isLoading || !projectData) {
    return (
      <div className="fixed inset-0 z-[100] bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-black" />
          <span className="text-xs uppercase tracking-[0.2em] text-gray-500">Loading project details...</span>
        </div>
      </div>
    );
  }

  const ProjectIcon = IconMap[projectData.general?.icon] || Building2;

  return (
    <div className="relative font-sans text-black bg-white min-h-screen overflow-hidden">
      
      {/* Close button */}
      <Link href="/" className="fixed top-8 right-8 z-[200] cursor-pointer text-black hover:opacity-50 transition-opacity p-2">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </Link>

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
        <div className="h-full flex flex-nowrap items-center gap-[10vw] lg:gap-32 pl-[8vw] pr-[8vw] lg:pr-[calc(50vw-57vh)]">
          
          {/* Smart Spacer */}
          <div 
            className="relative z-50 hidden lg:block h-px shrink-0 flex-[0_0_auto]" 
            style={{ width: 'calc(50vw - 57vh - 64px)' }} 
          />

          {/* TIER 0: Previous Project Peek */}
          {prevProject?.general?.coverImage && (
            <div className="h-[76vh] aspect-[3432/2288] shrink-0 mb-[8vh] opacity-30 pointer-events-none relative grayscale">
              <Image
                src={prevProject.general.coverImage}
                alt="Previous project"
                fill
                sizes="50vw"
                className="object-cover"
              />
            </div>
          )}

          {/* BLOCK 1: COVER IMAGE & TITLE */}
          <div className="relative h-full flex flex-col justify-center flex-[0_0_auto] shrink-0 pt-[12vh] pb-[12vh] pointer-events-none select-none">
            {/* Title & Location */}
            <div className="absolute top-0 right-full mr-[30px] lg:mr-[44px] w-[300px] flex flex-col items-end text-right z-20 pt-[12vh]">
              <div className="size-[38px] lg:size-[50px] bg-black text-white flex items-center justify-center mb-6">
                <ProjectIcon size={24} strokeWidth={1.5} />
              </div>
              <h1 className="text-xl lg:text-3xl font-bold uppercase tracking-tighter leading-none m-0 p-0 break-words w-full">
                {projectData.general?.title || 'Untitled Project'}
              </h1>
              <p className="mt-2 text-[10px] lg:text-[12px] text-[#797979] uppercase tracking-[0.3em] font-medium mb-12">
                {projectData.general?.location || ''}
              </p>

              <div className="hidden lg:flex flex-col items-end w-full space-y-4">
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

            {/* Main Cover Image */}
            <div className="relative h-[76vh] shrink-0 shadow-sm will-change-transform" style={{ aspectRatio: '3432 / 2288' }}>
              <Image
                src={projectData.general?.coverImage || '/placeholder.jpg'}
                alt="Cover"
                fill
                priority
                sizes="90vw"
                draggable={false}
                className="object-cover select-none pointer-events-none"
              />
            </div>
          </div>

          {/* BLOCK 2: DESCRIPTION */}
          {description && (
            <div className="h-full flex flex-col shrink-0 lg:pt-[12vh] lg:pb-[12vh] justify-start pt-[20vh] pointer-events-none select-none">
               <div className="w-[320px] p-8 bg-white/50 backdrop-blur-sm">
                 <p className="text-[14px] leading-[1.8] text-black uppercase tracking-wide opacity-90 whitespace-pre-wrap font-medium">
                   {description}
                 </p>
               </div>
            </div>
          )}

          {/* BLOCK 3: SLIDER */}
          {sliderImages.length > 0 && (
            <div 
              className="relative h-[76vh] aspect-[3/2] flex-[0_0_auto] shrink-0 self-center overflow-hidden shadow-lg bg-gray-50 pointer-events-auto"
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
              
              <div className="absolute bottom-8 right-8 text-[11px] font-bold tracking-widest bg-white px-4 py-2 uppercase shadow-sm">
                {activeSlide + 1} / {sliderImages.length}
              </div>
            </div>
          )}

          {/* BLOCK 4: GALLERY IMAGES */}
          {imageBlocks.map((block, idx) => (
            <div key={`gallery-${idx}`} className="relative h-[76vh] aspect-[3/2] flex-[0_0_auto] shrink-0 self-center overflow-hidden shadow-lg pointer-events-none select-none">
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
                <div className="absolute bottom-6 left-6 bg-black/80 text-white text-[11px] px-4 py-2 uppercase tracking-wider backdrop-blur-sm">
                  {block.caption}
                </div>
              )}
            </div>
          ))}

          {/* Credits Block */}
          <div className="h-[76vh] self-center flex flex-col flex-wrap gap-x-16 gap-y-8 pt-12 pointer-events-none select-none shrink-0">
            <div className="w-[200px]">
              <h4 className="text-[9px] text-[#797979] uppercase tracking-widest mb-3 border-b border-gray-100 pb-2">Status</h4>
              <p className="text-[11px] text-black uppercase font-bold tracking-wider">{projectData.general?.status || 'Completed'}</p>
            </div>
            <div className="w-[200px]">
              <h4 className="text-[9px] text-[#797979] uppercase tracking-widest mb-3 border-b border-gray-100 pb-2">Year</h4>
              <p className="text-[11px] text-black uppercase font-bold tracking-wider">{projectYear}</p>
            </div>
          </div>

          {/* TIER 0: Next Project Peek */}
          {nextProject?.general?.coverImage && (
            <div className="h-[76vh] aspect-[3432/2288] shrink-0 mt-[8vh] opacity-30 pointer-events-none relative grayscale">
              <Image
                src={nextProject.general.coverImage}
                alt="Next project"
                fill
                sizes="50vw"
                className="object-cover"
              />
            </div>
          )}

          {/* End spacer */}
          <div className="shrink-0 w-[5vw]" />
        </div>
      </div>

      {/* Drag indicator */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-50 pointer-events-none opacity-50">
        <div className="flex flex-col items-center gap-3 text-[11px] uppercase tracking-[0.3em] text-black">
          <span className="w-12 h-px bg-black"></span>
          <span>Kéo ngang để xem</span>
          <span className="w-12 h-px bg-black"></span>
        </div>
      </div>

      <style jsx global>{`
        .scrollbar-hidden::-webkit-scrollbar { display: none; }
        .scrollbar-hidden { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
