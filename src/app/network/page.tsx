'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Header } from '@/components/common/Header';
import { GraphCanvas } from '@/components/network/GraphCanvas';
import { NodeInspector } from '@/components/network/NodeInspector';
import { FindingsPanel } from '@/components/network/FindingsPanel';
import { PathFinderPanel } from '@/components/network/PathFinderPanel';
import { FinancialGraph, GraphAnalysisResult, GraphNode, GraphEdge } from '@/modules/graph/graphTypes';
import { LoadingState, ErrorState } from '@/components/common/StateViews';

type RiskTier = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
type NodeType = 'ENTITY' | 'ACCOUNT';

interface NetworkFilterState {
  riskLevels: Set<RiskTier>;
  nodeTypes: Set<NodeType>;
  suspiciousOnly: boolean;
  minAmount: number;
}

const DEFAULT_FILTERS: NetworkFilterState = {
  riskLevels: new Set(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']),
  nodeTypes: new Set(['ENTITY', 'ACCOUNT']),
  suspiciousOnly: false,
  minAmount: 0,
};

export default function NetworkPage() {
  const [rootId, setRootId] = useState('ENT-8821'); // Apex Logistics by default
  const [depth, setDepth] = useState(2);
  const [activeTab, setActiveTab] = useState<'FINDINGS' | 'PATH' | 'CLUSTERS'>('FINDINGS');

  const [graphData, setGraphData] = useState<FinancialGraph | null>(null);
  const [analysisData, setAnalysisData] = useState<GraphAnalysisResult | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>('ENT-8821');
  const [highlightedNodes, setHighlightedNodes] = useState<string[]>([]);
  const [highlightedEdges, setHighlightedEdges] = useState<string[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Filtering System State
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState<NetworkFilterState>({
    riskLevels: new Set(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']),
    nodeTypes: new Set(['ENTITY', 'ACCOUNT']),
    suspiciousOnly: false,
    minAmount: 0,
  });
  const [tempFilters, setTempFilters] = useState<NetworkFilterState>({ ...filters });

  const loadNetwork = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [graphRes, analysisRes] = await Promise.all([
        fetch(`/api/v1/network?entityId=${encodeURIComponent(rootId)}&depth=${depth}`),
        fetch(`/api/v1/network/analysis?entityId=${encodeURIComponent(rootId)}`),
      ]);

      if (!graphRes.ok || !analysisRes.ok) {
        throw new Error('Failed to retrieve graph data from database');
      }

      const graphJson = await graphRes.json();
      const analysisJson = await analysisRes.json();

      if (graphJson.success && analysisJson.success) {
        setGraphData(graphJson.data);
        setAnalysisData(analysisJson.data);
        if (!selectedNodeId) setSelectedNodeId(rootId);
      } else {
        throw new Error(graphJson.error?.message || 'Graph API error');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to query graph');
    } finally {
      setLoading(false);
    }
  }, [rootId, depth, selectedNodeId]);

  useEffect(() => {
    loadNetwork();
  }, [loadNetwork]);

  // Compute active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.riskLevels.size < 4) count++;
    if (filters.nodeTypes.size < 2) count++;
    if (filters.suspiciousOnly) count++;
    if (filters.minAmount > 0) count++;
    return count;
  }, [filters]);

  // Apply visual filtering to graph nodes and edges
  const { filteredNodes, filteredEdges } = useMemo(() => {
    if (!graphData) return { filteredNodes: [], filteredEdges: [] };

    // Filter nodes
    const nodes = graphData.nodes.filter((node) => {
      // Always keep root node for navigation anchor
      if (node.id === rootId) return true;

      // Always keep explicitly selected node
      if (selectedNodeId && node.id === selectedNodeId) return true;

      // Node type check
      if (!filters.nodeTypes.has(node.type as NodeType)) return false;

      // Risk level check
      if (!filters.riskLevels.has(node.riskLevel as RiskTier)) return false;

      // Suspicious only check
      if (filters.suspiciousOnly && !node.isFlagged && !node.isMule && node.riskLevel !== 'CRITICAL' && node.riskLevel !== 'HIGH') {
        return false;
      }

      return true;
    });

    const nodeIdSet = new Set(nodes.map((n) => n.id));

    // Filter edges connecting surviving nodes
    const edges = graphData.edges.filter((edge) => {
      if (!nodeIdSet.has(edge.source) || !nodeIdSet.has(edge.target)) return false;
      if (filters.minAmount > 0 && (edge.amount || 0) < filters.minAmount) return false;
      return true;
    });

    return { filteredNodes: nodes, filteredEdges: edges };
  }, [graphData, rootId, selectedNodeId, filters]);

  const selectedNode: GraphNode | null =
    graphData?.nodes.find((n) => n.id === selectedNodeId) || null;

  const handleHighlight = (nodeIds: string[], edgeIds: string[] = []) => {
    setHighlightedNodes(nodeIds);
    setHighlightedEdges(edgeIds);
    if (nodeIds.length > 0) {
      setSelectedNodeId(nodeIds[0]);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setRootId(searchQuery.trim());
      setSelectedNodeId(searchQuery.trim());
      setSearchQuery('');
    }
  };

  const toggleRiskFilter = (tier: RiskTier) => {
    setTempFilters((prev) => {
      const next = new Set(prev.riskLevels);
      if (next.has(tier)) {
        if (next.size > 1) next.delete(tier);
      } else {
        next.add(tier);
      }
      return { ...prev, riskLevels: next };
    });
  };

  const toggleNodeTypeFilter = (type: NodeType) => {
    setTempFilters((prev) => {
      const next = new Set(prev.nodeTypes);
      if (next.has(type)) {
        if (next.size > 1) next.delete(type);
      } else {
        next.add(type);
      }
      return { ...prev, nodeTypes: next };
    });
  };

  const handleApplyFilters = () => {
    setFilters({ ...tempFilters });
    setIsFilterOpen(false);
  };

  const handleResetFilters = () => {
    const reset = {
      riskLevels: new Set<RiskTier>(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']),
      nodeTypes: new Set<NodeType>(['ENTITY', 'ACCOUNT']),
      suspiciousOnly: false,
      minAmount: 0,
    };
    setTempFilters(reset);
    setFilters(reset);
    setIsFilterOpen(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <Header />

      {/* Title & Stats Ribbon */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)' }}>
            Fraud Network & Graph Intelligence Engine
          </h1>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            Multi-hop relational graph generated from PostgreSQL 16 • Entity ➔ Account ➔ Transaction Flow
          </p>
        </div>

        {/* Depth, Search & Filter Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <form onSubmit={handleSearchSubmit} style={{ display: 'flex', alignItems: 'center' }}>
            <input
              type="text"
              placeholder="Search Entity ID (e.g. ENT-4109)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '4px 0 0 4px',
                padding: '6px 10px',
                fontSize: '12px',
                color: 'var(--text-primary)',
                outline: 'none',
              }}
            />
            <button
              type="submit"
              className="btn-primary"
              style={{ borderRadius: '0 4px 4px 0', padding: '6px 12px', fontSize: '12px' }}
            >
              Focus
            </button>
          </form>

          {/* Filters Button */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => {
                setTempFilters({ ...filters });
                setIsFilterOpen(!isFilterOpen);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                backgroundColor: activeFilterCount > 0 ? 'rgba(59, 130, 246, 0.15)' : 'var(--bg-card)',
                border: activeFilterCount > 0 ? '1px solid var(--accent-primary, #3b82f6)' : '1px solid var(--border-subtle)',
                color: activeFilterCount > 0 ? 'var(--accent-primary, #3b82f6)' : 'var(--text-primary)',
              }}
            >
              <span>⚙️ Filters ▾</span>
              {activeFilterCount > 0 && (
                <span
                  style={{
                    backgroundColor: 'var(--accent-primary, #3b82f6)',
                    color: '#ffffff',
                    fontSize: '10px',
                    fontWeight: 700,
                    borderRadius: '10px',
                    padding: '1px 6px',
                  }}
                >
                  {activeFilterCount}
                </span>
              )}
            </button>

            {/* Filter Popover Dropdown */}
            {isFilterOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: '110%',
                  right: 0,
                  width: '320px',
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '8px',
                  boxShadow: '0 10px 25px rgba(0, 0, 0, 0.5)',
                  padding: '18px',
                  zIndex: 50,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
                    Graph Density & Filter Rules
                  </span>
                  <button
                    onClick={() => setIsFilterOpen(false)}
                    style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '14px' }}
                  >
                    ✕
                  </button>
                </div>

                {/* Risk Level Filter */}
                <div>
                  <span style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
                    Risk Level:
                  </span>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                    {(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] as RiskTier[]).map((tier) => {
                      const isChecked = tempFilters.riskLevels.has(tier);
                      return (
                        <label
                          key={tier}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            fontSize: '11px',
                            color: 'var(--text-primary)',
                            cursor: 'pointer',
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleRiskFilter(tier)}
                          />
                          {tier}
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Node Type Filter */}
                <div>
                  <span style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
                    Node Type:
                  </span>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--text-primary)', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={tempFilters.nodeTypes.has('ENTITY')}
                        onChange={() => toggleNodeTypeFilter('ENTITY')}
                      />
                      Entity Nodes
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--text-primary)', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={tempFilters.nodeTypes.has('ACCOUNT')}
                        onChange={() => toggleNodeTypeFilter('ACCOUNT')}
                      />
                      Account Nodes
                    </label>
                  </div>
                </div>

                {/* Flags Filter */}
                <div>
                  <span style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
                    Special Flags:
                  </span>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--text-primary)', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={tempFilters.suspiciousOnly}
                      onChange={(e) => setTempFilters((prev) => ({ ...prev, suspiciousOnly: e.target.checked }))}
                    />
                    Suspicious / High-Risk Only
                  </label>
                </div>

                {/* Minimum Amount Filter */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                    <span>Min Transfer Volume:</span>
                    <span className="font-mono" style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                      ₹{(tempFilters.minAmount / 1000).toFixed(0)}k
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1000000"
                    step="50000"
                    value={tempFilters.minAmount}
                    onChange={(e) => setTempFilters((prev) => ({ ...prev, minAmount: Number(e.target.value) }))}
                    style={{ width: '100%' }}
                  />
                </div>

                {/* Filter Actions */}
                <div style={{ display: 'flex', gap: '8px', marginTop: '4px', borderTop: '1px solid var(--border-subtle)', paddingTop: '12px' }}>
                  <button
                    onClick={handleApplyFilters}
                    className="btn-primary"
                    style={{ flex: 1, padding: '6px 12px', fontSize: '11px', textAlign: 'center' }}
                  >
                    Apply Filters
                  </button>
                  <button
                    onClick={handleResetFilters}
                    className="btn-secondary"
                    style={{ padding: '6px 12px', fontSize: '11px' }}
                  >
                    Reset
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Depth Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: 'var(--bg-card)', padding: '3px', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', padding: '0 6px' }}>Depth:</span>
            {[1, 2, 3, 4, 5].map((d) => (
              <button
                key={d}
                onClick={() => setDepth(d)}
                style={{
                  padding: '3px 8px',
                  borderRadius: '4px',
                  border: 'none',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  backgroundColor: depth === d ? 'var(--accent-blue)' : 'transparent',
                  color: depth === d ? 'white' : 'var(--text-secondary)',
                }}
              >
                {d}H
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Network Stats Bar */}
      {graphData && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
            gap: '8px',
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '6px',
            padding: '10px 14px',
            fontSize: '11px',
          }}
        >
          <div>
            <span style={{ color: 'var(--text-muted)' }}>Root Subject:</span>
            <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{rootId}</div>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)' }}>Visible Nodes / Edges:</span>
            <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
              {filteredNodes.length} / {filteredEdges.length}
              {filteredNodes.length < graphData.statistics.nodeCount && (
                <span style={{ fontSize: '10px', color: 'var(--accent-primary, #3b82f6)', marginLeft: '4px', fontWeight: 500 }}>
                  (Filtered from {graphData.statistics.nodeCount})
                </span>
              )}
            </div>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)' }}>Entities / Accounts:</span>
            <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
              {filteredNodes.filter((n) => n.type === 'ENTITY').length} / {filteredNodes.filter((n) => n.type === 'ACCOUNT').length}
            </div>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)' }}>Suspicious Nodes:</span>
            <div style={{ fontWeight: 700, color: '#ef4444' }}>
              {filteredNodes.filter((n) => n.isFlagged || n.isMule || n.riskLevel === 'CRITICAL' || n.riskLevel === 'HIGH').length} Flagged
            </div>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)' }}>Network Risk:</span>
            <div style={{ fontWeight: 700, color: analysisData?.riskLevel === 'CRITICAL' ? '#ef4444' : '#f97316' }}>
              {analysisData?.networkRiskScore || 0}/100 ({analysisData?.riskLevel || 'LOW'})
            </div>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)' }}>Discovered Cycles:</span>
            <div style={{ fontWeight: 700, color: (analysisData?.cycles.length || 0) > 0 ? '#ef4444' : 'var(--text-primary)' }}>
              {analysisData?.cycles.length || 0} Loops
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <LoadingState message="Constructing relational fraud graph from PostgreSQL..." />
      ) : error ? (
        <ErrorState message={error} onRetry={loadNetwork} />
      ) : graphData && analysisData ? (
        <div style={{ display: 'grid', gridTemplateColumns: '2.3fr 1fr', gap: '16px', alignItems: 'start' }}>
          {/* Main Visual Graph Canvas */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <GraphCanvas
              nodes={filteredNodes}
              edges={filteredEdges}
              rootId={rootId}
              selectedNodeId={selectedNodeId}
              onSelectNode={(id) => setSelectedNodeId(id)}
              highlightedNodeIds={highlightedNodes}
              highlightedEdgeIds={highlightedEdges}
            />
          </div>

          {/* Right Investigation & Analysis Drawer */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* Node Inspector */}
            <NodeInspector
              node={selectedNode}
              onClose={() => setSelectedNodeId(null)}
              onSetRoot={(id) => setRootId(id)}
              onExpandDepth={() => setDepth((d) => Math.min(5, d + 1))}
            />

            {/* Analysis Tabs */}
            <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '14px' }}>
              <div style={{ display: 'flex', borderBottom: '1px solid var(--border-subtle)', gap: '8px', marginBottom: '12px', paddingBottom: '6px' }}>
                <button
                  onClick={() => setActiveTab('FINDINGS')}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    borderBottom: activeTab === 'FINDINGS' ? '2px solid var(--accent-blue)' : 'none',
                    color: activeTab === 'FINDINGS' ? 'var(--text-primary)' : 'var(--text-muted)',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    paddingBottom: '4px',
                  }}
                >
                  Findings ({analysisData.findings.length + analysisData.cycles.length})
                </button>

                <button
                  onClick={() => setActiveTab('PATH')}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    borderBottom: activeTab === 'PATH' ? '2px solid var(--accent-blue)' : 'none',
                    color: activeTab === 'PATH' ? 'var(--text-primary)' : 'var(--text-muted)',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    paddingBottom: '4px',
                  }}
                >
                  Path Finder
                </button>

                <button
                  onClick={() => setActiveTab('CLUSTERS')}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    borderBottom: activeTab === 'CLUSTERS' ? '2px solid var(--accent-blue)' : 'none',
                    color: activeTab === 'CLUSTERS' ? 'var(--text-primary)' : 'var(--text-muted)',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    paddingBottom: '4px',
                  }}
                >
                  Clusters ({analysisData.clusters.length})
                </button>
              </div>

              {activeTab === 'FINDINGS' && (
                <FindingsPanel
                  findings={analysisData.findings}
                  cycles={analysisData.cycles}
                  onHighlightNodes={handleHighlight}
                />
              )}

              {activeTab === 'PATH' && (
                <PathFinderPanel onHighlightPath={handleHighlight} />
              )}

              {activeTab === 'CLUSTERS' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {analysisData.clusters.map((cl) => (
                    <div key={cl.id} style={{ padding: '10px', backgroundColor: 'var(--bg-secondary)', borderRadius: '6px', fontSize: '11px' }}>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{cl.name}</div>
                      <div style={{ color: 'var(--text-muted)', margin: '2px 0' }}>{cl.typologyHint}</div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
                        <span style={{ color: '#ef4444', fontWeight: 600 }}>{cl.suspiciousTxCount} Suspicious Txns</span>
                        <button
                          onClick={() => handleHighlight(cl.memberNodeIds)}
                          className="btn-secondary"
                          style={{ padding: '2px 6px', fontSize: '10px' }}
                        >
                          Highlight Cluster
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
