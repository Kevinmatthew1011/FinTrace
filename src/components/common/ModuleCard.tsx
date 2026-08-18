import React from 'react';
import { StatusBadge, StatusVariant } from './StatusBadge';

interface ModuleCardProps {
  id: string;
  name: string;
  description: string;
  status: string;
  variant?: StatusVariant;
  phase: string;
  keyFeatures: string[];
}

export const ModuleCard: React.FC<ModuleCardProps> = ({
  name,
  description,
  status,
  variant = 'info',
  phase,
  keyFeatures,
}) => {
  return (
    <div
      className="glass-panel"
      style={{
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        height: '100%',
      }}
    >
      <div>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600 }}>{name}</h3>
          <StatusBadge label={status} variant={variant} showPulse={status === 'READY'} />
        </div>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '16px' }}>
          {description}
        </p>
      </div>

      <div>
        <div style={{ marginBottom: '12px' }}>
          <p style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: 700 }}>
            Key Capabilities
          </p>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {keyFeatures.map((feat, i) => (
              <li key={i} style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ color: 'var(--accent-cyan)', fontSize: '10px' }}>▸</span>
                {feat}
              </li>
            ))}
          </ul>
        </div>

        <div
          style={{
            paddingTop: '12px',
            borderTop: '1px solid var(--border-subtle)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Roadmap Target:</span>
          <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--accent-indigo)' }}>{phase}</span>
        </div>
      </div>
    </div>
  );
};
