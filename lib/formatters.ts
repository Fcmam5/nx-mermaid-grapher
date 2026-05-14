import { Edges } from './data-structures/graph.ds.interface';

export type OutputFormat = 'mermaid' | 'edges' | 'json' | 'dot';

export const OUTPUT_FORMATS: readonly OutputFormat[] = ['mermaid', 'edges', 'json', 'dot'];

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
  }
}

function withOutgoing(edges: Edges<string>): string[] {
  return Object.keys(edges).filter((lib) => edges[lib].length > 0);
}

function formatMermaid(edges: Edges<string>): string {
  const lines = withOutgoing(edges).flatMap((lib) =>
    edges[lib].map((dep) => `  ${lib} --> ${dep}\n`),
  );
  return `graph LR\n${lines.join('')}`;
}

function formatEdges(edges: Edges<string>): string {
  const lines = withOutgoing(edges).flatMap((lib) =>
    edges[lib].map((dep) => `${lib} ${dep}\n`),
  );
  return lines.join('');
}

function formatJson(edges: Edges<string>): string {
  const nodes = Object.keys(edges);
  const edgeList: [string, string][] = nodes.flatMap((src) =>
    edges[src].map((dst) => [src, dst] as [string, string]),
  );
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
