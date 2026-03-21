'use client';

import React, { useRef, useEffect, useState } from 'react';
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
  sliderBlocks.forEach(block => {
    if (block.slides && block.slides.length > 0) {
      block.slides.forEach(slide => {
        if (slide.url) images.push(slide.url);
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
  const [activeSlide, setActiveSlide] = useState(0);
  const [dragConstraints, setDragConstraints] = useState({ left: 0, right: 0 });

  // Get data from blocks array
  const description = getTextBlock(project);
  const sliderImages = getSliderImages(project);
  const projectYear = getProjectYear(project);

  // Update constraints when container changes
  useEffect(() => {
    const updateConstraints = () => {
      if (containerRef.current) {
        const scrollWidth = containerRef.current.scrollWidth;
        const clientWidth = containerRef.current.clientWidth;
        setDragConstraints({ left: -(scrollWidth - clientWidth), right: 0 });
      }
    };

    const timer = setTimeout(updateConstraints, 1000);
    window.addEventListener('resize', updateConstraints);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updateConstraints);
    };
  }, [project]);

  const handleDragEnd = (_, info) => {
    if (Math.abs(info.offset.y) > 100 || Math.abs(info.velocity.y) > 500) {
      onClose();
    }
  };

  // Cuộn chuột để thoát overlay
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

  const ProjectIcon = IconMap[project.general?.icon] || Building2;

  // Get all blocks to display (excluding the first image block which is cover)
  const imageBlocks = project.blocks?.filter(b => b.type === 'image') || [];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-white text-black overflow-hidden font-sans"
    >
      {/* Loading overlay when fetching full project data */}
      {isLoading && (
        <div className="absolute inset-0 z-[200] bg-white/90 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-black" />
            <span className="text-xs uppercase tracking-[0.2em] text-gray-500">Loading project details...</span>
          </div>
        </div>
      )}

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
          className="h-screen w-screen overflow-x-auto overflow-y-hidden flex flex-nowrap items-center gap-[5vw] lg:gap-16 scrollbar-hidden overscroll-none cursor-grab active:cursor-grabbing will-change-transform perspective-1000"
        >
          {/* Smart Spacer to center the image. */}
          <div 
            className="relative z-50 hidden lg:block h-px shrink-0 flex-[0_0_auto]" 
            style={{ width: 'calc(50vw - 57vh - 64px)' }} 
          />

          {/* Mobile spacer fallback */}
          <div className="shrink-0 w-[5vw] lg:hidden block" />

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

            {/* Main Cover Image */}
            <motion.div
              layoutId={`project-image-${project._id}`}
              className="relative h-[76vh] shrink-0 shadow-sm will-change-transform"
              style={{ aspectRatio: '3432 / 2288' }}
              transition={{ 
                duration: 0.8, 
                ease: [0.16, 1, 0.3, 1] 
              }}
            >
              <Image
                src={project.general?.coverImage || '/placeholder.jpg'}
                alt="Cover"
                fill
                priority
                sizes="90vw"
                draggable={false}
                className="object-cover select-none pointer-events-none"
              />
            </motion.div>
          </div>

          {/* BLOCK 2: DESCRIPTION - Get from blocks type='text' */}
          {description && (
            <div className="h-full flex flex-col shrink-0 lg:pt-[12vh] lg:pb-[12vh] justify-start pt-[20vh] pointer-events-none select-none">
               <div className="w-[290px] text-[13px] leading-[1.6] text-black uppercase tracking-tight opacity-80">
                 <p className="whitespace-pre-wrap">{description}</p>
               </div>
            </div>
          )}

          {/* BLOCK 3: SLIDER - Get from blocks type='slider' */}
          {sliderImages.length > 0 && (
            <div 
              className="relative h-[76vh] aspect-[3/2] flex-[0_0_auto] shrink-0 self-center cursor-pointer overflow-hidden group shadow-sm bg-gray-50 pointer-events-auto"
              onPointerDown={(e) => e.stopPropagation()}
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

          {/* BLOCK 4: ADDITIONAL GALLERY - Get from blocks type='image' */}
          {imageBlocks.map((block, idx) => (
            <div key={`gallery-${idx}`} className="relative h-[76vh] aspect-[3/2] flex-[0_0_auto] shrink-0 self-center shadow-sm pointer-events-none select-none">
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
          <div className="h-[76vh] self-center flex flex-col flex-wrap gap-x-12 gap-y-6 pt-12 pointer-events-none select-none">
            <div className="w-[200px]">
              <h4 className="text-[9px] text-[#797979] uppercase tracking-widest mb-3 border-b border-gray-100 pb-2">Status</h4>
              <p className="text-[11px] text-black uppercase font-bold tracking-wider">{project.general?.status || 'Completed'}</p>
            </div>
            <div className="w-[200px]">
              <h4 className="text-[9px] text-[#797979] uppercase tracking-widest mb-3 border-b border-gray-100 pb-2">Year</h4>
              <p className="text-[11px] text-black uppercase font-bold tracking-wider">{projectYear}</p>
            </div>
          </div>

          {/* End Spacer */}
          <div className="h-px w-[50vw] shrink-0 flex-[0_0_auto]"></div>
        </motion.div>
      </motion.div>

      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </motion.div>
  );
}
