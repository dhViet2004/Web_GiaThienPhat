'use client';

import React from 'react';
import Link from 'next/link';
import { X } from 'lucide-react';

export default function SidebarMenu({ isOpen, onClose }) {
  const links = [
    { label: 'Landscape', href: '#landscape' },
    { label: 'Engineering', href: '#engineering' },
    { label: 'Architecture', href: '#architecture' },
    { label: 'Products', href: '#products' },
  ];

  return (
    <>

      {/* Backdrop (closes sidebar on click) */}
      <div 
        onClick={onClose}
        aria-hidden="true"
        className={`md:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ease-in-out ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* Sidebar Navigation */}
      <nav
        className={`md:hidden fixed top-0 bottom-0 left-0 z-50 flex flex-col gap-0.5 bg-white pt-[60px] md:pt-[80px] pr-12 pl-[5vw] md:pl-[35px] transition-all duration-300 ease-in-out ${
          isOpen 
            ? 'translate-x-0 opacity-100 pointer-events-auto shadow-2xl' 
            : '-translate-x-full opacity-0 pointer-events-none'
        }`}
      >
        <div className="mt-8 flex flex-col gap-1">
          {links.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              onClick={onClose}
              className="text-[13px] font-semibold uppercase opacity-50 transition-opacity hover:opacity-100 text-black py-1.5 pr-8 w-fit tracking-widest"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </nav>
    </>
  );
}
