'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Save, FileText, X, AlertCircle, CheckCircle } from 'lucide-react';

function CredentialEditContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [credential, setCredential] = useState(null);
  const [formData, setFormData] = useState({
    id: '',
    brand: '',
    title: '',
    subtitle: '',
    src: '',
    num: '',
    medal: false,
    pdf: null
  });
  const [pdfPreview, setPdfPreview] = useState(null);
  const [pdfDeleted, setPdfDeleted] = useState(false);

  useEffect(() => {
    if (!id) {
      setError('Missing credential ID');
      setLoading(false);
      return;
    }

    fetch('/api/admin/credentials')
      .then(res => res.json())
      .then(data => {
        if (data.items) {
          const found = data.items.find(item => item.id === id);
          if (found) {
            setCredential(found);
            setFormData({
              id: found.id,
              brand: found.brand,
              title: found.title,
              subtitle: found.subtitle || '',
              src: found.src || '',
              num: found.num || '',
              medal: found.medal || false,
              pdf: null
            });
            if (found.pdfPath) {
              setPdfPreview(found.pdfPath);
            }
          } else {
            setError('Credential not found');
          }
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch:', err);
        setError('Failed to load credential');
        setLoading(false);
      });
  }, [id]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePdfChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, pdf: file }));
      setPdfPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.brand || !formData.title || !formData.num) {
      setError('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('id', formData.id);
      formDataToSend.append('brand', formData.brand);
      formDataToSend.append('title', formData.title);
      formDataToSend.append('subtitle', formData.subtitle);
      formDataToSend.append('src', formData.src);
      formDataToSend.append('num', formData.num);
      formDataToSend.append('medal', String(formData.medal));
      formDataToSend.append('pdfPath', credential?.pdfPath || '');
      
      if (formData.pdf) {
        formDataToSend.append('pdf', formData.pdf);
        formDataToSend.append('keepExistingPdf', 'false');
        formDataToSend.append('deletePdf', 'true');
      } else if (pdfDeleted) {
        formDataToSend.append('keepExistingPdf', 'false');
        formDataToSend.append('deletePdf', 'true');
      } else {
        formDataToSend.append('keepExistingPdf', 'true');
        formDataToSend.append('deletePdf', 'false');
      }

      const res = await fetch('/api/admin/credentials', {
        method: 'PUT',
        body: formDataToSend,
      });

      const data = await res.json();
      
      if (data.success) {
        setSuccess('Cập nhật thành công!');
        setTimeout(() => {
          router.push('/admin/credentials');
        }, 1500);
      } else {
        setError(data.error || 'Có lỗi xảy ra');
      }
    } catch (err) {
      console.error('Failed to save:', err);
      setError('Có lỗi xảy ra khi lưu');
    }
    
    setSaving(false);
  };

  const removePdf = () => {
    setFormData(prev => ({ ...prev, pdf: null }));
    setPdfPreview(null);
    setPdfDeleted(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-xs uppercase tracking-widest text-gray-400">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (error && !credential) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">{error}</h1>
          <button
            onClick={() => router.push('/admin/credentials')}
            className="mt-4 px-6 py-3 bg-black text-white font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors"
          >
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/admin/credentials')}
              className="flex items-center gap-2 text-gray-600 hover:text-black transition-colors"
            >
              <ArrowLeft size={20} />
              <span className="text-sm font-medium">Quay lại</span>
            </button>
            <div className="h-6 w-px bg-gray-300" />
            <h1 className="text-lg font-black uppercase tracking-tight">
              Edit Credential
            </h1>
          </div>
          
          {credential?.num && (
            <span className="text-sm font-mono text-gray-400">{credential.num}</span>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Preview Image */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="aspect-video bg-gray-100">
              <img
                src={formData.src || 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=800'}
                alt="Preview"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Form Fields */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
            {/* Image URL */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">
                Image URL
              </label>
              <input
                type="text"
                value={formData.src}
                onChange={(e) => handleChange('src', e.target.value)}
                className="w-full border border-gray-300 px-4 py-3 text-sm focus:border-black focus:outline-none transition-colors"
                placeholder="https://..."
              />
            </div>

            {/* ID */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">
                ID (Slug)
              </label>
              <input
                type="text"
                value={formData.id}
                onChange={(e) => handleChange('id', e.target.value)}
                className="w-full border border-gray-300 px-4 py-3 text-sm focus:border-black focus:outline-none transition-colors bg-gray-50"
                placeholder="unique-id"
                disabled
              />
              <p className="text-xs text-gray-400 mt-1">ID không thể thay đổi</p>
            </div>

            {/* Num */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">
                Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.num}
                onChange={(e) => handleChange('num', e.target.value)}
                className="w-full border border-gray-300 px-4 py-3 text-sm focus:border-black focus:outline-none transition-colors"
                placeholder="(01)"
                required
              />
            </div>

            {/* Brand */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">
                Brand <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.brand}
                onChange={(e) => handleChange('brand', e.target.value)}
                className="w-full border border-gray-300 px-4 py-3 text-sm focus:border-black focus:outline-none transition-colors"
                placeholder="Brand name"
                required
              />
            </div>

            {/* Title */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                className="w-full border border-gray-300 px-4 py-3 text-sm focus:border-black focus:outline-none transition-colors"
                placeholder="Title"
                required
              />
            </div>

            {/* Subtitle */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">
                Subtitle
              </label>
              <textarea
                value={formData.subtitle}
                onChange={(e) => handleChange('subtitle', e.target.value)}
                className="w-full border border-gray-300 px-4 py-3 text-sm focus:border-black focus:outline-none transition-colors resize-none h-24"
                placeholder="Subtitle"
              />
            </div>

            {/* Medal Toggle */}
            <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={() => handleChange('medal', !formData.medal)}
                className={`w-14 h-7 rounded-full transition-colors relative ${
                  formData.medal ? 'bg-yellow-500' : 'bg-gray-300'
                }`}
              >
                <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform shadow ${
                  formData.medal ? 'translate-x-8' : 'translate-x-1'
                }`} />
              </button>
              <div>
                <span className="text-sm font-bold uppercase tracking-widest">
                  Medal Award
                </span>
                <p className="text-xs text-gray-500">Hiển thị badge huy chương</p>
              </div>
            </div>
          </div>

          {/* PDF Upload Section */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-sm font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
              <FileText size={18} className="text-gray-400" />
              PDF Document
            </h3>
            
            {pdfPreview ? (
              <div className="flex items-center gap-4 p-4 border border-green-200 bg-green-50 rounded-lg">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center shrink-0">
                  <FileText size={24} className="text-red-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-800 truncate">
                    {formData.pdf ? formData.pdf.name : credential?.pdfPath?.split('/').pop()}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formData.pdf ? 'File mới chưa lưu' : 'File hiện tại'}
                  </p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <a
                    href={pdfPreview}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-2 text-xs font-bold uppercase tracking-wider bg-gray-100 hover:bg-gray-200 transition-colors"
                  >
                    Xem
                  </a>
                  <button
                    type="button"
                    onClick={removePdf}
                    className="px-3 py-2 text-xs font-bold uppercase tracking-wider text-red-600 hover:bg-red-100 transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 hover:bg-gray-50 transition-colors">
                <div className="flex flex-col items-center justify-center">
                  <FileText size={32} className="w-8 h-8 mb-3 text-gray-400" />
                  <p className="text-sm text-gray-500 mb-1">Click để chọn file PDF</p>
                  <p className="text-xs text-gray-400">hoặc kéo thả file vào đây</p>
                </div>
                <input 
                  type="file" 
                  className="hidden" 
                  accept="application/pdf"
                  onChange={handlePdfChange}
                />
              </label>
            )}
          </div>

          {/* Messages */}
          {error && (
            <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              <AlertCircle size={20} className="shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          {success && (
            <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
              <CheckCircle size={20} className="shrink-0" />
              <p className="text-sm">{success}</p>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex gap-4 sticky bottom-6">
            <button
              type="button"
              onClick={() => router.push('/admin/credentials')}
              className="flex-1 py-4 border-2 border-gray-300 text-sm font-bold uppercase tracking-widest hover:bg-gray-100 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-[2] py-4 bg-black text-white text-sm font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Đang lưu...
                </>
              ) : (
                <>
                  <Save size={16} />
                  Lưu Thay Đổi
                </>
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-xs uppercase tracking-widest text-gray-400">Đang tải...</p>
      </div>
    </div>
  );
}

export default function CredentialEditPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <CredentialEditContent />
    </Suspense>
  );
}
