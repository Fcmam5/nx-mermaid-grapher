import { Edges } from './data-structures/graph.ds.interface';
import { computeStats } from './stats';

/**
 * Return a copy of `graph` with the given libraries removed both as sources
 * and as targets. Useful for trimming noise before rendering or computing
 * stats — e.g. `formatGraph(excludeLibs(g, ['noisy-lib']), 'mermaid')`.
 *
 * Returns the input reference unchanged when `excluded` is empty.
 */
export function excludeLibs(graph: Edges<string>, excluded: readonly string[]): Edges<string> {
  if (excluded.length === 0) return graph;
  const blocklist = new Set(excluded);
  const result: Edges<string> = {};
  for (const [lib, deps] of Object.entries(graph)) {
    if (blocklist.has(lib)) continue;
    result[lib] = deps.filter((dep) => !blocklist.has(dep));
  }
  return result;
}

export type OutputFormat = 'mermaid' | 'edges' | 'json' | 'dot' | 'stats';

export const OUTPUT_FORMATS: readonly OutputFormat[] = ['mermaid', 'edges', 'json', 'dot', 'stats'];

export function isOutputFormat(value: string): value is OutputFormat {
  return (OUTPUT_FORMATS as readonly string[]).includes(value);
}

/**
 * Render a dependency graph in the requested format.
 *
 * - `mermaid` — `graph LR` body with one edge per indented line. Isolated nodes
 *   are omitted (they cannot be expressed as an edge).
 * - `edges` — minimal whitespace-separated edge list, one `source target` pair
 *   per line. Designed for cheap token consumption by AI agents.
 * - `json` — `{ "nodes": [...], "edges": [["src", "dst"], ...] }`. Includes
 *   isolated nodes so the topology can be reconstructed faithfully.
 * - `dot` — Graphviz `digraph` declaration, ready to pipe into `dot -Tsvg`.
 * - `stats` — human-readable summary (counts, roots/leaves, max depth, cycle
 *   flag, per-project fan-in/fan-out). Designed for AI agents and humans who
 *   want a single token-cheap snapshot of workspace shape.
 */
export function formatGraph(edges: Edges<string>, format: OutputFormat): string {
  switch (format) {
    case 'mermaid':
      return formatMermaid(edges);
    case 'edges':
      return formatEdges(edges);
    case 'json':
      return formatJson(edges);
    case 'dot':
      return formatDot(edges);
    case 'stats':
      return formatStats(edges);
  }
}

function withOutgoing(edges: Edges<string>): string[] {
  return Object.keys(edges).filter((lib) => edges[lib].length > 0);
}

function formatMermaid(edges: Edges<string>): string {
  const lines = withOutgoing(edges).flatMap((lib) => edges[lib].map((dep) => `  ${lib} --> ${dep}\n`));
  return `graph LR\n${lines.join('')}`;
}

function formatEdges(edges: Edges<string>): string {
  const lines = withOutgoing(edges).flatMap((lib) => edges[lib].map((dep) => `${lib} ${dep}\n`));
  return lines.join('');
}

function formatJson(edges: Edges<string>): string {
  const nodes = Object.keys(edges);
  const edgeList: [string, string][] = nodes.flatMap((src) => edges[src].map((dst) => [src, dst] as [string, string]));
  return JSON.stringify({ nodes, edges: edgeList });
}

function formatDot(edges: Edges<string>): string {
  const lines: string[] = ['digraph G {'];
  for (const node of Object.keys(edges)) {
    lines.push(`  "${node}";`);
  }
  for (const src of withOutgoing(edges)) {
    for (const dst of edges[src]) {
      lines.push(`  "${src}" -> "${dst}";`);
    }
  }
  lines.push('}');
  return `${lines.join('\n')}\n`;
}

function formatStats(edges: Edges<string>): string {
  const s = computeStats(edges);
  const lines: string[] = ['graph stats'];
  lines.push(`  nodes:     ${s.nodes}`);
  lines.push(`  edges:     ${s.edges}`);

  lines.push(`  roots:     ${s.roots.length}`);
  for (const r of s.roots) lines.push(`    ${r}`);

  lines.push(`  leaves:    ${s.leaves.length}`);
  for (const l of s.leaves) lines.push(`    ${l}`);

  lines.push(`  cycles:    ${s.hasCycles ? 'yes (max depth omitted)' : 'none'}`);

  if (!s.hasCycles) {
    lines.push(`  max depth: ${s.maxDepth}`);
    if (s.longestPath) {
      lines.push(`    ${s.longestPath.join(' -> ')}`);
    }
  }

  if (s.projects.length > 0) {
    lines.push('');
    lines.push('per-project (fan-in / fan-out):');
    const maxLen = Math.max(...s.projects.map((p) => p.name.length));
    for (const p of s.projects) {
      lines.push(`  ${p.name.padEnd(maxLen)}   ${p.fanIn} / ${p.fanOut}`);
    }
  }

  return `${lines.join('\n')}\n`;
}
