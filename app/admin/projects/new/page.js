'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, Building2, Plus, Trash2, ArrowUp, ArrowDown, 
  Image as ImageIcon, Type, LayoutTemplate, Users, Check
} from 'lucide-react';
import { apiPost } from '@/lib/api';

export default function CreateNewProjectPage() {
  const router = useRouter();
  
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

  const handleGeneralChange = (e) => {
    const { name, value } = e.target;
    setProject(prev => ({
      ...prev,
      general: { ...prev.general, [name]: value }
    }));
  };

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

      <div className="p-8 lg:p-12 pb-32">
          
        <form onSubmit={handleSubmit} className="flex flex-col gap-16">
          
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

          <section>
            <div className="mb-8 border-b border-black pb-2 flex items-center justify-between">
              <h2 className="text-xs uppercase font-bold tracking-[0.25em]">B. Cấu Trúc Khối Nội Dung (Kéo thả Timeline)</h2>
            </div>

            <div className="flex flex-col gap-4 mb-8">
              {project.blocks.length === 0 && (
                <div className="p-8 border border-dashed border-gray-300 text-center text-gray-400 text-xs uppercase tracking-[0.1em]">
                  Dòng thời gian đang rỗng. Hãy thêm Khối Mới để bắt đầu.
                </div>
              )}

              {project.blocks.map((block, index) => (
                <div key={block.id} className="relative border border-gray-200 p-6 bg-gray-50/50 group">
                  
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
                    {block.type === 'credits' && <Users size={14} />}
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em]">KHỐI: {block.type}</span>
                  </div>

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
              <button type="button" onClick={() => addBlock('credits')} className="border border-gray-300 p-3 flex flex-col items-center justify-center gap-2 hover:border-black hover:bg-black hover:text-white transition-all text-gray-600 col-span-2 md:col-span-1">
                <Users size={18} strokeWidth={1.5} />
                <span className="text-[9px] font-bold uppercase tracking-[0.1em]">Thông Tín Dụng</span>
              </button>
            </div>

          </section>
        </form>
      </div>
    </div>
  );
}
