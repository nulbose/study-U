'use client';

import { useState } from 'react';

interface Table { title: string; description: string; headers: string[]; rows: string[][]; }
interface Props { table: Table; onClose: () => void; inline?: boolean; }

export default function DataTableView({ table, onClose, inline }: Props) {
  const [search, setSearch] = useState('');
  const filtered = table.rows.filter((row) =>
    row.some((cell) => cell.toLowerCase().includes(search.toLowerCase()))
  );

  const content = (
    <div>
      <div className="mb-4">
        <h2 className="text-lg font-bold mb-1" style={{ color: '#1f2937' }}>{table.title}</h2>
        {table.description && <p className="text-sm" style={{ color: '#9ca3af' }}>{table.description}</p>}
      </div>
      <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
        placeholder="데이터 검색..." className="w-full px-3 py-2 text-sm rounded-xl outline-none mb-4"
        style={{ border: '1px solid #e5e7eb', background: '#f8f9fa' }} />
      <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid #e5e7eb' }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: '#f8f9fa', borderBottom: '1px solid #e5e7eb' }}>
              {table.headers.map((h, i) => (
                <th key={i} className="px-4 py-3 text-left text-xs font-semibold" style={{ color: '#374151' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((row, i) => (
              <tr key={i} style={{ borderBottom: '1px solid #f3f4f6', background: i % 2 === 0 ? 'white' : '#fafafa' }}>
                {row.map((cell, j) => (
                  <td key={j} className="px-4 py-3 text-xs" style={{ color: '#6b7280' }}>{cell}</td>
                ))}
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={table.headers.length} className="px-4 py-8 text-center text-sm" style={{ color: '#9ca3af' }}>검색 결과 없음</td></tr>
            )}
          </tbody>
        </table>
      </div>
      <p className="text-xs mt-2" style={{ color: '#9ca3af' }}>총 {filtered.length}개 행</p>
    </div>
  );

  if (inline) return <div>{content}</div>;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.5)' }}>
      <div className="bg-white rounded-2xl w-full max-w-3xl shadow-xl overflow-hidden" style={{ maxHeight: '85vh' }}>
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid #e5e7eb' }}>
          <span className="text-sm font-semibold" style={{ color: '#1f2937' }}>데이터 표</span>
          <button onClick={onClose} style={{ color: '#9ca3af' }}>✕</button>
        </div>
        <div className="overflow-y-auto p-6" style={{ maxHeight: 'calc(85vh - 64px)' }}>{content}</div>
      </div>
    </div>
  );
}