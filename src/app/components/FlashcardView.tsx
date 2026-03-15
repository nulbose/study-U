'use client';

import { useState } from 'react';

interface Flashcard {
  front: string;
  back: string;
  category: string;
}

interface Props {
  flashcards: Flashcard[];
  onClose: () => void;
}

export default function FlashcardView({ flashcards, onClose }: Props) {
  const [current, setCurrent] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [known, setKnown] = useState<number[]>([]);
  const [unknown, setUnknown] = useState<number[]>([]);
  const [done, setDone] = useState(false);

  const card = flashcards[current];

  const handleKnow = () => {
    setKnown((prev) => [...prev, current]);
    next();
  };

  const handleUnknow = () => {
    setUnknown((prev) => [...prev, current]);
    next();
  };

  const next = () => {
    if (current + 1 >= flashcards.length) {
      setDone(true);
      return;
    }
    setCurrent((c) => c + 1);
    setFlipped(false);
  };

  if (done) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.5)' }}>
        <div className="bg-white rounded-2xl p-8 w-full max-w-md text-center shadow-xl">
          <div className="text-5xl mb-4">🎉</div>
          <h2 className="text-xl font-bold mb-2" style={{ color: '#1f2937' }}>플래시카드 완료!</h2>
          <div className="flex gap-4 justify-center my-6">
            <div className="text-center p-4 rounded-2xl" style={{ background: '#d1fae5' }}>
              <p className="text-2xl font-bold" style={{ color: '#059669' }}>{known.length}</p>
              <p className="text-sm" style={{ color: '#065f46' }}>알고 있음 ✓</p>
            </div>
            <div className="text-center p-4 rounded-2xl" style={{ background: '#fee2e2' }}>
              <p className="text-2xl font-bold" style={{ color: '#dc2626' }}>{unknown.length}</p>
              <p className="text-sm" style={{ color: '#991b1b' }}>복습 필요 ✗</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => { setCurrent(0); setFlipped(false); setKnown([]); setUnknown([]); setDone(false); }}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white"
              style={{ background: '#1a73e8' }}
            >
              다시 시작
            </button>
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium"
              style={{ background: '#f1f3f4', color: '#5f6368' }}
            >
              닫기
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.5)' }}>
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden">
        {/* 헤더 */}
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid #e5e7eb' }}>
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold" style={{ color: '#1f2937' }}>플래시카드</span>
            <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: '#dbeafe', color: '#1d4ed8' }}>
              {current + 1} / {flashcards.length}
            </span>
          </div>
          <button onClick={onClose} style={{ color: '#9ca3af' }}>✕</button>
        </div>

        {/* 진행 바 */}
        <div style={{ height: 3, background: '#f1f3f4' }}>
          <div
            style={{
              height: '100%',
              background: '#1a73e8',
              width: `${((current + 1) / flashcards.length) * 100}%`,
              transition: 'width 0.3s',
            }}
          />
        </div>

        {/* 카드 */}
        <div className="p-6">
          <div
            onClick={() => setFlipped((v) => !v)}
            className="cursor-pointer rounded-2xl p-8 text-center min-h-48 flex flex-col items-center justify-center gap-3 transition-all"
            style={{
              background: flipped ? '#e8f0fe' : '#f8f9fa',
              border: flipped ? '2px solid #1a73e8' : '2px solid #e5e7eb',
              minHeight: 180,
            }}
          >
            {!flipped ? (
              <>
                <span className="text-xs px-2 py-1 rounded-full mb-2" style={{ background: '#dbeafe', color: '#1d4ed8' }}>
                  {card.category}
                </span>
                <p className="text-base font-semibold" style={{ color: '#1f2937' }}>{card.front}</p>
                <p className="text-xs mt-2" style={{ color: '#9ca3af' }}>탭하여 답 확인</p>
              </>
            ) : (
              <>
                <span className="text-xs px-2 py-1 rounded-full mb-2" style={{ background: '#d1fae5', color: '#059669' }}>
                  답변
                </span>
                <p className="text-base" style={{ color: '#1f2937', lineHeight: 1.6 }}>{card.back}</p>
              </>
            )}
          </div>

          {/* 액션 버튼 */}
          {flipped && (
            <div className="flex gap-3 mt-4">
              <button
                onClick={handleUnknow}
                className="flex-1 py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2"
                style={{ background: '#fee2e2', color: '#dc2626' }}
              >
                ✗ 모르겠어요
              </button>
              <button
                onClick={handleKnow}
                className="flex-1 py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2"
                style={{ background: '#d1fae5', color: '#059669' }}
              >
                ✓ 알고 있어요
              </button>
            </div>
          )}

          {!flipped && (
            <button
              onClick={() => setFlipped(true)}
              className="w-full mt-4 py-3 rounded-xl text-sm font-medium text-white"
              style={{ background: '#1a73e8' }}
            >
              답 보기
            </button>
          )}
        </div>
      </div>
    </div>
  );
}