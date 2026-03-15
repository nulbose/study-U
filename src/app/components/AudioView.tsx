'use client';

import { useState, useEffect, useRef } from 'react';

interface AudioSection {
  title: string;
  script: string;
}

interface Audio {
  title: string;
  duration: string;
  sections: AudioSection[];
  fullScript: string;
}

interface Props {
  audio: Audio;
  onClose: () => void;
  inline?: boolean;
}

export default function AudioView({ audio, onClose, inline }: Props) {
  const [playing, setPlaying] = useState(false);
  const [currentSection, setCurrentSection] = useState(0);
  const [currentChar, setCurrentChar] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [speed, setSpeed] = useState(1);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const section = audio.sections[currentSection];

  // 브라우저 TTS 사용
  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ko-KR';
      utterance.rate = speed;
      utterance.onend = () => {
        if (currentSection + 1 < audio.sections.length) {
          setCurrentSection((c) => c + 1);
          setCurrentChar(0);
          setDisplayText('');
        } else {
          setPlaying(false);
        }
      };
      utteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    }
  };

  // 텍스트 타이핑 효과
  useEffect(() => {
    if (playing) {
      const text = section.script;
      setDisplayText('');
      setCurrentChar(0);

      intervalRef.current = setInterval(() => {
        setCurrentChar((c) => {
          if (c >= text.length) {
            if (intervalRef.current) clearInterval(intervalRef.current);
            return c;
          }
          setDisplayText(text.slice(0, c + 1));
          return c + 1;
        });
      }, 30 / speed);

      speak(section.script);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
      window.speechSynthesis?.cancel();
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [playing, currentSection, speed]);

  const handlePlay = () => {
    if (playing) {
      setPlaying(false);
    } else {
      setPlaying(true);
    }
  };

  const handleSectionClick = (idx: number) => {
    setPlaying(false);
    setCurrentSection(idx);
    setCurrentChar(0);
    setDisplayText(audio.sections[idx].script);
  };

  const content = (
    <div className="max-w-2xl mx-auto">
      {/* 플레이어 */}
      <div className="rounded-2xl p-6 mb-5" style={{ background: 'linear-gradient(135deg, #0d9488, #0f766e)' }}>
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.2)' }}>
            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2z" />
            </svg>
          </div>
          <div>
            <h2 className="text-white font-bold text-base">{audio.title}</h2>
            <p className="text-white opacity-70 text-sm">⏱ {audio.duration}</p>
          </div>
        </div>

        {/* 진행 바 */}
        <div className="h-1.5 rounded-full mb-4" style={{ background: 'rgba(255,255,255,0.2)' }}>
          <div
            className="h-full rounded-full transition-all"
            style={{
              background: 'white',
              width: `${((currentSection) / audio.sections.length) * 100}%`,
            }}
          />
        </div>

        {/* 컨트롤 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* 이전 */}
            <button
              onClick={() => handleSectionClick(Math.max(0, currentSection - 1))}
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(255,255,255,0.2)', color: 'white' }}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
              </svg>
            </button>

            {/* 재생/정지 */}
            <button
              onClick={handlePlay}
              className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{ background: 'white', color: '#0d9488' }}
            >
              {playing ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                </svg>
              ) : (
                <svg className="w-5 h-5 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </button>

            {/* 다음 */}
            <button
              onClick={() => handleSectionClick(Math.min(audio.sections.length - 1, currentSection + 1))}
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(255,255,255,0.2)', color: 'white' }}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 18l8.5-6L6 6v12zm2-8.14L11.03 12 8 14.14V9.86zM16 6h2v12h-2z" />
              </svg>
            </button>
          </div>

          {/* 재생 속도 */}
          <div className="flex items-center gap-2">
            <span className="text-white text-xs opacity-70">속도</span>
            {[0.75, 1, 1.25, 1.5].map((s) => (
              <button
                key={s}
                onClick={() => setSpeed(s)}
                className="px-2 py-0.5 rounded text-xs font-medium transition-all"
                style={{
                  background: speed === s ? 'white' : 'rgba(255,255,255,0.2)',
                  color: speed === s ? '#0d9488' : 'white',
                }}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 현재 재생 중인 스크립트 */}
      <div className="rounded-2xl p-5 mb-4" style={{ background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
        <div className="flex items-center gap-2 mb-3">
          {playing && (
            <div className="flex gap-1 items-end">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="w-1 rounded-full"
                  style={{
                    background: '#0d9488',
                    height: `${8 + i * 4}px`,
                    animation: `bounce ${0.6 + i * 0.1}s ease-in-out infinite alternate`,
                  }}
                />
              ))}
            </div>
          )}
          <p className="text-xs font-semibold" style={{ color: '#0d9488' }}>
            {section.title}
          </p>
          <span className="text-xs" style={{ color: '#9ca3af' }}>
            {currentSection + 1} / {audio.sections.length}
          </span>
        </div>
        <p className="text-sm leading-relaxed" style={{ color: '#374151', minHeight: 60 }}>
          {displayText || section.script}
          {playing && displayText.length < section.script.length && (
            <span className="animate-pulse">▋</span>
          )}
        </p>
      </div>

      {/* 섹션 목록 */}
      <div className="flex flex-col gap-1">
        {audio.sections.map((sec, i) => (
          <div
            key={i}
            onClick={() => handleSectionClick(i)}
            className="flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all"
            style={{
              background: i === currentSection ? '#e6f9f6' : 'white',
              border: i === currentSection ? '1px solid #0d9488' : '1px solid #e5e7eb',
            }}
          >
            <div
              className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-xs font-bold"
              style={{
                background: i === currentSection ? '#0d9488' : '#f1f3f4',
                color: i === currentSection ? 'white' : '#6b7280',
              }}
            >
              {i === currentSection && playing ? (
                <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                </svg>
              ) : (
                i + 1
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium truncate" style={{ color: i === currentSection ? '#0d9488' : '#1f2937' }}>
                {sec.title}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  if (inline) return <div>{content}</div>;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.5)' }}>
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-xl overflow-hidden" style={{ maxHeight: '88vh' }}>
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid #e5e7eb' }}>
          <span className="text-sm font-semibold" style={{ color: '#1f2937' }}>AI 오디오 오버뷰</span>
          <button onClick={onClose} style={{ color: '#9ca3af' }}>✕</button>
        </div>
        <div className="overflow-y-auto p-6" style={{ maxHeight: 'calc(88vh - 64px)' }}>{content}</div>
      </div>
    </div>
  );
}