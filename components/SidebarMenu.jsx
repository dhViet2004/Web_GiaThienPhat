'use client';

import React from 'react';
import Link from 'next/link';

export default function SidebarMenu({ isOpen, onClose }) {
  const links = [
    { label: 'Projects', href: '/' },
    { label: 'About', href: '/about' },
    { label: 'Credentials', href: '/credentials' },
  ];

  const handleLinkClick = (e, href) => {
    // Nếu là hash link thì xử lý filter, không điều hướng
    if (href.startsWith('#')) {
      e.preventDefault();
      const currentHash = window.location.hash.toLowerCase();
      if (currentHash === href.toLowerCase()) {
        window.history.pushState(null, '', window.location.pathname);
        window.dispatchEvent(new Event('hashchange'));
      }
      onClose();
    } else {
      // Điều hướng đến trang mới
      onClose();
    }
  };

  return (
    <>
      {/* Sidebar Navigation: BIG.dk Style - Menu trượt từ trái, z-index cao hơn header */}
      <nav
        className={`fixed top-0 bottom-0 left-0 z-[1000] flex flex-col gap-0.5 bg-white pt-[70px] pl-[30px] lg:pl-[30px] pr-10 transition-all duration-300 ${
          isOpen 
            ? 'translate-x-0 opacity-100 pointer-events-auto' 
            : '-translate-x-full opacity-0 pointer-events-none'
        }`}
      >
        {links.map((link) => (
          <Link
            key={link.label}
            href={link.href}
            onClick={(e) => handleLinkClick(e, link.href)}
            className="text-sm uppercase opacity-50 transition-opacity hover:opacity-100"
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </>
  );
}
