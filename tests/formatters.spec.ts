import { Edges } from '../lib/data-structures/graph.ds.interface';
import { OUTPUT_FORMATS, OutputFormat, excludeLibs, formatGraph, isOutputFormat } from '../lib/formatters';

const SAMPLE: Edges<string> = {
  a: ['b', 'c'],
  b: ['c'],
  c: [], // isolated (no outgoing edges)
};

describe('isOutputFormat', () => {
  it.each(OUTPUT_FORMATS)('accepts %s', (fmt) => {
    expect(isOutputFormat(fmt)).toBe(true);
  });

  it('rejects unknown values', () => {
    expect(isOutputFormat('graphviz')).toBe(false);
    expect(isOutputFormat('')).toBe(false);
  });
});

describe('formatGraph', () => {
  describe('mermaid', () => {
    it('emits a graph LR block with one indented edge per line', () => {
      expect(formatGraph(SAMPLE, 'mermaid')).toBe('graph LR\n  a --> b\n  a --> c\n  b --> c\n');
    });

    it('omits isolated nodes (no outgoing edges)', () => {
      expect(formatGraph({ orphan: [] }, 'mermaid')).toBe('graph LR\n');
    });
  });

  describe('edges', () => {
    it('emits a plain "src dst" line per edge', () => {
      expect(formatGraph(SAMPLE, 'edges')).toBe('a b\na c\nb c\n');
    });

    it('produces empty output when there are no edges', () => {
      expect(formatGraph({ orphan: [] }, 'edges')).toBe('');
    });
  });

  describe('json', () => {
    it('emits compact JSON with the full node list (incl. isolated) and edge pairs', () => {
      const out = JSON.parse(formatGraph(SAMPLE, 'json'));
      expect(out).toEqual({
        nodes: ['a', 'b', 'c'],
        edges: [
          ['a', 'b'],
          ['a', 'c'],
          ['b', 'c'],
        ],
      });
    });

    it('is single-line (compact) so it is cheap to consume', () => {
      expect(formatGraph(SAMPLE, 'json')).not.toContain('\n');
    });

    it('includes nodes that are only targets and never sources', () => {
      const out = formatGraph({ a: ['b'] }, 'json');
      const parsed = JSON.parse(out) as { nodes: string[]; edges: [string, string][] };
      expect(parsed.nodes).toContain('a');
      expect(parsed.nodes).toContain('b');
      expect(parsed.edges).toEqual([['a', 'b']]);
    });
  });

  describe('dot', () => {
    it('emits a digraph declaration with quoted nodes and edges', () => {
      const out = formatGraph(SAMPLE, 'dot');
      expect(out.startsWith('digraph G {\n')).toBe(true);
      expect(out.trimEnd().endsWith('}')).toBe(true);
      expect(out).toContain('  "a";');
      expect(out).toContain('  "c";'); // isolated node still declared
      expect(out).toContain('  "a" -> "b";');
      expect(out).toContain('  "b" -> "c";');
    });
  });

  describe('stats', () => {
    it('emits a readable summary block with the expected sections', () => {
      const out = formatGraph(SAMPLE, 'stats');

      expect(out.startsWith('graph stats\n')).toBe(true);
      expect(out).toMatch(/nodes:\s+3/);
      expect(out).toMatch(/edges:\s+3/);
      expect(out).toMatch(/roots:\s+1/);
      expect(out).toMatch(/leaves:\s+1/);
      expect(out).toMatch(/cycles:\s+none/);
      expect(out).toMatch(/max depth:\s+2/);
      expect(out).toContain('a -> b -> c');
      expect(out).toContain('per-project (fan-in / fan-out):');
      // Node `c` is the most depended-on, so it lists first.
      const perProject = out.split('per-project (fan-in / fan-out):\n')[1];
      expect(perProject.trimStart().startsWith('c ')).toBe(true);
    });

    it('omits the per-project section for an empty graph', () => {
      const out = formatGraph({}, 'stats');
      expect(out).toMatch(/nodes:\s+0/);
      expect(out).toMatch(/edges:\s+0/);
      expect(out).not.toContain('per-project');
    });

    it('flags cycles and omits max depth', () => {
      const out = formatGraph({ a: ['b'], b: ['a'] }, 'stats');
      expect(out).toMatch(/cycles:\s+yes/);
      expect(out).not.toContain('max depth:');
    });
  });

  it('is exhaustive over OUTPUT_FORMATS (no format silently falls through)', () => {
    for (const fmt of OUTPUT_FORMATS) {
      expect(typeof formatGraph(SAMPLE, fmt as OutputFormat)).toBe('string');
    }
  });
});

describe('excludeLibs', () => {
  it('returns the input reference unchanged when no libs are excluded', () => {
    expect(excludeLibs(SAMPLE, [])).toBe(SAMPLE);
  });

  it('drops the excluded libs as both sources and targets', () => {
    const out = excludeLibs(SAMPLE, ['b']);
    expect(out).toEqual({ a: ['c'], c: [] });
    // Original is untouched.
    expect(SAMPLE).toEqual({ a: ['b', 'c'], b: ['c'], c: [] });
  });

  it('handles multiple exclusions and never leaves dangling edges', () => {
    const out = excludeLibs(SAMPLE, ['b', 'c']);
    expect(out).toEqual({ a: [] });
  });

  it('composes with formatGraph for AI-agent style filtering', () => {
    const out = formatGraph(excludeLibs(SAMPLE, ['b']), 'edges');
    expect(out).toBe('a c\n');
  });
});
