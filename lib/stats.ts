import { Edges } from './data-structures/graph.ds.interface';

export interface ProjectStats {
  name: string;
  /** Number of edges pointing _at_ this project. */
  fanIn: number;
  /** Number of edges leaving this project. */
  fanOut: number;
}

export interface GraphStats {
  nodes: number;
  edges: number;
  /** Projects with no incoming edges (entry points). Sorted ascending. */
  roots: string[];
  /** Projects with no outgoing edges (pure leaves). Sorted ascending. */
  leaves: string[];
  /** True if the graph contains at least one directed cycle. */
  hasCycles: boolean;
  /**
   * Number of edges in the longest dependency path. `null` when the graph
   * contains a cycle (the concept is undefined in that case).
   */
  maxDepth: number | null;
  /**
   * One example of a longest path (sequence of node names). `null` when the
   * graph has cycles, is empty, or has no edges.
   */
  longestPath: string[] | null;
  /**
   * All projects, sorted by `(fanIn desc, fanOut desc, name asc)` so the most
   * "load-bearing" projects appear first.
   */
  projects: ProjectStats[];
}

/**
 * Compute counts, hubs, and the longest dependency path for a graph.
 *
 * Runs in O(V + E). DFS is recursive; on Node 22 the default stack handles
 * dependency graphs comfortably larger than any real-world Nx workspace.
 */
export function computeStats(graph: Edges<string>): GraphStats {
  // Build the node set from keys ∪ targets so we are robust to hand-rolled
  // `Edges<string>` values where a dependency target was not declared as its
  // own key. (The loader and `DiGraph` always declare targets, so this only
  // matters for direct callers of the public API.)
  const declared = new Set<string>(Object.keys(graph));
  for (const targets of Object.values(graph)) {
    for (const t of targets) declared.add(t);
  }
  const nodes = [...declared];

  const fanIn = new Map<string, number>();
  const fanOut = new Map<string, number>();
  for (const n of nodes) {
    fanIn.set(n, 0);
    fanOut.set(n, 0);
  }

  let edgeCount = 0;
  for (const src of nodes) {
    const targets = graph[src] ?? [];
    fanOut.set(src, targets.length);
    edgeCount += targets.length;
    for (const dst of targets) {
      fanIn.set(dst, (fanIn.get(dst) as number) + 1);
    }
  }

  const roots = nodes.filter((n) => fanIn.get(n) === 0).sort();
  const leaves = nodes.filter((n) => fanOut.get(n) === 0).sort();

  // DFS with three-colour cycle detection + memoised longest path.
  const WHITE = 0;
  const GRAY = 1;
  const BLACK = 2;
  const color = new Map<string, number>();
  for (const n of nodes) color.set(n, WHITE);
  const memo = new Map<string, { depth: number; path: string[] }>();
  let hasCycles = false;

  const dfs = (n: string): { depth: number; path: string[] } => {
    const cached = memo.get(n);
    if (cached) return cached;
    if (color.get(n) === GRAY) {
      hasCycles = true;
      return { depth: 0, path: [n] };
    }
    color.set(n, GRAY);
    let best: { depth: number; path: string[] } = { depth: 0, path: [n] };
    for (const child of graph[n] ?? []) {
      const sub = dfs(child);
      if (sub.depth + 1 > best.depth) {
        best = { depth: sub.depth + 1, path: [n, ...sub.path] };
      }
    }
    color.set(n, BLACK);
    memo.set(n, best);
    return best;
  };

  let longest: { depth: number; path: string[] } = { depth: 0, path: [] };
  for (const n of nodes) {
    const result = dfs(n);
    if (result.depth > longest.depth) longest = result;
  }

  const maxDepth = hasCycles ? null : longest.depth;
  const longestPath = hasCycles || longest.depth === 0 ? null : longest.path;

  const projects: ProjectStats[] = nodes
    .map((n) => ({
      name: n,
      fanIn: fanIn.get(n) as number,
      fanOut: fanOut.get(n) as number,
    }))
    .sort((a, b) => b.fanIn - a.fanIn || b.fanOut - a.fanOut || a.name.localeCompare(b.name));

  return {
    nodes: nodes.length,
    edges: edgeCount,
    roots,
    leaves,
    hasCycles,
    maxDepth,
    longestPath,
    projects,
  };
}
