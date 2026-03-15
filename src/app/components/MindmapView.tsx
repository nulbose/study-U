'use client';

import { useEffect, useRef } from 'react';

interface Branch {
  label: string;
  children: string[];
}

interface Mindmap {
  center: string;
  branches: Branch[];
}

interface Props {
  mindmap: Mindmap;
  onClose: () => void;
  inline?: boolean;
}

const COLORS = [
  '#6366f1', '#f59e0b', '#10b981', '#ef4444',
  '#8b5cf6', '#06b6d4', '#f97316', '#84cc16',
];

export default function MindmapView({ mindmap, onClose, inline }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;
    const cx = W / 2;
    const cy = H / 2;

    ctx.clearRect(0, 0, W, H);

    const branches = mindmap.branches;
    const angleStep = (2 * Math.PI) / branches.length;

    branches.forEach((branch, i) => {
      const angle = i * angleStep - Math.PI / 2;
      const branchR = 160;
      const bx = cx + branchR * Math.cos(angle);
      const by = cy + branchR * Math.sin(angle);
      const color = COLORS[i % COLORS.length];

      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(bx, by);
      ctx.strokeStyle = color;
      ctx.lineWidth = 2.5;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(bx, by, 36, 0, 2 * Math.PI);
      ctx.fillStyle = color;
      ctx.fill();

      ctx.fillStyle = '#fff';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      wrapText(ctx, branch.label, bx, by, 60, 14);

      const childCount = branch.children.length;
      const childAngleSpread = Math.PI / 2.5;
      const childAngleStep = childCount > 1 ? childAngleSpread / (childCount - 1) : 0;
      const childStartAngle = angle - childAngleSpread / 2;

      branch.children.forEach((child, j) => {
        const childAngle = childCount > 1 ? childStartAngle + j * childAngleStep : angle;
        const childR = 100;
        const chx = bx + childR * Math.cos(childAngle);
        const chy = by + childR * Math.sin(childAngle);

        ctx.beginPath();
        ctx.moveTo(bx, by);
        ctx.lineTo(chx, chy);
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.5;
        ctx.globalAlpha = 0.6;
        ctx.stroke();
        ctx.globalAlpha = 1;

        ctx.beginPath();
        ctx.arc(chx, chy, 28, 0, 2 * Math.PI);
        ctx.fillStyle = color + '33';
        ctx.fill();
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.fillStyle = '#374151';
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        wrapText(ctx, child, chx, chy, 50, 12);
      });
    });

    ctx.beginPath();
    ctx.arc(cx, cy, 50, 0, 2 * Math.PI);
    ctx.fillStyle = '#1e293b';
    ctx.fill();

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 13px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    wrapText(ctx, mindmap.center, cx, cy, 85, 15);

  }, [mindmap]);

  function wrapText(
    ctx: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number,
    maxWidth: number,
    lineHeight: number
  ) {
    const words = text.split(' ');
    const lines: string[] = [];
    let current = '';

    for (const word of words) {
      const test = current ? `${current} ${word}` : word;
      if (ctx.measureText(test).width > maxWidth && current) {
        lines.push(current);
        current = word;
      } else {
        current = test;
      }
    }
    if (current) lines.push(current);

    const startY = y - ((lines.length - 1) * lineHeight) / 2;
    lines.forEach((line, i) => {
      ctx.fillText(line, x, startY + i * lineHeight);
    });
  }

  const canvasContent = (
    <div>
      <div className="flex justify-center rounded-xl p-4" style={{ background: '#f8f9fa' }}>
        <canvas ref={canvasRef} width={700} height={600} className="max-w-full" />
      </div>
      <div className="flex flex-wrap gap-2 mt-4">
        {mindmap.branches.map((branch, i) => (
          <span
            key={i}
            className="px-3 py-1 rounded-full text-white text-xs font-medium"
            style={{ backgroundColor: COLORS[i % COLORS.length] }}
          >
            {branch.label}
          </span>
        ))}
      </div>
    </div>
  );

  if (inline) return <div>{canvasContent}</div>;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.5)' }}>
      <div className="bg-white rounded-2xl p-6 w-full max-w-3xl shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-gray-800 text-lg">🗺️ 마인드맵</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
        </div>
        {canvasContent}
      </div>
    </div>
  );
}