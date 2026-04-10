'use client';

import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, ArrowUpRight, Grid, List } from 'lucide-react';
import Link from 'next/link';
import { apiGet, apiDelete } from '@/lib/api';

// 定义项目分类常量
const CATEGORIES = [
  { label: 'Tất Cả', value: null, color: 'bg-black' },
  { label: 'Landscape', value: 'Landscape', color: 'bg-green-600' },
  { label: 'Engineering', value: 'Engineering', color: 'bg-blue-600' },
  { label: 'Architecture', value: 'Architecture', color: 'bg-amber-600' },
  { label: 'Products', value: 'Products', color: 'bg-purple-600' },
];

export default function AdminDashboard() {
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [isLoading, setIsLoading] = useState(true);

  // 加载项目数据
  useEffect(() => {
    setIsLoading(true);
    apiGet('/api/projects')
      .then(data => {
        if (!data.error && Array.isArray(data)) {
          setProjects(data);
          setFilteredProjects(data);
        }
      })
      .catch(err => console.error('Error fetching projects:', err))
      .finally(() => setIsLoading(false));
  }, []);

  // 根据分类筛选项目
  useEffect(() => {
    if (activeCategory === null) {
      setFilteredProjects(projects);
    } else {
      setFilteredProjects(projects.filter(p => p.category === activeCategory));
    }
  }, [activeCategory, projects]);

  const handleDelete = async (id) => {
    if (!confirm('Bạn có chắc chắn muốn xóa bản ghi này? Hành động này không thể hoàn tác!')) return;
    try {
      await apiDelete(`/api/projects/${id}`);
      setProjects(prev => prev.filter(p => p._id !== id));
      setFilteredProjects(prev => prev.filter(p => p._id !== id));
    } catch (err) {
      console.error('Error deleting project:', err);
      alert('Xóa thất bại');
    }
  };

  const getLatestYear = () => {
    if (!projects.length) return 'N/A';
    return new Date(projects[0].createdAt).getFullYear();
  };

  // 统计每个分类的项目数量
  const getCategoryCount = (category) => {
    if (category === null) return projects.length;
    return projects.filter(p => p.category === category).length;
  };

  return (
    <>
      <div className="p-8 md:p-12 min-h-screen pb-20">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 border-b border-gray-200 pb-8">
          <div>
            <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter">CÁC DỰ ÁN</h2>
            <p className="text-gray-500 font-light mt-4 uppercase tracking-widest text-sm flex gap-4 flex-wrap">
              <span>TỔNG KHỐI LƯỢNG: {projects.length}</span>
              <span>ĐANG HIỂN THỊ: {filteredProjects.length}</span>
              <span>GẦN ĐÂY: {getLatestYear()}</span>
            </p>
          </div>

          <Link href="/admin/projects/new" className="mt-8 md:mt-0 flex items-center gap-2 bg-black text-white px-8 py-4 uppercase text-xs tracking-widest font-bold hover:bg-gray-800 transition-colors group">
            <Plus size={16} />
            <span>THÊM DỰ ÁN MỚI</span>
            <ArrowUpRight size={16} className="opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all" />
          </Link>
        </header>

        {/* ===== PHẦN BỘ LỌC THEO DANH MỤC ===== */}
        <div className="mb-10">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.value ?? 'all'}
                  onClick={() => setActiveCategory(cat.value)}
                  className={`px-4 py-2.5 text-[11px] font-bold uppercase tracking-wider transition-all border ${
                    activeCategory === cat.value
                      ? `${cat.color} text-white border-transparent`
                      : 'bg-white text-black border-gray-300 hover:border-black hover:bg-gray-50'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    {cat.label}
                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                      activeCategory === cat.value
                        ? 'bg-white/20 text-white'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {getCategoryCount(cat.value)}
                    </span>
                  </span>
                </button>
              ))}
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-1 border border-gray-300 p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 transition-colors ${viewMode === 'grid' ? 'bg-black text-white' : 'hover:bg-gray-100'}`}
                title="Grid View"
              >
                <Grid size={16} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 transition-colors ${viewMode === 'list' ? 'bg-black text-white' : 'hover:bg-gray-100'}`}
                title="List View"
              >
                <List size={16} />
              </button>
            </div>
          </div>

          {/* Active filter indicator */}
          {activeCategory && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>Đang lọc theo:</span>
              <span className="font-bold text-black uppercase tracking-wider">
                {CATEGORIES.find(c => c.value === activeCategory)?.label}
              </span>
              <button
                onClick={() => setActiveCategory(null)}
                className="ml-2 text-xs uppercase tracking-wider underline hover:text-red-600 transition-colors"
              >
                Xóa bộ lọc
              </button>
            </div>
          )}
        </div>

        {/* ===== HIỂN THỊ DỰ ÁN ===== */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-xs uppercase tracking-widest text-gray-400">Đang tải dữ liệu...</p>
            </div>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed border-gray-300">
            <p className="text-gray-400 text-sm uppercase tracking-widest mb-4">
              {activeCategory 
                ? `Không có dự án nào thuộc danh mục "${CATEGORIES.find(c => c.value === activeCategory)?.label}"` 
                : 'Chưa có dự án nào'}
            </p>
            <Link href="/admin/projects/new" className="inline-flex items-center gap-2 text-black hover:underline text-sm uppercase tracking-widest">
              <Plus size={14} />
              Tạo dự án mới
            </Link>
          </div>
        ) : viewMode === 'grid' ? (
          /* ===== GRID VIEW ===== */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-12">
            {filteredProjects.map((project) => (
              <div key={project._id} className="group cursor-pointer relative flex flex-col">
                <div className="aspect-[4/3] w-full bg-gray-100 overflow-hidden relative border border-gray-200">
                  <img
                    src={project.general?.coverImage || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2070'}
                    alt={project.general?.title || 'Project Image'}
                    className="w-full h-full object-cover transition-all duration-700 ease-in-out group-hover:scale-105"
                  />
                  
                  {/* Category Badge */}
                  {project.category && (
                    <span className={`absolute top-4 left-4 px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-white ${
                      project.category === 'Landscape' ? 'bg-green-600' :
                      project.category === 'Engineering' ? 'bg-blue-600' :
                      project.category === 'Architecture' ? 'bg-amber-600' :
                      project.category === 'Products' ? 'bg-purple-600' : 'bg-gray-600'
                    }`}>
                      {project.category}
                    </span>
                  )}

                  {/* Overlay actions */}
                  <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Link href={`/admin/projects/${project._id}`} className="p-3 bg-white text-black hover:bg-black hover:text-white transition-colors border border-black/10">
                      <Edit2 size={16} strokeWidth={2.5} />
                    </Link>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(project._id); }}
                      className="p-3 bg-white text-red-600 hover:bg-red-600 hover:text-white transition-colors border border-black/10"
                    >
                      <Trash2 size={16} strokeWidth={2.5} />
                    </button>
                  </div>
                </div>

                <div className="mt-4 border-t border-gray-200 pt-4 flex-1 flex flex-col justify-between">
                  <div className="flex justify-between items-start mb-4">
                    <div className="pr-4">
                      <h3 className="text-2xl font-black uppercase tracking-tighter leading-none break-words max-w-full text-balance overflow-visible">
                        {project.general?.title}
                      </h3>
                      <p className="text-xs text-gray-500 font-medium uppercase tracking-[0.2em] mt-3">
                        {project.general?.typology || project.general?.location || 'PROJECT'}
                      </p>
                    </div>
                    <span className="text-sm font-bold border-2 border-black px-3 py-1 tracking-wider whitespace-nowrap shrink-0">
                      {new Date(project.createdAt).getFullYear()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* ===== LIST VIEW ===== */
          <div className="border border-gray-200">
            {/* Header */}
            <div className="grid grid-cols-12 gap-4 p-4 bg-gray-50 border-b border-gray-200 text-[10px] font-bold uppercase tracking-widest text-gray-500">
              <div className="col-span-5">Dự Án</div>
              <div className="col-span-2">Danh Mục</div>
              <div className="col-span-2">Loại Hình</div>
              <div className="col-span-1">Năm</div>
              <div className="col-span-2 text-right">Hành Động</div>
            </div>
            
            {/* Rows */}
            {filteredProjects.map((project, idx) => (
              <div 
                key={project._id} 
                className={`grid grid-cols-12 gap-4 p-4 items-center hover:bg-gray-50 transition-colors ${
                  idx !== filteredProjects.length - 1 ? 'border-b border-gray-100' : ''
                }`}
              >
                <div className="col-span-5 flex items-center gap-4">
                  <div className="w-16 h-12 bg-gray-100 overflow-hidden shrink-0">
                    <img
                      src={project.general?.coverImage || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2070'}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold uppercase tracking-tight truncate">{project.general?.title}</h3>
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider truncate">{project.general?.location}</p>
                  </div>
                </div>
                <div className="col-span-2">
                  {project.category && (
                    <span className={`inline-block px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-white ${
                      project.category === 'Landscape' ? 'bg-green-600' :
                      project.category === 'Engineering' ? 'bg-blue-600' :
                      project.category === 'Architecture' ? 'bg-amber-600' :
                      project.category === 'Products' ? 'bg-purple-600' : 'bg-gray-600'
                    }`}>
                      {project.category}
                    </span>
                  )}
                </div>
                <div className="col-span-2 text-xs text-gray-600 uppercase tracking-wider truncate">
                  {project.general?.typology || '-'}
                </div>
                <div className="col-span-1 text-sm font-bold">
                  {new Date(project.createdAt).getFullYear()}
                </div>
                <div className="col-span-2 flex justify-end gap-2">
                  <Link href={`/admin/projects/${project._id}`} className="p-2 bg-black text-white hover:bg-gray-800 transition-colors">
                    <Edit2 size={14} strokeWidth={2.5} />
                  </Link>
                  <button
                    onClick={() => handleDelete(project._id)}
                    className="p-2 bg-white text-red-600 border border-gray-300 hover:bg-red-600 hover:text-white hover:border-red-600 transition-colors"
                  >
                    <Trash2 size={14} strokeWidth={2.5} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
