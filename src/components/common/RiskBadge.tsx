import React from 'react';
import { RiskLevel } from '@/types/fraud';

interface RiskBadgeProps {
  level: RiskLevel;
  score?: number;
  size?: 'sm' | 'md';
}

const levelStyles: Record<RiskLevel, { bg: string; text: string; border: string; label: string }> = {
  CRITICAL: {
    bg: 'rgba(239, 68, 68, 0.15)',
    text: '#ef4444',
    border: 'rgba(239, 68, 68, 0.4)',
    label: 'Critical',
  },
  HIGH: {
    bg: 'rgba(249, 115, 22, 0.15)',
    text: '#f97316',
    border: 'rgba(249, 115, 22, 0.4)',
    label: 'High',
  },
  MEDIUM: {
    bg: 'rgba(234, 179, 8, 0.15)',
    text: '#eab308',
    border: 'rgba(234, 179, 8, 0.4)',
    label: 'Medium',
  },
  LOW: {
    bg: 'rgba(59, 130, 246, 0.15)',
    text: '#60a5fa',
    border: 'rgba(59, 130, 246, 0.4)',
    label: 'Low',
  },
};

export const RiskBadge: React.FC<RiskBadgeProps> = ({ level, score, size = 'sm' }) => {
  const style = levelStyles[level] || levelStyles.LOW;
  const isSm = size === 'sm';

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: isSm ? '2px 8px' : '4px 10px',
        borderRadius: '4px',
        fontSize: isSm ? '11px' : '12px',
        fontWeight: 600,
        backgroundColor: style.bg,
        color: style.text,
        border: `1px solid ${style.border}`,
        letterSpacing: '0.02em',
      }}
    >
      <span
        style={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          backgroundColor: style.text,
        }}
      />
      {style.label} {score !== undefined && `(${score})`}
    </span>
  );
};
