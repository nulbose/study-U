'use client';

import { useState, useRef, useEffect } from 'react';
import { Source, Message } from '../page';

interface Props {
  sources: Source[];
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  notebookTitle: string;
  pdfText: string;
  selectedSourceId: number | null;
}

const MODELS = [
  { value: 'gpt-4o-mini', label: 'GPT-4o mini' },
  { value: 'gpt-4o', label: 'GPT-4o' },
];

const LEVELS = [
  { value: 'beginner', label: '입문' },
  { value: 'intermediate', label: '중급' },
  { value: 'advanced', label: '심화' },
];

const SUGGESTIONS = [
  '이 문서의 핵심 내용을 요약해줘',
  '가장 중요한 개념 3가지를 알려줘',
  '더 공부해야 할 부분은 어디야?',
];

export default function ChatPanel({
  sources,
  messages,
  setMessages,
  notebookTitle,
  pdfText,
  selectedSourceId,
}: Props) {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [model, setModel] = useState('gpt-4o-mini');
  const [level, setLevel] = useState('intermediate');
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const hasDoc = sources.length > 0;
  const selectedSource = sources.find((s) => s.id === selectedSourceId);

  const titleLabel = selectedSource
    ? selectedSource.name.replace(/\.pdf$/i, '')
    : sources.length === 0
    ? notebookTitle
    : sources.length === 1
    ? sources[0].name.replace(/\.pdf$/i, '')
    : `${sources[0].name.replace(/\.pdf$/i, '')} 외 ${sources.length - 1}개`;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const sendMessage = async (text?: string) => {
    const question = (text ?? input).trim();
    if (!question) return;
    if (!hasDoc) {
      alert('소스를 먼저 추가해주세요!');
      return;
    }

    const newMessages: Message[] = [
      ...messages,
      { role: 'user', content: question },
    ];
    setMessages(newMessages);
    setInput('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
    setLoading(true);

    try {
      const context = selectedSource
        ? selectedSource.name
        : sources.map((s) => s.name).join(', ');
      const activeText = pdfText || '';
      const history = messages.slice(-10).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: question,
          context,
          pdfText: activeText,
          history,
          model,
          level,
        }),
      });
      const data = await res.json();
      setMessages([
        ...newMessages,
        { role: 'assistant', content: data.response },
      ]);
    } catch {
      setMessages([
        ...newMessages,
        { role: 'assistant', content: '오류가 발생했습니다. 다시 시도해주세요.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 160) + 'px';
  };

  return (
    <div className="flex flex-col w-full min-w-0 h-full bg-white">
      {/* 상단 바 */}
      <div
        className="flex items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3 shrink-0"
        style={{ borderBottom: '1px solid #e5e7eb' }}
      >
        {/* 왼쪽: 제목 */}
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1">
          <div
            className="flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 rounded-lg shrink-0"
            style={{ background: '#dbeafe' }}
          >
            <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
                stroke="#1a73e8"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <span
            className="text-xs sm:text-sm font-semibold truncate"
            style={{ color: '#1f2937' }}
          >
            {titleLabel}
          </span>
          {selectedSource && (
            <span
              className="text-xs px-1.5 sm:px-2 py-0.5 rounded-full shrink-0 hidden xs:inline-flex"
              style={{ background: '#e8f0fe', color: '#1a73e8' }}
            >
              선택됨
            </span>
          )}
        </div>

        {/* 오른쪽: 배지 + 셀렉트 */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0 ml-2">
          {pdfText && (
            <span
              className="text-xs px-1.5 sm:px-2 py-0.5 rounded-full whitespace-nowrap hidden sm:inline-flex"
              style={{ background: '#d1fae5', color: '#065f46' }}
            >
              분석 완료
            </span>
          )}
          <select
            value={model}
            onChange={(e) => setModel(e.target.value)}
            className="text-xs rounded-lg px-1.5 sm:px-2 py-1 outline-none"
            style={{ border: '1px solid #e5e7eb', color: '#6b7280', background: 'white', fontSize: 'clamp(10px, 2.5vw, 12px)' }}
          >
            {MODELS.map((m) => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
          <select
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            className="text-xs rounded-lg px-1.5 sm:px-2 py-1 outline-none"
            style={{ border: '1px solid #e5e7eb', color: '#6b7280', background: 'white', fontSize: 'clamp(10px, 2.5vw, 12px)' }}
          >
            {LEVELS.map((l) => (
              <option key={l.value} value={l.value}>{l.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* 메시지 영역 */}
      <div className="flex-1 overflow-y-auto px-3 sm:px-4 py-3 sm:py-4 space-y-3 sm:space-y-4 custom-scrollbar">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center gap-3 sm:gap-4">
            <div
              className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center"
              style={{ background: '#eff6ff' }}
            >
              <svg className="w-6 h-6 sm:w-8 sm:h-8" viewBox="0 0 24 24" fill="none">
                <path
                  d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"
                  stroke="#60a5fa"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                  fill="#dbeafe"
                />
              </svg>
            </div>
            {hasDoc ? (
              <>
                <p className="text-xs sm:text-sm" style={{ color: '#6b7280' }}>
                  {selectedSource
                    ? `"${selectedSource.name.replace(/\.pdf$/i, '')}" 기반으로 질문하세요`
                    : '소스를 선택하거나 바로 질문하세요'}
                </p>
                <div className="flex flex-col gap-2 w-full max-w-sm px-2 sm:px-0">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => sendMessage(s)}
                      className="text-xs sm:text-sm text-left px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl transition-all active:scale-[0.98]"
                      style={{ border: '1px solid #e5e7eb', color: '#6b7280', background: 'white' }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-xs sm:text-sm" style={{ color: '#9ca3af' }}>
                왼쪽에서 소스를 추가한 뒤 질문하세요
              </p>
            )}
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'assistant' && (
              <div
                className="w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center shrink-0 mt-1 mr-1.5 sm:mr-2"
                style={{ background: '#dbeafe' }}
              >
                <span className="text-xs font-bold" style={{ color: '#1d4ed8', fontSize: 'clamp(9px, 2vw, 12px)' }}>AI</span>
              </div>
            )}
            <div
              className="max-w-[85%] sm:max-w-[75%] rounded-2xl px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm leading-relaxed"
              style={{
                background: msg.role === 'user' ? '#1a73e8' : '#f8f9fa',
                color: msg.role === 'user' ? 'white' : '#202124',
                borderBottomRightRadius: msg.role === 'user' ? 4 : undefined,
                borderBottomLeftRadius: msg.role === 'assistant' ? 4 : undefined,
                whiteSpace: 'pre-wrap',
              }}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div
              className="w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center shrink-0 mt-1 mr-1.5 sm:mr-2"
              style={{ background: '#dbeafe' }}
            >
              <span className="text-xs font-bold" style={{ color: '#1d4ed8', fontSize: 'clamp(9px, 2vw, 12px)' }}>AI</span>
            </div>
            <div className="rounded-2xl rounded-bl-sm px-3 sm:px-4 py-2.5 sm:py-3" style={{ background: '#f3f4f6' }}>
              <div className="flex gap-1 items-center">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full animate-bounce"
                    style={{ background: '#9ca3af', animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* 입력 영역 */}
      <div className="shrink-0 px-3 sm:px-4 pb-3 sm:pb-4 pt-2">
        <div
          className="flex items-end gap-2 rounded-2xl px-3 sm:px-4 py-2.5 sm:py-3 transition-all"
          style={{
            border: '1px solid #e5e7eb',
            background: 'white',
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
          }}
        >
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleTextareaChange}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            placeholder={
              hasDoc
                ? '문서에 대해 질문하세요...'
                : '소스를 먼저 추가해주세요'
            }
            disabled={!hasDoc || loading}
            rows={1}
            className="flex-1 resize-none outline-none text-xs sm:text-sm bg-transparent"
            style={{ maxHeight: 120, color: '#374151', lineHeight: 1.6 }}
          />
          <button
            onClick={() => sendMessage()}
            disabled={!input.trim() || !hasDoc || loading}
            className="flex items-center justify-center w-8 h-8 rounded-full transition-all shrink-0 active:scale-95"
            style={{
              background: input.trim() && hasDoc && !loading ? '#1a73e8' : '#f1f3f4',
              color: input.trim() && hasDoc && !loading ? 'white' : '#bdc1c6',
            }}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
              <path
                d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}