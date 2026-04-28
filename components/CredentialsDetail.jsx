'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Loader2 } from 'lucide-react';

export default function CredentialsDetail() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id;
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;

    fetch('/api/admin/credentials')
      .then(res => res.json())
      .then(data => {
        if (data.items) {
          const found = data.items.find(i => i.id === id);
          if (found) {
            setItem(found);
          }
          setLoading(false);
        }
      })
      .catch(err => {
        console.error('Failed to fetch:', err);
        setError('Failed to load credential');
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white font-sans">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white font-sans">
        <div className="text-center">
          <h1 className="text-2xl font-serif italic mb-4">Item not found</h1>
          <button onClick={() => router.push('/credentials')} className="text-sm underline">Return to Credentials</button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen flex flex-col font-sans text-gray-900 selection:bg-black selection:text-white">
      {/* Header */}
      <header className="fixed top-0 left-0 w-full p-8 flex justify-between items-center z-50 mix-blend-difference text-white pointer-events-none">
        <div 
            onClick={() => router.push('/credentials')}
            className="group flex items-center gap-2 cursor-pointer pointer-events-auto"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-medium tracking-widest uppercase">Back to Credentials</span>
        </div>
      </header>

      {/* Hero Section */}
      <div className="relative w-full h-[70vh] md:h-[80vh] overflow-hidden">
        <motion.div 
            initial={{ scale: 1.1, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="w-full h-full"
        >
            <img 
              src={item.src} 
              alt={item.title} 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/20" />
        </motion.div>
        
        {/* Title Block over Hero */}
        <motion.div 
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
            className="absolute bottom-0 left-0 p-8 md:p-16 w-full text-white"
        >
            <div className="flex items-center gap-4 text-xs font-mono tracking-widest text-white/80 mb-4 max-w-lg">
              <span>{item.num}</span>
              <div className="h-px bg-white/40 flex-1" />
              <span>{item.brand}</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-serif italic tracking-tight">{item.title}</h1>
        </motion.div>
      </div>

      {/* Content Section */}
      <motion.div 
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
        className="max-w-4xl mx-auto px-8 md:px-16 py-16 w-full"
      >
        <p className="text-xl md:text-2xl font-light text-gray-500 leading-relaxed mb-12">
            {item.subtitle}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
                <h3 className="text-sm font-bold tracking-widest uppercase mb-4">About the Project</h3>
                <p className="text-gray-600 leading-relaxed">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                </p>
            </div>
            <div>
                <h3 className="text-sm font-bold tracking-widest uppercase mb-4">Role</h3>
                <ul className="text-gray-600 leading-relaxed space-y-2">
                    <li>Art Direction</li>
                    <li>Visual Design</li>
                    <li>Motion Graphics</li>
                </ul>
            </div>
        </div>
      </motion.div>
    </div>
  );
}
