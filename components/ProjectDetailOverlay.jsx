'use client';

import React, { useRef, useEffect, useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Building2, Trees, Sofa, LayoutTemplate, Video, ImageIcon } from 'lucide-react';

const IconMap = {
  Building2: Building2,
  Trees: Trees,
  Sofa: Sofa,
  LayoutTemplate: LayoutTemplate,
  Video: Video,
  Image: ImageIcon
};

export default function ProjectDetailOverlay({ project, onClose }) {
  const containerRef = useRef(null);
  const [activeSlide, setActiveSlide] = useState(0);

  const [dragConstraints, setDragConstraints] = useState({ left: 0, right: 0 });

  // Cập nhật vùng kéo dựa trên kích thước thực tế
  useEffect(() => {
    const updateConstraints = () => {
      if (containerRef.current) {
        const scrollWidth = containerRef.current.scrollWidth;
        const clientWidth = containerRef.current.clientWidth;
        setDragConstraints({ left: -(scrollWidth - clientWidth), right: 0 });
      }
    };
    
    // Đợi ảnh load xong để có kích thước chuẩn
    const timer = setTimeout(updateConstraints, 500);
    window.addEventListener('resize', updateConstraints);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updateConstraints);
    };
  }, [project]);

  // Cuộn chuột chỉ dùng để thoát
  useEffect(() => {
    const handleWheel = (e) => {
      if (Math.abs(e.deltaY) > 1) {
        e.preventDefault();
        e.stopPropagation();
        onClose();
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => window.removeEventListener('wheel', handleWheel);
  }, [onClose]);

  const handleDragEnd = (_, info) => {
    if (Math.abs(info.offset.y) > 100 || Math.abs(info.velocity.y) > 500) {
      onClose();
    }
  };

  const ProjectIcon = IconMap[project.general?.icon] || Building2;
  const slides = (project.sliderGallery || (project.blocks?.filter(b => b.type === 'image').map(b => b.url)) || []).filter(s => !!s);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-white text-black overflow-hidden font-sans"
    >
      <motion.div 
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={0.4}
        onDragEnd={handleDragEnd}
        className="relative w-full h-full"
      >
        {/* Horizontal Content Track (Draggable) */}
        <motion.div 
          ref={containerRef}
          drag="x"
          dragConstraints={dragConstraints}
          dragElastic={0.2}
          className="h-full flex flex-nowrap items-start gap-[5vw] px-[10vw] cursor-grab active:cursor-grabbing will-change-transform perspective-1000"
        >
          {/* BLOCK 1: COVER IMAGE & TITLE */}
          <div className="relative h-full flex flex-col justify-center flex-[0_0_auto] shrink-0 pt-[12vh] pb-[12vh] pointer-events-none select-none">
            {/* Title & Location (Left of Image) */}
            <div className="absolute top-0 right-full mr-[30px] lg:mr-[44px] w-[300px] flex flex-col items-end text-right z-20 pt-[12vh]">
              <div className="size-[38px] lg:size-[50px] bg-black text-white flex items-center justify-center mb-6">
                <ProjectIcon size={24} strokeWidth={1.5} />
              </div>
              <h1 className="text-xl lg:text-3xl font-bold uppercase tracking-tighter leading-none m-0 p-0 break-words w-full">
                {project.general?.title}
              </h1>
              <p className="mt-2 text-[10px] lg:text-[12px] text-[#797979] uppercase tracking-[0.3em] font-medium mb-12">
                {project.general?.location}
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

            {/* Main Cover Image */}
            <motion.div
              layoutId={`project-image-${project._id}`}
              className="relative h-full shrink-0 shadow-sm"
              // ĐỒNG BỘ ASPECT RATIO: Gắn cứng style aspect ratio thay vì dùng class Tailwind (aspect-[3/2]) để tránh sai số tính toán
              style={{ aspectRatio: '3432 / 2288' }}
              // Đồng bộ thông số transition với thao tác vuốt tay
              transition={{ 
                duration: 0.8, 
                ease: [0.16, 1, 0.3, 1] 
              }}
              layout="position"
            >
              <Image
                src={project.general?.coverImage || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2070'}
                alt="Cover"
                fill
                priority
                draggable={false}
                className="object-cover select-none pointer-events-none"
              />
            </motion.div>
          </div>

          {/* BLOCK 2: DESCRIPTION */}
          <div className="h-full flex flex-col shrink-0 lg:pt-[12vh] lg:pb-[12vh] justify-start pt-[20vh] pointer-events-none select-none">
             <div className="w-[290px] text-[13px] leading-[1.6] text-black uppercase tracking-tight opacity-80">
               <p className="whitespace-pre-wrap">{project.description || "Project description following the minimalist architectural aesthetic."}</p>
             </div>
          </div>

          {/* BLOCK 3: CROSSFADE SLIDER */}
          {slides.length > 0 && (
            <div 
              className="relative h-[76vh] aspect-[3/2] flex-[0_0_auto] shrink-0 self-center cursor-pointer overflow-hidden group shadow-sm bg-gray-50 pointer-events-auto"
              onPointerDown={(e) => e.stopPropagation()} // Đảm bảo click chuyển slide không trigger drag
              onClick={() => setActiveSlide((prev) => (prev + 1) % slides.length)}
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
                    src={slides[activeSlide]}
                    alt={`Slide ${activeSlide}`}
                    fill
                    draggable={false}
                    className="object-cover select-none"
                  />
                </motion.div>
              </AnimatePresence>
              
              <div className="absolute bottom-6 right-6 text-[10px] font-bold tracking-widest bg-white px-3 py-1.5 uppercase">
                {activeSlide + 1} / {slides.length}
              </div>
            </div>
          )}

          {/* BLOCK 4: ADDITIONAL GALLERY & CREDITS */}
          {project.blocks?.filter(b => b.type === 'image').slice(2).map((block, idx) => (
            <div key={idx} className="relative h-[76vh] aspect-[3/2] flex-[0_0_auto] shrink-0 self-center shadow-sm pointer-events-none select-none">
              <Image
                src={block.url}
                alt={`Extra ${idx}`}
                fill
                draggable={false}
                className="object-cover"
              />
            </div>
          ))}

          {/* Credits Block */}
          <div className="h-[76vh] self-center flex flex-col flex-wrap gap-x-12 gap-y-6 pt-12 pointer-events-none select-none">
            <div className="w-[200px]">
              <h4 className="text-[9px] text-[#797979] uppercase tracking-widest mb-3 border-b border-gray-100 pb-2">Status</h4>
              <p className="text-[11px] text-black uppercase font-bold tracking-wider">{project.general?.status || 'Completed'}</p>
            </div>
            <div className="w-[200px]">
              <h4 className="text-[9px] text-[#797979] uppercase tracking-widest mb-3 border-b border-gray-100 pb-2">Year</h4>
              <p className="text-[11px] text-black uppercase font-bold tracking-wider">{project.general?.year || '2024'}</p>
            </div>
          </div>

          {/* End Spacer */}
          <div className="h-px w-[20vw] shrink-0 flex-[0_0_auto]"></div>
        </motion.div>
      </motion.div>

      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </motion.div>
  );
}
