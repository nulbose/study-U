'use client';

import { useState } from 'react';

interface Slide { type: string; title: string; subtitle: string; content: string[]; }
interface Slides { title: string; slides: Slide[]; }
interface Props { slides: Slides; onClose: () => void; inline?: boolean; }

const COLORS = ['#1a73e8', '#0d9488', '#7c3aed', '#dc2626', '#d97706', '#059669'];

export default function SlideView({ slides, onClose, inline }: Props) {
  const [current, setCurrent] = useState(0);
  const slide = slides.slides[current];
  const color = COLORS[current % COLORS.length];

  const content = (
    <div>
      {/* 슬라이드 본문 */}
      <div className="rounded-2xl p-8 mb-4" style={{ background: '#f8f9fa', border: '1px solid #e5e7eb', minHeight: 280 }}>
        {slide.type === 'title' ? (
          <div className="flex flex-col items-center justify-center text-center h-52">
            <div className="w-12 h-1.5 rounded-full mb-6" style={{ background: color }} />
            <h1 className="text-2xl font-bold mb-3" style={{ color: '#1f2937' }}>{slide.title}</h1>
            {slide.subtitle && <p className="text-base" style={{ color: '#6b7280' }}>{slide.subtitle}</p>}
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-1 h-6 rounded-full" style={{ background: color }} />
              <h2 className="text-lg font-bold" style={{ color: '#1f2937' }}>{slide.title}</h2>
            </div>
            {slide.subtitle && <p className="text-sm mb-4" style={{ color: '#6b7280' }}>{slide.subtitle}</p>}
            <ul className="space-y-2.5">
              {slide.content.map((item, i) => (
                <li key={i} className="flex items-start gap-3 p-3 rounded-xl" style={{ background: 'white' }}>
                  <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5"
                    style={{ background: color, color: 'white' }}>{i + 1}</span>
                  <span className="text-sm" style={{ color: '#374151' }}>{item}</span>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>

      {/* 네비게이션 */}
      <div className="flex items-center justify-between">
        <button onClick={() => setCurrent((c) => Math.max(0, c - 1))} disabled={current === 0}
          className="px-4 py-2 rounded-xl text-sm font-medium"
          style={{ background: current === 0 ? '#f1f3f4' : '#e8f0fe', color: current === 0 ? '#9ca3af' : '#1a73e8' }}>
          ← 이전
        </button>
        <div className="flex gap-1.5">
          {slides.slides.map((_, i) => (
            <button key={i} onClick={() => setCurrent(i)} className="rounded-full transition-all"
              style={{ width: i === current ? 20 : 8, height: 8, background: i === current ? color : '#e5e7eb' }} />
          ))}
        </div>
        <button onClick={() => setCurrent((c) => Math.min(slides.slides.length - 1, c + 1))}
          disabled={current === slides.slides.length - 1}
          className="px-4 py-2 rounded-xl text-sm font-medium"
          style={{ background: current === slides.slides.length - 1 ? '#f1f3f4' : '#1a73e8', color: current === slides.slides.length - 1 ? '#9ca3af' : 'white' }}>
          다음 →
        </button>
      </div>
    </div>
  );

  if (inline) return <div>{content}</div>;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.5)' }}>
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-3" style={{ borderBottom: '1px solid #e5e7eb' }}>
          <span className="text-sm font-semibold" style={{ color: '#1f2937' }}>슬라이드</span>
          <button onClick={onClose} style={{ color: '#9ca3af' }}>✕</button>
        </div>
        <div className="p-6">{content}</div>
      </div>
    </div>
  );
}