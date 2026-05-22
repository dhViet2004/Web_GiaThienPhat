'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Loader2, FileText } from 'lucide-react';

// Convert old /pdf/ path to new /api/pdf/ path
function getPdfUrl(pdfPath) {
  if (!pdfPath) return null;
  if (pdfPath.startsWith('/api/pdf/')) return pdfPath;
  if (pdfPath.startsWith('/pdf/')) {
    const filename = pdfPath.replace('/pdf/', '');
    return `/api/pdf/${filename}`;
  }
  return pdfPath;
}

function getDefaultPdfZoom() {
  if (typeof window === 'undefined') return 145;
  if (window.innerWidth >= 1800) return 160;
  if (window.innerWidth >= 1440) return 150;
  if (window.innerWidth >= 1024) return 135;
  return 115;
}

function PdfViewerModal({ pdfPath, onClose }) {
  const [loading, setLoading] = useState(true);
  const iframeRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const previousHtmlOverflow = document.documentElement.style.overflow;
    const previousBodyOverflow = document.body.style.overflow;
    const previousBodyPaddingRight = document.body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    const timeout = setTimeout(() => setLoading(false), 3000);
    
    return () => {
      document.documentElement.style.overflow = previousHtmlOverflow;
      document.body.style.overflow = previousBodyOverflow;
      document.body.style.paddingRight = previousBodyPaddingRight;
      clearTimeout(timeout);
    };
  }, []);

  const pdfUrl = `${getPdfUrl(pdfPath)}#toolbar=0&navpanes=0&scrollbar=1&view=FitH&zoom=${getDefaultPdfZoom()}`;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black z-[100] flex flex-col"
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 p-2 text-white hover:text-red-500 transition-colors"
        title="Close"
      >
        <span className="text-3xl font-light leading-none">×</span>
      </button>

      {/* PDF Container */}
      <div 
        ref={containerRef}
        className="flex-1 overflow-auto overscroll-contain"
        style={{
          WebkitOverflowScrolling: 'touch',
          touchAction: 'pan-y pinch-zoom',
        }}
      >
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <Loader2 className="w-8 h-8 animate-spin text-white" />
          </div>
        )}
        <iframe
          ref={iframeRef}
          src={pdfUrl}
          className="block w-screen h-[100dvh] bg-white"
          title="PDF Viewer"
          scrolling="yes"
          style={{
            WebkitOverflowScrolling: 'touch',
            touchAction: 'pan-y pinch-zoom',
          }}
          onLoad={() => setLoading(false)}
        />
      </div>
    </motion.div>
  );
}

export default function CredentialsDetail({ credential: initialCredential }) {
  const router = useRouter();
  const [item, setItem] = useState(initialCredential);
  const [loading, setLoading] = useState(!initialCredential);
  const [error, setError] = useState(null);
  const [showPdf, setShowPdf] = useState(false);

  useEffect(() => {
    if (!initialCredential && !item) {
      const id = window.location.pathname.split('/').pop();
      
      fetch('/api/admin/credentials')
        .then(res => res.json())
        .then(data => {
          if (data.items) {
            const found = data.items.find(i => i.id === id);
            if (found) {
              setItem(found);
              setShowPdf(true);
            } else {
              setError('Item not found');
            }
          }
          setLoading(false);
        })
        .catch(err => {
          console.error('Failed to fetch:', err);
          setError('Failed to load credential');
          setLoading(false);
        });
    } else if (initialCredential) {
      setShowPdf(true);
    }
  }, [initialCredential, item]);

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
          <button 
            onClick={() => router.push('/credentials')} 
            className="text-sm underline hover:text-gray-600"
          >
            Return to Credentials
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen flex flex-col font-sans text-gray-900 selection:bg-black selection:text-white">
      {/* Header */}
      <header className="fixed top-0 left-0 w-full p-4 md:p-6 flex justify-between items-center z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
        <button 
            onClick={() => router.push('/credentials')}
            className="group flex items-center gap-2 cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-medium tracking-widest uppercase">Back to Credentials</span>
        </button>
        
        {item.pdfPath && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowPdf(true)}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors ${
                showPdf 
                  ? 'bg-black text-white' 
                  : 'bg-green-100 text-green-800 hover:bg-green-200'
              }`}
            >
              <FileText size={14} />
              View PDF
            </button>
          </div>
        )}
      </header>

      {/* PDF Modal */}
      {showPdf && item.pdfPath && (
        <PdfViewerModal 
          pdfPath={getPdfUrl(item.pdfPath)} 
          onClose={() => setShowPdf(false)} 
        />
      )}

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
        
        {/* Medal Badge */}
        {item.medal && (
          <div className="absolute top-20 md:top-24 left-6 md:left-12 bg-gradient-to-b from-[#B8860B] to-[#DAA520] text-white px-3 py-2 text-xs font-bold uppercase tracking-wider shadow-lg">
            ★ Medal Award
          </div>
        )}

        {/* Title Block over Hero */}
        <motion.div 
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
            className="absolute bottom-0 left-0 p-6 md:p-12 w-full text-white"
        >
            <div className="flex items-center gap-4 text-xs font-mono tracking-widest text-white/80 mb-4 max-w-lg">
              <span>{item.num}</span>
              <div className="h-px bg-white/40 flex-1" />
              <span>{item.brand}</span>
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif italic tracking-tight">{item.title}</h1>
        </motion.div>
      </div>

      {/* Content Section */}
      <motion.div 
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
        className="max-w-4xl mx-auto px-6 md:px-16 py-12 md:py-16 w-full"
      >
        <p className="text-lg md:text-2xl font-light text-gray-500 leading-relaxed mb-12">
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

        {/* PDF Section in Content */}
        {item.pdfPath && (
          <div className="mt-16 pt-12 border-t border-gray-200">
            <div className="flex items-center gap-3 mb-6">
              <FileText size={24} className="text-gray-400" />
              <h3 className="text-lg font-bold tracking-widest uppercase">Project Document</h3>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                    <FileText size={24} className="text-red-600" />
                  </div>
                  <p className="font-medium text-gray-800">PDF Document</p>
                </div>
                <button
                  onClick={() => setShowPdf(true)}
                  className="flex items-center gap-2 px-5 py-2.5 bg-black text-white text-sm font-bold uppercase tracking-wider hover:bg-gray-800 transition-colors"
                >
                  <FileText size={16} />
                  View PDF
                </button>
              </div>
            </div>
          </div>
        )}

        {/* No PDF Message */}
        {!item.pdfPath && (
          <div className="mt-16 pt-12 border-t border-gray-200">
            <div className="flex items-center gap-3 mb-6">
              <FileText size={24} className="text-gray-300" />
              <h3 className="text-lg font-bold tracking-widest uppercase text-gray-400">Project Document</h3>
            </div>
            <div className="bg-gray-50 border border-dashed border-gray-300 rounded-lg p-8 text-center">
              <FileText size={32} className="mx-auto mb-4 text-gray-300" />
              <p className="text-gray-400 text-sm">Chưa cập nhật file PDF</p>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
