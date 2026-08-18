'use client';

import React, { useState } from 'react';
import { demoDataService } from '@/modules/demo';

export const ActivityChart: React.FC = () => {
  const [timeframe, setTimeframe] = useState<'24H' | '7D' | '30D'>('24H');
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const data = demoDataService.getActivityData(timeframe);

  const maxTotal = Math.max(...data.map((d) => d.totalVolume), 1);
  const maxSuspicious = Math.max(...data.map((d) => d.suspiciousVolume), 1);

  const svgWidth = 600;
  const svgHeight = 180;
  const paddingX = 40;
  const paddingY = 25;
  const chartWidth = svgWidth - paddingX * 2;
  const chartHeight = svgHeight - paddingY * 2;

  const points = data.map((d, i) => {
    const x = paddingX + (i / (data.length - 1 || 1)) * chartWidth;
    const yTotal = paddingY + chartHeight - (d.totalVolume / maxTotal) * chartHeight;
    const ySuspicious = paddingY + chartHeight - (d.suspiciousVolume / maxSuspicious) * chartHeight;
    return { x, yTotal, ySuspicious, data: d };
  });

  const totalPath = points.reduce(
    (acc, p, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${p.x} ${p.yTotal}`,
    ''
  );

  const suspiciousPath = points.reduce(
    (acc, p, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${p.x} ${p.ySuspicious}`,
    ''
  );

  return (
    <div
      style={{
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '8px',
        padding: '16px 20px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
        <div>
          <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>Transaction Activity & Volume</h3>
          <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Normalized volume and suspicious spikes over time</p>
        </div>

        {/* Timeframe Switcher */}
        <div style={{ display: 'flex', backgroundColor: 'var(--bg-elevated)', borderRadius: '6px', padding: '2px' }}>
          {(['24H', '7D', '30D'] as const).map((tf) => (
            <button
              key={tf}
              onClick={() => {
                setTimeframe(tf);
                setHoverIndex(null);
              }}
              style={{
                padding: '4px 10px',
                fontSize: '11px',
                fontWeight: 600,
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                backgroundColor: timeframe === tf ? 'var(--bg-card)' : 'transparent',
                color: timeframe === tf ? 'var(--text-primary)' : 'var(--text-muted)',
              }}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* SVG Chart */}
      <div style={{ width: '100%', overflowX: 'auto' }}>
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          style={{ width: '100%', height: '180px', overflow: 'visible' }}
        >
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
            const y = paddingY + chartHeight * (1 - ratio);
            return (
              <line
                key={ratio}
                x1={paddingX}
                y1={y}
                x2={svgWidth - paddingX}
                y2={y}
                stroke="var(--border-subtle)"
                strokeDasharray="3 3"
              />
            );
          })}

          {/* Total Volume Line */}
          <path d={totalPath} fill="none" stroke="#3b82f6" strokeWidth="2" />

          {/* Suspicious Volume Line */}
          <path d={suspiciousPath} fill="none" stroke="#ef4444" strokeWidth="2" strokeDasharray="4 2" />

          {/* Data Points */}
          {points.map((p, idx) => (
            <g key={idx}>
              <circle
                cx={p.x}
                cy={p.yTotal}
                r={hoverIndex === idx ? 5 : 3}
                fill="#3b82f6"
                onMouseEnter={() => setHoverIndex(idx)}
                style={{ cursor: 'pointer' }}
              />
              <circle
                cx={p.x}
                cy={p.ySuspicious}
                r={hoverIndex === idx ? 5 : 3}
                fill="#ef4444"
                onMouseEnter={() => setHoverIndex(idx)}
                style={{ cursor: 'pointer' }}
              />
              <text
                x={p.x}
                y={svgHeight - 6}
                textAnchor="middle"
                fontSize="9"
                fill="var(--text-muted)"
              >
                {p.data.timeLabel}
              </text>
            </g>
          ))}
        </svg>
      </div>

      {/* Legend & Tooltip detail */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '10px', paddingTop: '10px', borderTop: '1px solid var(--border-subtle)', fontSize: '11px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '12px', height: '2px', backgroundColor: '#3b82f6', display: 'inline-block' }} />
            <span style={{ color: 'var(--text-secondary)' }}>Total Volume</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '12px', height: '2px', backgroundColor: '#ef4444', display: 'inline-block', borderStyle: 'dashed' }} />
            <span style={{ color: '#ef4444' }}>Suspicious Volume</span>
          </div>
        </div>

        {hoverIndex !== null && points[hoverIndex] && (
          <div style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
            {points[hoverIndex].data.timeLabel}: {points[hoverIndex].data.totalVolume.toLocaleString()} txns | <span style={{ color: '#ef4444' }}>{points[hoverIndex].data.suspiciousVolume} flagged</span>
          </div>
        )}
      </div>
    </div>
  );
};
