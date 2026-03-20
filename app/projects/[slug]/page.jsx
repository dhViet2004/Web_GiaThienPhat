'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { X, Building2 } from 'lucide-react';
import gsap from 'gsap';

// --- MOCK DATA MỚI (CHỨA ĐẦY ĐỦ CÁC TRƯỜNG DỮ LIỆU NHƯ WEB BIG) ---
const mockProjectData = {
  _id: "p1", // ID khớp với trang chủ để chạy animation layoutId
  general: {
    title: "East Side Coastal Resiliency",
    location: "New York, United States",
    client: "City of New York | NYC DDC",
    typology: "Urbanism",
    status: "In Construction",
    coverImage: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2070"
  },
  description: "The East Side Coastal Resiliency (ESCR) project emerged from the U.S Department of Housing and Urban Development (HUD)’s Rebuild by Design competition, which sought to develop innovative design solutions to increase the resiliency of Sandy-impacted communities.\n\nThe 2.5-mile project area is located within the Federal Emergency Management Agency (FEMA) 100-year floodplain in Manhattan, spanning from Montgomery Street to East 25th Street along the East River.",
  sliderGallery: [
    "https://images.unsplash.com/photo-1449844908441-8829872d2607?q=80&w=2070",
    "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070",
    "https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=2069"
  ],
  sliderCaption: "TYPICAL ARRANGEMENT — Traditional designs often position elements deep within the plan, away from daylight and external views.",
  extraImages: [
    "https://images.unsplash.com/photo-1486325212027-8081e485255e?q=80&w=2070"
  ],
  credits: [
    { role: "Partner in Charge", name: "Bjarke Ingels" },
    { role: "Partner in Charge", name: "Kai-Uwe Bergmann" },
    { role: "Project Manager", name: "Jeremy Alain Siegel" },
    { role: "Design Lead", name: "Autumn Visconti" },
    { role: "Project Team", name: "Adam Poole" },
    { role: "Project Team", name: "Emmett Walker" },
    { role: "Project Team", name: "Erik Kreider" },
    { role: "Collaborators", name: "AKRF & KSE" },
    { role: "Collaborators", name: "MNLA" },
    { role: "Collaborators", name: "ONE Architecture" },
  ]
};

export default function ProjectDetail({ params }) {
  const containerRef = useRef(null);
  const [projectData, setProjectData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSlide, setActiveSlide] = useState(0); // Quản lý trạng thái của khối Slider

  const resolvedParams = React.use(params);
  const projectId = resolvedParams.slug;

  // Lấy dữ liệu (Mô phỏng gọi API)
  useEffect(() => {
    // Trong thực tế, bạn sẽ fetch từ API: fetch(`/api/projects/${projectId}`)
    // Ở đây mình set thẳng dữ liệu giả lập để bạn test UI
    setTimeout(() => {
      setProjectData(mockProjectData);
      setLoading(false);
    }, 500);
  }, [projectId]);

  // Mượt hóa cuộn ngang bằng GSAP
  useEffect(() => {
    const container = containerRef.current;
    if (!container || loading) return;

    let targetScroll = container.scrollLeft;
    
    const handleWheel = (e) => {
      // Nếu di chuyển ngang (deltaX) từ Trackpad, để trình duyệt xử lý tự nhiên
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
        targetScroll = container.scrollLeft; // Cập nhật lại đích để không bị nhảy khi dùng wheel sau đó
        return; 
      }

      e.preventDefault();
      
      // Hỗ trợ cuộn dọc -> ngang
      // Hệ số 1.5 để cảm giác lướt nhanh và thoáng hơn
      targetScroll += e.deltaY * 1.5;
      
      // Giới hạn vùng cuộn
      const maxScroll = container.scrollWidth - container.clientWidth;
      targetScroll = Math.max(0, Math.min(targetScroll, maxScroll));

      // Thực hiện hiệu ứng lướt mượt
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
  }, [loading]);

  if (loading) {
    return (
      <div className="w-full h-screen bg-white flex items-center justify-center font-sans">
        <div className="text-xs uppercase tracking-[0.2em] font-bold animate-pulse text-gray-400">Loading Configuration...</div>
      </div>
    );
  }

  return (
    <div className="relative font-sans text-black bg-white min-h-screen">

      {/* Nút Đóng (Góc trên phải) */}
      <Link href="/" className="fixed top-8 right-8 z-50 cursor-pointer text-black hover:opacity-50 transition-opacity p-2">
        <X size={32} strokeWidth={1} />
      </Link>

      {/* Ẩn thanh cuộn */}
      <style dangerouslySetInnerHTML={{
        __html: `
        .scrollbar-hidden::-webkit-scrollbar { display: none; }
        .scrollbar-hidden { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />

      {/* TRACK NGANG CHÍNH */}
      <div
        ref={containerRef}
        className="h-screen w-screen overflow-x-auto overflow-y-hidden flex flex-nowrap items-start gap-[5vw] lg:gap-16 px-[10vw] scrollbar-hidden overscroll-none"
      >

        {/* Khoảng đệm giả lập đẩy hình ảnh ra giữa màn hình lúc đầu */}
        <div className="relative z-50 hidden h-px flex-[0_0_auto] lg:block" style={{ width: 'calc(-64px - 49.39vh + 50vw)' }}></div>

        {/* =========================================
            KHỐI 1: BÌA DỰ ÁN & THÔNG TIN CHUNG
        =========================================== */}
        <div className="relative h-full flex flex-col justify-center flex-[0_0_auto] shrink-0 transform-gpu pt-12 pb-12 lg:pt-[12vh] lg:pb-[12vh]">

          <motion.div
            layoutId={`project-image-${projectData._id}`}
            className="w-auto h-full max-h-[76vh] relative z-10 shadow-sm"
            style={{ aspectRatio: '3432 / 2288' }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <Image
              src={projectData.general.coverImage}
              alt="Cover"
              fill
              priority
              sizes="(max-width: 1024px) 76vh, 90vw"
              className="object-cover"
            />
          </motion.div>

          {/* Sticky Info Box */}
          <div className="absolute top-0 right-full mr-[30px] lg:mr-[44px] w-[300px] flex flex-col items-end text-right z-20 pt-[12vh]">
            <div className="size-[38px] lg:size-[50px] bg-black text-white flex items-center justify-center shadow-md mb-4 lg:mb-6">
              <Building2 size={24} strokeWidth={1.5} />
            </div>
            <h1 className="text-xl lg:text-3xl font-bold uppercase tracking-tighter text-black leading-none m-0 p-0 break-words w-full">
              {projectData.general.title}
            </h1>
            <p className="mt-2 text-[10px] lg:text-[12px] text-[#797979] uppercase tracking-widest font-medium mb-6">
              {projectData.general.location}
            </p>

            {/* Bổ sung Metadata */}
            <div className="hidden lg:flex flex-col items-end w-full">
              <h4 className="text-[10px] text-[#797979] uppercase">Client</h4>
              <p className="text-[12px] text-black uppercase mb-3">{projectData.general.client}</p>

              <h4 className="text-[10px] text-[#797979] uppercase">Typology</h4>
              <p className="text-[12px] text-black uppercase mb-3">{projectData.general.typology}</p>

              <h4 className="text-[10px] text-[#797979] uppercase">Status</h4>
              <p className="text-[12px] text-black uppercase">{projectData.general.status}</p>
            </div>
          </div>
        </div>

        {/* =========================================
            KHỐI 2: ĐOẠN VĂN BẢN CHÍNH (Rộng 290px)
        =========================================== */}
        <div className="relative h-auto flex flex-col shrink-0 self-stretch lg:h-full lg:self-end lg:mt-10 lg:pb-[12vh]">
          <div className="min-w-[290px] w-[290px] text-[13px] leading-[18px] lg:text-sm lg:leading-[20px] text-black flex flex-col pt-12 lg:pt-[12vh]">
            <p className="whitespace-pre-wrap">{projectData.description}</p>
          </div>
        </div>

        {/* =========================================
            KHỐI 3: SLIDER ẢNH XẾP CHỒNG (CROSSFADE)
        =========================================== */}
        {projectData.sliderGallery && projectData.sliderGallery.length > 0 && (
          <div className="relative h-[76vh] flex-[0_0_auto] shrink-0 self-center">
            {/* Vùng CSS Grid để xếp đè ảnh lên nhau */}
            <div className="grid h-full w-auto cursor-pointer" onClick={() => setActiveSlide((prev) => (prev + 1) % projectData.sliderGallery.length)} style={{ aspectRatio: '3432 / 2288' }}>
              {projectData.sliderGallery.map((img, idx) => (
                <div
                  key={idx}
                  className={`relative h-full w-full transition-opacity duration-500 ease-in-out col-start-1 row-start-1 ${idx === activeSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
                >
                  <Image
                    src={img}
                    alt={`Slide ${idx}`}
                    fill
                    sizes="76vh"
                    className="object-cover"
                  />
                  {/* Caption & Bộ đếm */}
                  <div className="absolute bottom-4 right-0 left-0 text-center px-8 z-50">
                    <p className="text-[10px] md:text-[11px] text-black bg-white/70 inline-block px-3 py-1">
                      <span className="font-bold uppercase pr-2">{projectData.sliderCaption}</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Bộ đếm ở góc dưới phải (01 / 03) */}
            <div className="absolute right-0 bottom-[-20px] text-[10px] text-gray-500 flex gap-1 font-mono">
              <span className="text-black font-bold">0{activeSlide + 1}</span>
              <span>/</span>
              <span>0{projectData.sliderGallery.length}</span>
            </div>
          </div>
        )}

        {/* =========================================
            KHỐI 4: ẢNH GALLERY BÌNH THƯỜNG
        =========================================== */}
        {projectData.extraImages && projectData.extraImages.map((img, idx) => (
          <div key={`extra-${idx}`} className="relative h-[76vh] flex-[0_0_auto] shrink-0 self-center shadow-sm" style={{ aspectRatio: '3432 / 2288' }}>
            <Image
              src={img}
              alt={`Extra ${idx}`}
              fill
              sizes="76vh"
              className="object-cover"
            />
          </div>
        ))}

        {/* =========================================
            KHỐI 5: DANH SÁCH TEAM (FLEX COLUMN WRAP)
        =========================================== */}
        <div className="flex h-[76vh] max-h-[76vh] flex-col flex-wrap gap-x-12 lg:gap-x-16 lg:py-[6vh] shrink-0 content-start">
          <h3 className="mb-4 w-[200px] text-[14px] font-bold text-black uppercase tracking-widest border-b border-black pb-2">
            Project Credits
          </h3>

          {projectData.credits.map((credit, idx) => (
            <div key={idx} className="w-[180px] lg:w-[200px] mb-3 lg:mb-4">
              <h4 className="mb-1 text-[10px] text-[#969696] uppercase tracking-wider">{credit.role}</h4>
              <p className="text-[13px] lg:text-[14px] text-black font-medium leading-tight">{credit.name}</p>
            </div>
          ))}
        </div>

        {/* =========================================
            KHỐI 6: THE END SPACER
        =========================================== */}
        <div className="h-px w-[70vw] shrink-0 flex-[0_0_auto]"></div>

      </div>
    </div>
  );
}