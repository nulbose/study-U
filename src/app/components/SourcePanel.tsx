'use client';

import { useRef, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Source } from '../page';

interface Props {
  sources: Source[];
  setSources: React.Dispatch<React.SetStateAction<Source[]>>;
  selectedSourceId: number | null;
  setSelectedSourceId: React.Dispatch<React.SetStateAction<number | null>>;
}

function PdfIcon() {
  return (
    <div className="flex items-center justify-center w-7 h-7 rounded-lg shrink-0" style={{ background: '#e8f0fe' }}>
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" fill="#d2e3fc" stroke="#1a73e8" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M14 2v6h6" stroke="#1a73e8" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M8 13h8M8 17h5" stroke="#1a73e8" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    </div>
  );
}

function YoutubeIcon() {
  return (
    <div className="flex items-center justify-center w-7 h-7 rounded-lg shrink-0" style={{ background: '#fee2e2' }}>
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
        <rect width="20" height="14" x="2" y="5" rx="3" fill="#ef4444" />
        <path d="M10 9l5 3-5 3V9z" fill="white" />
      </svg>
    </div>
  );
}

function WebIcon() {
  return (
    <div className="flex items-center justify-center w-7 h-7 rounded-lg shrink-0" style={{ background: '#d1fae5' }}>
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9" stroke="#10b981" strokeWidth="1.5" />
        <path d="M12 3c0 0-4 3-4 9s4 9 4 9" stroke="#10b981" strokeWidth="1.2" />
        <path d="M12 3c0 0 4 3 4 9s-4 9-4 9" stroke="#10b981" strokeWidth="1.2" />
        <path d="M3 12h18" stroke="#10b981" strokeWidth="1.2" />
      </svg>
    </div>
  );
}

export default function SourcePanel({
  sources,
  setSources,
  selectedSourceId,
  setSelectedSourceId,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [uploading, setUploading] = useState(false);
  const [urlLoading, setUrlLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState('');

  const handleFileUpload = async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      alert('PDF 파일만 업로드 가능합니다.');
      return;
    }
    setShowUrlInput(false);
    setUploading(true);

    const safeFileName = file.name
      .replace(/[^a-zA-Z0-9._-]/g, '_')
      .replace(/_{2,}/g, '_');
    const storagePath = `pdfs/${Date.now()}_${safeFileName}`;

    const { error } = await supabase.storage
      .from('sources')
      .upload(storagePath, file);

    if (error) {
      alert(`업로드 실패: ${error.message}`);
      setUploading(false);
      return;
    }

    let text = '';
    try {
      const res = await fetch('/api/parse-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileName: storagePath }),
      });
      const data = await res.json();
      if (data.text) text = data.text;
    } catch (err) {
      console.error('PDF 파싱 실패:', err);
    }

    const newSource: Source = {
      id: Date.now(),
      name: file.name,
      type: 'pdf',
      chunks: Math.floor(text.length / 500) || 1,
      storagePath,
      text,
    };
    setSources((prev) => [...prev, newSource]);
    setSelectedSourceId(newSource.id);
    setUploading(false);
  };

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) await handleFileUpload(file);
    e.target.value = '';
  };

  const handleUrlAdd = async () => {
    if (!urlInput.trim()) return;
    setUrlLoading(true);
    const isYoutube = urlInput.includes('youtube.com') || urlInput.includes('youtu.be');

    let text = '';
    try {
      const res = await fetch('/api/parse-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: urlInput }),
      });
      const data = await res.json();
      if (data.text) text = data.text;
    } catch (err) {
      console.error('URL 파싱 실패:', err);
    }

    const displayName = isYoutube
      ? 'YouTube: ' + urlInput.replace(/^https?:\/\/(www\.)?youtube\.com\/watch\?v=/, '').slice(0, 20)
      : urlInput.replace(/^https?:\/\//, '').slice(0, 35);

    const newSource: Source = {
      id: Date.now(),
      name: displayName,
      type: isYoutube ? 'youtube' : 'webpage',
      chunks: Math.floor(text.length / 500) || 1,
      text,
    };
    setSources((prev) => [...prev, newSource]);
    setSelectedSourceId(newSource.id);
    setUrlInput('');
    setShowUrlInput(false);
    setUrlLoading(false);
  };

  const handleSelect = (source: Source) => {
    setSelectedSourceId(source.id);
  };

  const handleDelete = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    setSources((prev) => prev.filter((s) => s.id !== id));
    if (selectedSourceId === id) setSelectedSourceId(null);
  };

  const startEdit = (e: React.MouseEvent, source: Source) => {
    e.stopPropagation();
    setEditingId(source.id);
    setEditingName(source.name);
  };

  const saveEdit = (id: number) => {
    if (editingName.trim()) {
      setSources((prev) =>
        prev.map((s) => (s.id === id ? { ...s, name: editingName.trim() } : s))
      );
    }
    setEditingId(null);
    setEditingName('');
  };

  const getIcon = (source: Source) => {
    if (source.type === 'youtube') return <YoutubeIcon />;
    if (source.type === 'webpage') return <WebIcon />;
    return <PdfIcon />;
  };

  const getTypeBadge = (type: string) => {
    if (type === 'youtube') return { label: 'YouTube', bg: '#fee2e2', color: '#dc2626' };
    if (type === 'webpage') return { label: '웹', bg: '#d1fae5', color: '#059669' };
    return { label: 'PDF', bg: '#dbeafe', color: '#1d4ed8' };
  };

  return (
    <aside
      className="flex flex-col w-full h-full"
      style={{ borderRight: '1px solid #e0e0e0', background: '#f8f9fa' }}
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files[0];
        if (file) handleFileUpload(file);
      }}
    >
      {/* 헤더 */}
      <div className="px-3 sm:px-4 pt-3 pb-3" style={{ borderBottom: '1px solid #e0e0e0' }}>
        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
          <span className="text-xs sm:text-sm font-semibold" style={{ color: '#1f2937' }}>소스</span>
          {sources.length > 0 && (
            <span className="text-xs font-medium px-1.5 py-0.5 rounded-full" style={{ background: '#dbeafe', color: '#1d4ed8' }}>
              {sources.length}
            </span>
          )}

          {/* URL 버튼 */}
          <button
            onClick={() => setShowUrlInput((v) => !v)}
            className="flex items-center gap-1 px-2 py-1.5 sm:py-1 rounded-lg text-xs font-medium transition-all active:scale-95"
            style={{
              background: showUrlInput ? '#e8f0fe' : 'white',
              color: showUrlInput ? '#1a73e8' : '#6b7280',
              border: showUrlInput ? '1px solid #1a73e8' : '1px solid #e0e0e0',
            }}
          >
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none">
              <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            URL
          </button>

          {/* PDF 버튼 */}
          <button
            onClick={() => { setShowUrlInput(false); setUrlInput(''); fileInputRef.current?.click(); }}
            disabled={uploading}
            className="flex items-center gap-1 px-2 py-1.5 sm:py-1 rounded-lg text-xs font-medium transition-all active:scale-95"
            style={{
              background: 'white',
              color: uploading ? '#9ca3af' : '#6b7280',
              border: '1px solid #e0e0e0',
              cursor: uploading ? 'not-allowed' : 'pointer',
            }}
          >
            {uploading ? (
              <svg className="w-3 h-3 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="40" strokeDashoffset="10" />
              </svg>
            ) : (
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                <path d="M14 2v6h6" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
              </svg>
            )}
            PDF
          </button>
        </div>

        {/* URL 입력창 */}
        {showUrlInput && (
          <div className="mt-3 flex flex-col gap-2">
            <input
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleUrlAdd()}
              placeholder="YouTube 또는 웹페이지 URL"
              autoFocus
              className="w-full px-3 py-2 text-xs rounded-xl outline-none"
              style={{ border: '1.5px solid #1a73e8', background: 'white', color: '#374151' }}
            />
            <div className="flex gap-2">
              <button
                onClick={handleUrlAdd}
                disabled={urlLoading || !urlInput.trim()}
                className="flex-1 py-1.5 rounded-full text-xs font-medium text-white flex items-center justify-center gap-1"
                style={{
                  background: '#1a73e8',
                  opacity: urlLoading || !urlInput.trim() ? 0.6 : 1,
                  cursor: urlLoading || !urlInput.trim() ? 'not-allowed' : 'pointer',
                }}
              >
                {urlLoading ? (
                  <>
                    <svg className="w-3 h-3 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="40" strokeDashoffset="10" />
                    </svg>
                    분석 중...
                  </>
                ) : '추가'}
              </button>
              <button
                onClick={() => { setShowUrlInput(false); setUrlInput(''); }}
                className="flex-1 py-1.5 rounded-full text-xs font-medium"
                style={{ background: '#f1f3f4', color: '#5f6368' }}
              >
                취소
              </button>
            </div>
          </div>
        )}

        {uploading && (
          <p className="text-xs mt-2 text-center" style={{ color: '#1a73e8' }}>
            ⏳ 업로드 및 분석 중...
          </p>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf"
        aria-label="PDF 파일 업로드"
        className="hidden"
        onChange={handleInputChange}
      />

      {/* 소스 목록 */}
      <div className="flex-1 overflow-y-auto p-2 sm:p-3 flex flex-col gap-2 custom-scrollbar">
        {sources.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center h-full text-center"
            style={{
              border: dragOver ? '2px dashed #1a73e8' : '2px dashed #e0e0e0',
              borderRadius: 16,
              background: dragOver ? '#e8f0fe' : 'transparent',
              padding: 'clamp(16px, 4vw, 32px) clamp(12px, 3vw, 16px)',
            }}
          >
            <div className="w-12 sm:w-14 h-12 sm:h-14 rounded-2xl flex items-center justify-center mb-3" style={{ background: '#f1f3f4' }}>
              <svg className="w-6 sm:w-7 h-6 sm:h-7" viewBox="0 0 24 24" fill="none">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" stroke="#9ca3af" strokeWidth="1.5" strokeLinejoin="round" />
                <path d="M14 2v6h6" stroke="#9ca3af" strokeWidth="1.5" strokeLinejoin="round" />
                <path d="M12 11v6M9 14l3-3 3 3" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <p className="text-xs sm:text-sm font-medium mb-1" style={{ color: '#374151' }}>소스를 추가해보세요</p>
            <p className="text-xs mb-3" style={{ color: '#9ca3af' }}>PDF 드래그 또는 URL 입력</p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 rounded-full text-xs font-medium text-white active:scale-95 transition-transform"
              style={{ background: '#1a73e8' }}
            >
              파일 선택
            </button>
          </div>
        ) : (
          <>
            {sources.length > 1 && (
              <div className="flex items-center justify-between px-1 pb-1">
                <span className="text-xs" style={{ color: '#9ca3af' }}>총 {sources.length}개 소스</span>
                <button
                  onClick={() => { setSources([]); setSelectedSourceId(null); }}
                  className="text-xs"
                  style={{ color: '#ef4444' }}
                >
                  전체 삭제
                </button>
              </div>
            )}

            {sources.map((source) => {
              const isSelected = selectedSourceId === source.id;
              const isEditing = editingId === source.id;
              const badge = getTypeBadge(source.type);

              return (
                <div
                  key={source.id}
                  onClick={() => handleSelect(source)}
                  className="group cursor-pointer rounded-xl p-2 transition-all active:scale-[0.98]"
                  style={{
                    background: 'white',
                    border: isSelected ? '1.5px solid #1a73e8' : '1px solid #e9ecef',
                    boxShadow: isSelected
                      ? '0 2px 8px rgba(26,115,232,0.15)'
                      : '0 1px 3px rgba(0,0,0,0.04)',
                  }}
                >
                  <div className="flex items-center gap-2">
                    <div className="shrink-0">
                      {getIcon(source)}
                    </div>
                    <div className="flex-1 min-w-0">
                      {isEditing ? (
                        <input
                          autoFocus
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') saveEdit(source.id);
                            if (e.key === 'Escape') setEditingId(null);
                          }}
                          onBlur={() => saveEdit(source.id)}
                          onClick={(e) => e.stopPropagation()}
                          className="w-full text-xs font-medium rounded-lg px-2 py-0.5 outline-none"
                          style={{ border: '1.5px solid #1a73e8', color: '#1f2937', background: '#f8fbff' }}
                        />
                      ) : (
                        <p className="text-xs font-medium truncate" style={{ color: '#1f2937' }}>
                          {source.name}
                        </p>
                      )}
                      <div className="flex items-center gap-1 mt-0.5 flex-wrap">
                        <span
                          className="px-1 py-px rounded font-medium shrink-0"
                          style={{ background: badge.bg, color: badge.color, fontSize: 10 }}
                        >
                          {badge.label}
                        </span>
                        <span className="shrink-0" style={{ color: '#9ca3af', fontSize: 10 }}>
                          {source.chunks}개 청크
                        </span>
                        {isSelected && (
                          <span className="font-medium shrink-0" style={{ color: '#1a73e8', fontSize: 10 }}>
                            · 활성
                          </span>
                        )}
                      </div>
                    </div>

                    {/* 액션 버튼 */}
                    <div className="flex items-center gap-0.5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity shrink-0">
                      <button
                        onClick={(e) => startEdit(e, source)}
                        className="w-6 h-6 rounded-md flex items-center justify-center active:scale-95"
                        style={{ background: '#f1f3f4', color: '#6b7280' }}
                        title="이름 편집"
                      >
                        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none">
                          <path
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
                          />
                        </svg>
                      </button>
                      <button
                        onClick={(e) => handleDelete(e, source.id)}
                        className="w-6 h-6 rounded-md flex items-center justify-center active:scale-95"
                        style={{ background: '#fee2e2', color: '#dc2626' }}
                        title="삭제"
                      >
                        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none">
                          <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* 활성 소스 표시 */}
                  {isSelected && (
                    <div
                      className="mt-1.5 pt-1.5 flex items-center gap-1"
                      style={{ borderTop: '1px solid #e8f0fe' }}
                    >
                      <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: '#1a73e8' }} />
                      <span style={{ color: '#1a73e8', fontSize: 10 }}>
                        이 소스를 기반으로 AI가 답변합니다
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </>
        )}
      </div>
    </aside>
  );
}