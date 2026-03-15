'use client';

import { useState } from 'react';

interface Scene {
  index: number;
  title: string;
  duration: string;
  visual: string;
  narration: string;
  keyPoints: string[];
}

interface Video {
  title: string;
  duration: string;
  description: string;
  scenes: Scene[];
  summary: string;
}

interface Props {
  video: Video;
  onClose: () => void;
  inline?: boolean;
}

const SCENE_COLORS = ['#1a73e8', '#0d9488', '#7c3aed', '#dc2626', '#d97706', '#059669', '#be123c'];

export default function VideoView({ video, onClose, inline }: Props) {
  const [currentScene, setCurrentScene] = useState(0);
  const [playing, setPlaying] = useState(false);

  const scene = video.scenes[currentScene];
  const color = SCENE_COLORS[currentScene % SCENE_COLORS.length];

  const goNext = () => {
    if (currentScene + 1 < video.scenes.length) {
      setCurrentScene((c) => c + 1);
    } else {
      setPlaying(false);
    }
  };

  const goPrev = () => {
    if (currentScene > 0) setCurrentScene((c) => c - 1);
  };

  const content = (
    <div className="max-w-2xl mx-auto">
      {/* 영상 플레이어 (시뮬레이션) */}
      <div className="rounded-2xl overflow-hidden mb-5" style={{ border: '1px solid #e5e7eb' }}>
        {/* 화면 영역 */}
        <div
          className="relative flex flex-col items-center justify-center p-8 text-center"
          style={{ background: `linear-gradient(135deg, ${color}22, ${color}11)`, minHeight: 220 }}
        >
          {/* 장면 번호 */}
          <div
            className="absolute top-3 left-3 px-2 py-1 rounded-lg text-xs font-medium"
            style={{ background: color, color: 'white' }}
          >
            장면 {scene.index}
          </div>

          {/* 진행 바 */}
          <div className="absolute top-0 left-0 right-0 h-1" style={{ background: '#e5e7eb' }}>
            <div
              className="h-full transition-all"
              style={{ background: color, width: `${((currentScene + 1) / video.scenes.length) * 100}%` }}
            />
          </div>

          {/* 시각 자료 아이콘 */}
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
            style={{ background: `${color}22` }}
          >
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke={color} strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.723v6.554a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
            </svg>
          </div>

          <h3 className="text-lg font-bold mb-2" style={{ color: '#1f2937' }}>{scene.title}</h3>

          {/* 시각 자료 설명 */}
          <div
            className="px-4 py-2 rounded-xl text-xs max-w-sm"
            style={{ background: `${color}15`, color: color, border: `1px solid ${color}30` }}
          >
            🎬 {scene.visual}
          </div>

          {/* 재생 시간 */}
          <div className="absolute bottom-3 right-3 text-xs" style={{ color: '#9ca3af' }}>
            ⏱ {scene.duration}
          </div>
        </div>

        {/* 컨트롤 바 */}
        <div
          className="flex items-center justify-between px-4 py-3"
          style={{ background: '#1f2937' }}
        >
          <div className="flex items-center gap-3">
            <button
              onClick={goPrev}
              disabled={currentScene === 0}
              className="w-8 h-8 rounded-full flex items-center justify-center transition-all"
              style={{ background: 'rgba(255,255,255,0.1)', color: currentScene === 0 ? '#6b7280' : 'white' }}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
              </svg>
            </button>

            <button
              onClick={() => setPlaying((v) => !v)}
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ background: color }}
            >
              {playing ? (
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                </svg>
              ) : (
                <svg className="w-4 h-4 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </button>

            <button
              onClick={goNext}
              disabled={currentScene === video.scenes.length - 1}
              className="w-8 h-8 rounded-full flex items-center justify-center transition-all"
              style={{ background: 'rgba(255,255,255,0.1)', color: currentScene === video.scenes.length - 1 ? '#6b7280' : 'white' }}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 18l8.5-6L6 6v12zM16 6h2v12h-2z" />
              </svg>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs" style={{ color: '#9ca3af' }}>
              {currentScene + 1} / {video.scenes.length}
            </span>
            <span className="text-xs" style={{ color: '#6b7280' }}>•</span>
            <span className="text-xs" style={{ color: '#9ca3af' }}>{video.duration}</span>
          </div>
        </div>
      </div>

      {/* 나레이션 */}
      <div className="rounded-2xl p-5 mb-4" style={{ background: '#f8f9fa', border: '1px solid #e5e7eb' }}>
        <p className="text-xs font-semibold mb-2" style={{ color: '#6b7280' }}>🎙 나레이션</p>
        <p className="text-sm leading-relaxed" style={{ color: '#374151' }}>{scene.narration}</p>
      </div>

      {/* 핵심 포인트 */}
      {scene.keyPoints.length > 0 && (
        <div className="rounded-2xl p-4 mb-5" style={{ background: `${color}0d`, border: `1px solid ${color}30` }}>
          <p className="text-xs font-semibold mb-2" style={{ color }}>💡 핵심 포인트</p>
          <ul className="space-y-1.5">
            {scene.keyPoints.map((point, i) => (
              <li key={i} className="flex items-start gap-2 text-sm" style={{ color: '#374151' }}>
                <span className="shrink-0 font-bold" style={{ color }}>•</span>
                {point}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 장면 목록 */}
      <div>
        <p className="text-xs font-semibold mb-3 px-1" style={{ color: '#9ca3af' }}>장면 목록</p>
        <div className="flex flex-col gap-2">
          {video.scenes.map((s, i) => {
            const c = SCENE_COLORS[i % SCENE_COLORS.length];
            const isActive = i === currentScene;
            return (
              <div
                key={i}
                onClick={() => setCurrentScene(i)}
                className="flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all"
                style={{
                  background: isActive ? `${c}10` : 'white',
                  border: isActive ? `1px solid ${c}40` : '1px solid #e5e7eb',
                }}
              >
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold"
                  style={{ background: isActive ? c : '#f1f3f4', color: isActive ? 'white' : '#6b7280' }}
                >
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: isActive ? c : '#1f2937' }}>
                    {s.title}
                  </p>
                  <p className="text-xs" style={{ color: '#9ca3af' }}>{s.duration}</p>
                </div>
                {isActive && (
                  <div className="w-2 h-2 rounded-full" style={{ background: c }} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 전체 요약 */}
      <div className="mt-5 rounded-2xl p-4" style={{ background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
        <p className="text-xs font-semibold mb-1" style={{ color: '#15803d' }}>✅ 동영상 요약</p>
        <p className="text-sm leading-relaxed" style={{ color: '#374151' }}>{video.summary}</p>
      </div>
    </div>
  );

  if (inline) return <div>{content}</div>;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.5)' }}>
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-xl overflow-hidden" style={{ maxHeight: '88vh' }}>
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid #e5e7eb' }}>
          <span className="text-sm font-semibold" style={{ color: '#1f2937' }}>동영상 개요</span>
          <button onClick={onClose} style={{ color: '#9ca3af' }}>✕</button>
        </div>
        <div className="overflow-y-auto p-6" style={{ maxHeight: 'calc(88vh - 64px)' }}>{content}</div>
      </div>
    </div>
  );
}