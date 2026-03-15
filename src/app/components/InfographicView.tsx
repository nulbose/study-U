'use client';

interface Stat { label: string; value: string; icon: string; }
interface TimelineItem { step: number; title: string; desc: string; }
interface Category { name: string; items: string[]; color: string; }
interface Infographic {
  title: string; subtitle: string;
  stats: Stat[]; timeline: TimelineItem[]; categories: Category[];
}
interface Props { infographic: Infographic; onClose: () => void; inline?: boolean; }

export default function InfographicView({ infographic, onClose, inline }: Props) {
  const content = (
    <div>
      <div className="text-center mb-6 p-6 rounded-2xl" style={{ background: 'linear-gradient(135deg, #1a73e8, #0d9488)' }}>
        <h1 className="text-xl font-bold text-white mb-1">{infographic.title}</h1>
        <p className="text-sm text-white opacity-80">{infographic.subtitle}</p>
      </div>
      <div className="grid grid-cols-2 gap-3 mb-6">
        {infographic.stats.map((stat, i) => (
          <div key={i} className="p-4 rounded-2xl text-center" style={{ background: '#f8f9fa', border: '1px solid #e5e7eb' }}>
            <div className="text-2xl mb-1">{stat.icon}</div>
            <p className="text-lg font-bold" style={{ color: '#1f2937' }}>{stat.value}</p>
            <p className="text-xs" style={{ color: '#6b7280' }}>{stat.label}</p>
          </div>
        ))}
      </div>
      {infographic.timeline.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-semibold mb-3" style={{ color: '#1f2937' }}>📅 타임라인</h3>
          <div className="relative pl-6">
            <div className="absolute left-2 top-0 bottom-0 w-0.5" style={{ background: '#e5e7eb' }} />
            {infographic.timeline.map((item, i) => (
              <div key={i} className="relative mb-4">
                <div className="absolute -left-4 w-4 h-4 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{ background: '#1a73e8', color: 'white', top: 2 }}>{item.step}</div>
                <div className="p-3 rounded-xl ml-2" style={{ background: '#f8f9fa' }}>
                  <p className="text-sm font-medium" style={{ color: '#1f2937' }}>{item.title}</p>
                  <p className="text-xs mt-0.5" style={{ color: '#6b7280' }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {infographic.categories.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold mb-3" style={{ color: '#1f2937' }}>🏷️ 카테고리</h3>
          <div className="grid grid-cols-2 gap-3">
            {infographic.categories.map((cat, i) => (
              <div key={i} className="p-3 rounded-xl" style={{ background: '#f8f9fa', borderLeft: `3px solid ${cat.color || '#1a73e8'}` }}>
                <p className="text-xs font-semibold mb-2" style={{ color: cat.color || '#1a73e8' }}>{cat.name}</p>
                <ul className="space-y-1">
                  {cat.items.map((item, j) => (
                    <li key={j} className="text-xs flex items-start gap-1" style={{ color: '#6b7280' }}>
                      <span>•</span> {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  if (inline) return <div>{content}</div>;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.5)' }}>
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-xl overflow-hidden" style={{ maxHeight: '88vh' }}>
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid #e5e7eb' }}>
          <span className="text-sm font-semibold" style={{ color: '#1f2937' }}>인포그래픽</span>
          <button onClick={onClose} style={{ color: '#9ca3af' }}>✕</button>
        </div>
        <div className="overflow-y-auto p-6" style={{ maxHeight: 'calc(88vh - 64px)' }}>{content}</div>
      </div>
    </div>
  );
}