'use client';

import { useState, useEffect } from 'react';
import SourcePanel from './components/SourcePanel';
import ChatPanel from './components/ChatPanel';
import StudioPanel from './components/StudioPanel';
import MindmapView from './components/MindmapView';
import ReportView from './components/ReportView';
import SlideView from './components/SlideView';
import InfographicView from './components/InfographicView';
import DataTableView from './components/DataTableView';
import AudioView from './components/AudioView';
import VideoView from './components/VideoView';

export interface Source {
  id: number;
  name: string;
  type: string;
  chunks: number;
  storagePath?: string;
  text?: string;
}

export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export type ActiveContent =
  | { type: 'quiz'; data: unknown }
  | { type: 'mindmap'; data: unknown }
  | { type: 'flashcard'; data: unknown }
  | { type: 'report'; data: unknown }
  | { type: 'slides'; data: unknown }
  | { type: 'infographic'; data: unknown }
  | { type: 'table'; data: unknown }
  | { type: 'audio'; data: unknown }
  | { type: 'video'; data: unknown }
  | null;

export default function Home() {
  const [sources, setSources] = useState<Source[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [notebookTitle] = useState<string>('새 노트북');
  const [selectedSourceId, setSelectedSourceId] = useState<number | null>(null);
  const [activeContent, setActiveContent] = useState<ActiveContent>(null);
  
  // 모바일 사이드바 토글 상태
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(false);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const selectedSource = sources.find((s) => s.id === selectedSourceId);
  const pdfText = selectedSource?.text ?? '';

  // 화면 크기 감지
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // 사이드바 열릴 때 스크롤 방지
  useEffect(() => {
    if (leftSidebarOpen || rightSidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [leftSidebarOpen, rightSidebarOpen]);

  const closeSidebars = () => {
    setLeftSidebarOpen(false);
    setRightSidebarOpen(false);
  };

  return (
    <div className="flex h-screen font-sans overflow-hidden relative" style={{ background: '#f8f9fa' }}>

      {/* 모바일 오버레이 */}
      {isMobile && (leftSidebarOpen || rightSidebarOpen) && (
        <div
          className="fixed inset-0 bg-black/50 z-40 transition-opacity"
          onClick={closeSidebars}
        />
      )}

      {/* 모바일 토글 버튼 - 소스 */}
      {isMobile && (
        <button
          onClick={() => { setLeftSidebarOpen(true); setRightSidebarOpen(false); }}
          className="fixed left-3 top-3 z-50 flex items-center justify-center rounded-full shadow-lg"
          style={{ width: 40, height: 40, background: '#1a73e8', color: 'white' }}
          aria-label="소스 패널 열기"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </button>
      )}

      {/* 모바일 토글 버튼 - 스튜디오 */}
      {isMobile && (
        <button
          onClick={() => { setRightSidebarOpen(true); setLeftSidebarOpen(false); }}
          className="fixed right-3 top-3 z-50 flex items-center justify-center rounded-full shadow-lg"
          style={{ width: 40, height: 40, background: '#1f2937', color: 'white' }}
          aria-label="스튜디오 패널 열기"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </button>
      )}

      {/* 왼쪽: 소스 패널 */}
      <div 
        className={`shrink-0 ${
          isMobile 
            ? `fixed left-0 top-0 h-full z-50 transition-transform duration-300 ${leftSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`
            : ''
        }`} 
        style={{ 
          width: isMobile ? 'min(280px, 85vw)' : 'clamp(200px, 20vw, 288px)',
          maxWidth: isMobile ? '85vw' : undefined
        }}
      >
        <SourcePanel
          sources={sources}
          setSources={setSources}
          selectedSourceId={selectedSourceId}
          setSelectedSourceId={(id) => {
            setSelectedSourceId(id);
            if (isMobile) setLeftSidebarOpen(false);
          }}
        />
        {/* 모바일 닫기 버튼 */}
        {isMobile && leftSidebarOpen && (
          <button
            onClick={() => setLeftSidebarOpen(false)}
            className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: '#f1f3f4', color: '#5f6368' }}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {activeContent ? (
        <>
          <div className="flex-1 min-w-0 overflow-auto bg-white" style={{ borderRight: '1px solid #e0e0e0' }}>
            <ContentPanel
              activeContent={activeContent}
              onClose={() => setActiveContent(null)}
            />
          </div>
          <div 
            className="shrink-0 flex-col hidden md:flex" 
            style={{ width: 'clamp(280px, 28vw, 400px)', borderRight: '1px solid #e0e0e0' }}
          >
            <ChatPanel
              sources={sources}
              messages={messages}
              setMessages={setMessages}
              notebookTitle={notebookTitle}
              pdfText={pdfText}
              selectedSourceId={selectedSourceId}
            />
          </div>
        </>
      ) : (
        <div className={`flex-1 min-w-0 ${isMobile ? 'pt-14' : ''}`}>
          <ChatPanel
            sources={sources}
            messages={messages}
            setMessages={setMessages}
            notebookTitle={notebookTitle}
            pdfText={pdfText}
            selectedSourceId={selectedSourceId}
          />
        </div>
      )}

      {/* 오른쪽: 스튜디오 */}
      <div 
        className={`shrink-0 ${
          isMobile 
            ? `fixed right-0 top-0 h-full z-50 transition-transform duration-300 ${rightSidebarOpen ? 'translate-x-0' : 'translate-x-full'}`
            : ''
        }`} 
        style={{ 
          width: isMobile ? 'min(280px, 85vw)' : 'clamp(200px, 20vw, 288px)',
          maxWidth: isMobile ? '85vw' : undefined
        }}
      >
        <StudioPanel
          sources={sources}
          selectedSourceId={selectedSourceId}
          setActiveContent={(content) => {
            setActiveContent(content);
            if (isMobile) setRightSidebarOpen(false);
          }}
          activeContent={activeContent}
        />
        {/* 모바일 닫기 버튼 */}
        {isMobile && rightSidebarOpen && (
          <button
            onClick={() => setRightSidebarOpen(false)}
            className="absolute top-3 left-3 w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: '#f1f3f4', color: '#5f6368' }}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}

// ── 콘텐츠 패널 ──────────────────────────────────────────
function ContentPanel({
  activeContent,
  onClose,
}: {
  activeContent: ActiveContent;
  onClose: () => void;
}) {
  if (!activeContent) return null;

  const labelMap: Record<string, string> = {
    quiz: '퀴즈',
    mindmap: '마인드맵',
    flashcard: '플래시카드',
    report: '보고서',
    slides: '슬라이드',
    infographic: '인포그래픽',
    table: '데이터 표',
    audio: 'AI 오디오 오버뷰',
    video: '동영상 개요',
  };

  return (
    <div className="w-full h-full flex flex-col">
      <div
        className="flex items-center justify-between px-4 sm:px-6 py-2.5 sm:py-3 shrink-0 bg-white sticky top-0 z-10"
        style={{ borderBottom: '1px solid #e5e7eb' }}
      >
        <span className="text-xs sm:text-sm font-semibold" style={{ color: '#1f2937' }}>
          {labelMap[activeContent.type] ?? activeContent.type}
        </span>
        <button
          onClick={onClose}
          className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs active:scale-95"
          style={{ background: '#f1f3f4', color: '#5f6368' }}
        >
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
          닫기
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar">
        {activeContent.type === 'quiz' && (
          <InlineQuiz
            quizzes={activeContent.data as { question: string; options: string[]; answer: number; explanation: string }[]}
          />
        )}
        {activeContent.type === 'mindmap' && (
          <MindmapView
            mindmap={activeContent.data as { center: string; branches: { label: string; children: string[] }[] }}
            onClose={onClose}
            inline
          />
        )}
        {activeContent.type === 'flashcard' && (
          <InlineFlashcard
            flashcards={activeContent.data as { front: string; back: string; category: string }[]}
          />
        )}
        {activeContent.type === 'report' && (
          <ReportView
            report={activeContent.data as { title: string; summary: string; sections: { heading: string; content: string }[]; keyPoints: string[]; conclusion: string }}
            onClose={onClose}
            inline
          />
        )}
        {activeContent.type === 'slides' && (
          <SlideView
            slides={activeContent.data as { title: string; slides: { type: string; title: string; subtitle: string; content: string[] }[] }}
            onClose={onClose}
            inline
          />
        )}
        {activeContent.type === 'infographic' && (
          <InfographicView
            infographic={activeContent.data as { title: string; subtitle: string; stats: { label: string; value: string; icon: string }[]; timeline: { step: number; title: string; desc: string }[]; categories: { name: string; items: string[]; color: string }[] }}
            onClose={onClose}
            inline
          />
        )}
        {activeContent.type === 'table' && (
          <DataTableView
            table={activeContent.data as { title: string; description: string; headers: string[]; rows: string[][] }}
            onClose={onClose}
            inline
          />
        )}
        {activeContent.type === 'audio' && (
          <AudioView
            audio={activeContent.data as { title: string; duration: string; sections: { title: string; script: string }[]; fullScript: string }}
            onClose={onClose}
            inline
          />
        )}
        {activeContent.type === 'video' && (
          <VideoView
            video={activeContent.data as { title: string; duration: string; description: string; scenes: { index: number; title: string; duration: string; visual: string; narration: string; keyPoints: string[] }[]; summary: string }}
            onClose={onClose}
            inline
          />
        )}
      </div>
    </div>
  );
}

// ── 인라인 퀴즈 ──────────────────────────────────────────
function InlineQuiz({
  quizzes,
}: {
  quizzes: { question: string; options: string[]; answer: number; explanation: string }[];
}) {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  if (!quizzes || quizzes.length === 0) {
    return (
      <div className="flex items-center justify-center py-16">
        <p className="text-sm" style={{ color: '#9ca3af' }}>퀴즈 데이터를 불러올 수 없습니다.</p>
      </div>
    );
  }

  const quiz = quizzes[current];

  const handleSelect = (i: number) => {
    if (selected !== null) return;
    setSelected(i);
    if (i === quiz.answer) setScore((s) => s + 1);
  };

  const next = () => {
    if (current + 1 >= quizzes.length) { setFinished(true); return; }
    setCurrent((c) => c + 1);
    setSelected(null);
  };

  if (finished) {
    const pct = Math.round((score / quizzes.length) * 100);
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-6 max-w-2xl mx-auto">
        <div
          className="w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold"
          style={{ background: pct >= 70 ? '#d1fae5' : '#fee2e2', color: pct >= 70 ? '#059669' : '#dc2626' }}
        >
          {pct}%
        </div>
        <div className="text-center">
          <p className="text-xl font-bold mb-1" style={{ color: '#1f2937' }}>
            {pct >= 80 ? '훌륭해요! 🎉' : pct >= 60 ? '잘하셨어요!' : '조금 더 공부해봐요'}
          </p>
          <p className="text-sm" style={{ color: '#6b7280' }}>{quizzes.length}문제 중 {score}개 정답</p>
        </div>
        <button
          onClick={() => { setCurrent(0); setSelected(null); setScore(0); setFinished(false); }}
          className="px-8 py-3 rounded-full text-sm font-semibold text-white"
          style={{ background: '#1a73e8' }}
        >
          다시 풀기
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <span className="text-sm font-medium" style={{ color: '#6b7280' }}>
          {current + 1} / {quizzes.length}
        </span>
        <div className="flex-1 mx-4 h-2 rounded-full" style={{ background: '#f1f3f4' }}>
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${((current + 1) / quizzes.length) * 100}%`, background: '#1a73e8' }}
          />
        </div>
        <span className="text-sm font-medium" style={{ color: '#1a73e8' }}>{score}점</span>
      </div>

      <div className="rounded-2xl p-6 mb-4" style={{ background: '#f8f9fa', border: '1px solid #e5e7eb' }}>
        <p className="text-base font-semibold mb-5" style={{ color: '#1f2937' }}>{quiz.question}</p>
        <div className="flex flex-col gap-3">
          {quiz.options.map((opt, i) => {
            let bg = 'white', border = '#e5e7eb', color = '#374151';
            if (selected !== null) {
              if (i === quiz.answer) { bg = '#d1fae5'; border = '#34a853'; color = '#166634'; }
              else if (i === selected) { bg = '#fee2e2'; border = '#ea4335'; color = '#991b1b'; }
            }
            return (
              <button
                key={i}
                onClick={() => handleSelect(i)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-left transition-all"
                style={{ background: bg, border: `1.5px solid ${border}`, color }}
              >
                <span
                  className="w-6 h-6 rounded-full border flex items-center justify-center text-xs font-bold shrink-0"
                  style={{ borderColor: border, color }}
                >
                  {['①', '②', '③', '④'][i]}
                </span>
                {opt}
              </button>
            );
          })}
        </div>
      </div>

      {selected !== null && (
        <>
          <div className="rounded-xl p-4 mb-4" style={{ background: '#eff6ff', border: '1px solid #dbeafe' }}>
            <p className="text-xs font-semibold mb-1" style={{ color: '#1d4ed8' }}>💡 해설</p>
            <p className="text-sm" style={{ color: '#374151' }}>{quiz.explanation}</p>
          </div>
          <button
            onClick={next}
            className="w-full py-3 rounded-xl text-sm font-semibold text-white"
            style={{ background: '#1a73e8' }}
          >
            {current + 1 >= quizzes.length ? '결과 보기' : '다음 문제 →'}
          </button>
        </>
      )}
    </div>
  );
}

// ── 인라인 플래시카드 ──────────────────────────────────────
function InlineFlashcard({
  flashcards,
}: {
  flashcards: { front: string; back: string; category: string }[];
}) {
  const [current, setCurrent] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [known, setKnown] = useState<number[]>([]);
  const [unknown, setUnknown] = useState<number[]>([]);
  const [done, setDone] = useState(false);

  if (!flashcards || flashcards.length === 0) {
    return (
      <div className="flex items-center justify-center py-16">
        <p className="text-sm" style={{ color: '#9ca3af' }}>플래시카드 데이터를 불러올 수 없습니다.</p>
      </div>
    );
  }

  const card = flashcards[current];

  const handleKnow = () => { setKnown((p) => [...p, current]); next(); };
  const handleUnknow = () => { setUnknown((p) => [...p, current]); next(); };
  const next = () => {
    if (current + 1 >= flashcards.length) { setDone(true); return; }
    setCurrent((c) => c + 1);
    setFlipped(false);
  };

  if (done) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-6 max-w-2xl mx-auto">
        <div className="text-5xl">🎉</div>
        <h2 className="text-xl font-bold" style={{ color: '#1f2937' }}>플래시카드 완료!</h2>
        <div className="flex gap-4">
          <div className="text-center p-4 rounded-2xl" style={{ background: '#d1fae5' }}>
            <p className="text-2xl font-bold" style={{ color: '#059669' }}>{known.length}</p>
            <p className="text-sm" style={{ color: '#065f46' }}>알고 있음 ✓</p>
          </div>
          <div className="text-center p-4 rounded-2xl" style={{ background: '#fee2e2' }}>
            <p className="text-2xl font-bold" style={{ color: '#dc2626' }}>{unknown.length}</p>
            <p className="text-sm" style={{ color: '#991b1b' }}>복습 필요 ✗</p>
          </div>
        </div>
        <button
          onClick={() => { setCurrent(0); setFlipped(false); setKnown([]); setUnknown([]); setDone(false); }}
          className="px-8 py-3 rounded-full text-sm font-semibold text-white"
          style={{ background: '#1a73e8' }}
        >
          다시 시작
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm" style={{ color: '#6b7280' }}>{current + 1} / {flashcards.length}</span>
        <div className="flex-1 mx-4 h-2 rounded-full" style={{ background: '#f1f3f4' }}>
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${((current + 1) / flashcards.length) * 100}%`, background: '#be123c' }}
          />
        </div>
      </div>

      <div
        onClick={() => setFlipped((v) => !v)}
        className="cursor-pointer rounded-2xl p-10 text-center flex flex-col items-center justify-center gap-3 transition-all mb-4"
        style={{
          background: flipped ? '#e8f0fe' : '#f8f9fa',
          border: flipped ? '2px solid #1a73e8' : '2px solid #e5e7eb',
          minHeight: 200,
        }}
      >
        {!flipped ? (
          <>
            <span className="text-xs px-2 py-1 rounded-full mb-2"
              style={{ background: '#dbeafe', color: '#1d4ed8' }}>{card.category}</span>
            <p className="text-lg font-semibold" style={{ color: '#1f2937' }}>{card.front}</p>
            <p className="text-xs mt-2" style={{ color: '#9ca3af' }}>탭하여 답 확인</p>
          </>
        ) : (
          <>
            <span className="text-xs px-2 py-1 rounded-full mb-2"
              style={{ background: '#d1fae5', color: '#059669' }}>답변</span>
            <p className="text-base leading-relaxed" style={{ color: '#1f2937' }}>{card.back}</p>
          </>
        )}
      </div>

      {flipped ? (
        <div className="flex gap-3">
          <button onClick={handleUnknow} className="flex-1 py-3 rounded-xl text-sm font-medium"
            style={{ background: '#fee2e2', color: '#dc2626' }}>✗ 모르겠어요</button>
          <button onClick={handleKnow} className="flex-1 py-3 rounded-xl text-sm font-medium"
            style={{ background: '#d1fae5', color: '#059669' }}>✓ 알고 있어요</button>
        </div>
      ) : (
        <button onClick={() => setFlipped(true)} className="w-full py-3 rounded-xl text-sm font-medium text-white"
          style={{ background: '#1a73e8' }}>답 보기</button>
      )}
    </div>
  );
}