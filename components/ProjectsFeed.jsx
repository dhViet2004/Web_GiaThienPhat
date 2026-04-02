'use client';

import React, { useRef, useState, useEffect, useLayoutEffect, useCallback } from 'react';
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
  const mainImageCardRef = useRef(null);
  const [activeSlide, setActiveSlide] = useState(0);
  const [layoutAnimationDone, setLayoutAnimationDone] = useState(false);
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

  const centerMainImageInViewport = useCallback(() => {
    const scrollEl = scrollRef.current;
    const card = mainImageCardRef.current;
    if (!scrollEl || !card) return;
    const cardRect = card.getBoundingClientRect();
    const cardCenterX = cardRect.left + cardRect.width / 2;
    // Sửa: Dùng scrollEl bounding rect thay vì window.scrollX
    const viewportCenterX = scrollEl.getBoundingClientRect().left + scrollEl.clientWidth / 2;
    const delta = cardCenterX - viewportCenterX;
    scrollEl.scrollLeft = Math.max(0, scrollEl.scrollLeft + delta);
  }, []);

  // Only center AFTER shared layout animation finishes — centering mid-animation reads
  // an incorrect bounding rect and causes the "jerk to the left then center" bug.
  useLayoutEffect(() => {
    if (isLoading || !layoutAnimationDone) return;
    requestAnimationFrame(() => {
      requestAnimationFrame(centerMainImageInViewport);
    });
  }, [project?._id, isLoading, layoutAnimationDone, centerMainImageInViewport]);

  // Keep image centered on window resize even after layout animation is done.
  useEffect(() => {
    if (isLoading || !layoutAnimationDone) return;
    let rafId;
    const onResize = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(centerMainImageInViewport);
    };
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      cancelAnimationFrame(rafId);
    };
  }, [isLoading, layoutAnimationDone, centerMainImageInViewport]);

  return (
    <div className="relative w-full h-full bg-white text-black font-sans flex flex-col overflow-hidden group/expanded">
      {isLoading && (
        <div className="absolute inset-0 z-[200] bg-white flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-black" />
            <span className="text-xs uppercase tracking-[0.2em] text-gray-500">Loading details...</span>
          </div>
        </div>
      )}

      {/* Horizontal Scroll Content */}
      <div
        ref={scrollRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="w-full h-full overflow-x-auto overflow-y-hidden scrollbar-hidden img-sync-height"
        style={{ cursor: isDragging ? 'grabbing' : 'grab', scrollBehavior: 'auto', WebkitOverflowScrolling: 'touch' }}
      >
        <div className="h-full flex flex-nowrap items-center gap-[8px] lg:gap-[8px] pl-[20px] lg:pl-[35px] pr-[20px] lg:pr-[35px]">

          {/* Info Block */}
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="h-full flex flex-col justify-center shrink-0 w-[85vw] sm:w-[320px] lg:w-[380px] select-none pointer-events-none pl-[5vw] lg:pl-[10vw]">
            <div className="mb-6"></div>
            <h1 className="text-xl lg:text-3xl font-bold uppercase tracking-tighter leading-none break-words w-full m-0 p-0 text-right">
              {project.general?.title || 'Untitled Project'}
            </h1>
            <p className="mt-2 text-[10px] lg:text-[12px] text-[#797979] uppercase tracking-[0.3em] font-medium mb-12 text-right">
              {project.general?.location || ''}
            </p>
            <div className="flex flex-col gap-4 items-end">
              <div>
                <h4 className="text-[9px] text-[#797979] uppercase tracking-widest mb-1">Client</h4>
                <p className="text-[11px] text-black uppercase font-bold tracking-wider">{project.general?.client || 'N/A'}</p>
              </div>
              <div>
                <h4 className="text-[9px] text-[#797979] uppercase tracking-widest mb-1">Typology</h4>
                <p className="text-[11px] text-black uppercase font-bold tracking-wider">{project.general?.typology || 'N/A'}</p>
              </div>
            </div>
          </motion.div>

          {/* Cover Image with shared LayoutId */}
          <div ref={mainImageCardRef} className="relative shrink-0 shadow-sm self-center pointer-events-none select-none" style={{ height: 'var(--img-h)', aspectRatio: 'auto' }}>
            <motion.div
              layoutId={layoutId}
              className="relative w-auto h-full flex items-center justify-center"
              onLayoutAnimationComplete={() => setLayoutAnimationDone(true)}
            >
              <Image src={coverImageUrl} alt="Cover" width={0} height={0} sizes="(max-width: 1024px) 70vw, 500px" style={{ width: 'auto', height: '100%', maxWidth: '100%' }} priority draggable={false} className="object-contain select-none pointer-events-none max-h-full w-auto max-w-full" />
            </motion.div>
          </div>

          {/* Description */}
          {description && (
            <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.4 }} className="relative h-full flex flex-col justify-center shrink-0 w-[85vw] sm:w-[290px] pointer-events-none select-none">
              <div className="text-[13px] leading-[1.6] text-black uppercase tracking-tight opacity-80">
                <h3 className="text-[10px] lg:text-[11px] font-bold uppercase tracking-[0.2em] text-[#797979] mb-3">DESCRIPTION</h3>
                <p className="whitespace-pre-wrap break-words [overflow-wrap:anywhere]">{normalizeDescriptionText(description)}</p>
              </div>
            </motion.div>
          )}

          {/* Gallery Images */}
          {galleryImageBlocks.map((block, idx) => (
            <div key={`gallery-${idx}`} className="relative h-full shrink-0 flex items-center justify-center pointer-events-none select-none" style={{ height: 'var(--img-h)', minWidth: 'min(75vw,500px)' }}>
              <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.5 + idx * 0.1 }} className="relative z-0 shrink-0 w-auto shadow-sm overflow-hidden flex items-center justify-center" style={{ height: 'var(--img-h)' }}>
                {block.url && (
                  <Image src={block.url} alt={block.caption || `Gallery ${idx + 1}`} width={0} height={0} sizes="(max-width: 1024px) 75vw, 500px" style={{ width: 'auto', height: '100%', maxWidth: '100%' }} draggable={false} className="object-contain select-none pointer-events-none max-h-full w-auto max-w-full mx-auto" />
                )}
                {block.caption && (
                  <div className="absolute bottom-4 left-4 bg-black/70 text-white text-[10px] px-2 py-1 uppercase tracking-wider">{block.caption}</div>
                )}
              </motion.div>
            </div>
          ))}

          {/* Slider Images */}
          {sliderImages.length > 0 && (
            <div className="h-full flex items-center shrink-0 w-[min(75vw,340px)] lg:w-[500px] shadow-sm bg-gray-50 pointer-events-auto cursor-pointer" onClick={() => setActiveSlide((prev) => (prev + 1) % sliderImages.length)}>
              <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.5 }} className="relative z-0 shrink-0 w-auto shadow-sm overflow-hidden flex items-center justify-center" style={{ height: 'var(--img-h)' }}>
                <AnimatePresence mode="wait">
                  <motion.div key={activeSlide} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.6 }} className="relative w-auto h-full flex items-center justify-center">
                    <Image src={sliderImages[activeSlide]} alt={`Slide ${activeSlide + 1}`} width={0} height={0} sizes="(max-width: 1024px) 75vw, 500px" style={{ width: 'auto', height: '100%', maxWidth: '100%' }} draggable={false} className="object-contain select-none pointer-events-none max-h-full w-auto max-w-full mx-auto" />
                  </motion.div>
                </AnimatePresence>
                <div className="absolute bottom-6 right-6 text-[10px] font-bold tracking-widest bg-white px-3 py-1.5 uppercase">{activeSlide + 1} / {sliderImages.length}</div>
              </motion.div>
            </div>
          )}

          {/* Status + Year */}
          <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.7 }} className="h-full flex flex-col justify-center shrink-0 w-[min(180px,45vw)] lg:w-[240px] gap-8 pointer-events-none select-none">
            <div>
              <h4 className="text-[9px] text-[#797979] uppercase tracking-widest mb-3 border-b border-gray-100 pb-2">Status</h4>
              <p className="text-[11px] text-black uppercase font-bold tracking-wider">{project.general?.status || 'Completed'}</p>
            </div>
            <div>
              <h4 className="text-[9px] text-[#797979] uppercase tracking-widest mb-3 border-b border-gray-100 pb-2">Year</h4>
              <p className="text-[11px] text-black uppercase font-bold tracking-wider">{projectYear}</p>
            </div>
          </motion.div>

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
  const [projectsCache, setProjectsCache] = useState({});
  const [selectedProject, setSelectedProject] = useState(null);
  const selectedProjectRef = useRef(null);

  const prefetchAllProjects = useCallback(async (projectsList) => {
    if (!projectsList || projectsList.length === 0) return;
    const cache = {};
    const batchSize = 5;
    for (let i = 0; i < projectsList.length; i += batchSize) {
      const batch = projectsList.slice(i, i + batchSize);
      const promises = batch.map(project =>
        apiGet(`/api/projects/${project._id}`)
          .then(data => {
            if (!data.error && (data.project || data)) cache[project._id] = data.project || data;
          })
          .catch(err => { cache[project._id] = project; })
      );
      await Promise.all(promises);
    }
    setProjectsCache(cache);
  }, []);

  useEffect(() => {
    let mounted = true;
    const init = async () => {
      try {
        const data = await apiGet('/api/projects');
        if (!mounted) return;

        if (!data.error && Array.isArray(data)) {
          setProjects(data);
          const pathParts = window.location.pathname.split('/');
          const projectUrlId = pathParts[pathParts.length - 1];
          const found = data.find(p => p._id === projectUrlId);
          if (found) setSelectedProject(found);
        }
        setIsInitialized(true);

        const startPrefetch = () => prefetchAllProjects(data);
        window.addEventListener('introStarted', startPrefetch, { once: true });
        const fallback = setTimeout(startPrefetch, 100);

        return () => {
          window.removeEventListener('introStarted', startPrefetch);
          clearTimeout(fallback);
        };
      } catch (err) {
        setIsInitialized(true);
      }
    };
    init();
    return () => { mounted = false; };
  }, [prefetchAllProjects]);

  useEffect(() => {
    selectedProjectRef.current = selectedProject;
  }, [selectedProject]);

  useEffect(() => {
    const handlePopState = () => {
      const pathParts = window.location.pathname.split('/');
      const projectUrlId = pathParts[pathParts.length - 1];
      const found = projects.find(p => p._id === projectUrlId);
      setSelectedProject(found || null);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [projects]);

  const handleSelectProject = useCallback((project) => {
    if (project) {
      window.history.pushState(null, '', `/projects/${project._id}`);
      gsap.killTweensOf('.velocity-card');
      gsap.set('.velocity-card', { scale: 1, y: 0 });
      setSelectedProject(project);

      // Use instant scroll so it completes synchronously — no conflict with
      // centerMainImageInViewport which reads window.scrollX to center the image.
      setTimeout(() => {
        const el = document.getElementById(`project-${project._id}`);
        if (el) el.scrollIntoView({ behavior: 'instant', block: 'center' });
      }, 100);
    } else {
      window.history.pushState(null, '', '/');
      setSelectedProject(null);
    }
  }, []);

  // LOGIC MỚI: Đóng project khi cuộn chuột
  useEffect(() => {
    if (!selectedProject) return;

    const handleUserScroll = (e) => {
      // 1. Kiểm tra xem người dùng có đang cuộn bên trong nội dung chi tiết không
      if (e.target.closest('.img-sync-height')) {
        if (e instanceof WheelEvent) {
          // Cho phép cuộn ngang (xem gallery), đóng khi cuộn dọc
          if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
        } else {
          return; // Touchmove bên trong gallery thì không đóng
        }
      }

      // 2. Đóng project và quay lại danh sách
      setSelectedProject(null);
    };

    // Đợi 500ms sau khi mở để tránh đóng ngay lập tức
    const timer = setTimeout(() => {
      window.addEventListener('wheel', handleUserScroll, { passive: true });
      window.addEventListener('touchmove', handleUserScroll, { passive: true });
    }, 500);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('wheel', handleUserScroll);
      window.removeEventListener('touchmove', handleUserScroll);
    };
  }, [selectedProject]);

  const getProjectData = useCallback((projectId) => {
    return projectsCache[projectId] || projects.find(p => p._id === projectId) || null;
  }, [projectsCache, projects]);

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
        if (selectedProjectRef.current) return; // Disallow velocity when expanding

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

      const st = {
        trigger: item,
        start: 'top 95%',
        toggleActions: 'play none none reverse',
      };

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

  return (
    <>
      <style jsx global>{`
        .scrollbar-hidden::-webkit-scrollbar { display: none; }
        .scrollbar-hidden { -ms-overflow-style: none; scrollbar-width: none; }
        .img-sync-height {
          --img-h: min(36vh, 220px);
        }
        .img-sync-height > div {
          height: 100%;
        }
        @media (min-width: 640px) { .img-sync-height { --img-h: min(42vh, 300px); } }
        @media (min-width: 768px) { .img-sync-height { --img-h: min(48vh, 360px); } }
        @media (min-width: 1024px) { .img-sync-height { --img-h: min(52vh, 440px); } }
        @media (min-width: 1280px) { .img-sync-height { --img-h: min(55vh, 1200px); } }
      `}</style>

      <div ref={containerRef} className="w-full bg-white relative pt-36 pb-[30vh] overflow-hidden z-10">
        <div className="w-full max-w-[1800px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16">
          <div className="projects-scaler origin-top will-change-transform" style={{ transformOrigin: '50% 0%', transform: 'translateZ(0)' }}>
            <div className="flex flex-col items-center w-full transition-all duration-500 gap-1 lg:gap-1">
              {projects.map((project, index) => {
                const isSelected = selectedProject?._id === project._id;
                const fullData = isSelected ? getProjectData(project._id) : project;

                return (
                  <motion.div
                    key={project._id || index}
                    id={`project-${project._id}`}
                    layout
                    className={`relative w-full transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${isSelected
                        ? 'h-[55vh] md:h-[60vh] max-w-none z-50 my-0'
                        : 'flex justify-center items-center max-w-[1600px] h-auto my-2'
                      }`}
                    transition={
                      isSelected
                        ? { type: 'spring', stiffness: 100, damping: 20, mass: 1 }
                        : { type: 'spring', stiffness: 50, damping: 18, mass: 1, duration: 1.2 }
                    }
                  >
                    {!isSelected ? (
                      <div className="project-row w-full flex justify-center items-center group">
                        <div className="velocity-card relative flex flex-col md:inline-flex md:flex-row items-center">

                          {/* Left Info Desktop */}
                          <div className="hidden md:flex absolute top-0 right-full mr-[4px] lg:mr-[6px] w-[324px] project-info justify-end z-20">
                            <div className="relative w-full text-right flex flex-col items-end origin-right">
                              <div onClick={(e) => { e.preventDefault(); handleSelectProject(project); }} className="group/link cursor-pointer flex flex-col items-end">
                                <div className="relative pr-6 lg:pr-15">
                                  <h2 className="text-[14px] lg:text-[18px] font-normal uppercase text-black m-0 p-0 leading-tight whitespace-nowrap">
                                    {project.general?.title}
                                  </h2>
                                  <span className="absolute -bottom-1 right-6 lg:right-8 h-px bg-black w-0 group-hover/link:w-full transition-all duration-400" style={{ right: '0', left: 'auto' }}></span>
                                </div>
                                <p className="text-[#797979] text-[11px] lg:text-[12px] uppercase mt-[4px] lg:mt-[6px] pr-6 lg:pr-15">
                                  {project.general?.location}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Cover Image Wrapper with LayoutID */}
                          <div className="shrink-0 project-image overflow-hidden w-[90vw] sm:w-[350px] lg:w-[64vh] aspect-3/2 relative">
                            <motion.div
                              layoutId={`img-container-${project._id}`}
                              onClick={() => handleSelectProject(project)}
                              className="relative w-full h-full cursor-pointer group"
                            >
                              <Image
                                src={project.general?.coverImage || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2070'}
                                alt={project.general?.title || 'Preview'}
                                fill
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
                    ) : (
                      <InlineProjectDetail
                        project={fullData}
                        onClose={() => handleSelectProject(null)}
                        layoutId={`img-container-${project._id}`}
                        isLoading={!projectsCache[project._id]}
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