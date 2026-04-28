'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Award, Image as ImageIcon, X, RotateCcw } from 'lucide-react';

export default function CredentialsAdmin() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [editModal, setEditModal] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newItem, setNewItem] = useState({
    id: '', brand: '', title: '', subtitle: '', src: '', num: '', medal: false
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch('/api/admin/credentials');
      const data = await res.json();
      setItems(data.items || []);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch:', error);
      setLoading(false);
    }
  };

  const handleReset = async () => {
    if (!confirm('Reset all credentials to default? This will delete all current data.')) return;
    setSaving(true);
    try {
      const res = await fetch('/api/admin/credentials?action=reset', { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setItems(data.items);
        alert('Credentials reset successfully!');
      }
    } catch (error) {
      console.error('Failed to reset:', error);
    }
    setSaving(false);
  };

  const handleAddNew = async () => {
    if (!newItem.brand || !newItem.title || !newItem.num) {
      alert('Please fill in brand, title, and num');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/admin/credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItem),
      });
      const data = await res.json();
      if (data.success) {
        fetchData();
        setShowAddModal(false);
        setNewItem({ id: '', brand: '', title: '', subtitle: '', src: '', num: '', medal: false });
      }
    } catch (error) {
      console.error('Failed to add:', error);
    }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this credential?')) return;
    setSaving(true);
    try {
      const res = await fetch('/api/admin/credentials', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (data.success) {
        setItems(prev => prev.filter(item => item.id !== id));
      }
    } catch (error) {
      console.error('Failed to delete:', error);
    }
    setSaving(false);
  };

  const updateField = async (index, field, value) => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/credentials', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ index, field, value }),
      });
      const result = await res.json();
      if (result.success) {
        setItems(prev => prev.map((item, i) => i === index ? result.item : item));
      }
    } catch (error) {
      console.error('Failed to update:', error);
    }
    setSaving(false);
  };

  const handleImageUpload = (index) => {
    const url = prompt('Enter image URL:');
    if (url) {
      updateField(index, 'src', url);
    }
  };

  const openEditModal = (index) => {
    setEditModal({ index, ...items[index] });
  };

  const closeEditModal = () => {
    setEditModal(null);
  };

  const saveEditModal = () => {
    if (editModal) {
      updateField(editModal.index, 'brand', editModal.brand);
      updateField(editModal.index, 'title', editModal.title);
      updateField(editModal.index, 'subtitle', editModal.subtitle);
      updateField(editModal.index, 'src', editModal.src);
      updateField(editModal.index, 'medal', editModal.medal);
      closeEditModal();
    }
  };

  if (loading) {
    return (
      <div className="p-8 md:p-12 min-h-screen">
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-xs uppercase tracking-widest text-gray-400">Đang tải dữ liệu...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Toast notification */}
      {saving && (
        <div className="fixed top-4 right-4 bg-black text-white px-4 py-2 text-xs uppercase tracking-widest font-bold z-50 animate-pulse">
          Đang lưu...
        </div>
      )}

      <div className="p-8 md:p-12 min-h-screen pb-20">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 border-b border-gray-200 pb-8">
          <div>
            <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter">CREDENTIALS</h2>
            <p className="text-gray-500 font-light mt-4 uppercase tracking-widest text-sm flex gap-4 flex-wrap">
              <span>TỔNG SỐ: {items.length}</span>
              <span>MEDAL: {items.filter(i => i.medal).length}</span>
            </p>
          </div>

          <div className="mt-8 md:mt-0 flex gap-3 flex-wrap">
            <button
              onClick={handleReset}
              className="flex items-center gap-2 border-2 border-red-500 text-red-500 px-6 py-3 uppercase text-xs tracking-widest font-bold hover:bg-red-500 hover:text-white transition-colors"
            >
              <RotateCcw size={14} />
              RESET
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 bg-black text-white px-8 py-3 uppercase text-xs tracking-widest font-bold hover:bg-gray-800 transition-colors"
            >
              <Plus size={14} />
              THÊM MỚI
            </button>
          </div>
        </header>

        {/* Credentials Grid */}
        {items.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed border-gray-300">
            <p className="text-gray-400 text-sm uppercase tracking-widest mb-4">
              Chưa có credentials nào
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {items.map((item, index) => (
              <div 
                key={item.id} 
                className="group cursor-pointer relative flex flex-col bg-white border border-gray-200 hover:border-black transition-colors"
              >
                {/* Image */}
                <div className="w-full h-48 bg-gray-100 overflow-hidden relative">
                  <img
                    src={item.src || 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=800'}
                    alt={item.title}
                    className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105"
                  />
                  
                  {/* Medal Badge */}
                  {item.medal && (
                    <div className="absolute top-3 left-3 bg-yellow-500 text-white px-2 py-1 text-[9px] font-bold uppercase tracking-wider flex items-center gap-1">
                      <Award size={10} />
                      MEDAL
                    </div>
                  )}

                  {/* Number Badge */}
                  <div className="absolute top-3 right-3 bg-black text-white px-2 py-1 text-[10px] font-mono">
                    {item.num}
                  </div>

                  {/* Hover Actions */}
                  <div className="absolute bottom-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => { e.stopPropagation(); openEditModal(index); }}
                      className="p-2.5 bg-white text-black hover:bg-black hover:text-white transition-colors border border-black/10"
                      title="Edit"
                    >
                      <Edit2 size={14} strokeWidth={2.5} />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleImageUpload(index); }}
                      className="p-2.5 bg-white text-black hover:bg-black hover:text-white transition-colors border border-black/10"
                      title="Change Image"
                    >
                      <ImageIcon size={14} strokeWidth={2.5} />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }}
                      className="p-2.5 bg-white text-red-500 hover:bg-red-500 hover:text-white transition-colors border border-black/10"
                      title="Delete"
                    >
                      <Trash2 size={14} strokeWidth={2.5} />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold mb-1">
                      {item.brand}
                    </p>
                    <h3 className="text-lg font-black tracking-tight leading-tight mb-2">
                      {item.title}
                    </h3>
                    <p className="text-xs text-gray-500 leading-relaxed">
                      {item.subtitle}
                    </p>
                  </div>

                  <button
                    onClick={() => updateField(index, 'medal', !item.medal)}
                    className={`mt-4 w-full py-2.5 text-[10px] font-bold uppercase tracking-widest transition-colors ${
                      item.medal
                        ? 'bg-yellow-500 text-white hover:bg-yellow-600'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {item.medal ? 'Remove Medal' : 'Add Medal'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white w-full max-w-2xl max-h-[90vh] overflow-auto">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
              <h2 className="text-xl font-black uppercase tracking-tighter">
                Edit {editModal.num}
              </h2>
              <button
                onClick={closeEditModal}
                className="p-2 hover:bg-gray-100 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Preview Image */}
              <div className="aspect-video bg-gray-100 overflow-hidden border border-gray-200">
                <img
                  src={editModal.src || 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=800'}
                  alt={editModal.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Image URL */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">
                  Image URL
                </label>
                <input
                  type="text"
                  value={editModal.src}
                  onChange={(e) => setEditModal({ ...editModal, src: e.target.value })}
                  className="w-full border border-gray-300 px-4 py-3 text-sm focus:border-black focus:outline-none transition-colors"
                  placeholder="https://..."
                />
              </div>

              {/* Brand */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">
                  Brand
                </label>
                <input
                  type="text"
                  value={editModal.brand}
                  onChange={(e) => setEditModal({ ...editModal, brand: e.target.value })}
                  className="w-full border border-gray-300 px-4 py-3 text-sm focus:border-black focus:outline-none transition-colors"
                  placeholder="Brand name"
                />
              </div>

              {/* Title */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={editModal.title}
                  onChange={(e) => setEditModal({ ...editModal, title: e.target.value })}
                  className="w-full border border-gray-300 px-4 py-3 text-sm focus:border-black focus:outline-none transition-colors"
                  placeholder="Title"
                />
              </div>

              {/* Subtitle */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">
                  Subtitle
                </label>
                <textarea
                  value={editModal.subtitle}
                  onChange={(e) => setEditModal({ ...editModal, subtitle: e.target.value })}
                  className="w-full border border-gray-300 px-4 py-3 text-sm focus:border-black focus:outline-none transition-colors resize-none h-24"
                  placeholder="Subtitle"
                />
              </div>

              {/* Medal Toggle */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => setEditModal({ ...editModal, medal: !editModal.medal })}
                  className={`w-12 h-6 rounded-full transition-colors relative ${
                    editModal.medal ? 'bg-yellow-500' : 'bg-gray-300'
                  }`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform shadow ${
                    editModal.medal ? 'translate-x-7' : 'translate-x-1'
                  }`} />
                </button>
                <span className="text-sm font-bold uppercase tracking-widest">
                  Medal
                </span>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex gap-3 sticky bottom-0 bg-white">
              <button
                onClick={closeEditModal}
                className="flex-1 py-3 border border-gray-300 text-sm font-bold uppercase tracking-widest hover:bg-gray-50 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={saveEditModal}
                className="flex-1 py-3 bg-black text-white text-sm font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors"
              >
                Lưu Thay Đổi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add New Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white w-full max-w-2xl max-h-[90vh] overflow-auto">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
              <h2 className="text-xl font-black uppercase tracking-tighter">
                THÊM CREDENTIALS MỚI
              </h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 hover:bg-gray-100 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* ID */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">
                  ID (slug)
                </label>
                <input
                  type="text"
                  value={newItem.id}
                  onChange={(e) => setNewItem({ ...newItem, id: e.target.value })}
                  className="w-full border border-gray-300 px-4 py-3 text-sm focus:border-black focus:outline-none transition-colors"
                  placeholder="unique-id"
                />
              </div>

              {/* Num */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">
                  Number (required)
                </label>
                <input
                  type="text"
                  value={newItem.num}
                  onChange={(e) => setNewItem({ ...newItem, num: e.target.value })}
                  className="w-full border border-gray-300 px-4 py-3 text-sm focus:border-black focus:outline-none transition-colors"
                  placeholder="(11)"
                />
              </div>

              {/* Brand */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">
                  Brand (required)
                </label>
                <input
                  type="text"
                  value={newItem.brand}
                  onChange={(e) => setNewItem({ ...newItem, brand: e.target.value })}
                  className="w-full border border-gray-300 px-4 py-3 text-sm focus:border-black focus:outline-none transition-colors"
                  placeholder="Brand name"
                />
              </div>

              {/* Title */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">
                  Title (required)
                </label>
                <input
                  type="text"
                  value={newItem.title}
                  onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                  className="w-full border border-gray-300 px-4 py-3 text-sm focus:border-black focus:outline-none transition-colors"
                  placeholder="Title"
                />
              </div>

              {/* Subtitle */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">
                  Subtitle
                </label>
                <textarea
                  value={newItem.subtitle}
                  onChange={(e) => setNewItem({ ...newItem, subtitle: e.target.value })}
                  className="w-full border border-gray-300 px-4 py-3 text-sm focus:border-black focus:outline-none transition-colors resize-none h-24"
                  placeholder="Subtitle"
                />
              </div>

              {/* Image URL */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">
                  Image URL
                </label>
                <input
                  type="text"
                  value={newItem.src}
                  onChange={(e) => setNewItem({ ...newItem, src: e.target.value })}
                  className="w-full border border-gray-300 px-4 py-3 text-sm focus:border-black focus:outline-none transition-colors"
                  placeholder="https://..."
                />
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex gap-3 sticky bottom-0 bg-white">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 py-3 border border-gray-300 text-sm font-bold uppercase tracking-widest hover:bg-gray-50 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleAddNew}
                className="flex-1 py-3 bg-black text-white text-sm font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors"
              >
                Thêm Mới
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
