'use client';

interface Section { heading: string; content: string; }
interface Report {
  title: string;
  summary: string;
  sections: Section[];
  keyPoints: string[];
  conclusion: string;
}
interface Props { report: Report; onClose: () => void; inline?: boolean; }

export default function ReportView({ report, onClose, inline }: Props) {
  const content = (
    <div>
      <h1 className="text-xl font-bold mb-3" style={{ color: '#1f2937' }}>{report.title}</h1>
      <div className="rounded-xl p-4 mb-5" style={{ background: '#eff6ff', border: '1px solid #dbeafe' }}>
        <p className="text-xs font-semibold mb-1" style={{ color: '#1d4ed8' }}>📌 요약</p>
        <p className="text-sm leading-relaxed" style={{ color: '#374151' }}>{report.summary}</p>
      </div>
      <div className="mb-5">
        <h3 className="text-sm font-semibold mb-3" style={{ color: '#1f2937' }}>💡 핵심 포인트</h3>
        <div className="flex flex-col gap-2">
          {report.keyPoints.map((point, i) => (
            <div key={i} className="flex items-start gap-2.5 p-3 rounded-xl" style={{ background: '#f8f9fa' }}>
              <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5"
                style={{ background: '#1a73e8', color: 'white' }}>{i + 1}</span>
              <p className="text-sm" style={{ color: '#374151' }}>{point}</p>
            </div>
          ))}
        </div>
      </div>
      {report.sections.map((section, i) => (
        <div key={i} className="mb-5">
          <h3 className="text-sm font-semibold mb-2 flex items-center gap-2" style={{ color: '#1f2937' }}>
            <span className="w-1 h-4 rounded-full" style={{ background: '#1a73e8' }} />
            {section.heading}
          </h3>
          <p className="text-sm leading-relaxed pl-3" style={{ color: '#6b7280', borderLeft: '2px solid #e5e7eb' }}>
            {section.content}
          </p>
        </div>
      ))}
      <div className="rounded-xl p-4" style={{ background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
        <p className="text-xs font-semibold mb-1" style={{ color: '#15803d' }}>✅ 결론</p>
        <p className="text-sm leading-relaxed" style={{ color: '#374151' }}>{report.conclusion}</p>
      </div>
    </div>
  );

  if (inline) return <div>{content}</div>;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.5)' }}>
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-xl overflow-hidden" style={{ maxHeight: '85vh' }}>
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid #e5e7eb' }}>
          <span className="text-sm font-semibold" style={{ color: '#1f2937' }}>보고서</span>
          <button onClick={onClose} style={{ color: '#9ca3af' }}>✕</button>
        </div>
        <div className="overflow-y-auto p-6" style={{ maxHeight: 'calc(85vh - 64px)' }}>{content}</div>
      </div>
    </div>
  );
}