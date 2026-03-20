'use client';

import React, { useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { X, Building2 } from 'lucide-react';

// Dữ liệu mô phỏng dự án chi tiết
export default function ProjectDetail({ params }) {
  const containerRef = useRef(null);
  const [projectData, setProjectData] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  
  // Unwrap params using React 19's use() API
  const resolvedParams = React.use(params);
  const projectId = resolvedParams.slug;

  useEffect(() => {
    fetch(`/api/projects/${projectId}`)
      .then(res => res.json())
      .then(data => {
        if (!data.error) setProjectData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching project:', err);
        setLoading(false);
      });
  }, [projectId]);

  // Auto-scroll horizontal bằng nút cuộn chuột (tuỳ chọn thêm để tiện UX)
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e) => {
      // Nếu scroll dọc (deltaY), tự động chuyển thành scroll chéo ngang (scrollLeft)
      if (e.deltaY !== 0) {
        container.scrollLeft += e.deltaY;
      }
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, [loading]);

  if (loading) {
    return (
      <div className="w-full h-screen bg-white flex items-center justify-center font-sans">
        <div className="text-xs uppercase tracking-[0.2em] font-bold animate-pulse text-gray-400">Loading Configuration...</div>
      </div>
    );
  }

  if (!projectData) {
    return (
      <div className="w-full h-screen bg-white flex flex-col items-center justify-center font-sans">
        <div className="text-xl uppercase font-black text-black">PROJECT NOT FOUND</div>
        <Link href="/" className="mt-4 text-[10px] uppercase tracking-widest text-gray-500 hover:text-black">Return Home</Link>
      </div>
    );
  }

  return (
    <div className="relative font-sans text-black">
      
      {/* Nút Đóng (Góc trên phải) */}
      <Link href="/" className="fixed top-8 right-8 z-50 cursor-pointer text-black hover:opacity-50 transition-opacity p-2">
        <X size={32} strokeWidth={1} />
      </Link>

      {/* CSS ẩn thanh cuộn */}
      <style dangerouslySetInnerHTML={{__html: `
        .scrollbar-hidden::-webkit-scrollbar { display: none; }
        .scrollbar-hidden { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />

      {/* TRACK NGANG CHÍNH */}
      <div 
        ref={containerRef}
        className="h-screen w-screen bg-white overflow-x-auto overflow-y-hidden flex flex-nowrap items-center gap-[5vw] px-[10vw] scrollbar-hidden overscroll-none"
      >
        
        {/* =========================================
            BLOCK 1: COVER IMAGE & STICKY INFO
        =========================================== */}
        <div className="relative h-[76vh] aspect-[3/2] shrink-0 transform-gpu mt-12">
          
          {/* LayoutId kết nối với trang Home để bung ảnh ra */}
          <motion.div 
            layoutId={`project-image-${projectData._id}`}
            className="w-full h-full relative z-10 bg-gray-100"
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            {projectData.general?.coverImage && (
              <Image 
                src={projectData.general.coverImage}
                alt="Cover"
                fill
                priority
                sizes="(max-width: 1024px) 76vh, 90vw"
                className="object-cover"
              />
            )}
          </motion.div>

          {/* Sticky Info nằm tuyệt đối bên TRÁI ảnh chính */}
          <div className="absolute top-0 right-full mr-10 w-[300px] flex flex-col items-end text-right z-20">
            {/* Icon vuông đen */}
            <div className="size-[50px] bg-black text-white flex items-center justify-center shadow-md mb-6">
              <Building2 size={24} strokeWidth={1.5} />
            </div>
            {/* Tiêu đề & Địa điểm */}
            <h1 className="text-3xl lg:text-4xl font-bold uppercase tracking-tighter text-black leading-none m-0 p-0 break-words w-full">
              {projectData.general?.title}
            </h1>
            <p className="mt-2 text-xs text-gray-500 uppercase tracking-[0.25em] font-medium">
              {projectData.general?.location}
            </p>
          </div>
        </div>

        {/* =========================================
            DYNAMIC BLOCKS (Horizon Sequence)
        =========================================== */}
        {projectData.blocks && projectData.blocks.map(block => {
          switch(block.type) {
            case 'text':
              return (
                <div key={block.id} className="w-[300px] shrink-0 flex flex-col justify-center h-[76vh] mt-12 bg-white z-10 px-4 lg:px-0">
                  <p className="text-[13px] leading-relaxed text-black font-medium whitespace-pre-wrap">
                    {block.content}
                  </p>
                </div>
              );
            case 'image':
              return (
                <div key={block.id} className="relative h-[76vh] shrink-0 transform-gpu mt-12 flex flex-col items-center justify-center">
                  <div className="relative h-full aspect-[3/2] group">
                    <Image 
                      src={block.url || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2070'}
                      alt={block.caption || 'Block Image'}
                      fill
                      sizes="(max-width: 1024px) 76vh, 90vw"
                      className="object-cover filter grayscale group-hover:grayscale-0 transition-all duration-700 ease-[0.16,1,0.3,1]"
                    />
                  </div>
                  {block.caption && (
                    <div className="mt-4 text-[10px] text-gray-500 tracking-widest uppercase">{block.caption}</div>
                  )}
                </div>
              );
            case 'slider':
              return block.slides.map((slide, sIdx) => (
                <div key={`${block.id}-${sIdx}`} className="relative h-[76vh] aspect-[3/2] shrink-0 group transform-gpu mt-12">
                  <Image 
                    src={slide.url || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2070'}
                    alt={slide.caption || `Slide ${sIdx}`}
                    fill
                    sizes="(max-width: 1024px) 76vh, 90vw"
                    className="object-cover filter grayscale hover:grayscale-0 transition-all duration-700"
                  />
                  {slide.caption && (
                    <div className="absolute bottom-4 left-4 bg-white/90 px-3 py-1 text-[9px] uppercase tracking-widest z-20">
                      {slide.caption}
                    </div>
                  )}
                </div>
              ));
            case 'video':
              return (
                <div key={block.id} className="w-[80vw] max-w-[1000px] shrink-0 h-[76vh] mt-12 bg-black flex items-center justify-center overflow-hidden">
                  <iframe 
                    src={block.iframeUrl} 
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowFullScreen
                  ></iframe>
                </div>
              );
            case 'credits':
              return (
                <div key={block.id} className="h-[76vh] shrink-0 flex flex-col flex-wrap gap-x-16 gap-y-6 pt-10 pb-10 content-start bg-white z-10 w-fit mt-12 pr-[10vw]">
                  <div className="w-full flex-[0_0_100%] max-h-0 border-t border-black mb-8"></div>
                  
                  <h2 className="text-[10px] uppercase font-black tracking-[0.2em] mb-4 text-black w-full">Project Credits</h2>
                  
                  {block.roles.map((role, idx) => (
                    <div key={idx} className="max-w-[200px] mb-4 break-words">
                      <span className="text-[10px] text-gray-400 uppercase tracking-widest mb-1 block">
                        {role.roleName}
                      </span>
                      <span className="text-[12px] leading-tight font-bold uppercase text-black block">
                        {role.people}
                      </span>
                    </div>
                  ))}
                </div>
              );
            default:
              return null;
          }
        })}

      </div>
    </div>
  );
}
