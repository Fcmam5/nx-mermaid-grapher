import { Edges } from '../lib/data-structures/graph.ds.interface';
import { computeStats } from '../lib/stats';

describe('computeStats', () => {
  it('handles an empty graph', () => {
    const s = computeStats({});
    expect(s).toEqual({
      nodes: 0,
      edges: 0,
      roots: [],
      leaves: [],
      hasCycles: false,
      maxDepth: 0,
      longestPath: null,
      projects: [],
    });
  });

  it('treats an isolated node as both a root and a leaf with depth 0', () => {
    const s = computeStats({ a: [] });
    expect(s.nodes).toBe(1);
    expect(s.edges).toBe(0);
    expect(s.roots).toEqual(['a']);
    expect(s.leaves).toEqual(['a']);
    expect(s.maxDepth).toBe(0);
    expect(s.longestPath).toBeNull();
    expect(s.hasCycles).toBe(false);
  });

  it('computes counts, fan-in/out, and the longest path on a linear chain', () => {
    // a -> b -> c -> d
    const g: Edges<string> = { a: ['b'], b: ['c'], c: ['d'], d: [] };
    const s = computeStats(g);

    expect(s.nodes).toBe(4);
    expect(s.edges).toBe(3);
    expect(s.roots).toEqual(['a']);
    expect(s.leaves).toEqual(['d']);
    expect(s.hasCycles).toBe(false);
    expect(s.maxDepth).toBe(3);
    expect(s.longestPath).toEqual(['a', 'b', 'c', 'd']);

    const fan = Object.fromEntries(s.projects.map((p) => [p.name, [p.fanIn, p.fanOut]]));
    expect(fan).toEqual({ a: [0, 1], b: [1, 1], c: [1, 1], d: [1, 0] });
  });

  it('finds the longest path through a diamond (a->b->d, a->c->d)', () => {
    const g: Edges<string> = { a: ['b', 'c'], b: ['d'], c: ['d'], d: [] };
    const s = computeStats(g);

    expect(s.maxDepth).toBe(2);
    // Either route is acceptable; we only care that it's a real depth-2 path.
    expect(s.longestPath?.[0]).toBe('a');
    expect(s.longestPath?.[s.longestPath.length - 1]).toBe('d');
    expect(s.longestPath).toHaveLength(3);
    expect(s.roots).toEqual(['a']);
    expect(s.leaves).toEqual(['d']);
  });

  it('detects cycles and reports null max depth', () => {
    // a -> b -> a
    const g: Edges<string> = { a: ['b'], b: ['a'] };
    const s = computeStats(g);

    expect(s.hasCycles).toBe(true);
    expect(s.maxDepth).toBeNull();
    expect(s.longestPath).toBeNull();
    // Neither node has fan-in 0 → no roots; same for leaves.
    expect(s.roots).toEqual([]);
    expect(s.leaves).toEqual([]);
  });

  it('detects a self-loop as a cycle', () => {
    const g: Edges<string> = { a: ['a'] };
    const s = computeStats(g);
    expect(s.hasCycles).toBe(true);
    expect(s.maxDepth).toBeNull();
  });

  it('sorts projects by fan-in desc, then fan-out desc, then name asc', () => {
    // a -> b -> c, a -> c
    //   a: fanIn=0, fanOut=2
    //   b: fanIn=1, fanOut=1
    //   c: fanIn=2, fanOut=0  <- highest fan-in, comes first
    const g: Edges<string> = { a: ['b', 'c'], b: ['c'], c: [] };
    const s = computeStats(g);
    expect(s.projects.map((p) => p.name)).toEqual(['c', 'b', 'a']);
  });

  it('produces a stable per-project order for ties (name ascending)', () => {
    const g: Edges<string> = { z: ['x'], y: ['x'], x: [] };
    const s = computeStats(g);
    // y and z both have fanIn=0, fanOut=1 → tied → sorted by name asc.
    const namesAfterX = s.projects.slice(1).map((p) => p.name);
    expect(namesAfterX).toEqual(['y', 'z']);
  });
});
