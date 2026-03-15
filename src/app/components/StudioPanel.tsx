'use client';

import { useState } from 'react';
import { Source, ActiveContent } from '../page';

interface Props {
  sources: Source[];
  selectedSourceIds: number[];
  setActiveContent: (content: ActiveContent) => void;
  activeContent: ActiveContent;
}

interface SavedItem {
  id: string;
  type: string;
  title: string;
  subtitle: string;
  createdAt: Date;
  data: unknown;
}

const CONTENT_TYPES = [
  { id: 'slides', label: '슬라이드 자료', cardBg: '#fef0da', iconBg: '#fdd89a', iconColor: '#d97706' },
  { id: 'mindmap', label: '마인드맵', cardBg: '#f0e6ff', iconBg: '#d8b4fe', iconColor: '#7c3aed' },
  { id: 'report', label: '보고서', cardBg: '#dcf2e8', iconBg: '#a3e8c4', iconColor: '#166534' },
  { id: 'flashcard', label: '플래시카드', cardBg: '#fde0ea', iconBg: '#f9a8c0', iconColor: '#be123c' },
  { id: 'quiz', label: '퀴즈', cardBg: '#dbeafe', iconBg: '#bfdbfe', iconColor: '#1d4ed8' },
  { id: 'infographic', label: '인포그래픽', cardBg: '#ede8ff', iconBg: '#c4b5fd', iconColor: '#6d28d9' },
  { id: 'table', label: '데이터 표', cardBg: '#f1f3f4', iconBg: '#dadce0', iconColor: '#3c4043' },
];

function timeAgo(date: Date): string {
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return '방금 전';
  if (mins < 60) return `${mins}분 전`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}시간 전`;
  return `${Math.floor(hrs / 24)}일 전`;
}

function TypeIcon({ id, color }: { id: string; color: string }) {
  const s = { width: 12, height: 12, fill: 'none', viewBox: '0 0 24 24', stroke: color, strokeWidth: '1.5' } as const;
  if (id === 'audio') return <svg {...s}><path strokeLinecap="round" strokeLinejoin="round" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2z" /></svg>;
  if (id === 'slides') return <svg {...s}><rect x="2" y="3" width="20" height="14" rx="2" stroke={color} fill="none" /><path strokeLinecap="round" d="M8 21h8M12 17v4" /></svg>;
  if (id === 'video') return <svg {...s}><path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.723v6.554a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" /></svg>;
  if (id === 'mindmap') return <svg {...s}><circle cx="12" cy="12" r="2.5" fill={color} stroke="none" /><circle cx="5" cy="5" r="1.5" fill={color} stroke="none" /><circle cx="19" cy="5" r="1.5" fill={color} stroke="none" /><circle cx="5" cy="19" r="1.5" fill={color} stroke="none" /><circle cx="19" cy="19" r="1.5" fill={color} stroke="none" /><path strokeLinecap="round" d="M10.5 10.5L6.5 6.5M13.5 10.5L17.5 6.5M10.5 13.5L6.5 17.5M13.5 13.5L17.5 17.5" /></svg>;
  if (id === 'report') return <svg {...s}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>;
  if (id === 'flashcard') return <svg {...s}><rect x="2" y="6" width="20" height="13" rx="2" stroke={color} fill="none" /><path strokeLinecap="round" strokeLinejoin="round" d="M16 2l-2 4M12 2v4M8 2l2 4" /></svg>;
  if (id === 'quiz') return <svg {...s}><circle cx="12" cy="12" r="10" stroke={color} fill="none" /><path strokeLinecap="round" strokeLinejoin="round" d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3M12 17h.01" /></svg>;
  if (id === 'infographic') return <svg {...s}><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>;
  return <svg {...s}><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M3 14h18M10 3v18M4 3h16a1 1 0 011 1v16a1 1 0 01-1 1H4a1 1 0 01-1-1V4a1 1 0 011-1z" /></svg>;
}

function getItemColor(type: string) {
  const map: Record<string, { bg: string; color: string }> = {
    quiz: { bg: '#dbeafe', color: '#1d4ed8' },
    mindmap: { bg: '#f0e6ff', color: '#7c3aed' },
    flashcard: { bg: '#fde0ea', color: '#be123c' },
    report: { bg: '#dcf2e8', color: '#166534' },
    slides: { bg: '#fef0da', color: '#d97706' },
    infographic: { bg: '#ede8ff', color: '#6d28d9' },
    table: { bg: '#f1f3f4', color: '#3c4043' },
  };
  return map[type] ?? { bg: '#f1f3f4', color: '#3c4043' };
}

export default function StudioPanel({
  sources,
  selectedSourceIds,
  setActiveContent,
  activeContent,
}: Props) {
  const [loadingType, setLoadingType] = useState<string | null>(null);
  const [savedItems, setSavedItems] = useState<SavedItem[]>([]);

  const hasDoc = sources.length > 0;

  const getPayload = () => {
    const activeSources = selectedSourceIds.length > 0
      ? sources.filter((s) => selectedSourceIds.includes(s.id))
      : sources;
    return {
      context: activeSources.map((s) => s.name).join(', '),
      pdfText: activeSources.map((s) => s.text || '').filter(Boolean).join('\n\n---\n\n'),
    };
  };

  const addSavedItem = (
    type: string,
    title: string,
    subtitle: string,
    data: unknown
  ) => {
    setSavedItems((prev) => [
      {
        id: Date.now().toString(),
        type,
        title,
        subtitle,
        createdAt: new Date(),
        data,
      },
      ...prev,
    ]);
  };

  const openSavedItem = (item: SavedItem) => {
    setActiveContent({
      type: item.type as ActiveContent['type'],
      data: item.data,
    });
  };

  const deleteSavedItem = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setSavedItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleCardClick = async (id: string) => {
    if (!hasDoc) {
      alert('소스를 먼저 선택해주세요.');
      return;
    }

    const payload = getPayload();
    const activeSources = selectedSourceIds.length > 0
      ? sources.filter((s) => selectedSourceIds.includes(s.id))
      : sources;
    const sourceName = activeSources.length === 1
      ? activeSources[0].name.replace(/\.pdf$/i, '')
      : activeSources.length > 1
      ? `${activeSources.length}개 소스`
      : '문서';

    setLoadingType(id);

    try {
      if (id === 'quiz') {
        const res = await fetch('/api/quiz', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();

        if (data.error) {
          alert(`퀴즈 생성 실패: ${data.error}`);
          return;
        }
        if (!data.quizzes || data.quizzes.length === 0) {
          alert('퀴즈를 생성할 수 없습니다. 소스 내용을 확인해주세요.');
          return;
        }

        addSavedItem(
          'quiz',
          `${sourceName} 퀴즈`,
          `퀴즈 · ${data.quizzes.length}문제`,
          data.quizzes
        );

      } else if (id === 'mindmap') {
        const res = await fetch('/api/mindmap', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();

        if (data.error) {
          alert(`마인드맵 생성 실패: ${data.error}`);
          return;
        }

        addSavedItem(
          'mindmap',
          `${sourceName} 마인드맵`,
          '마인드맵',
          data.mindmap
        );

      } else if (id === 'flashcard') {
        const res = await fetch('/api/flashcard', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();

        if (data.error) {
          alert(`플래시카드 생성 실패: ${data.error}`);
          return;
        }

        addSavedItem(
          'flashcard',
          `${sourceName} 플래시카드`,
          `플래시카드 · ${data.flashcards.length}장`,
          data.flashcards
        );

      } else if (id === 'report') {
        const res = await fetch('/api/report', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();

        if (data.error) {
          alert(`보고서 생성 실패: ${data.error}`);
          return;
        }

        addSavedItem(
          'report',
          `${sourceName} 보고서`,
          '보고서 · 요약',
          data.report
        );

      } else if (id === 'slides') {
        const res = await fetch('/api/slides', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();

        if (data.error) {
          alert(`슬라이드 생성 실패: ${data.error}`);
          return;
        }

        addSavedItem(
          'slides',
          `${sourceName} 슬라이드`,
          `슬라이드 · ${data.slides.slides.length}장`,
          data.slides
        );

      } else if (id === 'infographic') {
        const res = await fetch('/api/infographic', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();

        if (data.error) {
          alert(`인포그래픽 생성 실패: ${data.error}`);
          return;
        }

        addSavedItem(
          'infographic',
          `${sourceName} 인포그래픽`,
          '인포그래픽',
          data.infographic
        );

      } else if (id === 'table') {
        const res = await fetch('/api/datatable', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();

        if (data.error) {
          alert(`데이터 표 생성 실패: ${data.error}`);
          return;
        }

        addSavedItem(
          'table',
          `${sourceName} 데이터 표`,
          `표 · ${data.table.rows.length}행`,
          data.table
        );
      } else {
        alert('곧 지원 예정인 기능입니다 ✨');
      }

    } catch (err) {
      console.error(err);
      alert('생성 실패! 다시 시도해주세요.');
    } finally {
      setLoadingType(null);
    }
  };

  return (
    <aside
      className="flex flex-col w-full h-full overflow-hidden"
      style={{ background: '#f8f9fa', borderLeft: '1px solid #e0e0e0' }}
    >
      {/* 헤더 */}
      <div className="flex items-center justify-between px-3 py-2.5 sm:py-3 shrink-0">
        <span style={{ fontSize: 'clamp(12px, 1.2vw, 15px)', fontWeight: 600, color: '#1f2937' }}>
          스튜디오
        </span>
        <button className="p-1.5 rounded-lg active:scale-95 transition-transform" style={{ color: '#5f6368' }}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
            <rect x="3" y="3" width="5" height="18" rx="1" />
            <rect x="10" y="3" width="11" height="18" rx="1" />
          </svg>
        </button>
      </div>

      {/* 스크롤 영역 */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">

        {/* 선택된 소스 표시 */}
        {selectedSourceIds.length > 0 && (
          <div
            className="mx-2 mb-2 px-2 py-1.5 rounded-xl"
            style={{ background: '#e8f0fe', color: '#1a73e8', fontSize: 'clamp(9px, 0.9vw, 11px)' }}
          >
            📄 <span className="truncate">
              {selectedSourceIds.length === 1
                ? sources.find((s) => s.id === selectedSourceIds[0])?.name.replace(/\.pdf$/i, '')
                : `${selectedSourceIds.length}개 소스`}
            </span> 기반으로 생성
          </div>
        )}

        {/* 콘텐츠 그리드 */}
        <div className="px-2 pb-3 grid grid-cols-2 gap-1.5 sm:gap-1.5">
          {CONTENT_TYPES.map((ct) => (
            <button
              key={ct.id}
              onClick={() => handleCardClick(ct.id)}
              disabled={loadingType !== null}
              className="relative rounded-xl text-left transition-all hover:brightness-95 active:scale-[0.97]"
              style={{
                background: ct.cardBg,
                outline: activeContent?.type === ct.id ? `2px solid ${ct.iconColor}` : 'none',
                padding: 'clamp(8px, 1vw, 10px)',
              }}
            >
              <span
                className="absolute top-1.5 right-1.5 opacity-60"
                style={{ color: ct.iconColor }}
              >
                <svg
                  style={{ width: 'clamp(10px, 1vw, 14px)', height: 'clamp(10px, 1vw, 14px)' }}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </span>
              <div
                className="rounded-lg flex items-center justify-center mb-1.5 sm:mb-1"
                style={{
                  background: ct.iconBg,
                  width: 'clamp(22px, 2vw, 24px)',
                  height: 'clamp(22px, 2vw, 24px)',
                }}
              >
                {loadingType === ct.id ? (
                  <svg
                    style={{ width: 'clamp(8px, 0.9vw, 12px)', height: 'clamp(8px, 0.9vw, 12px)' }}
                    className="animate-spin" viewBox="0 0 24 24" fill="none"
                  >
                    <circle cx="12" cy="12" r="10" stroke={ct.iconColor} strokeWidth="3" strokeDasharray="40" strokeDashoffset="10" />
                  </svg>
                ) : (
                  <TypeIcon id={ct.id} color={ct.iconColor} />
                )}
              </div>
              <span
                style={{
                  fontSize: 'clamp(9px, 1vw, 11px)',
                  fontWeight: 500,
                  color: '#3c4043',
                  lineHeight: 1.3,
                  display: 'block',
                }}
              >
                {ct.label}
              </span>
            </button>
          ))}
        </div>

        {/* 생성된 콘텐츠 목록 */}
        {savedItems.length > 0 && (
          <div className="px-2 pb-3">
            <div className="h-px mb-2" style={{ background: '#e5e7eb' }} />
            <p className="mb-2 px-1" style={{ color: '#9ca3af', fontSize: 'clamp(9px, 1vw, 11px)' }}>
              생성된 콘텐츠
            </p>
            <div className="flex flex-col gap-1.5 sm:gap-1">
              {savedItems.map((item) => {
                const { bg, color } = getItemColor(item.type);
                const isActive =
                  activeContent?.type === item.type &&
                  JSON.stringify(activeContent?.data) === JSON.stringify(item.data);
                return (
                  <div
                    key={item.id}
                    onClick={() => openSavedItem(item)}
                    className="group flex items-center gap-2 rounded-xl transition-colors cursor-pointer active:scale-[0.98]"
                    style={{
                      background: isActive ? '#e8f0fe' : 'white',
                      border: isActive ? '1px solid #1a73e8' : '1px solid #e9ecef',
                      padding: 'clamp(8px, 1vw, 10px)',
                    }}
                  >
                    {/* 아이콘 */}
                    <div
                      className="rounded-xl flex items-center justify-center shrink-0"
                      style={{
                        background: bg,
                        width: 'clamp(28px, 2.5vw, 32px)',
                        height: 'clamp(28px, 2.5vw, 32px)',
                      }}
                    >
                      <TypeIcon id={item.type} color={color} />
                    </div>

                    {/* 텍스트 */}
                    <div className="flex-1 min-w-0">
                      <p
                        className="font-semibold truncate"
                        style={{
                          color: isActive ? '#1a73e8' : '#202124',
                          fontSize: 'clamp(10px, 1vw, 11px)',
                        }}
                      >
                        {item.title}
                      </p>
                      <p
                        className="truncate"
                        style={{
                          fontSize: 'clamp(9px, 0.9vw, 10px)',
                          color: '#80868b',
                          marginTop: 1,
                        }}
                      >
                        {item.subtitle} · {timeAgo(item.createdAt)}
                      </p>
                    </div>

                    {/* 재생 버튼 */}
                    <button
                      className="rounded-full flex items-center justify-center shrink-0 active:scale-95"
                      style={{
                        background: isActive ? '#1a73e8' : '#e5e7eb',
                        width: 'clamp(22px, 2vw, 24px)',
                        height: 'clamp(22px, 2vw, 24px)',
                      }}
                    >
                      <svg
                        style={{
                          width: 'clamp(8px, 0.9vw, 12px)',
                          height: 'clamp(8px, 0.9vw, 12px)',
                          marginLeft: 1,
                        }}
                        fill={isActive ? 'white' : '#6b7280'}
                        viewBox="0 0 24 24"
                      >
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </button>

                    {/* 삭제 버튼 */}
                    <button
                      type="button"
                      onClick={(e) => deleteSavedItem(e, item.id)}
                      className="rounded-full flex items-center justify-center shrink-0 active:scale-95 opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{
                        background: '#fee2e2',
                        width: 'clamp(22px, 2vw, 24px)',
                        height: 'clamp(22px, 2vw, 24px)',
                      }}
                      title="삭제"
                    >
                      <svg
                        style={{ width: 'clamp(8px, 0.9vw, 10px)', height: 'clamp(8px, 0.9vw, 10px)' }}
                        fill="none" viewBox="0 0 24 24" stroke="#dc2626" strokeWidth="2.5"
                      >
                        <path strokeLinecap="round" d="M18 6L6 18M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 메모 추가 버튼 */}
      <div
        className="px-3 py-2.5 sm:py-2 shrink-0 flex justify-center"
        style={{ borderTop: '1px solid #e5e7eb' }}
      >
        <button
          className="flex items-center gap-1.5 rounded-full font-medium transition-colors active:scale-95"
          style={{
            background: '#1f2937',
            color: 'white',
            fontSize: 'clamp(10px, 1vw, 13px)',
            padding: 'clamp(8px, 0.8vw, 10px) clamp(14px, 1.5vw, 20px)',
          }}
        >
          <svg
            style={{ width: 'clamp(12px, 1.2vw, 16px)', height: 'clamp(12px, 1.2vw, 16px)' }}
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          메모 추가
        </button>
      </div>
    </aside>
  );
}