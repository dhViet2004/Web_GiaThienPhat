'use client';

import React, { useRef, useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CustomEase } from 'gsap/CustomEase';
import { useGSAP } from '@gsap/react';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, Trees, Sofa, LayoutTemplate, Video, ImageIcon } from 'lucide-react';
import ProjectDetailOverlay from './ProjectDetailOverlay';

gsap.registerPlugin(ScrollTrigger, CustomEase);

CustomEase.create('customBIG', 'M0,0 C0.45,0 0.55,1 1,1');

const IconMap = {
  Building2: Building2,
  Trees: Trees,
  Sofa: Sofa,
  LayoutTemplate: LayoutTemplate,
  Video: Video,
  Image: ImageIcon
};

export default function ProjectsFeed() {
  const containerRef = useRef(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedProjectFull, setSelectedProjectFull] = useState(null);
  const [isExiting, setIsExiting] = useState(false);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  useEffect(() => {
    fetch('/api/projects')
      .then(res => res.json())
      .then(data => {
        if (!data.error) {
          setProjects(data);
          const pathParts = window.location.pathname.split('/');
          const projectUrlId = pathParts[pathParts.length - 1];
          const found = data.find(p => p._id === projectUrlId);
          if (found) setSelectedProject(found);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

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

  const handleSelectProject = (project) => {
    if (project) {
      window.history.pushState(null, '', `/projects/${project._id}`);
      gsap.killTweensOf('.velocity-card');
      gsap.killTweensOf('.projects-scaler');
      gsap.set('.velocity-card', { scale: 1, y: 0 });
      document.body.style.overflow = 'hidden';
      setSelectedProject(project);
      setSelectedProjectFull(null);
      setIsLoadingDetail(true);

      // Fetch full project data including sliderGallery and blocks
      fetch(`/api/projects/${project._id}`)
        .then(res => res.json())
        .then(data => {
          if (!data.error && data.project) {
            setSelectedProjectFull(data.project);
          } else {
            // Fallback to basic project data if API fails
            setSelectedProjectFull(project);
          }
          setIsLoadingDetail(false);
        })
        .catch(err => {
          console.error('Error fetching project detail:', err);
          setSelectedProjectFull(project);
          setIsLoadingDetail(false);
        });
    } else {
      window.history.pushState(null, '', '/');
      setIsExiting(true);
      gsap.set('.velocity-card', { scale: 1, y: 0 });
      setSelectedProject(null);
      setSelectedProjectFull(null);
      setIsLoadingDetail(false);
      setTimeout(() => {
        document.body.style.overflow = 'auto';
        setIsExiting(false);
      }, 800);
    }
  };

  useEffect(() => {
    const handleIntroComplete = () => {
      setTimeout(() => ScrollTrigger.refresh(), 100);
    };
    window.addEventListener('introAnimationComplete', handleIntroComplete);
    const fallback = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 3500);
    return () => {
      window.removeEventListener('introAnimationComplete', handleIntroComplete);
      clearTimeout(fallback);
    };
  }, []);

  useGSAP(() => {
    if (loading || projects.length === 0) return;

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

      gsap.fromTo(imageBlock,
        { y: 150, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: 'customBIG', force3D: true, scrollTrigger: st }
      );

      gsap.fromTo(infoWrapper,
        { y: 100, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: 'customBIG', force3D: true, delay: 0.1, scrollTrigger: st }
      );
    });

  }, { scope: containerRef, dependencies: [loading, projects.length] });

  if (loading) {
    return (
      <div className="w-full h-screen bg-white flex items-center justify-center font-sans">
        <div className="text-xs uppercase tracking-[0.2em] font-bold animate-pulse text-gray-400">Loading Projects...</div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="w-full bg-white relative pt-36 pb-[30vh] overflow-hidden z-10">
      <div className="w-full max-w-[1800px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16">
        <div
          className="projects-scaler origin-top will-change-transform"
          style={{
            transformOrigin: '50% 0%',
            transform: 'translateZ(0)',
            pointerEvents: (selectedProject || isExiting) ? 'none' : 'auto',
            opacity: selectedProject ? 0 : 1,
            transition: 'opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
        >
          <div className="flex flex-col items-center gap-[5vh] lg:gap-[4vh] w-full">
            {projects.map((project, index) => {
              const ProjectIcon = IconMap[project.general?.icon] || Building2;
              const linkHref = `/projects/${project._id}`;

              return (
                <section
                  key={project._id || index}
                  className="project-row relative flex w-full max-w-[1600px] justify-center items-start"
                >
                  <div className="velocity-card relative flex flex-col md:inline-flex md:flex-row items-start will-change-transform">
                    <div className="hidden md:flex absolute top-0 right-full mr-[30px] lg:mr-[44px] w-[324px] project-info justify-end z-20">
                      <div className="relative w-full text-right flex flex-col items-end origin-right">
                        <div className="absolute top-0 right-0 size-[38px] lg:size-[50px] bg-black text-white flex items-center justify-center">
                          <ProjectIcon size={22} strokeWidth={1.5} />
                        </div>

                        <Link href={linkHref} className="mt-[18px] lg:mt-[24px] group cursor-pointer flex flex-col items-end">
                          <motion.div
                            className="relative pr-14 lg:pr-20"
                            whileHover="hover"
                            initial="rest"
                          >
                            <h2 className="text-[14px] lg:text-[18px] font-normal uppercase text-black m-0 p-0 leading-tight whitespace-nowrap">
                              {project.general?.title}
                            </h2>
                            <motion.span
                              className="absolute -bottom-1 right-14 lg:right-20 h-px bg-black"
                              variants={{ rest: { width: 0 }, hover: { width: '100%' } }}
                              transition={{ duration: 0.4, ease: [0.45, 0, 0.55, 1] }}
                            />
                          </motion.div>
                          <p className="text-[#797979] text-[11px] lg:text-[12px] uppercase mt-[4px] lg:mt-[6px] pr-14 lg:pr-20">
                            {project.general?.location}
                          </p>
                        </Link>
                      </div>
                    </div>

                    <div className="shrink-0 project-image overflow-hidden w-[90vw] sm:w-[350px] lg:w-[64vh] aspect-3/2">
                      <div className="relative w-full h-full">
                        <motion.div
                          layoutId={`project-image-${project._id}`}
                          onClick={() => handleSelectProject(project)}
                          className="relative w-full h-full cursor-pointer group"
                          whileHover="hover"
                          initial="rest"
                          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                        >
                          <div className="relative w-full h-full">
                            <Image
                              src={project.general?.coverImage || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2070'}
                              alt={project.general?.title || 'Preview'}
                              fill
                              priority={index < 4}
                              sizes="(max-width: 768px) 90vw, 64vh"
                              className="object-cover"
                            />
                          </div>
                          <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                        </motion.div>
                      </div>
                    </div>

                    <div className="flex md:hidden flex-col w-full mt-4 project-info px-2">
                      <Link href={linkHref} className="flex items-start gap-4">
                        <div className="size-[30px] bg-black text-white shrink-0 flex items-center justify-center">
                          <ProjectIcon size={16} strokeWidth={1.5} />
                        </div>
                        <div>
                          <h2 className="text-[15px] font-normal uppercase text-black leading-none">{project.general?.title}</h2>
                          <p className="text-[#797979] text-[11px] uppercase mt-1">{project.general?.location}</p>
                        </div>
                      </Link>
                    </div>
                  </div>
                </section>
              );
            })}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {selectedProject && selectedProject.general && (
          <ProjectDetailOverlay
            key={selectedProject._id}
            project={selectedProjectFull || selectedProject}
            onClose={() => handleSelectProject(null)}
            isLoading={isLoadingDetail}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
