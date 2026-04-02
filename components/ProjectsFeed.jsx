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
  const introSlideRef = useRef(null);
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

  // Chiều rộng slide intro = vùng cuộn (trùng với max-w + px của feed/menu), không dùng 100vw để khỏi lệch so với header
  useLayoutEffect(() => {
    const scrollEl = scrollRef.current;
    const introEl = introSlideRef.current;
    if (!scrollEl || !introEl) return;
    const sync = () => {
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

  return (
    <div className="relative w-full h-full bg-white text-black font-sans flex flex-col overflow-hidden">
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
          {/* Không dùng px trên hàng: padding chỉ ở cột Meta / Description để cột ảnh 60% không bị thụt trái */}
          <div
            ref={introSlideRef}
            className="shrink-0 h-full flex flex-col lg:flex-row items-center lg:items-stretch justify-start gap-0 lg:gap-0 min-w-0"
          >
            
            {/* Cột Meta (20%) - Right aligned — flex-basis cố định để cột Description trống vẫn giữ 20-60-20 */}
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              transition={{ delay: 0.3 }}
              className="w-full lg:flex-[0_0_20%] lg:max-w-[20%] lg:min-w-0 order-2 lg:order-1 flex flex-col items-center lg:items-end text-center lg:text-right shrink-0 select-none pointer-events-none pl-4 lg:pl-12 pr-2 lg:pr-3"
            >
              <div className="mb-4 lg:mb-6"></div>
              <h1 className="text-xl lg:text-2xl xl:text-3xl font-bold uppercase tracking-tighter leading-none break-words w-full m-0 p-0">
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

            {/* Cột Ảnh Chính (60%) — full width cột, ảnh scale theo chiều ngang trước (tránh khoảng trắng do width:auto + height:80vh) */}
            <div className="w-full lg:flex-[0_0_60%] lg:max-w-[60%] h-full order-1 lg:order-2 flex min-w-0 justify-center items-center shrink-0 px-0">
              <motion.div
                layoutId={layoutId}
                className="relative w-full h-full max-h-full flex items-center justify-center min-w-0"
              >
                <Image
                  src={coverImageUrl}
                  alt="Cover"
                  width={1920}
                  height={1080}
                  sizes="60vw"
                  priority
                  draggable={false}
                  className="object-contain select-none pointer-events-none w-full h-auto max-h-[min(80vh,100%)] max-w-full"
                />
              </motion.div>
            </div>

            {/* Cột Description (20%) - Left aligned */}
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              transition={{ delay: 0.3 }}
              className="w-full lg:flex-[0_0_20%] lg:max-w-[20%] lg:min-w-0 order-3 flex flex-col items-center lg:items-start text-center lg:text-left shrink-0 select-none pointer-events-none pl-2 lg:pl-3 pr-4 lg:pr-12"
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
          {/* Các ảnh phụ nằm tiếp nối bên phải, sẽ hiện ra khi user cuộn ngang */}

          {/* Gallery Images */}
          {galleryImageBlocks.slice(0, 6).map((block, idx) => (
            <div 
              key={`gallery-${idx}`} 
              className="h-full shrink-0 flex items-center justify-center"
              style={{ width: 'min(80vw, 600px)', minWidth: 'min(60vw, 300px)' }}
            >
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                transition={{ delay: 0.4 + idx * 0.1 }}
                className="relative z-0 shrink-0 w-auto h-full shadow-sm overflow-hidden flex items-center justify-center"
              >
                {block.url && (
                  <Image 
                    src={block.url} 
                    alt={block.caption || `Gallery ${idx + 1}`} 
                    width={0} 
                    height={0} 
                    sizes="100vh"
                    style={{ width: 'auto', height: '80vh', maxHeight: '100%' }} 
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
              className="h-full shrink-0 w-[min(80vw,500px)] lg:w-[min(60vw,400px)] pointer-events-auto cursor-pointer pr-[20px] lg:pr-[35px]" 
              onClick={() => setActiveSlide((prev) => (prev + 1) % sliderImages.length)}
            >
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                transition={{ delay: 0.5 }}
                className="relative z-0 shrink-0 w-auto h-full shadow-sm overflow-hidden flex items-center justify-center" 
                style={{ height: '80vh' }}
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
                      sizes="100vh"
                      style={{ width: 'auto', height: '80vh', maxHeight: '100%' }} 
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
  const [projectsCache, setProjectsCache] = useState({});
  const [selectedProject, setSelectedProject] = useState(null);
  const selectedProjectRef = useRef(null);

  const touchState = useRef({ startY: 0, startX: 0, startTime: 0 });

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

      requestAnimationFrame(() => {
        const el = document.getElementById(`project-${project._id}`);
        if (el) el.scrollIntoView({ behavior: 'instant', block: 'center' });
      });
    } else {
      window.history.pushState(null, '', '/');
      setSelectedProject(null);
    }
  }, []);

  // LOGIC: Đóng project khi cuộn dọc (wheel hoặc touch swipe)
  useEffect(() => {
    if (!selectedProject) return;

    const handleWheel = (e) => {
      // 1. Kiểm tra xem người dùng có đang cuộn bên trong gallery không
      // Nếu event target nằm trong phần tử có class 'gallery-scroll' (phần col-span-3)
      const galleryContainer = document.querySelector('.gallery-scroll-area');
      if (galleryContainer && galleryContainer.contains(e.target)) {
        // Cho phép cuộn ngang bên trong gallery
        // Chỉ đóng nếu người dùng cố tình cuộn dọc với lực mạnh hơn nhiều so với cuộn ngang
        const isVerticalScroll = Math.abs(e.deltaY) > Math.abs(e.deltaX) + 5;
        if (!isVerticalScroll) return;
      }

      // 2. Kiểm tra xem có phải cuộn dọc chủ đạo không (giống BIG studio)
      // deltaY là cuộn dọc, deltaX là cuộn ngang
      // Nếu |deltaY| >> |deltaX|, đó là cuộn dọc -> đóng
      const isVerticalScroll = Math.abs(e.deltaY) > Math.abs(e.deltaX) + 5;
      if (isVerticalScroll) {
        e.preventDefault();
        setSelectedProject(null);
      }
    };

    const handleTouchStart = (e) => {
      if (e.touches.length !== 1) return;
      const touch = e.touches[0];
      touchState.current = {
        startY: touch.clientY,
        startX: touch.clientX,
        startTime: Date.now()
      };
    };

    const handleTouchMove = (e) => {
      if (e.touches.length !== 1) return;
      
      // Kiểm tra xem touch có đang ở trong gallery không
      const galleryContainer = document.querySelector('.gallery-scroll-area');
      if (galleryContainer && galleryContainer.contains(e.target)) {
        return; // Không xử lý touchmove bên trong gallery
      }

      const touch = e.touches[0];
      const deltaY = touch.clientY - touchState.current.startY;
      const deltaX = touch.clientX - touchState.current.startX;

      // Vuốt dọc (swipe up/down) với lực đủ lớn -> đóng
      // |deltaY| > |deltaX| có nghĩa là vuốt dọc là chính
      if (Math.abs(deltaY) > Math.abs(deltaX) + 30) {
        e.preventDefault();
        setSelectedProject(null);
      }
    };

    // Đợi 500ms sau khi mở để tránh đóng ngay lập tức do quán tính cuộn chuột
    const timer = setTimeout(() => {
      window.addEventListener('wheel', handleWheel, { passive: false });
      window.addEventListener('touchstart', handleTouchStart, { passive: true });
      window.addEventListener('touchmove', handleTouchMove, { passive: false });
    }, 500);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
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
        if (selectedProjectRef.current) return;

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

  return (
    <>
      <style jsx global>{`
        .scrollbar-hidden::-webkit-scrollbar { display: none; }
        .scrollbar-hidden { -ms-overflow-style: none; scrollbar-width: none; }
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
                    className={`transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${isSelected
                        ? 'relative w-full h-[50vh] md:h-[60vh] z-50 my-0'
                        : 'relative w-full flex justify-center items-center max-w-[1600px] h-auto my-2'
                      }`}
                    transition={{ type: "spring", bounce: 0.2, duration: 0.8 }}
                  >
                    {!isSelected ? (
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
                          <div className="shrink-0 project-image overflow-hidden w-[90vw] sm:w-[350px] lg:w-[64vh] relative">
                            <motion.div
                              layoutId={`img-container-${project._id}`}
                              onClick={() => handleSelectProject(project)}
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
