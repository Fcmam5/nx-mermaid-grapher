import { Edges } from '../lib/data-structures/graph.ds.interface';
import {
  OUTPUT_FORMATS,
  OutputFormat,
  formatGraph,
  isOutputFormat,
} from '../lib/formatters';

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
      expect(formatGraph(SAMPLE, 'mermaid')).toBe(
        'graph LR\n  a --> b\n  a --> c\n  b --> c\n',
      );
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

  it('is exhaustive over OUTPUT_FORMATS (no format silently falls through)', () => {
    for (const fmt of OUTPUT_FORMATS) {
      expect(typeof formatGraph(SAMPLE, fmt as OutputFormat)).toBe('string');
    }
  });
});
