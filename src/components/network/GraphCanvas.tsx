'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { GraphNode, GraphEdge } from '@/modules/graph/graphTypes';

interface GraphCanvasProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  rootId?: string;
  selectedNodeId?: string | null;
  onSelectNode: (nodeId: string) => void;
  highlightedNodeIds?: string[];
  highlightedEdgeIds?: string[];
}

interface LayoutNode extends GraphNode {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

export const GraphCanvas: React.FC<GraphCanvasProps> = ({
  nodes,
  edges,
  rootId,
  selectedNodeId,
  onSelectNode,
  highlightedNodeIds = [],
  highlightedEdgeIds = [],
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [nodePositions, setNodePositions] = useState<Map<string, { x: number; y: number }>>(new Map());

  // Deterministic circular/layered layout initialization
  useEffect(() => {
    if (nodes.length === 0) return;

    const width = 800;
    const height = 550;
    const centerX = width / 2;
    const centerY = height / 2;

    const positions = new Map<string, { x: number; y: number }>();
    const entities = nodes.filter((n) => n.type === 'ENTITY');
    const accounts = nodes.filter((n) => n.type === 'ACCOUNT');

    // Place root entity at center
    const root = entities.find((e) => e.id === rootId) || entities[0];
    if (root) {
      positions.set(root.id, { x: centerX, y: centerY });
    }

    // Place other entities in outer circle
    const otherEntities = entities.filter((e) => e.id !== root?.id);
    const entityRadius = Math.min(260, Math.max(160, otherEntities.length * 35));

    otherEntities.forEach((e, i) => {
      const angle = (i / Math.max(1, otherEntities.length)) * 2 * Math.PI - Math.PI / 2;
      positions.set(e.id, {
        x: centerX + Math.cos(angle) * entityRadius,
        y: centerY + Math.sin(angle) * entityRadius,
      });
    });

    // Place accounts near their owning entities
    accounts.forEach((acc, i) => {
      const ownerPos = positions.get(acc.entityId || '') || { x: centerX, y: centerY };
      const accAngle = (i * 1.3) % (2 * Math.PI);
      const accDist = 70 + (i % 3) * 15;
      positions.set(acc.id, {
        x: ownerPos.x + Math.cos(accAngle) * accDist,
        y: ownerPos.y + Math.sin(accAngle) * accDist,
      });
    });

    setNodePositions(positions);
    setPan({ x: 0, y: 0 });
    setZoom(1);
  }, [nodes, rootId]);

  // Pan interaction
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target === containerRef.current || (e.target as HTMLElement).tagName === 'svg') {
      setIsDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
    }
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleZoomIn = () => setZoom((z) => Math.min(2.5, z + 0.2));
  const handleZoomOut = () => setZoom((z) => Math.max(0.4, z - 0.2));
  const handleResetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const highlightNodeSet = useMemo(() => new Set(highlightedNodeIds), [highlightedNodeIds]);
  const highlightEdgeSet = useMemo(() => new Set(highlightedEdgeIds), [highlightedEdgeIds]);

  return (
    <div
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      style={{
        position: 'relative',
        width: '100%',
        height: '560px',
        backgroundColor: '#0a0d14',
        border: '1px solid var(--border-subtle)',
        borderRadius: '8px',
        overflow: 'hidden',
        cursor: isDragging ? 'grabbing' : 'grab',
        userSelect: 'none',
      }}
    >
      {/* Canvas Controls Overlay */}
      <div
        style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          display: 'flex',
          gap: '6px',
          zIndex: 20,
          backgroundColor: 'rgba(15, 23, 42, 0.85)',
          padding: '4px',
          borderRadius: '6px',
          border: '1px solid var(--border-subtle)',
          backdropFilter: 'blur(4px)',
        }}
      >
        <button onClick={handleZoomIn} className="btn-secondary" style={{ padding: '4px 8px', fontSize: '12px' }} title="Zoom In">
          +
        </button>
        <button onClick={handleZoomOut} className="btn-secondary" style={{ padding: '4px 8px', fontSize: '12px' }} title="Zoom Out">
          -
        </button>
        <button onClick={handleResetView} className="btn-secondary" style={{ padding: '4px 8px', fontSize: '11px' }} title="Reset View">
          Reset
        </button>
      </div>

      {/* Legend Overlay */}
      <div
        style={{
          position: 'absolute',
          bottom: '12px',
          left: '12px',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '12px',
          zIndex: 20,
          backgroundColor: 'rgba(15, 23, 42, 0.85)',
          padding: '8px 12px',
          borderRadius: '6px',
          border: '1px solid var(--border-subtle)',
          fontSize: '11px',
          color: 'var(--text-secondary)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '2px', backgroundColor: '#ef4444' }} />
          <span>Critical Risk</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '2px', backgroundColor: '#f97316' }} />
          <span>High Risk</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '2px', backgroundColor: '#38bdf8' }} />
          <span>Low/Normal Risk</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '50%', border: '2px dashed #a855f7' }} />
          <span>Account Node</span>
        </div>
      </div>

      {/* SVG Rendering Layer */}
      <svg
        width="100%"
        height="100%"
        style={{ position: 'absolute', inset: 0 }}
      >
        <defs>
          <marker
            id="arrowhead-normal"
            markerWidth="8"
            markerHeight="6"
            refX="7"
            refY="3"
            orient="auto"
          >
            <polygon points="0 0, 8 3, 0 6" fill="#475569" />
          </marker>
          <marker
            id="arrowhead-critical"
            markerWidth="8"
            markerHeight="6"
            refX="7"
            refY="3"
            orient="auto"
          >
            <polygon points="0 0, 8 3, 0 6" fill="#ef4444" />
          </marker>
          <marker
            id="arrowhead-highlight"
            markerWidth="8"
            markerHeight="6"
            refX="7"
            refY="3"
            orient="auto"
          >
            <polygon points="0 0, 8 3, 0 6" fill="#38bdf8" />
          </marker>
        </defs>

        <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
          {/* 1. Render Edges */}
          {edges.map((edge) => {
            const srcPos = nodePositions.get(edge.source);
            const tgtPos = nodePositions.get(edge.target);
            if (!srcPos || !tgtPos) return null;

            const isHighlighted = highlightEdgeSet.has(edge.transactionId || edge.id);
            const isSuspicious = edge.isSuspicious || (edge.riskScore && edge.riskScore >= 60);
            const isOwnership = edge.type === 'OWNS_ACCOUNT';

            const strokeColor = isHighlighted
              ? '#38bdf8'
              : isSuspicious
              ? '#ef4444'
              : isOwnership
              ? '#334155'
              : '#475569';

            const strokeWidth = isHighlighted ? 3 : isSuspicious ? 2 : 1.2;
            const strokeDash = isOwnership ? '3,3' : 'none';
            const marker = isOwnership
              ? undefined
              : isHighlighted
              ? 'url(#arrowhead-highlight)'
              : isSuspicious
              ? 'url(#arrowhead-critical)'
              : 'url(#arrowhead-normal)';

            const midX = (srcPos.x + tgtPos.x) / 2;
            const midY = (srcPos.y + tgtPos.y) / 2;

            return (
              <g key={edge.id}>
                <line
                  x1={srcPos.x}
                  y1={srcPos.y}
                  x2={tgtPos.x}
                  y2={tgtPos.y}
                  stroke={strokeColor}
                  strokeWidth={strokeWidth}
                  strokeDasharray={strokeDash}
                  markerEnd={marker}
                />
                {edge.amount && !isOwnership && (
                  <g transform={`translate(${midX}, ${midY})`}>
                    <rect
                      x="-35"
                      y="-9"
                      width="70"
                      height="18"
                      rx="3"
                      fill="#0f172a"
                      stroke={strokeColor}
                      strokeWidth="0.8"
                    />
                    <text
                      textAnchor="middle"
                      dy="3.5"
                      fill={isSuspicious ? '#fca5a5' : '#cbd5e1'}
                      fontSize="9"
                      fontFamily="monospace"
                      fontWeight="600"
                    >
                      ₹{(edge.amount / 1000).toFixed(0)}k
                    </text>
                  </g>
                )}
              </g>
            );
          })}

          {/* 2. Render Nodes */}
          {nodes.map((node) => {
            const pos = nodePositions.get(node.id);
            if (!pos) return null;

            const isSelected = selectedNodeId === node.id;
            const isHighlighted = highlightNodeSet.has(node.id);
            const isRoot = node.id === rootId;
            const isEntity = node.type === 'ENTITY';

            const riskColor =
              node.riskLevel === 'CRITICAL'
                ? '#ef4444'
                : node.riskLevel === 'HIGH'
                ? '#f97316'
                : node.riskLevel === 'MEDIUM'
                ? '#eab308'
                : '#38bdf8';

            return (
              <g
                key={node.id}
                transform={`translate(${pos.x}, ${pos.y})`}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectNode(node.id);
                }}
                style={{ cursor: 'pointer' }}
              >
                {/* Active/Highlight Ring */}
                {(isSelected || isHighlighted || isRoot) && (
                  <circle
                    r={isEntity ? 28 : 20}
                    fill="none"
                    stroke={isSelected ? '#38bdf8' : isHighlighted ? '#a855f7' : '#ef4444'}
                    strokeWidth="2.5"
                    strokeDasharray={isHighlighted ? '4,4' : 'none'}
                  />
                )}

                {/* Node Shape */}
                {isEntity ? (
                  <rect
                    x="-22"
                    y="-14"
                    width="44"
                    height="28"
                    rx="6"
                    fill="#1e293b"
                    stroke={riskColor}
                    strokeWidth={node.riskScore >= 60 ? '2' : '1.2'}
                  />
                ) : (
                  <circle
                    r="14"
                    fill="#0f172a"
                    stroke={riskColor}
                    strokeWidth="1.5"
                    strokeDasharray={node.isMule ? '3,2' : 'none'}
                  />
                )}

                {/* Node Glyph */}
                <text
                  textAnchor="middle"
                  dy="4"
                  fill="white"
                  fontSize={isEntity ? '11' : '9'}
                  fontWeight="700"
                >
                  {isEntity ? (node.entityType === 'SHELL_COMPANY' ? '🏢' : '👤') : '💳'}
                </text>

                {/* Node Label */}
                <text
                  textAnchor="middle"
                  y={isEntity ? 26 : 22}
                  fill="var(--text-primary)"
                  fontSize="10"
                  fontWeight="600"
                  style={{ textShadow: '0 1px 3px rgba(0,0,0,0.9)' }}
                >
                  {node.label.length > 18 ? node.label.slice(0, 16) + '…' : node.label}
                </text>

                {/* Node Sublabel */}
                <text
                  textAnchor="middle"
                  y={isEntity ? 37 : 32}
                  fill="var(--text-muted)"
                  fontSize="8"
                  fontFamily="monospace"
                >
                  {node.id}
                </text>
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
};
