'use client';

import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CustomEase } from 'gsap/CustomEase';
import { useGSAP } from '@gsap/react';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, Trees, Sofa, LayoutTemplate, Video, ImageIcon } from 'lucide-react';
import ProjectDetailOverlay from './ProjectDetailOverlay';
import { apiGet } from '@/lib/api';

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
  
  // Basic projects list (for feed display)
  const [projects, setProjects] = useState([]);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Full project data cache - prefetched during intro
  const [projectsCache, setProjectsCache] = useState({});
  
  // Overlay state
  const [selectedProject, setSelectedProject] = useState(null);
  const [isExiting, setIsExiting] = useState(false);

  // Track if we're in intro phase (prefetching data)
  const [isIntroPhase, setIsIntroPhase] = useState(true);

  // Prefetch all project details
  const prefetchAllProjects = useCallback(async (projectsList) => {
    if (!projectsList || projectsList.length === 0) return;
    
    const cache = {};
    
    // Fetch all project details in parallel (but limit concurrency)
    const batchSize = 5;
    for (let i = 0; i < projectsList.length; i += batchSize) {
      const batch = projectsList.slice(i, i + batchSize);
      const promises = batch.map(project => 
        apiGet(`/api/projects/${project._id}`)
          .then(data => {
            if (!data.error && (data.project || data)) {
              cache[project._id] = data.project || data;
            }
          })
          .catch(err => {
            console.warn(`Failed to prefetch project ${project._id}:`, err);
            // Cache the basic data as fallback
            cache[project._id] = project;
          })
      );
      await Promise.all(promises);
    }
    
    setProjectsCache(cache);
  }, []);

  // Initialize: fetch projects list, then prefetch all details
  useEffect(() => {
    let mounted = true;
    
    const init = async () => {
      try {
        const data = await apiGet('/api/projects');
        if (!mounted) return;
        
        if (!data.error && Array.isArray(data)) {
          setProjects(data);
          
          // Check if URL has a project ID (direct link)
          const pathParts = window.location.pathname.split('/');
          const projectUrlId = pathParts[pathParts.length - 1];
          const found = data.find(p => p._id === projectUrlId);
          if (found) {
            setSelectedProject(found);
          }
        }
        
        setIsInitialized(true);
        
        // Wait for intro to start or finish, then prefetch
        const startPrefetch = () => {
          setIsIntroPhase(true);
          prefetchAllProjects(data);
          // After prefetch, mark intro phase as done
          setTimeout(() => setIsIntroPhase(false), 100);
        };
        
        // Listen for intro start or fallback
        window.addEventListener('introStarted', startPrefetch, { once: true });
        
        // If intro already started (unlikely), or as fallback
        const fallback = setTimeout(startPrefetch, 100);
        
        return () => {
          window.removeEventListener('introStarted', startPrefetch);
          clearTimeout(fallback);
        };
      } catch (err) {
        console.error('Error fetching projects:', err);
        setIsInitialized(true);
      }
    };
    
    init();
    
    return () => {
      mounted = false;
    };
  }, [prefetchAllProjects]);

  // Listen for intro complete to trigger prefetch if not started
  useEffect(() => {
    const handleIntroComplete = () => {
      if (projects.length > 0 && Object.keys(projectsCache).length === 0) {
        prefetchAllProjects(projects);
      }
    };
    
    window.addEventListener('introAnimationComplete', handleIntroComplete);
    
    // Fallback: if intro takes too long, prefetch anyway
    const fallback = setTimeout(() => {
      if (projects.length > 0 && Object.keys(projectsCache).length === 0) {
        prefetchAllProjects(projects);
      }
    }, 4000);
    
    return () => {
      window.removeEventListener('introAnimationComplete', handleIntroComplete);
      clearTimeout(fallback);
    };
  }, [projects, projectsCache, prefetchAllProjects]);

  // Handle browser back/forward
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
      gsap.killTweensOf('.projects-scaler');
      gsap.set('.velocity-card', { scale: 1, y: 0 });
      document.body.style.overflow = 'hidden';
      setSelectedProject(project);
      // No loading state - use cached data immediately
    } else {
      window.history.pushState(null, '', '/');
      setIsExiting(true);
      gsap.set('.velocity-card', { scale: 1, y: 0 });
      setSelectedProject(null);
      setTimeout(() => {
        document.body.style.overflow = 'auto';
        setIsExiting(false);
      }, 800);
    }
  }, []);

  // Get full project data from cache (with fallback to basic data)
  const getProjectData = useCallback((projectId) => {
    return projectsCache[projectId] || projects.find(p => p._id === projectId) || null;
  }, [projectsCache, projects]);

  // GSAP animations
  useEffect(() => {
    const handleIntroComplete = () => {
      setTimeout(() => ScrollTrigger.refresh(), 100);
    };
    window.addEventListener('introAnimationComplete', handleIntroComplete);
    const fallback = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 4500);
    return () => {
      window.removeEventListener('introAnimationComplete', handleIntroComplete);
      clearTimeout(fallback);
    };
  }, []);

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

  }, { scope: containerRef, dependencies: [isInitialized, projects.length] });

  // Don't show loading - render projects immediately (empty list if not loaded yet)
  if (!isInitialized) {
    return (
      <div className="w-full bg-white relative pt-36 pb-[30vh] overflow-hidden z-10" />
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
                    <div className="hidden md:flex absolute top-0 right-full mr-[10px] lg:mr-[16px] w-[324px] project-info justify-end z-20">
                      <div className="relative w-full text-right flex flex-col items-end origin-right">
                        <div className="absolute top-0 right-0 size-[38px] lg:size-[50px] bg-black text-white flex items-center justify-center">
                          <ProjectIcon size={22} strokeWidth={1.5} />
                        </div>

                        <Link href={linkHref} className="mt-0 group cursor-pointer flex flex-col items-end">
                          <motion.div
                            className="relative pr-6 lg:pr-15"
                            whileHover="hover"
                            initial="rest"
                          >
                            <h2 className="text-[14px] lg:text-[18px] font-normal uppercase text-black m-0 p-0 leading-tight whitespace-nowrap">
                              {project.general?.title}
                            </h2>
                            <motion.span
                              className="absolute -bottom-1 right-6 lg:right-8 h-px bg-black"
                              variants={{ rest: { width: 0 }, hover: { width: '100%' } }}
                              transition={{ duration: 0.4, ease: [0.45, 0, 0.55, 1] }}
                            />
                          </motion.div>
                          <p className="text-[#797979] text-[11px] lg:text-[12px] uppercase mt-[4px] lg:mt-[6px] pr-6 lg:pr-15">
                            {project.general?.location}
                          </p>
                        </Link>
                      </div>
                    </div>

                    <div className="shrink-0 project-image overflow-hidden w-[90vw] sm:w-[350px] lg:w-[64vh] aspect-3/2">
                      <div className="relative w-full h-full">
                        <motion.div
                          onClick={() => handleSelectProject(project)}
                          className="relative w-full h-full cursor-pointer group"
                          whileHover="hover"
                          initial="rest"
                          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                        >
                          <Image
                            src={project.general?.coverImage || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2070'}
                            alt={project.general?.title || 'Preview'}
                            fill
                            priority={index < 4}
                            sizes="(max-width: 768px) 90vw, 64vh"
                            className="object-cover"
                          />
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
            project={getProjectData(selectedProject._id)}
            onClose={() => handleSelectProject(null)}
            isLoading={false}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
