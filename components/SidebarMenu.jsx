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

      {/* Sidebar Navigation (BIG Style Right Drawer) */}
      <nav
        className={`fixed top-0 bottom-0 right-0 z-50 w-[210px] bg-white flex flex-col pt-[80px] px-[25px] transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isOpen ? 'translate-x-0 shadow-2xl' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col gap-2">
          {links.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              onClick={onClose}
              className="group flex items-center text-[13px] font-semibold uppercase text-[#6b6b6b] hover:text-black py-1.5 tracking-widest transition-colors"
            >
              <span className="mr-2 block w-[10px] -translate-y-[0.5px] opacity-40 group-hover:opacity-100">+</span>
              {link.label}
            </Link>
          ))}
        </div>
      </nav>
    </>
  );
}
