'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, Building2, Plus, Trash2, ArrowUp, ArrowDown, 
  Image as ImageIcon, Type, LayoutTemplate, Video, Users, Check
} from 'lucide-react';
import { apiPost } from '@/lib/api';

export default function CreateNewProjectPage() {
  const router = useRouter();
  
  // Complex State Management
  const [project, setProject] = useState({
    general: {
      title: '',
      location: '',
      client: '',
      typology: '',
      status: '',
      coverImage: '',
      icon: 'Building2'
    },
    blocks: []
  });

  // --- Handlers: General Info ---
  const handleGeneralChange = (e) => {
    const { name, value } = e.target;
    setProject(prev => ({
      ...prev,
      general: { ...prev.general, [name]: value }
    }));
  };

  // --- Handlers: Block Management ---
  const addBlock = (type) => {
    let newBlock = { id: Date.now().toString(), type };
    
    switch(type) {
      case 'text':
        newBlock.content = '';
        break;
      case 'image':
        newBlock.url = '';
        newBlock.caption = '';
        break;
      case 'slider':
        newBlock.slides = [{ url: '', caption: '' }];
        break;
      case 'video':
        newBlock.iframeUrl = '';
        break;
      case 'credits':
        newBlock.roles = [{ roleName: '', people: '' }];
        break;
      default:
        break;
    }

    setProject(prev => ({
      ...prev,
      blocks: [...prev.blocks, newBlock]
    }));
  };

  const removeBlock = (id) => {
    setProject(prev => ({
      ...prev,
      blocks: prev.blocks.filter(b => b.id !== id)
    }));
  };

  const moveBlock = (index, direction) => {
    if (
      (direction === -1 && index === 0) || 
      (direction === 1 && index === project.blocks.length - 1)
    ) return;

    setProject(prev => {
      const newBlocks = [...prev.blocks];
      const temp = newBlocks[index];
      newBlocks[index] = newBlocks[index + direction];
      newBlocks[index + direction] = temp;
      return { ...prev, blocks: newBlocks };
    });
  };

  const updateBlock = (id, field, value) => {
    setProject(prev => ({
      ...prev,
      blocks: prev.blocks.map(b => b.id === id ? { ...b, [field]: value } : b)
    }));
  };

  // --- Handlers: Array mutations for specific blocks ---
  const addSlide = (blockId) => {
    setProject(prev => ({
      ...prev,
      blocks: prev.blocks.map(b => {
        if (b.id === blockId && b.type === 'slider') {
          return { ...b, slides: [...b.slides, { url: '', caption: '' }] };
        }
        return b;
      })
    }));
  };

  const updateSlide = (blockId, slideIndex, field, value) => {
    setProject(prev => ({
      ...prev,
      blocks: prev.blocks.map(b => {
        if (b.id === blockId && b.type === 'slider') {
          const newSlides = [...b.slides];
          newSlides[slideIndex] = { ...newSlides[slideIndex], [field]: value };
          return { ...b, slides: newSlides };
        }
        return b;
      })
    }));
  };

  const removeSlide = (blockId, slideIndex) => {
    setProject(prev => ({
      ...prev,
      blocks: prev.blocks.map(b => {
        if (b.id === blockId && b.type === 'slider') {
          return { ...b, slides: b.slides.filter((_, i) => i !== slideIndex) };
        }
        return b;
      })
    }));
  };

  const addRole = (blockId) => {
    setProject(prev => ({
      ...prev,
      blocks: prev.blocks.map(b => {
        if (b.id === blockId && b.type === 'credits') {
          return { ...b, roles: [...b.roles, { roleName: '', people: '' }] };
        }
        return b;
      })
    }));
  };

  const updateRole = (blockId, roleIndex, field, value) => {
    setProject(prev => ({
      ...prev,
      blocks: prev.blocks.map(b => {
        if (b.id === blockId && b.type === 'credits') {
          const newRoles = [...b.roles];
          newRoles[roleIndex] = { ...newRoles[roleIndex], [field]: value };
          return { ...b, roles: newRoles };
        }
        return b;
      })
    }));
  };

  const removeRole = (blockId, roleIndex) => {
    setProject(prev => ({
      ...prev,
      blocks: prev.blocks.map(b => {
        if (b.id === blockId && b.type === 'credits') {
          return { ...b, roles: b.roles.filter((_, i) => i !== roleIndex) };
        }
        return b;
      })
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await apiPost('/api/projects', project);
      alert('Đã lưu Dự Án thành công vào hệ thống MongoDB!');
      router.push('/admin');
      router.refresh();
    } catch (err) {
      console.error('Error creating project:', err);
      alert('Lỗi: ' + (err.message || 'Không thể lưu dự án'));
    }
  };

  return (
    <div className="min-h-screen bg-white text-black font-sans">
      
      {/* Header */}
      <div className="px-8 py-8 border-b border-gray-200 sticky top-0 bg-white/95 backdrop-blur-md z-50 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link 
            href="/admin" 
            className="p-2 border border-gray-300 hover:border-black transition-colors"
          >
            <ArrowLeft size={18} strokeWidth={1.5} />
          </Link>
          <h1 className="text-3xl font-black uppercase tracking-tighter m-0 leading-none">
            THÊM DỰ ÁN MỚI
          </h1>
        </div>
        <button 
          onClick={handleSubmit}
          className="bg-black text-white px-6 py-3 text-[11px] font-bold tracking-[0.2em] uppercase hover:bg-gray-800 transition-colors flex items-center gap-2"
        >
          <span>Lưu Dự Án Thật</span>
          <Check size={14} strokeWidth={3} />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
        
        {/* =========================================
            LEFT COLUMN: FORM BUILDER (60%)
        =========================================== */}
        <div className="lg:col-span-7 p-8 lg:p-12 pb-32 border-r border-gray-200">
          
          <form onSubmit={handleSubmit} className="flex flex-col gap-16">
            
            {/* --- SECTION A: GENERAL INFO --- */}
            <section>
              <div className="mb-8 border-b border-black pb-2">
                <h2 className="text-xs uppercase font-bold tracking-[0.25em]">A. Thông Tin Chung</h2>
              </div>
              
              <div className="flex flex-col gap-8">
                <div>
                  <label className="text-[10px] text-gray-500 uppercase tracking-[0.2em] mb-1 block">Tên Dự Án</label>
                  <input
                    type="text"
                    name="title"
                    value={project.general.title}
                    onChange={handleGeneralChange}
                    placeholder="VD: TOÀ THÁP SEN BĂNG"
                    className="w-full bg-transparent border-b border-gray-300 focus:border-black transition-colors rounded-none outline-none py-2 text-xl font-bold uppercase placeholder:text-gray-200"
                  />
                </div>

                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <label className="text-[10px] text-gray-500 uppercase tracking-[0.2em] mb-1 block">Vị Trí Của Dự Án</label>
                    <input
                      type="text"
                      name="location"
                      value={project.general.location}
                      onChange={handleGeneralChange}
                      placeholder="Hà Nội, Việt Nam"
                      className="w-full bg-transparent border-b border-gray-300 focus:border-black transition-colors rounded-none outline-none py-2 text-sm placeholder:text-gray-200"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-500 uppercase tracking-[0.2em] mb-1 block">Chủ Đầu Tư</label>
                    <input
                      type="text"
                      name="client"
                      value={project.general.client}
                      onChange={handleGeneralChange}
                      placeholder="Gia Thien Phat Group"
                      className="w-full bg-transparent border-b border-gray-300 focus:border-black transition-colors rounded-none outline-none py-2 text-sm placeholder:text-gray-200"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-500 uppercase tracking-[0.2em] mb-1 block">Loại Hình / Chức Năng</label>
                    <input
                      type="text"
                      name="typology"
                      value={project.general.typology}
                      onChange={handleGeneralChange}
                      placeholder="Biệt Thự Vườn"
                      className="w-full bg-transparent border-b border-gray-300 focus:border-black transition-colors rounded-none outline-none py-2 text-sm placeholder:text-gray-200"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-500 uppercase tracking-[0.2em] mb-1 block">Tình Trạng Hiện Tại</label>
                    <input
                      type="text"
                      name="status"
                      value={project.general.status}
                      onChange={handleGeneralChange}
                      placeholder="Đã Hoàn Thành"
                      className="w-full bg-transparent border-b border-gray-300 focus:border-black transition-colors rounded-none outline-none py-2 text-sm placeholder:text-gray-200"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-gray-500 uppercase tracking-[0.2em] mb-1 block">Đường Dẫn URL Hình Nền</label>
                  <input
                    type="url"
                    name="coverImage"
                    value={project.general.coverImage}
                    onChange={handleGeneralChange}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full bg-transparent border-b border-gray-300 focus:border-black transition-colors rounded-none outline-none py-2 text-sm placeholder:text-gray-200"
                  />
                </div>
              </div>
            </section>

            {/* --- SECTION B: CONTENT BUILDER --- */}
            <section>
              <div className="mb-8 border-b border-black pb-2 flex items-center justify-between">
                <h2 className="text-xs uppercase font-bold tracking-[0.25em]">B. Cấu Trúc Khối Nội Dung (Kéo thả Timeline)</h2>
              </div>

              {/* Added Blocks List */}
              <div className="flex flex-col gap-4 mb-8">
                {project.blocks.length === 0 && (
                  <div className="p-8 border border-dashed border-gray-300 text-center text-gray-400 text-xs uppercase tracking-[0.1em]">
                    Dòng thời gian đang rỗng. Hãy thêm Khối Mới để bắt đầu.
                  </div>
                )}

                {project.blocks.map((block, index) => (
                  <div key={block.id} className="relative border border-gray-200 p-6 bg-gray-50/50 group">
                    
                    {/* Block Toolbar */}
                    <div className="absolute top-0 right-0 p-2 flex items-center gap-1 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity bg-white border-b border-l border-gray-200">
                      <button type="button" onClick={() => moveBlock(index, -1)} disabled={index === 0} className="p-1 text-gray-400 hover:text-black disabled:opacity-30"><ArrowUp size={14} /></button>
                      <button type="button" onClick={() => moveBlock(index, 1)} disabled={index === project.blocks.length - 1} className="p-1 text-gray-400 hover:text-black disabled:opacity-30"><ArrowDown size={14} /></button>
                      <div className="w-px h-3 bg-gray-300 mx-1"></div>
                      <button type="button" onClick={() => removeBlock(block.id)} className="p-1 text-red-500 hover:text-red-700"><Trash2 size={14} /></button>
                    </div>

                    <div className="mb-4 flex items-center gap-2 text-black border-b border-gray-200 pb-2 w-fit">
                      {block.type === 'text' && <Type size={14} />}
                      {block.type === 'image' && <ImageIcon size={14} />}
                      {block.type === 'slider' && <LayoutTemplate size={14} />}
                      {block.type === 'video' && <Video size={14} />}
                      {block.type === 'credits' && <Users size={14} />}
                      <span className="text-[10px] font-bold uppercase tracking-[0.2em]">KHỐI: {block.type}</span>
                    </div>

                    {/* Block Specific Form Fields */}
                    {block.type === 'text' && (
                      <textarea
                        value={block.content}
                        onChange={(e) => updateBlock(block.id, 'content', e.target.value)}
                        placeholder="Nhập nội dung văn bản cho mục này..."
                        rows={4}
                        className="w-full bg-white border border-gray-300 focus:border-black transition-colors rounded-none outline-none p-3 text-sm placeholder:text-gray-300 resize-y"
                      />
                    )}

                    {block.type === 'image' && (
                      <div className="flex flex-col gap-4">
                        <input
                          type="url"
                          value={block.url}
                          onChange={(e) => updateBlock(block.id, 'url', e.target.value)}
                          placeholder="Đường dẫn URL Hình Ảnh"
                          className="w-full bg-transparent border-b border-gray-300 focus:border-black transition-colors rounded-none outline-none py-2 text-sm placeholder:text-gray-300"
                        />
                        <input
                          type="text"
                          value={block.caption}
                          onChange={(e) => updateBlock(block.id, 'caption', e.target.value)}
                          placeholder="Chú thích ảnh phía dưới (Tùy chọn)"
                          className="w-full bg-transparent border-b border-gray-300 focus:border-black transition-colors rounded-none outline-none py-2 text-sm placeholder:text-gray-300"
                        />
                      </div>
                    )}

                    {block.type === 'slider' && (
                      <div className="flex flex-col gap-4">
                        {block.slides.map((slide, sIdx) => (
                          <div key={sIdx} className="flex gap-4 items-start pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                            <span className="text-[10px] font-bold mt-3 text-gray-400 w-4">{sIdx + 1}.</span>
                            <div className="flex-1 flex flex-col gap-2">
                              <input
                                type="url"
                                value={slide.url}
                                onChange={(e) => updateSlide(block.id, sIdx, 'url', e.target.value)}
                                placeholder="Link Hình Ảnh cho Khung Chiếu Này"
                                className="w-full bg-transparent border-b border-gray-300 focus:border-black transition-colors rounded-none outline-none py-1 text-sm placeholder:text-gray-300"
                              />
                              <input
                                type="text"
                                value={slide.caption}
                                onChange={(e) => updateSlide(block.id, sIdx, 'caption', e.target.value)}
                                placeholder="Ghi nhận Chú Thích"
                                className="w-full bg-transparent border-b border-gray-300 focus:border-black transition-colors rounded-none outline-none py-1 text-xs placeholder:text-gray-300 text-gray-500"
                              />
                            </div>
                            <button type="button" onClick={() => removeSlide(block.id, sIdx)} className="mt-2 text-gray-400 hover:text-red-500">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        ))}
                        <button 
                          type="button" 
                          onClick={() => addSlide(block.id)}
                          className="text-[10px] tracking-[0.15em] uppercase font-bold flex items-center gap-1 w-fit mt-2 hover:text-blue-600 transition-colors"
                        >
                          <Plus size={12} /> Thêm Slide Hình
                        </button>
                      </div>
                    )}

                    {block.type === 'video' && (
                      <input
                        type="url"
                        value={block.iframeUrl}
                        onChange={(e) => updateBlock(block.id, 'iframeUrl', e.target.value)}
                        placeholder="Liên Kết Video Vimeo / YouTube Cần Nhúng (Embed URL)"
                        className="w-full bg-transparent border-b border-gray-300 focus:border-black transition-colors rounded-none outline-none py-2 text-sm placeholder:text-gray-300"
                      />
                    )}

                    {block.type === 'credits' && (
                      <div className="flex flex-col gap-3">
                        {block.roles.map((role, rIdx) => (
                          <div key={rIdx} className="flex gap-4 items-end">
                            <div className="flex-1">
                              <label className="text-[9px] text-gray-400 uppercase tracking-[0.1em] mb-1 block">Vai Trò Đảm Lĩnh</label>
                              <input
                                type="text"
                                value={role.roleName}
                                onChange={(e) => updateRole(block.id, rIdx, 'roleName', e.target.value)}
                                placeholder="VD: Đối Tác Dự Án"
                                className="w-full bg-transparent border-b border-gray-300 focus:border-black transition-colors rounded-none outline-none py-1 text-sm placeholder:text-gray-200"
                              />
                            </div>
                            <div className="flex-[2]">
                              <label className="text-[9px] text-gray-400 uppercase tracking-[0.1em] mb-1 block">Tên Các Cá Nhân Thực Hiện (Cách nhau bằng dấu phẩy)</label>
                              <input
                                type="text"
                                value={role.people}
                                onChange={(e) => updateRole(block.id, rIdx, 'people', e.target.value)}
                                placeholder="Bjarke Ingels, Thomas Christoffersen"
                                className="w-full bg-transparent border-b border-gray-300 focus:border-black transition-colors rounded-none outline-none py-1 text-sm placeholder:text-gray-200"
                              />
                            </div>
                            <button type="button" onClick={() => removeRole(block.id, rIdx)} className="mb-2 text-gray-400 hover:text-red-500">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        ))}
                        <button 
                          type="button" 
                          onClick={() => addRole(block.id)}
                          className="text-[10px] tracking-[0.15em] uppercase font-bold flex items-center gap-1 w-fit mt-3 hover:text-blue-600 transition-colors"
                        >
                          <Plus size={12} /> Bổ Sung Nhóm Vai Trò
                        </button>
                      </div>
                    )}

                  </div>
                ))}
              </div>

              {/* Add New Block Buttons */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                <button type="button" onClick={() => addBlock('text')} className="border border-gray-300 p-3 flex flex-col items-center justify-center gap-2 hover:border-black hover:bg-black hover:text-white transition-all text-gray-600">
                  <Type size={18} strokeWidth={1.5} />
                  <span className="text-[9px] font-bold uppercase tracking-[0.1em]">Chữ Text</span>
                </button>
                <button type="button" onClick={() => addBlock('image')} className="border border-gray-300 p-3 flex flex-col items-center justify-center gap-2 hover:border-black hover:bg-black hover:text-white transition-all text-gray-600">
                  <ImageIcon size={18} strokeWidth={1.5} />
                  <span className="text-[9px] font-bold uppercase tracking-[0.1em]">1 Ảnh</span>
                </button>
                <button type="button" onClick={() => addBlock('slider')} className="border border-gray-300 p-3 flex flex-col items-center justify-center gap-2 hover:border-black hover:bg-black hover:text-white transition-all text-gray-600">
                  <LayoutTemplate size={18} strokeWidth={1.5} />
                  <span className="text-[9px] font-bold uppercase tracking-[0.1em]">Trình Chiếu</span>
                </button>
                <button type="button" onClick={() => addBlock('video')} className="border border-gray-300 p-3 flex flex-col items-center justify-center gap-2 hover:border-black hover:bg-black hover:text-white transition-all text-gray-600">
                  <Video size={18} strokeWidth={1.5} />
                  <span className="text-[9px] font-bold uppercase tracking-[0.1em]">Trình Phát Video</span>
                </button>
                <button type="button" onClick={() => addBlock('credits')} className="border border-gray-300 p-3 flex flex-col items-center justify-center gap-2 hover:border-black hover:bg-black hover:text-white transition-all text-gray-600 col-span-2 md:col-span-1">
                  <Users size={18} strokeWidth={1.5} />
                  <span className="text-[9px] font-bold uppercase tracking-[0.1em]">Thông Tín Dụng</span>
                </button>
              </div>

            </section>
          </form>
        </div>

        {/* =========================================
            RIGHT COLUMN: LIVE PREVIEW (40%)
        =========================================== */}
        <div className="lg:col-span-5 bg-[#fbfbfb] p-8 hidden lg:block overflow-hidden relative">
          
          <div className="sticky top-32 w-full">
            <div className="mb-4 flex items-center justify-between border-b border-gray-200 pb-2">
               <h3 className="text-[10px] uppercase font-bold tracking-[0.25em] text-gray-400">Bản Xem Trước Trực Tiếp (Bố Cục Ngang)</h3>
               <div className="flex items-center gap-2">
                 <span className="text-[8px] uppercase tracking-widest text-gray-400">Trực Tuyến</span>
                 <div className="size-2 bg-green-500 rounded-full animate-pulse"></div>
               </div>
            </div>

            {/* Simulated Horizontal Scroll Portal */}
            <div className="w-full bg-white border border-gray-200 shadow-sm relative overflow-hidden">
              <div 
                className="flex flex-nowrap items-start gap-4 p-4 h-[450px] overflow-x-auto overflow-y-hidden"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }} // Hide scrollbar specifically for the preview
              >
                {/* Custom CSS to hide webkit scrollbar for this specific container */}
                <style dangerouslySetInnerHTML={{__html: `
                  .flex-nowrap::-webkit-scrollbar { display: none; }
                `}} />

                {/* 1. The Cover Block (Always exists based on General Info) */}
                <div className="shrink-0 h-full w-[280px] flex flex-col border border-gray-100 bg-white relative group">
                  <div className="relative w-full aspect-[3/2] bg-gray-100">
                    {project.general.coverImage ? (
                      <img src={project.general.coverImage} alt="Ảnh Bìa" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300"><Building2 size={24} /></div>
                    )}
                  </div>
                  <div className="p-4 bg-white flex items-start gap-3 mt-auto absolute bottom-0 left-0">
                     <div className="size-8 bg-black shrink-0 text-white flex items-center justify-center"><Building2 size={16} /></div>
                     <div>
                       <h4 className="text-xl font-bold uppercase tracking-tighter leading-none break-all">{project.general.title || 'CHƯA ĐẶT TÊN'}</h4>
                       <span className="text-[8px] uppercase tracking-[0.2em] text-gray-400">{project.general.location || 'CHƯA RÕ VỊ TRÍ'}</span>
                     </div>
                  </div>
                </div>

                {/* 2. Fact Sheet (Auto generated from General Info) */}
                <div className="shrink-0 h-full w-[200px] p-6 bg-white border border-gray-100 flex flex-col justify-center">
                  <div className="flex flex-col gap-4">
                    <div>
                      <span className="text-[8px] text-gray-400 uppercase tracking-widest block mb-1">Loại Hình / Chức Năng</span>
                      <span className="text-xs font-bold uppercase break-words">{project.general.typology || '—'}</span>
                    </div>
                    <div>
                      <span className="text-[8px] text-gray-400 uppercase tracking-widest block mb-1">Tình Trạng Hiện Tại</span>
                      <span className="text-xs font-bold uppercase break-words">{project.general.status || '—'}</span>
                    </div>
                    <div>
                      <span className="text-[8px] text-gray-400 uppercase tracking-widest block mb-1">Chủ Đầu Tư</span>
                      <span className="text-xs font-bold uppercase break-words">{project.general.client || '—'}</span>
                    </div>
                  </div>
                </div>

                {/* 3. The Sequence Blocks */}
                {project.blocks.map(block => {
                  switch(block.type) {
                    
                    case 'text':
                      return (
                        <div key={block.id} className="shrink-0 h-full w-[260px] max-w-[400px] p-6 bg-white border border-gray-100 overflow-hidden">
                          <p className="text-[11px] leading-[1.6] text-black whitespace-pre-wrap font-medium break-words overflow-wrap-anywhere">
                            {block.content || 'Chưa nhập nội dung chữ...'}
                          </p>
                        </div>
                      );
                    
                    case 'image':
                      return (
                        <div key={block.id} className="shrink-0 h-full bg-white border border-gray-100 flex flex-col items-center justify-center px-6 min-w-[300px]">
                           {block.url ? (
                             <div className="relative max-h-[85%] w-auto">
                               <img src={block.url} alt="block" className="max-h-full w-auto object-contain" />
                               {block.caption && <div className="text-[9px] uppercase tracking-widest text-gray-400 mt-2 text-center">{block.caption}</div>}
                             </div>
                           ) : (
                             <div className="flex flex-col items-center gap-2 text-gray-300"><ImageIcon size={24} /><span className="text-[8px] uppercase tracking-widest">Chỗ Trống Cho Hình Ảnh</span></div>
                           )}
                        </div>
                      );

                    case 'slider':
                      return (
                        <div key={block.id} className="shrink-0 h-full flex items-center bg-gray-50 border border-gray-100 px-4 min-w-[200px] border-l-4 border-l-black">
                          {block.slides.length === 0 ? (
                            <div className="w-[150px] text-center flex flex-col items-center gap-2 text-gray-300"><LayoutTemplate size={24} /><span className="text-[8px] uppercase tracking-widest">Trình Chiếu Đang Rỗng</span></div>
                          ) : (
                            <div className="flex gap-2 h-[80%] items-center">
                              {block.slides.map((s, i) => (
                                <div key={i} className="h-full relative flex-shrink-0">
                                  {s.url ? (
                                    <img src={s.url} alt={`slide ${i}`} className="h-full w-auto object-contain bg-white" />
                                  ) : (
                                    <div className="h-full w-[150px] bg-white flex items-center justify-center text-gray-200 border border-dashed border-gray-300 text-[8px] uppercase">Slide {i+1}</div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );

                    case 'video':
                      return (
                        <div key={block.id} className="shrink-0 h-full w-[400px] bg-black border border-gray-100 flex items-center justify-center p-4">
                          <div className="w-full aspect-video border border-gray-800 flex items-center justify-center text-gray-600 bg-gray-900 overflow-hidden relative">
                             {block.iframeUrl ? (
                               <div className="absolute inset-0 bg-gray-800 flex items-center justify-center text-white text-[10px] uppercase font-bold tracking-widest"><Video size={16} className="mr-2"/> Bản Xem Trước Video Nhúng</div>
                             ) : (
                               <div className="flex flex-col items-center gap-2"><Video size={24} /><span className="text-[8px] uppercase tracking-widest">Chỗ Trống Cho Kênh Video</span></div>
                             )}
                          </div>
                        </div>
                      );

                    case 'credits':
                      return (
                        <div key={block.id} className="shrink-0 h-full w-[300px] p-6 bg-white border border-gray-100 overflow-y-auto">
                          <h4 className="text-[10px] uppercase font-black tracking-[0.2em] mb-6 border-b border-black pb-2">Tín Dụng Nguồn Trích Dẫn</h4>
                          <div className="flex flex-col gap-4">
                            {block.roles.length === 0 ? (
                              <span className="text-[9px] text-gray-400 uppercase tracking-widest">Chưa có thông tin được nhập vào</span>
                            ) : (
                              block.roles.map((r, i) => (
                                <div key={i}>
                                  <span className="text-[8px] text-gray-400 uppercase tracking-widest block">{r.roleName || '-'}</span>
                                  <span className="text-[10px] leading-tight font-medium uppercase mt-0.5 block">{r.people || '-'}</span>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      );

                    default:
                      return null;
                  }
                })}

                {/* Cap end to allow scrolling past last item */}
                <div className="shrink-0 w-[40px]"></div>

              </div>
            </div>
            
            <p className="text-[9px] text-gray-400 uppercase tracking-widest mt-4 text-center">
              * Cuộn ngang để trải nghiệm trước trình tự hiển thị thực tế
            </p>

          </div>
        </div>

      </div>
    </div>
  );
}
