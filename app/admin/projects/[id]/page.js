'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, Building2, Plus, Trash2, ArrowUp, ArrowDown, 
  Image as ImageIcon, Type, LayoutTemplate, Users, Check, Loader2
} from 'lucide-react';
import { apiGet, apiPut } from '@/lib/api';

export default function EditProjectPage({ params }) {
  const { id: projectId } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Complex State Management
  const [project, setProject] = useState({
    // category 字段：Landscape, Engineering, Architecture, Products
    category: 'Architecture',
    // subcategory: Public Space, Parks, Planning, Structural, BIM, Green Tech, Cultural, Residential, Office, Hospitality, Furniture, Lighting, Installation
    subcategory: '',
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

  const CATEGORIES = [
    { label: 'Landscape', value: 'Landscape', sub: ['Public Space', 'Parks', 'Planning'] },
    { label: 'Engineering', value: 'Engineering', sub: ['Structural', 'BIM', 'Green Tech'] },
    { label: 'Architecture', value: 'Architecture', sub: ['Cultural', 'Residential', 'Office', 'Hospitality'] },
    { label: 'Products', value: 'Products', sub: ['Furniture', 'Lighting', 'Installation'] },
  ];

  const [selectedCategory, setSelectedCategory] = useState('Architecture');
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);

  // Load existing project data
  useEffect(() => {
    if (!projectId) return;
    
    setLoading(true);
    apiGet(`/api/projects/${projectId}`)
      .then(data => {
        if (data.error) {
          alert('Không tìm thấy dự án!');
          router.push('/admin');
          return;
        }
        // Transform data to match form structure
        const projectData = data.project || data;
        setProject({
          category: projectData.category || 'Architecture',
          subcategory: projectData.subcategory || '',
          general: {
            title: projectData.general?.title || '',
            location: projectData.general?.location || '',
            client: projectData.general?.client || '',
            typology: projectData.general?.typology || '',
            status: projectData.general?.status || '',
            coverImage: projectData.general?.coverImage || '',
            icon: projectData.general?.icon || 'Building2'
          },
          blocks: projectData.blocks || []
        });
        // Sync selected states
        setSelectedCategory(projectData.category || 'Architecture');
        setSelectedSubcategory(projectData.subcategory || null);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading project:', err);
        alert('Lỗi khi tải dữ liệu dự án');
        setLoading(false);
      });
  }, [projectId, router]);

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
    
    if (!project.general.title.trim()) {
      alert('Vui lòng nhập tên dự án!');
      return;
    }
    
    setSaving(true);
    try {
      await apiPut(`/api/projects/${projectId}`, project);
      alert('Đã cập nhật Dự Án thành công!');
      router.push('/admin');
      router.refresh();
    } catch (err) {
      console.error('Error updating project:', err);
      alert('Lỗi: ' + (err.message || 'Không thể cập nhật'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 size={32} className="animate-spin text-black" />
          <p className="text-xs uppercase tracking-[0.2em] text-gray-400">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

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
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tighter m-0 leading-none">
              CHỈNH SỬA DỰ ÁN
            </h1>
            <p className="text-xs text-gray-400 uppercase tracking-[0.15em] mt-1">
              ID: {projectId}
            </p>
          </div>
        </div>
        <button 
          onClick={handleSubmit}
          disabled={saving}
          className="bg-black text-white px-6 py-3 text-[11px] font-bold tracking-[0.2em] uppercase hover:bg-gray-800 transition-colors flex items-center gap-2 disabled:opacity-50"
        >
          {saving ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              <span>ĐANG LƯU...</span>
            </>
          ) : (
            <>
              <span>LƯU THAY ĐỔI</span>
              <Check size={14} strokeWidth={3} />
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
        
        {/* =========================================
            LEFT COLUMN: FORM BUILDER (60%)
        =========================================== */}
        <div className="lg:col-span-12 p-8 lg:p-12 pb-32">
          
          <form onSubmit={handleSubmit} className="flex flex-col gap-16">
            
            {/* --- SECTION A: GENERAL INFO --- */}
            <section>
              <div className="mb-8 border-b border-black pb-2">
                <h2 className="text-xs uppercase font-bold tracking-[0.25em]">A. Thông Tin Chung</h2>
              </div>
              
              <div className="flex flex-col gap-8">
                {/* Category Selection */}
                <div>
                  <label className="text-[10px] text-gray-500 uppercase tracking-[0.2em] mb-2 block">Danh Mục Dự Án</label>
                  
                  {/* Main Categories */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat.value}
                        type="button"
                        onClick={() => {
                          setSelectedCategory(cat.value);
                          setSelectedSubcategory(null);
                          setProject(prev => ({ ...prev, category: cat.value, subcategory: '' }));
                        }}
                        className={`px-4 py-2 text-[11px] font-bold uppercase tracking-wider transition-all border ${
                          selectedCategory === cat.value 
                            ? 'bg-black text-white border-black' 
                            : 'bg-white text-black border-gray-300 hover:border-black'
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>

                  {/* Sub Categories - Hiện khi đã chọn category */}
                  {selectedCategory && CATEGORIES.find(c => c.value === selectedCategory)?.sub && (
                    <div className="flex flex-wrap gap-2 pl-4 border-l-2 border-gray-200">
                      <span className="text-[9px] text-gray-400 uppercase tracking-[0.15em] self-center mr-2">Danh Mục Con:</span>
                      {CATEGORIES.find(c => c.value === selectedCategory).sub.map((sub) => (
                        <button
                          key={sub}
                          type="button"
                          onClick={() => {
                            setSelectedSubcategory(sub);
                            setProject(prev => ({ ...prev, subcategory: sub }));
                          }}
                          className={`px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider transition-all border ${
                            selectedSubcategory === sub 
                              ? 'bg-gray-800 text-white border-gray-800' 
                              : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-gray-400 hover:text-gray-800'
                          }`}
                        >
                          {sub}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Hiển thị giá trị đã chọn */}
                  {(selectedCategory || selectedSubcategory) && (
                    <div className="mt-3 text-[9px] text-gray-400 uppercase tracking-[0.1em]">
                      Đã chọn: <span className="font-bold text-black">{selectedCategory}</span>
                      {selectedSubcategory && <span> / <span className="font-bold text-black">{selectedSubcategory}</span></span>}
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-[10px] text-gray-500 uppercase tracking-[0.2em] mb-1 block">Tên Dự Án</label>
                  <input
                    type="text"
                    name="title"
                    value={project.general.title}
                    onChange={handleGeneralChange}
                    placeholder="VD: Toà Tháp Sen Băng"
                    className="admin-input w-full bg-transparent border-b border-gray-300 focus:border-black transition-colors rounded-none outline-none py-2 text-xl font-bold placeholder:text-gray-200"
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
                      className="admin-input w-full bg-transparent border-b border-gray-300 focus:border-black transition-colors rounded-none outline-none py-2 text-sm placeholder:text-gray-200"
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
                      className="admin-input w-full bg-transparent border-b border-gray-300 focus:border-black transition-colors rounded-none outline-none py-2 text-sm placeholder:text-gray-200"
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
                      className="admin-input w-full bg-transparent border-b border-gray-300 focus:border-black transition-colors rounded-none outline-none py-2 text-sm placeholder:text-gray-200"
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
                      className="admin-input w-full bg-transparent border-b border-gray-300 focus:border-black transition-colors rounded-none outline-none py-2 text-sm placeholder:text-gray-200"
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

                <div>
                  <label className="text-[10px] text-gray-500 uppercase tracking-[0.2em] mb-1 block">Đường Dẫn URL Icon Dự Án (Khối màu đen)</label>
                  <input
                    type="text"
                    name="icon"
                    value={project.general.icon}
                    onChange={handleGeneralChange}
                    placeholder="VD: https://media.big.dk/... hoặc Building2, Trees, Sofa"
                    className="w-full bg-transparent border-b border-gray-300 focus:border-black transition-colors rounded-none outline-none py-2 text-sm placeholder:text-gray-200"
                  />
                </div>
              </div>
            </section>

            {/* --- SECTION B: CONTENT BUILDER --- */}
            <section>
              <div className="mb-10 border-b border-black pb-4">
                <h2 className="text-xs uppercase font-bold tracking-[0.25em]">B. Cấu Trúc Khối Nội Dung (Kéo thả Timeline)</h2>
                <p className="text-[10px] text-gray-400 mt-2">Sắp xếp các khối theo thứ tự hiển thị ngang trên trang chi tiết dự án</p>
              </div>

              {/* Added Blocks List */}
              <div className="flex flex-col gap-8 mb-10">
                {project.blocks.length === 0 && (
                  <div className="p-8 border border-dashed border-gray-300 text-center text-gray-400 text-xs uppercase tracking-[0.1em]">
                    Dòng thời gian đang rỗng. Hãy thêm Khối Mới để bắt đầu.
                  </div>
                )}

                {project.blocks.map((block, index) => (
                  <div key={block.id} className="relative border border-gray-200 p-8 bg-gray-50/50 group shadow-sm">
                    
                    {/* Block Toolbar */}
                    <div className="absolute top-0 right-0 p-2 flex items-center gap-1 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity bg-white border-b border-l border-gray-200">
                      <button type="button" onClick={() => moveBlock(index, -1)} disabled={index === 0} className="p-1 text-gray-400 hover:text-black disabled:opacity-30"><ArrowUp size={14} /></button>
                      <button type="button" onClick={() => moveBlock(index, 1)} disabled={index === project.blocks.length - 1} className="p-1 text-gray-400 hover:text-black disabled:opacity-30"><ArrowDown size={14} /></button>
                      <div className="w-px h-3 bg-gray-300 mx-1"></div>
                      <button type="button" onClick={() => removeBlock(block.id)} className="p-1 text-red-500 hover:text-red-700"><Trash2 size={14} /></button>
                    </div>

                    <div className="mb-6 flex items-center gap-3 text-black border-b border-gray-200 pb-3 w-full">
                      {block.type === 'text' && <Type size={16} className="text-gray-600" />}
                      {block.type === 'image' && <ImageIcon size={16} className="text-gray-600" />}
                      {block.type === 'slider' && <LayoutTemplate size={16} className="text-gray-600" />}
                      {block.type === 'credits' && <Users size={16} className="text-gray-600" />}
                      <span className="text-[11px] font-bold uppercase tracking-[0.2em]">Khối: {block.type}</span>
                      <span className="text-[9px] text-gray-400 ml-auto">#{index + 1}</span>
                    </div>

                    {/* Block Specific Form Fields */}
                    {block.type === 'text' && (
                      <textarea
                        value={block.content}
                        onChange={(e) => updateBlock(block.id, 'content', e.target.value)}
                        placeholder="Nhập nội dung văn bản cho mục này..."
                        rows={5}
                        className="admin-input w-full bg-white border border-gray-300 focus:border-black transition-colors rounded-none outline-none p-4 text-sm placeholder:text-gray-300 resize-y"
                      />
                    )}

                    {block.type === 'image' && (
                      <div className="flex flex-col gap-5">
                        <div>
                          <label className="text-[10px] text-gray-500 uppercase tracking-[0.15em] mb-2 block">URL Hình Ảnh</label>
                          <input
                            type="url"
                            value={block.url}
                            onChange={(e) => updateBlock(block.id, 'url', e.target.value)}
                            placeholder="https://images.unsplash.com/..."
                            className="admin-input w-full bg-white border border-gray-300 focus:border-black transition-colors rounded-none outline-none p-3 text-sm placeholder:text-gray-300"
                          />
                        </div>
                        {/* Image Preview */}
                        {block.url ? (
                          <div className="relative w-full max-h-[180px] bg-gray-100 border border-gray-200 overflow-hidden">
                            <img 
                              src={block.url} 
                              alt="Preview" 
                              className="max-w-full max-h-[180px] object-contain mx-auto"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.parentElement.innerHTML += '<div class="p-6 text-center text-red-400 text-xs">⚠ Lỗi: Không thể tải ảnh từ URL này</div>';
                              }}
                            />
                          </div>
                        ) : (
                          <div className="w-full h-[100px] bg-gray-100 border border-dashed border-gray-300 flex items-center justify-center text-gray-400 text-xs">
                            <ImageIcon size={24} className="mr-2" /> Chưa có URL ảnh - Vui lòng nhập URL bên trên
                          </div>
                        )}
                        <div>
                          <label className="text-[10px] text-gray-500 uppercase tracking-[0.15em] mb-2 block">Chú Thích (Tùy Chọn)</label>
                          <input
                            type="text"
                            value={block.caption}
                            onChange={(e) => updateBlock(block.id, 'caption', e.target.value)}
                            placeholder="VD: Hình ảnh phối cảnh tổng thể"
                            className="admin-input w-full bg-white border border-gray-300 focus:border-black transition-colors rounded-none outline-none p-3 text-sm placeholder:text-gray-300"
                          />
                        </div>
                      </div>
                    )}

                    {block.type === 'slider' && (
                      <div className="flex flex-col gap-5">
                        <div className="text-[10px] text-gray-500 uppercase tracking-[0.15em] mb-2">Danh Sách Slides</div>
                        {block.slides && block.slides.map((slide, sIdx) => (
                          <div key={sIdx} className="flex gap-4 items-start bg-white p-4 border border-gray-200">
                            <span className="text-[11px] font-bold mt-3 text-gray-400 w-5">{sIdx + 1}</span>
                            <div className="flex-1 flex flex-col gap-3">
                              <div>
                                <label className="text-[9px] text-gray-400 uppercase tracking-[0.1em] mb-1 block">URL Hình Ảnh</label>
                                <input
                                  type="url"
                                  value={slide.url}
                                  onChange={(e) => updateSlide(block.id, sIdx, 'url', e.target.value)}
                                  placeholder="https://images.unsplash.com/..."
                                  className="admin-input w-full bg-gray-50 border border-gray-300 focus:border-black transition-colors rounded-none outline-none p-2.5 text-sm placeholder:text-gray-300"
                                />
                              </div>
                              <div>
                                <label className="text-[9px] text-gray-400 uppercase tracking-[0.1em] mb-1 block">Chú Thích</label>
                                <input
                                  type="text"
                                  value={slide.caption}
                                  onChange={(e) => updateSlide(block.id, sIdx, 'caption', e.target.value)}
                                  placeholder="VD: Hình ảnh nội thất"
                                  className="admin-input w-full bg-gray-50 border border-gray-300 focus:border-black transition-colors rounded-none outline-none p-2.5 text-sm placeholder:text-gray-300"
                                />
                              </div>
                            </div>
                            <button type="button" onClick={() => removeSlide(block.id, sIdx)} className="mt-6 text-gray-400 hover:text-red-500 p-1">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        ))}
                        <button 
                          type="button" 
                          onClick={() => addSlide(block.id)}
                          className="text-[11px] tracking-[0.15em] uppercase font-bold flex items-center gap-2 w-fit mt-2 hover:text-blue-600 transition-colors border border-dashed border-gray-300 px-4 py-3"
                        >
                          <Plus size={14} /> Thêm Slide Mới
                        </button>
                      </div>
                    )}

                    {block.type === 'credits' && (
                      <div className="flex flex-col gap-5">
                        <div className="text-[10px] text-gray-500 uppercase tracking-[0.15em] mb-2">Danh Sách Vai Trò</div>
                        {block.roles && block.roles.map((role, rIdx) => (
                          <div key={rIdx} className="flex gap-4 items-start bg-white p-4 border border-gray-200">
                            <div className="flex-1 flex flex-col gap-3">
                              <div>
                                <label className="text-[9px] text-gray-400 uppercase tracking-[0.1em] mb-1 block">Vai Trò</label>
                                <input
                                  type="text"
                                  value={role.roleName}
                                  onChange={(e) => updateRole(block.id, rIdx, 'roleName', e.target.value)}
                                  placeholder="VD: Kiến Trúc Sư Chính"
                                  className="admin-input w-full bg-gray-50 border border-gray-300 focus:border-black transition-colors rounded-none outline-none p-2.5 text-sm placeholder:text-gray-300"
                                />
                              </div>
                              <div>
                                <label className="text-[9px] text-gray-400 uppercase tracking-[0.1em] mb-1 block">Tên Cá Nhân (Cách nhau bằng dấu phẩy)</label>
                                <input
                                  type="text"
                                  value={role.people}
                                  onChange={(e) => updateRole(block.id, rIdx, 'people', e.target.value)}
                                  placeholder="VD: Nguyễn Văn A, Trần Thị B"
                                  className="admin-input w-full bg-gray-50 border border-gray-300 focus:border-black transition-colors rounded-none outline-none p-2.5 text-sm placeholder:text-gray-300"
                                />
                              </div>
                            </div>
                            <button type="button" onClick={() => removeRole(block.id, rIdx)} className="mt-6 text-gray-400 hover:text-red-500 p-1">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        ))}
                        <button 
                          type="button" 
                          onClick={() => addRole(block.id)}
                          className="text-[11px] tracking-[0.15em] uppercase font-bold flex items-center gap-2 w-fit mt-2 hover:text-blue-600 transition-colors border border-dashed border-gray-300 px-4 py-3"
                        >
                          <Plus size={14} /> Thêm Vai Trò Mới
                        </button>
                      </div>
                    )}

                  </div>
                ))}
              </div>

              {/* Add New Block Buttons */}
              <div className="mt-6 pt-8 border-t border-gray-200">
                <div className="text-[10px] text-gray-500 uppercase tracking-[0.15em] mb-4">Thêm Khối Mới</div>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  <button type="button" onClick={() => addBlock('text')} className="border-2 border-gray-200 p-5 flex flex-col items-center justify-center gap-3 hover:border-black hover:bg-black hover:text-white transition-all text-gray-500 group">
                    <Type size={20} strokeWidth={1.5} />
                    <span className="text-[10px] font-bold uppercase tracking-[0.1em]">Chữ Text</span>
                  </button>
                  <button type="button" onClick={() => addBlock('image')} className="border-2 border-gray-200 p-5 flex flex-col items-center justify-center gap-3 hover:border-black hover:bg-black hover:text-white transition-all text-gray-500 group">
                    <ImageIcon size={20} strokeWidth={1.5} />
                    <span className="text-[10px] font-bold uppercase tracking-[0.1em]">1 Ảnh</span>
                  </button>
                  <button type="button" onClick={() => addBlock('slider')} className="border-2 border-gray-200 p-5 flex flex-col items-center justify-center gap-3 hover:border-black hover:bg-black hover:text-white transition-all text-gray-500 group">
                    <LayoutTemplate size={20} strokeWidth={1.5} />
                    <span className="text-[10px] font-bold uppercase tracking-[0.1em]">Trình Chiếu</span>
                  </button>
                  <button type="button" onClick={() => addBlock('credits')} className="border-2 border-gray-200 p-5 flex flex-col items-center justify-center gap-3 hover:border-black hover:bg-black hover:text-white transition-all text-gray-500 group col-span-2 md:col-span-1">
                    <Users size={20} strokeWidth={1.5} />
                    <span className="text-[10px] font-bold uppercase tracking-[0.1em]">Thông Tín Dụng</span>
                  </button>
                </div>
              </div>

            </section>
          </form>
        </div>
      </div>
    </div>
  );
}