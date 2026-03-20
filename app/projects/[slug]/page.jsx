'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Building2, Trees, Sofa, LayoutTemplate, Video, ImageIcon } from 'lucide-react';
import gsap from 'gsap';

const IconMap = {
  Building2: Building2,
  Trees: Trees,
  Sofa: Sofa,
  LayoutTemplate: LayoutTemplate,
  Video: Video,
  Image: ImageIcon
};

export default function ProjectDetail({ params }) {
  const containerRef = useRef(null);
  const [projectData, setProjectData] = useState(null);
  const [prevId, setPrevId] = useState(null);
  const [nextId, setNextId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSlide, setActiveSlide] = useState(0);
  
  // Quản lý trạng thái chuyển đổi dự án
  const [swapping, setSwapping] = useState(false);
  const [navDirection, setNavDirection] = useState(null); // 'prev' (trượt từ trên xuống) | 'next' (trượt từ dưới lên)

  const resolvedParams = React.use(params);
  const projectId = resolvedParams.slug;

  // Lấy dữ liệu dự án + prev/next
  useEffect(() => {
    if (!projectId) return;
    setLoading(true);
    fetch(`/api/projects/${projectId}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          setLoading(false);
          return;
        }
        setProjectData(data.project || data); // Tương thích cả cấu trúc cũ và mới
        setPrevId(data.previousProjectId);
        setNextId(data.nextProjectId);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [projectId]);

  // Logic Cuộn ngang + Chuyển dự án dọc
  useEffect(() => {
    const container = containerRef.current;
    if (!container || loading || !projectData) return;

    let targetScroll = container.scrollLeft;
    let isNavigating = false;

    const handleWheel = (e) => {
      // Cho phép trackpad lướt ngang tự nhiên
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
        targetScroll = container.scrollLeft;
        return;
      }

      // --- LOGIC HOÁN ĐỔI DỰ ÁN (PROJECT SWAPPING) ---
      const atStart = container.scrollLeft <= 0;
      // Cộng thêm 2px sai số làm tròn của trình duyệt
      const atEnd = container.scrollLeft + container.clientWidth >= container.scrollWidth - 2; 
      
      const scrollingUp = e.deltaY < 0;
      const scrollingDown = e.deltaY > 0;

      if (!isNavigating) {
        // Nếu ở đầu trang và cuộn lên -> Load dự án trước (Trượt từ trên xuống)
        if (atStart && scrollingUp && prevId) {
          isNavigating = true;
          setNavDirection('prev');
          setSwapping(true);
          return;
        }
        // Nếu ở cuối trang và cuộn xuống -> Load dự án sau (Trượt từ dưới lên)
        if (atEnd && scrollingDown && nextId) {
          isNavigating = true;
          setNavDirection('next');
          setSwapping(true);
          return;
        }
      }

      e.preventDefault();

      targetScroll += e.deltaY * 1.5;
      const maxScroll = container.scrollWidth - container.clientWidth;
      targetScroll = Math.max(0, Math.min(targetScroll, maxScroll));

      gsap.to(container, {
        scrollLeft: targetScroll,
        duration: 0.8,
        ease: 'power2.out',
        overwrite: 'auto'
      });
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      container.removeEventListener('wheel', handleWheel);
      gsap.killTweensOf(container);
    };
  }, [loading, projectData, prevId, nextId]);

  if (loading) {
    return (
      <div className="w-full h-screen bg-white flex items-center justify-center font-sans">
        <div className="text-xs uppercase tracking-[0.2em] font-bold animate-pulse text-gray-400">Loading Project...</div>
      </div>
    );
  }

  const project = projectData;
  const ProjectIcon = IconMap[project.general?.icon] || Building2;
  const slides = (project.sliderGallery || (project.blocks?.filter(b => b.type === 'image').map(b => b.url)) || []).filter(s => !!s);
  const extraImages = project.extraImages || project.blocks?.filter(b => b.type === 'image').map(b => ({ url: b.url, caption: b.caption })) || [];
  const credits = project.credits || project.blocks?.filter(b => b.type === 'credits').flatMap(b => b.roles || []) || [];

  return (
    <div className={`relative font-sans text-black bg-white min-h-screen overflow-hidden ${swapping ? 'pointer-events-none' : ''}`}>

      {/* --- CÁC MÀN HÌNH CHUYỂN DỰ ÁN (VERTICAL SLIDING PANELS) --- */}
      <AnimatePresence>
        {swapping && navDirection === 'prev' && (
          <motion.div
            initial={{ y: '-100%' }}
            animate={{ y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            onAnimationComplete={() => window.location.href = `/projects/${prevId}`}
            className="fixed inset-0 z-[999] bg-white flex flex-col items-center justify-center"
          >
            <div className="size-[50px] bg-black text-white flex items-center justify-center mb-6">
              <Building2 size={24} strokeWidth={1.5} />
            </div>
            <h2 className="text-2xl uppercase tracking-[0.2em] font-bold text-black animate-pulse">Loading Previous...</h2>
          </motion.div>
        )}
        
        {swapping && navDirection === 'next' && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            onAnimationComplete={() => window.location.href = `/projects/${nextId}`}
            className="fixed inset-0 z-[999] bg-black flex flex-col items-center justify-center"
          >
            <div className="size-[50px] bg-white text-black flex items-center justify-center mb-6">
              <Building2 size={24} strokeWidth={1.5} />
            </div>
            <h2 className="text-2xl uppercase tracking-[0.2em] font-bold text-white animate-pulse">Loading Next...</h2>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Nút Đóng */}
      <Link href="/" className="fixed top-8 right-8 z-[200] cursor-pointer text-black hover:opacity-50 transition-opacity p-2">
        <X size={32} strokeWidth={1} />
      </Link>

      <style dangerouslySetInnerHTML={{
        __html: `
        .scrollbar-hidden::-webkit-scrollbar { display: none; }
        .scrollbar-hidden { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />

      {/* DẢI CUỘN NGANG CHÍNH */}
      <div
        ref={containerRef}
        className="h-screen w-screen overflow-x-auto overflow-y-hidden flex flex-nowrap items-center gap-[24px] lg:gap-8 scrollbar-hidden overscroll-none"
      >

        {/* Spacer: đẩy khối ảnh vào chính giữa viewport (text trái sát ảnh) */}
        <div className="shrink-0 h-px w-[8vw] lg:hidden" aria-hidden />
        <div
          className="shrink-0 h-px hidden lg:block"
          style={{ width: 'max(0px, calc(50vw - 324px - 57vh))' }}
          aria-hidden
        />

        {/* =========================================
            BLOCK 1: COVER IMAGE & STICKY INFO
        =========================================== */}
        <div className="relative h-full flex flex-col justify-center flex-[0_0_auto] shrink-0 pt-12 pb-12 lg:pt-[12vh] lg:pb-[12vh]">

          {/* Sticky Info Box — sát cạnh trái ảnh */}
          <div className="absolute top-0 right-full mr-[20px] lg:mr-[24px] w-[300px] flex flex-col items-end text-right z-20 pt-[12vh]">
            <div className="size-[38px] lg:size-[50px] bg-black text-white flex items-center justify-center shadow-md mb-4 lg:mb-6">
              <ProjectIcon size={24} strokeWidth={1.5} />
            </div>
            <h1 className="text-xl lg:text-3xl font-bold uppercase tracking-tighter text-black leading-none m-0 p-0 break-words w-full">
              {project.general?.title}
            </h1>
            <p className="mt-2 text-[10px] lg:text-[12px] text-[#797979] uppercase tracking-widest font-medium mb-6">
              {project.general?.location}
            </p>
            {/* Metadata */}
            <div className="hidden lg:flex flex-col items-end w-full">
              <h4 className="text-[10px] text-[#797979] uppercase">Client</h4>
              <p className="text-[12px] text-black uppercase mb-3">{project.general?.client || 'N/A'}</p>
              <h4 className="text-[10px] text-[#797979] uppercase">Typology</h4>
              <p className="text-[12px] text-black uppercase mb-3">{project.general?.typology || 'N/A'}</p>
              <h4 className="text-[10px] text-[#797979] uppercase">Status</h4>
              <p className="text-[12px] text-black uppercase">{project.general?.status || 'N/A'}</p>
            </div>
          </div>

          {/* Cover Image */}
          <motion.div
            layoutId={`project-image-${project._id}`}
            className="w-auto h-full max-h-[76vh] relative z-10 shadow-sm"
            style={{ aspectRatio: '3432 / 2288' }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <Image
              src={project.general?.coverImage || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2070'}
              alt="Cover"
              fill
              priority
              sizes="(max-width: 1024px) 76vh, 90vw"
              className="object-cover"
            />
          </motion.div>
        </div>

        {/* =========================================
            BLOCK 2: DESCRIPTION TEXT
        =========================================== */}
        <div className="relative h-auto flex flex-col shrink-0 self-stretch lg:h-full lg:self-end lg:pb-[12vh]">
          <div className="min-w-[290px] w-[290px] text-[13px] leading-[18px] lg:text-sm lg:leading-[20px] text-black flex flex-col pt-12 lg:pt-[12vh]">
            <p className="whitespace-pre-wrap">{project.description || project.general?.description || "Project description following the minimalist architectural aesthetic."}</p>
          </div>
        </div>

        {/* =========================================
            BLOCK 3: CROSSFADE IMAGE SLIDER
        =========================================== */}
        {slides.length > 0 && (
          <div className="relative h-[76vh] flex-[0_0_auto] shrink-0 self-center">
            <div
              className="grid h-full w-auto cursor-pointer"
              onClick={() => setActiveSlide((prev) => (prev + 1) % slides.length)}
              style={{ aspectRatio: '3432 / 2288' }}
            >
              {slides.map((img, idx) => (
                <div
                  key={idx}
                  className={`relative h-full w-full transition-opacity duration-500 ease-in-out col-start-1 row-start-1 ${idx === activeSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
                >
                  <Image
                    src={img}
                    alt={`Slide ${idx}`}
                    fill
                    sizes="76vh"
                    className="object-cover grayscale hover:grayscale-0 transition-all duration-700"
                  />
                </div>
              ))}
            </div>
            {/* Slide counter */}
            <div className="absolute right-0 bottom-[-20px] text-[10px] text-gray-500 flex gap-1 font-mono">
              <span className="text-black font-bold">0{activeSlide + 1}</span>
              <span>/</span>
              <span>0{slides.length}</span>
            </div>
          </div>
        )}

        {/* =========================================
            BLOCK 4: EXTRA GALLERY IMAGES
        =========================================== */}
        {extraImages.map((img, idx) => (
          <div key={`extra-${idx}`} className="relative h-[76vh] flex-[0_0_auto] shrink-0 self-center shadow-sm" style={{ aspectRatio: '3432 / 2288' }}>
            <Image
              src={img.url || img}
              alt={`Gallery ${idx}`}
              fill
              sizes="76vh"
              className="object-cover grayscale hover:grayscale-0 transition-all duration-700"
            />
          </div>
        ))}

        {/* =========================================
            BLOCK 5: PROJECT CREDITS
        =========================================== */}
        {credits.length > 0 && (
          <div className="flex h-[76vh] max-h-[76vh] flex-col flex-wrap gap-x-12 lg:gap-x-16 lg:py-[6vh] shrink-0 content-start self-center">
            <h3 className="mb-4 w-[200px] text-[14px] font-bold text-black uppercase tracking-widest border-b border-black pb-2">
              Project Credits
            </h3>
            {credits.map((credit, idx) => (
              <div key={idx} className="w-[180px] lg:w-[200px] mb-3 lg:mb-4">
                <h4 className="mb-1 text-[10px] text-[#969696] uppercase tracking-wider">{credit.role || credit.roleName}</h4>
                <p className="text-[13px] lg:text-[14px] text-black font-medium leading-tight">{credit.name || credit.people}</p>
              </div>
            ))}
          </div>
        )}

        {/* END SPACER */}
        <div className="h-px w-[70vw] shrink-0 flex-[0_0_auto]" />

      </div>
    </div>
  );
}