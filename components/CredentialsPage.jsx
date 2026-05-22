'use client';

import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import React, { useRef, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);
  return isMobile;
}

export default function CredentialsPage() {
  const isMobile = useIsMobile();
  const [credentialsItems, setCredentialsItems] = useState([]);

  useEffect(() => {
    fetch('/api/admin/credentials')
      .then(res => res.json())
      .then(data => {
        if (data.items) {
          setCredentialsItems(data.items);
        }
      })
      .catch(err => console.error('Failed to fetch credentials:', err));
  }, []);

  if (credentialsItems.length === 0) return null;

  return (
    <div className={`relative z-0 pointer-events-auto`}>
      {isMobile 
        ? <MobileCredentials introEnded={true} credentialsItems={credentialsItems} /> 
        : <DesktopCredentials introEnded={true} credentialsItems={credentialsItems} />}
    </div>
  );
}

function MobileCredentials({ introEnded, credentialsItems }) {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({ container: containerRef });
  const [activeIndex, setActiveIndex] = useState(0);
  const router = useRouter();

  const handleScroll = () => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const containerRect = container.getBoundingClientRect();
    const viewportCenter = containerRect.top + containerRect.height / 2;
    
    let minDistance = Infinity;
    let closestIndex = activeIndex;
    
    const children = container.getElementsByClassName('mobile-carousel-item');
    for (let i = 0; i < children.length; i++) {
      const rect = children[i].getBoundingClientRect();
      const childCenter = rect.top + rect.height / 2;
      const distance = Math.abs(childCenter - viewportCenter);
      if (distance < minDistance) {
        minDistance = distance;
        closestIndex = i;
      }
    }
    
    if (closestIndex !== activeIndex) {
      setActiveIndex(closestIndex);
    }
  };

  useEffect(() => {
    handleScroll();
  }, []);

  const displayItem = credentialsItems[activeIndex] || credentialsItems[0];

  return (
    <div className="bg-[#f2f2f2] h-[100dvh] flex flex-col relative font-sans text-gray-900 overflow-hidden">
      <header className={`absolute top-0 left-0 w-full z-50 pointer-events-none transition-opacity duration-1000 ${introEnded ? 'opacity-100' : 'opacity-0'}`}>
        <div className="px-4 py-3 flex justify-between items-center bg-[#f0f0f0]/95 backdrop-blur-md border-b border-gray-200 pointer-events-auto">
            <Link href="/" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                ← Home
            </Link>

            <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gray-200">
                <motion.div 
                  className="absolute top-0 left-0 h-full bg-black origin-left"
                  style={{ width: "100%", scaleX: scrollYProgress }}
                />
            </div>
        </div>
        
        <div className="px-4 py-2.5 flex justify-between items-center bg-white/80 backdrop-blur-md text-xs shadow-sm pointer-events-auto">
          <span className="font-medium truncate mr-4 text-gray-800">{displayItem.brand} : {displayItem.title}</span>
          <span className="shrink-0 text-gray-500 font-mono tracking-tighter">{activeIndex + 1}/{credentialsItems.length}</span>
        </div>
      </header>

      <div 
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 w-full flex flex-col overflow-y-scroll snap-y snap-mandatory items-center no-scrollbar relative pt-[30vh] pb-[30vh] z-20"
      >
        <div className="shrink-0 h-[10vh] w-full" />
        
        {credentialsItems.map((item, index) => (
          <MobileCarouselItem 
            key={item.id}
            item={item}
            index={index}
            containerRef={containerRef}
            introEnded={introEnded}
          />
        ))}

        <div className="shrink-0 h-[30vh] w-full" />
      </div>

      <div className={`absolute bottom-0 left-0 w-full bg-white/90 backdrop-blur-md h-[45px] flex items-center z-40 border-t border-gray-200 pointer-events-none transition-opacity duration-1000 delay-500 ${introEnded ? 'opacity-100' : 'opacity-0'}`}>
         <div className="flex items-end gap-[3px] h-5 px-4 w-[calc(100%-100px)]">
           {[...Array(40)].map((_, i) => (
             <RulerTick key={i} index={i} total={40} scrollProgress={scrollYProgress} />
           ))}
         </div>
         <div className="shrink-0 right-0 absolute bg-white/90 h-full flex items-center pr-4 pl-3 text-[10px] text-gray-500 font-mono tracking-tight shadow-[-4px_0_10px_rgba(255,255,255,1)]">
            {displayItem.brand.substring(0, 12)}{displayItem.brand.length > 12 ? '...' : ''}
         </div>
      </div>
    </div>
  );
}

const MobileCarouselItem = ({
  item,
  index,
  containerRef,
  introEnded
}) => {
  const ref = useRef(null);
  const router = useRouter();
  const clickStartPos = useRef({ x: 0, y: 0 });

  const { scrollYProgress } = useScroll({
    container: containerRef,
    target: ref,
    axis: 'y',
    offset: ['start end', 'end start'],
  });

  const scale = useTransform(
    scrollYProgress,
    [0, 0.15, 0.35, 0.5, 0.65, 0.85, 1],
    [0.75, 0.8, 0.9, 1, 0.9, 0.8, 0.75]
  );
  
  const archX = useTransform(
    scrollYProgress,
    [0, 0.15, 0.35, 0.5, 0.65, 0.85, 1],
    [150, 90, 20, -20, 20, 90, 150]
  );

  const y = useTransform(
    scrollYProgress,
    [0, 0.15, 0.35, 0.5, 0.65, 0.85, 1],
    ['-15%', '-8%', '-3%', '0%', '3%', '8%', '15%']
  );
  
  const zIndex = useTransform(
    scrollYProgress,
    [0, 0.45, 0.5, 0.55, 1],
    [0, 10, 20, 10, 0]
  );

  const handlePointerDown = (e) => {
    clickStartPos.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerUp = (e) => {
    const dx = Math.abs(e.clientX - clickStartPos.current.x);
    const dy = Math.abs(e.clientY - clickStartPos.current.y);
    if (dx < 5 && dy < 5) {
      router.push('/credentials/' + item.id);
    }
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 150, scale: 0.8 }}
      animate={introEnded ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 150, scale: 0.8 }}
      transition={{ duration: 1.2, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      className="mobile-carousel-item snap-center shrink-0 w-[82vw] max-w-[400px] aspect-video flex flex-col justify-center items-center relative my-3 cursor-pointer"
      style={{ perspective: 1200 }}
    >
      <motion.div
        style={{
          scale,
          x: archX,
          y,
          zIndex,
          transformOrigin: "left center"
        }}
        className="w-full h-full relative group shadow-2xl shadow-black/20 overflow-hidden"
      >
        <img
          src={item.src}
          alt={item.title}
          className="w-full h-full object-cover pointer-events-none"
        />
        
        <div className="absolute top-2 left-3 text-white text-[11px] font-medium tracking-wide drop-shadow-md">
          {item.brand}
        </div>
        
        {item.medal && (
            <div className="absolute -top-3 right-4 w-5 h-7 bg-gradient-to-b from-[#B8860B] to-[#DAA520] flex items-end justify-center pb-[#1px] clip-path-ribbon shadow-sm">
                <div className="w-2.5 h-2.5 bg-white/20 rounded-full flex items-center justify-center text-[6px] text-white">★</div>
            </div>
        )}
      </motion.div>
    </motion.div>
  );
};


function DesktopCredentials({ introEnded, credentialsItems }) {
  const containerRef = useRef(null);
  const { scrollXProgress } = useScroll({ container: containerRef });
  const [activeIndex, setActiveIndex] = useState(0);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const router = useRouter();

  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeftPos = useRef(0);

  const handleMouseDown = (e) => {
    isDragging.current = true;
    if (containerRef.current) {
      containerRef.current.style.scrollSnapType = 'none';
      startX.current = e.pageX - containerRef.current.offsetLeft;
      scrollLeftPos.current = containerRef.current.scrollLeft;
    }
  };

  const handleMouseLeave = () => {
    isDragging.current = false;
    if (containerRef.current) {
      containerRef.current.style.scrollSnapType = 'x mandatory';
    }
  };

  const handleMouseUp = () => {
    isDragging.current = false;
    if (containerRef.current) {
      containerRef.current.style.scrollSnapType = 'x mandatory';
    }
  };

  const handleMouseMove = (e) => {
    if (!isDragging.current || !containerRef.current) return;
    e.preventDefault();
    const x = e.pageX - containerRef.current.offsetLeft;
    const walk = (x - startX.current) * 1.5;
    containerRef.current.scrollLeft = scrollLeftPos.current - walk;
  };

  const handleScroll = () => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const viewportCenter = window.innerWidth / 2;
    
    let minDistance = Infinity;
    let closestIndex = activeIndex;

    const children = container.getElementsByClassName('carousel-item');
    for (let i = 0; i < children.length; i++) {
        const rect = children[i].getBoundingClientRect();
        const childCenter = rect.left + rect.width / 2;
        const distance = Math.abs(childCenter - viewportCenter);
        if (distance < minDistance) {
        minDistance = distance;
        closestIndex = i;
        }
    }
    
    if (closestIndex !== activeIndex) {
        setActiveIndex(closestIndex);
    }
  };

  useEffect(() => {
    handleScroll();
  }, []);

  const displayIndex = hoveredIndex !== null ? hoveredIndex : activeIndex;
  const displayItem = credentialsItems[displayIndex] || credentialsItems[0];

  return (
    <div className="bg-white min-h-screen flex flex-col relative overflow-hidden font-sans text-gray-900 selection:bg-black selection:text-white">
      
      <header className={`absolute top-0 left-0 w-full p-8 flex justify-between items-center z-50 pointer-events-none transition-opacity duration-1000 ${introEnded ? 'opacity-100' : 'opacity-0'}`}>
        <div />
      </header>

      <div className={`fixed top-[15vh] left-1/2 -translate-x-1/2 w-[90vw] max-w-2xl text-center pointer-events-none z-[100] transition-opacity duration-1000 delay-300 ${introEnded ? 'opacity-100' : 'opacity-0'}`}>
        <AnimatePresence mode="wait">
          <motion.div
            key={displayIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center justify-center gap-4 text-xs font-mono tracking-widest text-[#666] mb-4">
              <span>{displayItem.num}</span>
              <div className="h-[1px] bg-gray-400 flex-1" />
              <span>{displayItem.brand}</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-serif italic tracking-tight mb-2 text-[#222]">{displayItem.title}</h2>
            <p className="text-sm font-sans tracking-wide text-[#555] mt-4">{displayItem.subtitle}</p>
          </motion.div>
        </AnimatePresence>
      </div>

      <div 
        ref={containerRef}
        onScroll={handleScroll}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        className="w-full flex-1 flex overflow-x-scroll snap-x snap-mandatory items-center no-scrollbar relative pt-[38vh] pb-32 cursor-grab active:cursor-grabbing z-20"
      >
        <div className="shrink-0" style={{ width: 'calc(50vw - 8vw - 1rem)' }} />
        
        {credentialsItems.map((item, index) => (
          <DesktopCarouselItem 
            key={index} 
            index={index}
            item={item} 
            containerRef={containerRef} 
            setHoveredIndex={setHoveredIndex}
            introEnded={introEnded}
          />
        ))}

        <div className="shrink-0" style={{ width: 'calc(50vw - 8vw - 1rem)' }} />
      </div>

      <div className={`absolute bottom-10 left-1/2 -translate-x-1/2 w-[35vw] max-w-sm flex flex-col items-center justify-center z-10 pointer-events-none transition-opacity duration-1000 delay-500 ${introEnded ? 'opacity-100' : 'opacity-0'}`}>
        <div className="w-full h-[35px] flex gap-[3px] items-end justify-center mb-1">
          {[...Array(60)].map((_, i) => (
            <RulerTick key={i} index={i} total={60} scrollProgress={scrollXProgress} />
          ))}
        </div>
        <div className="w-full h-[1px] bg-gray-300 relative overflow-hidden">
          <motion.div 
            className="absolute top-0 left-0 h-full bg-black origin-left"
            style={{ 
              width: "100%",
              scaleX: scrollXProgress 
            }}
          />
        </div>
      </div>
    </div>
  );
}

const DesktopCarouselItem = ({
  index,
  containerRef,
  setHoveredIndex,
  introEnded,
  item
}) => {
  const ref = useRef(null);
  const router = useRouter();

  const clickStartPos = useRef({ x: 0, y: 0 });

  const { scrollXProgress } = useScroll({
    container: containerRef,
    target: ref,
    axis: 'x',
    offset: ['start end', 'end start'],
  });

  const scale = useTransform(
    scrollXProgress,
    [0, 0.15, 0.35, 0.5, 0.65, 0.85, 1],
    [0.8, 0.85, 0.95, 1, 0.95, 0.85, 0.8]
  );
  
  const archY = useTransform(
    scrollXProgress,
    [0, 0.15, 0.35, 0.5, 0.65, 0.85, 1],
    [150, 90, 30, -20, 30, 90, 150]
  );

  const x = useTransform(
    scrollXProgress,
    [0, 0.15, 0.35, 0.5, 0.65, 0.85, 1],
    ['-10%', '-5%', '-2%', '0%', '2%', '5%', '10%']
  );
  
  const zIndex = useTransform(
    scrollXProgress,
    [0, 0.45, 0.5, 0.55, 1],
    [0, 10, 20, 10, 0]
  );

  const handlePointerDown = (e) => {
    clickStartPos.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerUp = (e) => {
    const dx = Math.abs(e.clientX - clickStartPos.current.x);
    const dy = Math.abs(e.clientY - clickStartPos.current.y);
    if (dx < 5 && dy < 5) {
      router.push('/credentials/' + item.id);
    }
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.8, y: 100 }}
      animate={introEnded ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: 0.8, y: 100 }}
      transition={{ duration: 1.2, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
      onMouseEnter={() => setHoveredIndex(index)}
      onMouseLeave={() => setHoveredIndex(null)}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      className="carousel-item snap-center shrink-0 w-[60vw] sm:w-[35vw] md:w-[16vw] max-w-[280px] min-w-[200px] aspect-2/3 flex flex-col justify-center items-center relative mx-2 md:mx-4 cursor-pointer"
      style={{ perspective: 1200 }}
    >
      <motion.div
        style={{
          scale,
          y: archY,
          x,
          zIndex,
          transformOrigin: "center center"
        }}
        className="w-full h-full relative group shadow-2xl shadow-black/20"
      >
        <img
          src={item.src}
          alt={item.title}
          className="w-full h-full object-cover pointer-events-none"
        />
        
        {item.medal && (
            <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-6 h-8 bg-gradient-to-b from-[#B8860B] to-[#DAA520] flex items-end justify-center pb-1 clip-path-ribbon shadow-sm">
                <div className="w-3 h-3 bg-white/20 rounded-full flex items-center justify-center text-[8px] text-white">★</div>
            </div>
        )}
      </motion.div>
    </motion.div>
  );
};

const RulerTick = ({
  index,
  total,
  scrollProgress
}) => {
  const isMajor = index % 4 === 0;
  const baseHeight = isMajor ? 16 : 10;
  const activeHeight = isMajor ? 32 : 24;

  const position = index / (total - 1);
  
  const height = useTransform(
    scrollProgress,
    [position - 0.08, position, position + 0.08],
    [baseHeight, activeHeight, baseHeight]
  );

  const backgroundColor = useTransform(
    scrollProgress,
    [position - 0.08, position, position + 0.08],
    ["#9ca3af", "#000000", "#9ca3af"] 
  );

  return (
    <motion.div
      className="w-[1.5px] origin-bottom rounded-t-sm"
      style={{ height, backgroundColor }}
    />
  );
};
