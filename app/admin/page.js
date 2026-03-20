'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { Plus, Edit2, Trash2, ArrowUpRight } from 'lucide-react';

const mockProjects = [
  { id: 1, title: 'THE LOTUS TOWER', category: 'COMMERCIAL', year: '2025', image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop' },
  { id: 2, title: 'ZEN VILLA', category: 'RESIDENTIAL', year: '2024', image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=2075&auto=format&fit=crop' },
  { id: 3, title: 'URBAN OASIS', category: 'PUBLIC', year: '2024', image: 'https://images.unsplash.com/photo-1449844908441-8829872d2607?q=80&w=2070&auto=format&fit=crop' },
  { id: 4, title: 'ECO CAMPUS', category: 'EDUCATION', year: '2023', image: 'https://images.unsplash.com/photo-1541888053675-a0f5d475ceea?q=80&w=2069&auto=format&fit=crop' },
];

export default function AdminDashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const loadingRef = useRef(null);
  const textRef = useRef(null);
  const contentRef = useRef(null);

  useEffect(() => {
    // GTP LEAP Animation Sequence
    const tl = gsap.timeline({
      onComplete: () => {
        setIsLoading(false);
        // Reveal content
        gsap.fromTo(contentRef.current, 
          { opacity: 0, y: 40 }, 
          { opacity: 1, y: 0, duration: 1, ease: 'power3.out', stagger: 0.1 }
        );
      }
    });

    // Intro text animation
    tl.to(textRef.current, {
      opacity: 1,
      y: 0,
      duration: 0.6,
      ease: 'power2.out',
    })
    .to(textRef.current, {
      scale: 1.05,
      letterSpacing: '0.2em',
      duration: 1.2,
      ease: 'power2.inOut',
    })
    // Pull up the loading screen
    .to(loadingRef.current, {
      yPercent: -100,
      duration: 0.8,
      ease: 'power4.inOut',
    }, "-=0.2");

  }, []);

  return (
    <>
      {isLoading && (
        <div 
          ref={loadingRef} 
          className="fixed inset-0 z-50 bg-black flex items-center justify-center overflow-hidden"
        >
          <div className="overflow-hidden">
            <h1 
              ref={textRef} 
              className="text-white text-6xl md:text-9xl font-black uppercase tracking-tighter opacity-0 translate-y-10"
            >
              GTP LEAP
            </h1>
          </div>
        </div>
      )}

      <div ref={contentRef} className="p-8 md:p-12 min-h-screen opacity-0 pb-20">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 border-b border-gray-200 pb-8">
          <div>
            <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter">PROJECTS</h2>
            <p className="text-gray-500 font-light mt-4 uppercase tracking-widest text-sm flex gap-4">
              <span>TOTAL: {mockProjects.length}</span>
              <span>LATEST: {mockProjects[0].year}</span>
            </p>
          </div>
          
          <button className="mt-8 md:mt-0 flex items-center gap-2 bg-black text-white px-8 py-4 uppercase text-xs tracking-widest font-bold hover:bg-gray-800 transition-colors group">
            <Plus size={16} /> 
            <span>NEW PROJECT</span>
            <ArrowUpRight size={16} className="opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all" />
          </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-12">
          {mockProjects.map((project) => (
            <div key={project.id} className="group cursor-pointer relative flex flex-col">
              <div className="aspect-[4/3] w-full bg-gray-100 overflow-hidden relative border border-gray-200">
                {/* Image */}
                <img 
                  src={project.image} 
                  alt={project.title}
                  className="w-full h-full object-cover filter grayscale group-hover:grayscale-0 transition-all duration-700 ease-in-out group-hover:scale-105"
                />
                
                {/* Overlay actions */}
                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="p-3 bg-white text-black hover:bg-black hover:text-white transition-colors border border-black/10">
                    <Edit2 size={16} strokeWidth={2.5} />
                  </button>
                  <button className="p-3 bg-white text-red-600 hover:bg-red-600 hover:text-white transition-colors border border-black/10">
                    <Trash2 size={16} strokeWidth={2.5} />
                  </button>
                </div>
              </div>

              <div className="mt-6 border-t border-gray-200 pt-4 flex-1 flex flex-col justify-between">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-2xl font-black uppercase tracking-tighter leading-none">{project.title}</h3>
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-[0.2em] mt-3">{project.category}</p>
                  </div>
                  <span className="text-sm font-bold border-2 border-black px-3 py-1 tracking-wider">{project.year}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
