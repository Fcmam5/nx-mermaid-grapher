import { join } from 'node:path';
import { CliError, run, USAGE } from '../lib/cli';

const FIXTURE = join(__dirname, 'mocks', 'ddd-example.graph.json');

describe('CLI run()', () => {
  it('renders a Mermaid markdown block for a known fixture', () => {
    const out = run(['-f', FIXTURE]);

    expect(out.startsWith('```mermaid\n')).toBe(true);
    expect(out.endsWith('```')).toBe(true);
    expect(out).toContain('graph LR\n');
    // Spot-check a known edge from the fixture.
    expect(out).toContain('lending-infrastructure --> lending-application');
  });

  it('honours --exclude (repeatable) by dropping excluded libs from output', () => {
    const excluded = 'lending-infrastructure';
    const out = run(['-f', FIXTURE, '-e', excluded]);

    expect(out).not.toMatch(new RegExp(`(^|\\n)\\s*${excluded} -->`));
    expect(out).not.toMatch(new RegExp(`--> ${excluded}(\\n|$)`));
  });

  it('returns USAGE for --help', () => {
    expect(run(['--help'])).toBe(USAGE);
    expect(run(['-h'])).toBe(USAGE);
  });

  it('returns the package version for --version', () => {
    const out = run(['--version']);
    expect(out).toMatch(/^\d+\.\d+\.\d+/);
  });

  it('throws CliError when -f is missing', () => {
    expect(() => run([])).toThrow(CliError);
    expect(() => run([])).toThrow(/missing required option/i);
  });

  it('throws CliError on unknown options', () => {
    expect(() => run(['--definitely-not-a-flag'])).toThrow(CliError);
  });

  describe('--format / -o', () => {
    it('emits raw mermaid (no markdown fence) with --raw', () => {
      const out = run(['-f', FIXTURE, '--raw']);
      expect(out.startsWith('graph LR\n')).toBe(true);
      expect(out).not.toContain('```mermaid');
    });

    it('emits a plain edge list with --format edges', () => {
      const out = run(['-f', FIXTURE, '-o', 'edges']);
      expect(out).not.toContain('```');
      expect(out).not.toContain('graph LR');
      // Every non-empty line is `src dst` with no arrow noise.
      const nonEmpty = out.split('\n').filter(Boolean);
      expect(nonEmpty.length).toBeGreaterThan(0);
      for (const line of nonEmpty) {
        expect(line).toMatch(/^\S+ \S+$/);
      }
    });

    it('emits parseable JSON with --format json', () => {
      const out = run(['-f', FIXTURE, '--format', 'json']);
      const parsed = JSON.parse(out);
      expect(Array.isArray(parsed.nodes)).toBe(true);
      expect(Array.isArray(parsed.edges)).toBe(true);
      expect(parsed.nodes.length).toBeGreaterThan(0);
      // Every edge is a [src, dst] pair of strings referring to declared nodes.
      const nodeSet = new Set<string>(parsed.nodes);
      for (const [src, dst] of parsed.edges) {
        expect(nodeSet.has(src)).toBe(true);
        expect(nodeSet.has(dst)).toBe(true);
      }
    });

    it('emits a digraph with --format dot', () => {
      const out = run(['-f', FIXTURE, '-o', 'dot']);
      expect(out.startsWith('digraph G {\n')).toBe(true);
      expect(out.trimEnd().endsWith('}')).toBe(true);
      expect(out).toMatch(/"\S+" -> "\S+";/);
    });

    it('emits a stats summary with --format stats', () => {
      const out = run(['-f', FIXTURE, '-o', 'stats']);
      expect(out.startsWith('graph stats\n')).toBe(true);
      expect(out).toMatch(/nodes:\s+\d+/);
      expect(out).toMatch(/edges:\s+\d+/);
      expect(out).toMatch(/cycles:\s+(none|yes)/);
      expect(out).toContain('per-project (fan-in / fan-out):');
    });

    it('throws CliError for an unknown format', () => {
      expect(() => run(['-f', FIXTURE, '-o', 'graphviz'])).toThrow(/invalid --format/);
    });
  });
});
