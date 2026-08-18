'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavItem {
  name: string;
  href: string;
  icon: string;
  badge?: string;
  badgeType?: 'danger' | 'warning' | 'info';
}

const NAV_ITEMS: NavItem[] = [
  { name: 'Overview', href: '/overview', icon: '📊' },
  { name: 'Transactions', href: '/transactions', icon: '💳' },
  { name: 'Fraud Network', href: '/network', icon: '🕸️' },
  { name: 'Risk Intelligence', href: '/risk', icon: '⚡' },
  { name: 'Anomaly Intelligence', href: '/ai', icon: '🧠', badge: 'Live', badgeType: 'info' },
  { name: 'Alerts', href: '/alerts', icon: '🚨', badge: '156', badgeType: 'danger' },
  { name: 'Investigations', href: '/investigations', icon: '📁', badge: '24', badgeType: 'warning' },
  { name: 'Administration', href: '/admin', icon: '⚙️' },
];

export const Sidebar: React.FC = () => {
  const pathname = usePathname();

  return (
    <aside
      style={{
        width: 'var(--sidebar-width)',
        backgroundColor: 'var(--bg-secondary)',
        borderRight: '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '20px 12px',
      }}
    >
      <div>
        {/* Brand */}
        <Link
          href="/overview"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '0 8px 16px',
            borderBottom: '1px solid var(--border-subtle)',
            marginBottom: '16px',
            textDecoration: 'none',
          }}
        >
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '6px',
              backgroundColor: '#0284c7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              color: '#ffffff',
              fontSize: '15px',
            }}
          >
            FT
          </div>
          <div>
            <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
              FinTrace
            </div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Fraud Intelligence
            </div>
          </div>
        </Link>

        {/* Nav Links */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || (item.href === '/overview' && pathname === '/');

            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '9px 12px',
                  borderRadius: '6px',
                  backgroundColor: isActive ? 'var(--bg-elevated)' : 'transparent',
                  border: isActive ? '1px solid var(--border-subtle)' : '1px solid transparent',
                  color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                  fontSize: '13px',
                  fontWeight: isActive ? 600 : 500,
                  textDecoration: 'none',
                  transition: 'background-color 0.15s',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '15px', opacity: isActive ? 1 : 0.7 }}>{item.icon}</span>
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span
                    style={{
                      fontSize: '10px',
                      padding: '1px 6px',
                      borderRadius: '4px',
                      backgroundColor:
                        item.badgeType === 'danger'
                          ? 'rgba(239, 68, 68, 0.2)'
                          : 'rgba(245, 158, 11, 0.2)',
                      color:
                        item.badgeType === 'danger' ? '#ef4444' : '#f59e0b',
                      fontWeight: 700,
                    }}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* System Status Footer */}
      <div
        style={{
          padding: '10px 12px',
          borderRadius: '6px',
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          fontSize: '11px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
          <span style={{ color: 'var(--text-muted)' }}>Engine:</span>
          <span style={{ color: '#10b981', fontWeight: 600 }}>Active (Synthetic)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ color: 'var(--text-muted)' }}>SIH 2026:</span>
          <span style={{ color: 'var(--text-secondary)' }}>Phase 1 Ready</span>
        </div>
      </div>
    </aside>
  );
};
