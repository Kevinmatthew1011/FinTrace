'use client';

import React, { useState } from 'react';

interface NoteItem {
  id: string;
  authorName: string;
  content: string;
  isSystemGenerated: boolean;
  author?: {
    id: string;
    name: string;
    badgeNumber?: string | null;
  } | null;
  createdAt: string;
}

interface CaseNotesTabProps {
  caseId: string;
  notes: NoteItem[];
  onRefresh: () => void;
}

export const CaseNotesTab: React.FC<CaseNotesTabProps> = ({ caseId, notes, onRefresh }) => {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAddNote = async () => {
    if (!content.trim()) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/v1/cases/${caseId}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });
      const data = await res.json();
      if (data.success) {
        setContent('');
        onRefresh();
      } else {
        alert(data.error?.message || 'Error adding note');
      }
    } catch {
      alert('Network error adding note');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Note Creator Box */}
      <div
        style={{
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '8px',
          padding: '16px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}
      >
        <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
          Record Investigator Finding / Note
        </h3>

        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Document interview findings, field observations, subpoenas served, or forensic hypotheses..."
          rows={3}
          style={{
            width: '100%',
            padding: '10px 12px',
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '6px',
            color: 'var(--text-primary)',
            fontSize: '12px',
            resize: 'vertical',
          }}
        />

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={handleAddNote}
            disabled={loading || !content.trim()}
            style={{
              padding: '6px 16px',
              fontSize: '12px',
              fontWeight: 600,
              borderRadius: '5px',
              backgroundColor: 'var(--accent-primary, #3b82f6)',
              color: '#ffffff',
              border: 'none',
              cursor: content.trim() ? 'pointer' : 'not-allowed',
              opacity: content.trim() ? 1 : 0.6,
            }}
          >
            {loading ? 'Posting...' : 'Post Investigator Note'}
          </button>
        </div>
      </div>

      {/* Notes Feed */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {notes.length === 0 ? (
          <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px' }}>
            No notes or findings recorded yet.
          </div>
        ) : (
          notes.map((n) => (
            <div
              key={n.id}
              style={{
                backgroundColor: n.isSystemGenerated ? 'var(--bg-secondary)' : 'var(--bg-card)',
                border: `1px solid ${n.isSystemGenerated ? 'var(--border-subtle)' : 'rgba(59, 130, 246, 0.3)'}`,
                borderRadius: '8px',
                padding: '14px 18px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span
                    style={{
                      fontSize: '10px',
                      fontWeight: 700,
                      padding: '2px 6px',
                      borderRadius: '3px',
                      backgroundColor: n.isSystemGenerated ? 'var(--bg-elevated)' : 'rgba(59, 130, 246, 0.15)',
                      color: n.isSystemGenerated ? 'var(--text-muted)' : 'var(--accent-primary, #3b82f6)',
                    }}
                  >
                    {n.isSystemGenerated ? 'SYSTEM GENERATED' : 'INVESTIGATOR LOG'}
                  </span>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {n.authorName || n.author?.name || 'Investigator'}
                  </span>
                </div>

                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  {new Date(n.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>

              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
                {n.content}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
