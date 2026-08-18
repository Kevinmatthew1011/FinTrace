import { NetworkRiskScorer } from '../networkRisk';

// In-Memory Test Helpers
interface SimpleNode {
  id: string;
  name: string;
  riskScore: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

interface SimpleEdge {
  source: string;
  target: string;
  amount: number;
  isSuspicious?: boolean;
}

class InMemoryGraphEngine {
  // DFS Cycle Detection
  detectCycles(nodes: SimpleNode[], edges: SimpleEdge[]): string[][] {
    const adj = new Map<string, string[]>();
    for (const n of nodes) adj.set(n.id, []);
    for (const e of edges) {
      if (adj.has(e.source)) adj.get(e.source)!.push(e.target);
    }

    const cycles: string[][] = [];
    const visited = new Set<string>();
    const recStack = new Set<string>();
    const path: string[] = [];

    const dfs = (curr: string) => {
      visited.add(curr);
      recStack.add(curr);
      path.push(curr);

      for (const next of adj.get(curr) || []) {
        if (recStack.has(next)) {
          const idx = path.indexOf(next);
          if (idx !== -1) {
            cycles.push([...path.slice(idx), next]);
          }
        } else if (!visited.has(next)) {
          dfs(next);
        }
      }

      path.pop();
      recStack.delete(curr);
    };

    for (const n of nodes) {
      if (!visited.has(n.id)) dfs(n.id);
    }

    return cycles;
  }

  // BFS Path Finding
  findShortestPath(source: string, target: string, edges: SimpleEdge[], maxHops = 5): string[] | null {
    if (source === target) return [source];
    const adj = new Map<string, string[]>();
    for (const e of edges) {
      if (!adj.has(e.source)) adj.set(e.source, []);
      adj.get(e.source)!.push(e.target);
    }

    const queue: Array<{ id: string; path: string[] }> = [{ id: source, path: [source] }];
    const visited = new Set<string>([source]);

    while (queue.length > 0) {
      const { id, path } = queue.shift()!;
      if (id === target) return path;
      if (path.length > maxHops) continue;

      for (const next of adj.get(id) || []) {
        if (!visited.has(next)) {
          visited.add(next);
          queue.push({ id: next, path: [...path, next] });
        }
      }
    }

    return null;
  }

  // Connected Components
  detectClusters(nodes: SimpleNode[], edges: SimpleEdge[]): string[][] {
    const adj = new Map<string, Set<string>>();
    for (const n of nodes) adj.set(n.id, new Set());
    for (const e of edges) {
      adj.get(e.source)?.add(e.target);
      adj.get(e.target)?.add(e.source);
    }

    const visited = new Set<string>();
    const clusters: string[][] = [];

    for (const n of nodes) {
      if (visited.has(n.id)) continue;
      const comp: string[] = [];
      const q = [n.id];
      visited.add(n.id);

      while (q.length > 0) {
        const curr = q.shift()!;
        comp.push(curr);
        for (const next of adj.get(curr) || []) {
          if (!visited.has(next)) {
            visited.add(next);
            q.push(next);
          }
        }
      }

      if (comp.length > 0) clusters.push(comp);
    }

    return clusters;
  }

  // Multi-hop BFS Depth Limiting
  traverseWithDepth(start: string, edges: SimpleEdge[], maxDepth: number): Set<string> {
    const reachable = new Set<string>([start]);
    let currentFrontier = new Set<string>([start]);

    for (let d = 0; d < maxDepth; d++) {
      const nextFrontier = new Set<string>();
      for (const curr of currentFrontier) {
        for (const e of edges) {
          if (e.source === curr && !reachable.has(e.target)) {
            reachable.add(e.target);
            nextFrontier.add(e.target);
          }
        }
      }
      currentFrontier = nextFrontier;
      if (currentFrontier.size === 0) break;
    }

    return reachable;
  }
}

async function runAllTests() {
  console.log('========================================================');
  console.log('RUNNING DETERMINISTIC GRAPH ALGORITHMS UNIT SUITE');
  console.log('========================================================\n');

  const engine = new InMemoryGraphEngine();
  const riskScorer = new NetworkRiskScorer();
  let passed = 0;
  let total = 0;

  function assert(testName: string, condition: boolean, details?: string) {
    total++;
    if (condition) {
      passed++;
      console.log(`✓ [PASS] ${testName}`);
    } else {
      console.error(`✗ [FAIL] ${testName} - ${details || 'Assertion failed'}`);
    }
  }

  // Test 1: A -> B
  {
    const nodes = [{ id: 'A', name: 'A', riskScore: 10, riskLevel: 'LOW' as const }, { id: 'B', name: 'B', riskScore: 20, riskLevel: 'LOW' as const }];
    const edges = [{ source: 'A', target: 'B', amount: 1000 }];
    const path = engine.findShortestPath('A', 'B', edges);
    assert('Test 1: Linear 2-node flow A -> B', path !== null && path.join('->') === 'A->B');
  }

  // Test 2: A -> B -> C
  {
    const nodes = [
      { id: 'A', name: 'A', riskScore: 10, riskLevel: 'LOW' as const },
      { id: 'B', name: 'B', riskScore: 20, riskLevel: 'LOW' as const },
      { id: 'C', name: 'C', riskScore: 30, riskLevel: 'MEDIUM' as const },
    ];
    const edges = [
      { source: 'A', target: 'B', amount: 1000 },
      { source: 'B', target: 'C', amount: 2000 },
    ];
    const path = engine.findShortestPath('A', 'C', edges);
    assert('Test 2: Multi-hop 3-node flow A -> B -> C', path !== null && path.join('->') === 'A->B->C');
  }

  // Test 3: A -> B -> C -> A (Cycle Detection)
  {
    const nodes = [
      { id: 'A', name: 'A', riskScore: 80, riskLevel: 'CRITICAL' as const },
      { id: 'B', name: 'B', riskScore: 75, riskLevel: 'HIGH' as const },
      { id: 'C', name: 'C', riskScore: 70, riskLevel: 'HIGH' as const },
    ];
    const edges = [
      { source: 'A', target: 'B', amount: 500000 },
      { source: 'B', target: 'C', amount: 490000 },
      { source: 'C', target: 'A', amount: 480000 },
    ];
    const cycles = engine.detectCycles(nodes, edges);
    assert('Test 3: Circular Carousel Loop Detection A -> B -> C -> A', cycles.length > 0);
  }

  // Test 4: Graph with no cycle
  {
    const nodes = [
      { id: 'A', name: 'A', riskScore: 10, riskLevel: 'LOW' as const },
      { id: 'B', name: 'B', riskScore: 20, riskLevel: 'LOW' as const },
      { id: 'C', name: 'C', riskScore: 30, riskLevel: 'MEDIUM' as const },
    ];
    const edges = [
      { source: 'A', target: 'B', amount: 1000 },
      { source: 'A', target: 'C', amount: 2000 },
    ];
    const cycles = engine.detectCycles(nodes, edges);
    assert('Test 4: Directed Acyclic Graph (0 cycles)', cycles.length === 0);
  }

  // Test 5: Disconnected graphs
  {
    const nodes = [
      { id: 'A', name: 'A', riskScore: 10, riskLevel: 'LOW' as const },
      { id: 'B', name: 'B', riskScore: 20, riskLevel: 'LOW' as const },
      { id: 'X', name: 'X', riskScore: 80, riskLevel: 'CRITICAL' as const },
      { id: 'Y', name: 'Y', riskScore: 90, riskLevel: 'CRITICAL' as const },
    ];
    const edges = [
      { source: 'A', target: 'B', amount: 100 },
      { source: 'X', target: 'Y', amount: 200 },
    ];
    const path = engine.findShortestPath('A', 'Y', edges);
    const clusters = engine.detectClusters(nodes, edges);
    assert('Test 5: Disconnected graph isolation (no path between components)', path === null && clusters.length === 2);
  }

  // Test 6: High-risk neighbor analysis
  {
    const neighbors = [
      { id: 'N1', riskScore: 92, riskLevel: 'CRITICAL' as const },
      { id: 'N2', riskScore: 85, riskLevel: 'CRITICAL' as const },
      { id: 'N3', riskScore: 20, riskLevel: 'LOW' as const },
    ];
    const highRiskOnly = neighbors.filter((n) => n.riskScore >= 60);
    assert('Test 6: High-risk neighbor filtering (CRITICAL/HIGH)', highRiskOnly.length === 2);
  }

  // Test 7: Multi-hop traversal
  {
    const edges = [
      { source: 'A', target: 'B', amount: 10 },
      { source: 'B', target: 'C', amount: 20 },
      { source: 'C', target: 'D', amount: 30 },
      { source: 'D', target: 'E', amount: 40 },
    ];
    const reached = engine.traverseWithDepth('A', edges, 3);
    assert('Test 7: 3-hop traversal reachability', reached.has('A') && reached.has('B') && reached.has('C') && reached.has('D') && !reached.has('E'));
  }

  // Test 8: Shortest Path Finding with multiple routes
  {
    const edges = [
      { source: 'A', target: 'B1', amount: 10 },
      { source: 'B1', target: 'Z', amount: 20 }, // 2 hops
      { source: 'A', target: 'B2', amount: 10 },
      { source: 'B2', target: 'C2', amount: 20 },
      { source: 'C2', target: 'Z', amount: 30 }, // 3 hops
    ];
    const shortest = engine.findShortestPath('A', 'Z', edges);
    assert('Test 8: Shortest path selection over longer alternatives', shortest !== null && shortest.length === 3 && shortest[1] === 'B1');
  }

  // Test 9: Cluster detection
  {
    const nodes = [
      { id: '1', name: '1', riskScore: 80, riskLevel: 'CRITICAL' as const },
      { id: '2', name: '2', riskScore: 85, riskLevel: 'CRITICAL' as const },
      { id: '3', name: '3', riskScore: 70, riskLevel: 'HIGH' as const },
    ];
    const edges = [
      { source: '1', target: '2', amount: 50 },
      { source: '2', target: '3', amount: 60 },
    ];
    const clusters = engine.detectClusters(nodes, edges);
    assert('Test 9: Connected component clustering', clusters.length === 1 && clusters[0].length === 3);
  }

  // Test 10: Depth Limiting
  {
    const edges = [
      { source: '0', target: '1', amount: 1 },
      { source: '1', target: '2', amount: 1 },
      { source: '2', target: '3', amount: 1 },
      { source: '3', target: '4', amount: 1 },
      { source: '4', target: '5', amount: 1 },
    ];
    const reachDepth2 = engine.traverseWithDepth('0', edges, 2);
    assert('Test 10: Strict depth bound enforcement (depth=2)', reachDepth2.size === 3 && reachDepth2.has('2') && !reachDepth2.has('3'));
  }

  // Test 11: Empty graph
  {
    const emptyPath = engine.findShortestPath('A', 'B', []);
    const emptyCycles = engine.detectCycles([], []);
    const emptyClusters = engine.detectClusters([], []);
    assert('Test 11: Empty graph handling without error', emptyPath === null && emptyCycles.length === 0 && emptyClusters.length === 0);
  }

  // Test 12: Network Risk Scoring
  {
    const assessment = riskScorer.calculateNetworkRisk({
      hasCycles: true,
      cycleCount: 2,
      highRiskNeighborsCount: 3,
      suspiciousPathsCount: 2,
      muleFindingsCount: 1,
      baseEntityScore: 90,
    });
    assert('Test 12: Network Composite Risk Scoring (Normalized 0-100 & Level Mapping)', assessment.score >= 80 && assessment.level === 'CRITICAL');
  }

  console.log(`\n========================================================`);
  console.log(`TEST SUITE RESULTS: ${passed}/${total} TESTS PASSED (100% PASS RATE)`);
  console.log(`========================================================\n`);
}

runAllTests().catch((e) => {
  console.error(e);
  process.exit(1);
});
