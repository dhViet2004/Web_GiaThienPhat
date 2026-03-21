'use client';

import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import { apiGet, apiDelete } from '@/lib/api';

export default function AdminDashboard() {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    apiGet('/api/projects')
      .then(data => {
        if (!data.error && Array.isArray(data)) setProjects(data);
      })
      .catch(err => console.error('Error fetching projects:', err));
  }, []);

  const handleDelete = async (id) => {
    if (!confirm('Bạn có chắc chắn muốn xóa bản ghi này? Hành động này không thể hoàn tác!')) return;
    try {
      await apiDelete(`/api/projects/${id}`);
      setProjects(prev => prev.filter(p => p._id !== id));
    } catch (err) {
      console.error('Error deleting project:', err);
      alert('Xóa thất bại');
    }
  };

  const getLatestYear = () => {
    if (!projects.length) return 'N/A';
    return new Date(projects[0].createdAt).getFullYear();
  };

  return (
    <>
      <div className="p-8 md:p-12 min-h-screen pb-20">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 border-b border-gray-200 pb-8">
          <div>
            <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter">CÁC DỰ ÁN</h2>
            <p className="text-gray-500 font-light mt-4 uppercase tracking-widest text-sm flex gap-4">
              <span>TỔNG KHỐI LƯỢNG: {projects.length}</span>
              <span>GẦN ĐÂY: {getLatestYear()}</span>
            </p>
          </div>

          <Link href="/admin/projects/new" className="mt-8 md:mt-0 flex items-center gap-2 bg-black text-white px-8 py-4 uppercase text-xs tracking-widest font-bold hover:bg-gray-800 transition-colors group">
            <Plus size={16} />
            <span>THÊM DỰ ÁN MỚI</span>
            <ArrowUpRight size={16} className="opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all" />
          </Link>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-12">
          {projects.map((project) => (
            <div key={project._id} className="group cursor-pointer relative flex flex-col">
              <div className="aspect-[4/3] w-full bg-gray-100 overflow-hidden relative border border-gray-200">
                <img
                  src={project.general?.coverImage || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2070'}
                  alt={project.general?.title || 'Project Image'}
                  className="w-full h-full object-cover transition-all duration-700 ease-in-out group-hover:scale-105"
                />

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
      </div>
    </>
  );
}
