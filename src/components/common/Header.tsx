'use client';

import React, { useState } from 'react';
import { GlobalSearchModal } from './GlobalSearchModal';

interface HeaderProps {
  onRefresh?: () => void;
  lastUpdated?: string;
  isRefreshing?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onRefresh,
  lastUpdated,
  isRefreshing = false,
}) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <>
      <header
        style={{
          height: 'var(--header-height)',
          backgroundColor: 'var(--bg-secondary)',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
          position: 'sticky',
          top: 0,
          zIndex: 40,
        }}
      >
        {/* Search Trigger */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button
            onClick={() => setIsSearchOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '6px',
              padding: '6px 14px',
              color: 'var(--text-muted)',
              fontSize: '13px',
              cursor: 'pointer',
              minWidth: '280px',
              textAlign: 'left',
            }}
          >
            <span>🔍</span>
            <span style={{ flex: 1 }}>Search entities, accounts, txns...</span>
            <kbd
              style={{
                backgroundColor: 'var(--bg-elevated)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '3px',
                padding: '1px 5px',
                fontSize: '10px',
                color: 'var(--text-secondary)',
              }}
            >
              Ctrl+K
            </kbd>
          </button>
        </div>

        {/* Right Action Bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* Refresh Control */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {lastUpdated && (
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                Updated: {lastUpdated}
              </span>
            )}
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '6px',
                padding: '5px 10px',
                fontSize: '12px',
                color: 'var(--text-secondary)',
                cursor: isRefreshing ? 'not-allowed' : 'pointer',
              }}
              title="Refresh intelligence dataset"
            >
              <span style={{ display: 'inline-block', animation: isRefreshing ? 'spin 1s linear infinite' : 'none' }}>
                ↻
              </span>
              <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
            </button>
          </div>

          <div style={{ width: '1px', height: '24px', backgroundColor: 'var(--border-subtle)' }} />

          {/* User Profile */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '6px',
                backgroundColor: '#1e293b',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                fontWeight: 700,
                color: '#38bdf8',
              }}
            >
              AK
            </div>
            <div>
              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.1 }}>
                Agent Kiddo
              </div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                Senior Investigator
              </div>
            </div>
          </div>
        </div>
      </header>

      <GlobalSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
};
