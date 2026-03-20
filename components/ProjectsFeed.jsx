'use client';

import React, { useRef, useEffect } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CustomEase } from 'gsap/CustomEase';
import { useGSAP } from '@gsap/react';
import { motion } from 'framer-motion';
import { Building2, Trees, Sofa } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger, CustomEase);

// Đường cong chuyển động mượt mà chuẩn kiến trúc
CustomEase.create('customBIG', 'M0,0 C0.45,0 0.55,1 1,1');

const projects = [
  { id: 'p1', title: 'The Drop', location: 'Istanbul, Turkey', imageURL: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2070', icon: Building2 },
  { id: 'p2', title: 'Copenhill', location: 'Copenhagen, Denmark', imageURL: 'https://images.unsplash.com/photo-1449844908441-8829872d2607?q=80&w=2070', icon: Trees },
  { id: 'p3', title: 'Via 57 West', location: 'New York, USA', imageURL: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?q=80&w=2070', icon: Building2 },
  { id: 'p4', title: 'Noma', location: 'Copenhagen, Denmark', imageURL: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070', icon: Sofa },
  { id: 'p5', title: 'The Drop', location: 'Istanbul, Turkey', imageURL: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2070', icon: Building2 },
  { id: 'p6', title: 'Copenhill', location: 'Copenhagen, Denmark', imageURL: 'https://images.unsplash.com/photo-1449844908441-8829872d2607?q=80&w=2070', icon: Trees },
  { id: 'p7', title: 'Via 57 West', location: 'New York, USA', imageURL: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?q=80&w=2070', icon: Building2 },
  { id: 'p8', title: 'Noma', location: 'Copenhagen, Denmark', imageURL: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070', icon: Sofa }
];

export default function ProjectsFeed() {
  const containerRef = useRef(null);

  useEffect(() => {
    const handleIntroComplete = () => {
      setTimeout(() => ScrollTrigger.refresh(), 100);
    };
    window.addEventListener("introAnimationComplete", handleIntroComplete);

    // Bảo hiểm: Tự động refresh sau 2s đề phòng lỗi
    const backupTimer = setTimeout(() => ScrollTrigger.refresh(), 2000);

    return () => {
      window.removeEventListener("introAnimationComplete", handleIntroComplete);
      clearTimeout(backupTimer);
    };
  }, []);

  useGSAP(() => {
    // 1. Scale và Quán tính Toàn cục
    gsap.to('.projects-scaler', {
      scale: 0.95,
      y: '4vh',
      ease: 'none',
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top top',
        end: 'bottom bottom',
        // ĐIỀU CHỈNH 1: Đổi scrub: true thành số (1.2 giây) 
        // Khi dừng cuộn, trang web sẽ vẫn tiếp tục thu nhỏ/trượt thêm 1.2s nữa
        scrub: 1.2,
      }
    });

    // 2. Velocity Scale & Momentum Shift (Quán tính kéo giãn)
    ScrollTrigger.create({
      trigger: containerRef.current,
      start: 'top bottom',
      end: 'bottom top',
      onUpdate: (self) => {
        const rawVelocity = typeof self.getVelocity === 'function' ? self.getVelocity() : 0;
        const velocity = Math.abs(rawVelocity);

        // Scale
        const targetCardScale = Math.max(0.97, 1 - velocity / 8000);

        // ĐIỀU CHỈNH 2: TÍNH TOÁN QUÁN TÍNH DỌC (Momentum Y)
        // Khi cuộn xuống (rawVelocity > 0), khối sẽ bị kéo xuống dưới (y dương) như bị vướng gió.
        // Dùng utils.clamp để giới hạn độ văng tối đa là 80px để tránh vỡ giao diện.
        const momentumY = gsap.utils.clamp(-80, 80, rawVelocity / 25);

        gsap.to('.velocity-card', {
          scale: targetCardScale,
          y: momentumY, // Áp dụng lực cản
          duration: 0.8, // Mất 0.8s để khối đàn hồi nảy ngược về vị trí cũ sau khi ngừng cuộn
          ease: 'power3.out',
          overwrite: 'auto',
        });
      }
    });

    // 3. Hiệu ứng Parallax Reveal ban đầu cho từng item
    const items = gsap.utils.toArray('.project-row');
    items.forEach((item) => {
      const imageBlock = item.querySelector('.project-image');
      const infoWrapper = item.querySelector('.project-info');

      const st = {
        trigger: item,
        start: 'top 95%',
        toggleActions: 'play none none reverse',
      };

      gsap.fromTo(imageBlock,
        { y: 150, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: 'customBIG', force3D: true, scrollTrigger: st }
      );

      gsap.fromTo(infoWrapper,
        { y: 100, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: 'customBIG', force3D: true, delay: 0.1, scrollTrigger: st }
      );
    });

  }, { scope: containerRef });

  return (
    <div ref={containerRef} className="w-full bg-white relative pt-36 pb-[30vh] overflow-hidden z-10">

      <div
        className="projects-scaler origin-top will-change-transform"
        style={{ transformOrigin: '50% 0%', transform: 'translateZ(0)' }}
      >
        <div className="flex flex-col items-center gap-[8vh] lg:gap-[12vh] w-full px-6 md:px-0">
          {projects.map((project, id) => (
            <section
              key={id}
              className="project-row relative flex w-full justify-center items-start"
            >

              {/* Khối này sẽ nhận quán tính (Momentum Shift) và đàn hồi mượt mà */}
              <div className="velocity-card relative flex flex-col md:inline-flex md:flex-row items-start will-change-transform transform-gpu">

                {/* --- CHỮ TRÊN DESKTOP --- */}
                <div className="hidden md:flex absolute top-0 right-full mr-[30px] lg:mr-[44px] w-[324px] project-info transform-gpu justify-end z-20">
                  <div className="relative w-full text-right flex flex-col items-end transform-gpu origin-right">

                    {/* Icon vuông đen */}
                    <div className="absolute top-0 right-0 size-[38px] lg:size-[50px] bg-black text-white flex items-center justify-center">
                      <project.icon size={22} strokeWidth={1.5} />
                    </div>

                    <div className="mt-[18px] lg:mt-[24px] group cursor-pointer flex flex-col items-end">
                      <motion.div
                        className="relative block transform-gpu pr-14 lg:pr-20"
                        whileHover="hover"
                        initial="rest"
                      >
                        <h2 className="text-[14px] lg:text-[18px] font-normal uppercase text-black m-0 p-0 leading-tight whitespace-nowrap">
                          {project.title}
                        </h2>
                        <motion.span
                          className="absolute -bottom-1 right-14 lg:right-20 h-[1px] bg-black"
                          variants={{ rest: { width: 0 }, hover: { width: '100%' } }}
                          transition={{ duration: 0.4, ease: [0.45, 0, 0.55, 1] }}
                        />
                      </motion.div>
                      <p className="text-[#797979] text-[11px] lg:text-[12px] uppercase mt-[4px] lg:mt-[6px] pr-14 lg:pr-20">
                        {project.location}
                      </p>
                    </div>
                  </div>
                </div>

                {/* --- ẢNH CHÍNH --- */}
                <div
                  className="shrink-0 project-image overflow-hidden transform-gpu w-[90vw] sm:w-[350px] lg:w-[64vh]"
                  style={{ aspectRatio: '2974 / 2288' }}
                >
                  <div className="relative w-full h-full transform-gpu origin-center will-change-transform">
                    <motion.div
                      className="relative w-full h-full cursor-pointer group"
                      whileHover="hover"
                      initial="rest"
                    >
                      <motion.div
                        variants={{
                          rest: { filter: "none" },
                          hover: { filter: "none" }
                        }}
                        transition={{ duration: 0.8, ease: [0.25, 1, 0.5, 1] }}
                        className="relative w-full h-full transform-gpu"
                      >
                        <Image
                          src={project.imageURL}
                          alt={project.title}
                          fill
                          priority={id < 4}
                          sizes="(max-width: 768px) 90vw, 64vh"
                          className="object-cover"
                        />
                      </motion.div>
                      <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                    </motion.div>
                  </div>
                </div>

                {/* --- CHỮ TRÊN MOBILE --- */}
                <div className="flex md:hidden flex-col w-full mt-4 project-info px-2">
                  <div className="flex items-start gap-4">
                    <div className="size-[30px] bg-black text-white shrink-0 flex items-center justify-center">
                      <project.icon size={16} strokeWidth={1.5} />
                    </div>
                    <div>
                      <h2 className="text-[15px] font-normal uppercase text-black leading-none">{project.title}</h2>
                      <p className="text-[#797979] text-[11px] uppercase mt-1">{project.location}</p>
                    </div>
                  </div>
                </div>

              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}