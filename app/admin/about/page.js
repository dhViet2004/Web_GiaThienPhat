'use client';

import { useEffect, useState } from 'react';
import { Save, Plus, Trash2, GripVertical, ChevronDown, ChevronUp, Eye, Edit2 } from 'lucide-react';
import { apiGet, apiPut } from '@/lib/api';

const PEOPLE_CATEGORIES = ['Founder', 'Architect', 'Finance', 'Director', 'Collaborative'];

export default function AdminAboutPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [activeSection, setActiveSection] = useState('profile');

  useEffect(() => {
    loadAbout();
  }, []);

  const loadAbout = async () => {
    try {
      const res = await apiGet('/api/about');
      setData(res);
    } catch (err) {
      console.error('Error loading about data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage({ type: '', text: '' });
    try {
      await apiPut('/api/about', data);
      setMessage({ type: 'success', text: 'Lưu thành công!' });
    } catch (err) {
      setMessage({ type: 'error', text: 'Lỗi khi lưu: ' + err.message });
    } finally {
      setSaving(false);
    }
  };

  const updateField = (section, field, value) => {
    setData(prev => ({
      ...prev,
      [section]: { ...prev[section], [field]: value }
    }));
  };

  const updateNestedField = (section, field, subField, value) => {
    setData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: { ...prev[section][field], [subField]: value }
      }
    }));
  };

  const updateArrayItem = (section, field, index, value) => {
    setData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: prev[section][field].map((item, i) => i === index ? value : item)
      }
    }));
  };

  const addArrayItem = (section, field, defaultItem) => {
    setData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: [...prev[section][field], defaultItem]
      }
    }));
  };

  const removeArrayItem = (section, field, index) => {
    setData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: prev[section][field].filter((_, i) => i !== index)
      }
    }));
  };

  // People management
  const addPerson = () => {
    setData(prev => ({
      ...prev,
      people: [...prev.people, {
        name: '',
        role: '',
        image: '',
        bio: '',
        category: 'Architect',
        order: prev.people.length,
      }]
    }));
  };

  const updatePerson = (index, field, value) => {
    setData(prev => ({
      ...prev,
      people: prev.people.map((p, i) => i === index ? { ...p, [field]: value } : p)
    }));
  };

  const removePerson = (index) => {
    setData(prev => ({
      ...prev,
      people: prev.people.filter((_, i) => i !== index)
    }));
  };

  const movePerson = (index, direction) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= data.people.length) return;
    setData(prev => {
      const newPeople = [...prev.people];
      [newPeople[index], newPeople[newIndex]] = [newPeople[newIndex], newPeople[index]];
      return { ...prev, people: newPeople };
    });
  };

  // Socials management
  const addSocial = () => {
    setData(prev => ({
      ...prev,
      footer: {
        ...prev.footer,
        socials: [...prev.footer.socials, { name: '', url: '#' }]
      }
    }));
  };

  const updateSocial = (index, field, value) => {
    setData(prev => ({
      ...prev,
      footer: {
        ...prev.footer,
        socials: prev.footer.socials.map((s, i) => i === index ? { ...s, [field]: value } : s)
      }
    }));
  };

  const removeSocial = (index) => {
    setData(prev => ({
      ...prev,
      footer: {
        ...prev.footer,
        socials: prev.footer.socials.filter((_, i) => i !== index)
      }
    }));
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-xs uppercase tracking-widest text-gray-400">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const sections = [
    { id: 'profile', label: 'Profile' },
    { id: 'business', label: 'Business' },
    { id: 'people', label: 'People' },
    { id: 'office', label: 'Office' },
    { id: 'footer', label: 'Footer' },
  ];

  return (
    <div className="p-8 md:p-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 border-b border-gray-200 pb-8 gap-6">
        <div>
          <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter">QUẢN LÝ ABOUT</h2>
          <p className="text-gray-500 font-light mt-4 uppercase tracking-widest text-sm">
            Chỉnh sửa nội dung trang About
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-black text-white px-8 py-4 uppercase text-xs tracking-widest font-bold hover:bg-gray-800 transition-colors disabled:opacity-50"
        >
          <Save size={16} />
          <span>{saving ? 'ĐANG LƯU...' : 'LƯU THAY ĐỔI'}</span>
        </button>
      </div>

      {/* Message */}
      {message.text && (
        <div className={`mb-8 p-4 text-xs font-bold uppercase tracking-widest ${
          message.type === 'success'
            ? 'bg-green-50 text-green-600 border-l-2 border-green-500'
            : 'bg-red-50 text-red-600 border-l-2 border-red-500'
        }`}>
          {message.text}
        </div>
      )}

      {/* Section Tabs */}
      <div className="flex flex-wrap gap-2 mb-10 border-b border-gray-200 pb-4">
        {sections.map(section => (
          <button
            key={section.id}
            onClick={() => setActiveSection(section.id)}
            className={`px-5 py-2.5 text-[11px] font-bold uppercase tracking-wider transition-all border ${
              activeSection === section.id
                ? 'bg-black text-white border-black'
                : 'bg-white text-black border-gray-300 hover:border-black hover:bg-gray-50'
            }`}
          >
            {section.label}
          </button>
        ))}
      </div>

      {/* ===== PROFILE SECTION ===== */}
      {activeSection === 'profile' && (
        <div className="space-y-8">
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-bold uppercase tracking-wider mb-6 pb-4 border-b border-gray-200">Profile Header</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-[10px] uppercase tracking-[0.2em] text-gray-500 mb-2 block font-bold">Title</label>
                <input
                  type="text"
                  value={data.profile.title}
                  onChange={(e) => updateField('profile', 'title', e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded px-4 py-3 text-sm font-medium focus:outline-none focus:border-black transition-colors"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-[0.2em] text-gray-500 mb-2 block font-bold">Subtitle</label>
                <input
                  type="text"
                  value={data.profile.subtitle}
                  onChange={(e) => updateField('profile', 'subtitle', e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded px-4 py-3 text-sm font-medium focus:outline-none focus:border-black transition-colors"
                />
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-bold uppercase tracking-wider mb-6 pb-4 border-b border-gray-200">Tiếng Việt</h3>
            <div className="space-y-6">
              <div>
                <label className="text-[10px] uppercase tracking-[0.2em] text-gray-500 mb-2 block font-bold">FEDL Label</label>
                <input
                  type="text"
                  value={data.profile.vi.fedl}
                  onChange={(e) => updateNestedField('profile', 'vi', 'fedl', e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded px-4 py-3 text-sm font-medium focus:outline-none focus:border-black transition-colors"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-[0.2em] text-gray-500 mb-2 block font-bold">Đoạn văn 1</label>
                <textarea
                  rows={4}
                  value={data.profile.vi.paragraph1}
                  onChange={(e) => updateNestedField('profile', 'vi', 'paragraph1', e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded px-4 py-3 text-sm font-medium focus:outline-none focus:border-black transition-colors resize-y"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-[0.2em] text-gray-500 mb-2 block font-bold">Đoạn văn 2</label>
                <textarea
                  rows={4}
                  value={data.profile.vi.paragraph2}
                  onChange={(e) => updateNestedField('profile', 'vi', 'paragraph2', e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded px-4 py-3 text-sm font-medium focus:outline-none focus:border-black transition-colors resize-y"
                />
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-bold uppercase tracking-wider mb-6 pb-4 border-b border-gray-200">English</h3>
            <div className="space-y-6">
              <div>
                <label className="text-[10px] uppercase tracking-[0.2em] text-gray-500 mb-2 block font-bold">FEDL Label</label>
                <input
                  type="text"
                  value={data.profile.en.fedl}
                  onChange={(e) => updateNestedField('profile', 'en', 'fedl', e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded px-4 py-3 text-sm font-medium focus:outline-none focus:border-black transition-colors"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-[0.2em] text-gray-500 mb-2 block font-bold">Paragraph 1</label>
                <textarea
                  rows={4}
                  value={data.profile.en.paragraph1}
                  onChange={(e) => updateNestedField('profile', 'en', 'paragraph1', e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded px-4 py-3 text-sm font-medium focus:outline-none focus:border-black transition-colors resize-y"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-[0.2em] text-gray-500 mb-2 block font-bold">Paragraph 2</label>
                <textarea
                  rows={4}
                  value={data.profile.en.paragraph2}
                  onChange={(e) => updateNestedField('profile', 'en', 'paragraph2', e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded px-4 py-3 text-sm font-medium focus:outline-none focus:border-black transition-colors resize-y"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== BUSINESS SECTION ===== */}
      {activeSection === 'business' && (
        <div className="space-y-8">
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-bold uppercase tracking-wider mb-6 pb-4 border-b border-gray-200">Business Domains</h3>
            <div className="space-y-3">
              {data.business.domains.map((domain, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <GripVertical size={14} className="text-gray-400 shrink-0" />
                  <input
                    type="text"
                    value={domain}
                    onChange={(e) => updateArrayItem('business', 'domains', idx, e.target.value)}
                    className="flex-1 bg-white border border-gray-200 rounded px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-black transition-colors"
                  />
                  <button
                    onClick={() => removeArrayItem('business', 'domains', idx)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
              <button
                onClick={() => addArrayItem('business', 'domains', '')}
                className="flex items-center gap-2 text-sm font-bold text-black hover:text-gray-600 transition-colors mt-4"
              >
                <Plus size={14} /> Thêm Domain
              </button>
            </div>
          </div>

          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-bold uppercase tracking-wider mb-6 pb-4 border-b border-gray-200">Business Description</h3>
            <textarea
              rows={6}
              value={data.business.description}
              onChange={(e) => updateField('business', 'description', e.target.value)}
              className="w-full bg-white border border-gray-200 rounded px-4 py-3 text-sm font-medium focus:outline-none focus:border-black transition-colors resize-y"
            />
          </div>
        </div>
      )}

      {/* ===== PEOPLE SECTION ===== */}
      {activeSection === 'people' && (
        <div className="space-y-8">
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
              <h3 className="text-lg font-bold uppercase tracking-wider">Team Members ({data.people.length})</h3>
              <button
                onClick={addPerson}
                className="flex items-center gap-2 bg-black text-white px-4 py-2 text-xs font-bold uppercase tracking-wider hover:bg-gray-800 transition-colors"
              >
                <Plus size={14} /> Thêm Thành Viên
              </button>
            </div>

            <div className="space-y-6">
              {data.people.map((person, idx) => (
                <div key={idx} className="bg-white p-5 rounded-lg border border-gray-200">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="flex flex-col gap-1">
                      <button
                        onClick={() => movePerson(idx, -1)}
                        disabled={idx === 0}
                        className="p-1 hover:bg-gray-100 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <ChevronUp size={14} />
                      </button>
                      <button
                        onClick={() => movePerson(idx, 1)}
                        disabled={idx === data.people.length - 1}
                        className="p-1 hover:bg-gray-100 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <ChevronDown size={14} />
                      </button>
                    </div>
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div>
                        <label className="text-[9px] uppercase tracking-[0.2em] text-gray-400 mb-1 block font-bold">Tên</label>
                        <input
                          type="text"
                          value={person.name}
                          onChange={(e) => updatePerson(idx, 'name', e.target.value)}
                          className="w-full bg-gray-50 border border-gray-200 rounded px-3 py-2 text-sm font-medium focus:outline-none focus:border-black transition-colors"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] uppercase tracking-[0.2em] text-gray-400 mb-1 block font-bold">Chức Vụ</label>
                        <input
                          type="text"
                          value={person.role}
                          onChange={(e) => updatePerson(idx, 'role', e.target.value)}
                          className="w-full bg-gray-50 border border-gray-200 rounded px-3 py-2 text-sm font-medium focus:outline-none focus:border-black transition-colors"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] uppercase tracking-[0.2em] text-gray-400 mb-1 block font-bold">Danh Mục</label>
                        <select
                          value={person.category}
                          onChange={(e) => updatePerson(idx, 'category', e.target.value)}
                          className="w-full bg-gray-50 border border-gray-200 rounded px-3 py-2 text-sm font-medium focus:outline-none focus:border-black transition-colors"
                        >
                          {PEOPLE_CATEGORIES.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-[9px] uppercase tracking-[0.2em] text-gray-400 mb-1 block font-bold">Image URL</label>
                        <input
                          type="text"
                          value={person.image}
                          onChange={(e) => updatePerson(idx, 'image', e.target.value)}
                          className="w-full bg-gray-50 border border-gray-200 rounded px-3 py-2 text-sm font-medium focus:outline-none focus:border-black transition-colors"
                          placeholder="https://..."
                        />
                      </div>
                    </div>
                    <button
                      onClick={() => removePerson(idx)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded transition-colors shrink-0"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <div>
                    <label className="text-[9px] uppercase tracking-[0.2em] text-gray-400 mb-1 block font-bold">Bio</label>
                    <textarea
                      rows={3}
                      value={person.bio}
                      onChange={(e) => updatePerson(idx, 'bio', e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded px-3 py-2 text-sm font-medium focus:outline-none focus:border-black transition-colors resize-y"
                    />
                  </div>
                </div>
              ))}

              {data.people.length === 0 && (
                <div className="text-center py-12 text-gray-400">
                  <p className="text-sm uppercase tracking-widest">Chưa có thành viên nào</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ===== OFFICE SECTION ===== */}
      {activeSection === 'office' && (
        <div className="space-y-8">
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-bold uppercase tracking-wider mb-6 pb-4 border-b border-gray-200">Company Info</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-[10px] uppercase tracking-[0.2em] text-gray-500 mb-2 block font-bold">Company Name</label>
                <input
                  type="text"
                  value={data.office.companyName}
                  onChange={(e) => updateField('office', 'companyName', e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded px-4 py-3 text-sm font-medium focus:outline-none focus:border-black transition-colors"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-[0.2em] text-gray-500 mb-2 block font-bold">Capital</label>
                <input
                  type="text"
                  value={data.office.capital}
                  onChange={(e) => updateField('office', 'capital', e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded px-4 py-3 text-sm font-medium focus:outline-none focus:border-black transition-colors"
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-[10px] uppercase tracking-[0.2em] text-gray-500 mb-2 block font-bold">Registration</label>
                <input
                  type="text"
                  value={data.office.registration}
                  onChange={(e) => updateField('office', 'registration', e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded px-4 py-3 text-sm font-medium focus:outline-none focus:border-black transition-colors"
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-[10px] uppercase tracking-[0.2em] text-gray-500 mb-2 block font-bold">Address</label>
                <input
                  type="text"
                  value={data.office.address}
                  onChange={(e) => updateField('office', 'address', e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded px-4 py-3 text-sm font-medium focus:outline-none focus:border-black transition-colors"
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-[10px] uppercase tracking-[0.2em] text-gray-500 mb-2 block font-bold">Google Maps URL</label>
                <input
                  type="text"
                  value={data.office.mapUrl}
                  onChange={(e) => updateField('office', 'mapUrl', e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded px-4 py-3 text-sm font-medium focus:outline-none focus:border-black transition-colors"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-[0.2em] text-gray-500 mb-2 block font-bold">Tel</label>
                <input
                  type="text"
                  value={data.office.tel}
                  onChange={(e) => updateField('office', 'tel', e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded px-4 py-3 text-sm font-medium focus:outline-none focus:border-black transition-colors"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-[0.2em] text-gray-500 mb-2 block font-bold">Fax</label>
                <input
                  type="text"
                  value={data.office.fax}
                  onChange={(e) => updateField('office', 'fax', e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded px-4 py-3 text-sm font-medium focus:outline-none focus:border-black transition-colors"
                />
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-bold uppercase tracking-wider mb-6 pb-4 border-b border-gray-200">Station Access</h3>
            <div className="space-y-3">
              {data.office.stationAccess.map((station, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <GripVertical size={14} className="text-gray-400 shrink-0" />
                  <input
                    type="text"
                    value={station}
                    onChange={(e) => updateArrayItem('office', 'stationAccess', idx, e.target.value)}
                    className="flex-1 bg-white border border-gray-200 rounded px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-black transition-colors"
                  />
                  <button
                    onClick={() => removeArrayItem('office', 'stationAccess', idx)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
              <button
                onClick={() => addArrayItem('office', 'stationAccess', '')}
                className="flex items-center gap-2 text-sm font-bold text-black hover:text-gray-600 transition-colors mt-4"
              >
                <Plus size={14} /> Thêm Tuyến Đường
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== FOOTER SECTION ===== */}
      {activeSection === 'footer' && (
        <div className="space-y-8">
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-bold uppercase tracking-wider mb-6 pb-4 border-b border-gray-200">Social Links</h3>
            <div className="space-y-4">
              {data.footer.socials.map((social, idx) => (
                <div key={idx} className="flex items-center gap-3 bg-white p-4 rounded-lg border border-gray-200">
                  <input
                    type="text"
                    value={social.name}
                    onChange={(e) => updateSocial(idx, 'name', e.target.value)}
                    className="w-40 bg-gray-50 border border-gray-200 rounded px-3 py-2 text-sm font-medium focus:outline-none focus:border-black transition-colors"
                    placeholder="Name"
                  />
                  <input
                    type="text"
                    value={social.url}
                    onChange={(e) => updateSocial(idx, 'url', e.target.value)}
                    className="flex-1 bg-gray-50 border border-gray-200 rounded px-3 py-2 text-sm font-medium focus:outline-none focus:border-black transition-colors"
                    placeholder="https://..."
                  />
                  <button
                    onClick={() => removeSocial(idx)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
              <button
                onClick={addSocial}
                className="flex items-center gap-2 text-sm font-bold text-black hover:text-gray-600 transition-colors mt-4"
              >
                <Plus size={14} /> Thêm Social Link
              </button>
            </div>
          </div>

          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-bold uppercase tracking-wider mb-6 pb-4 border-b border-gray-200">Copyright</h3>
            <input
              type="text"
              value={data.footer.copyright}
              onChange={(e) => updateField('footer', 'copyright', e.target.value)}
              className="w-full bg-white border border-gray-200 rounded px-4 py-3 text-sm font-medium focus:outline-none focus:border-black transition-colors"
            />
          </div>
        </div>
      )}

      {/* Bottom Save */}
      <div className="mt-12 pt-8 border-t border-gray-200 flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-black text-white px-8 py-4 uppercase text-xs tracking-widest font-bold hover:bg-gray-800 transition-colors disabled:opacity-50"
        >
          <Save size={16} />
          <span>{saving ? 'ĐANG LƯU...' : 'LƯU THAY ĐỔI'}</span>
        </button>
      </div>
    </div>
  );
}
