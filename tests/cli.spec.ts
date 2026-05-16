// Wrap readFileSync in a jest.fn that delegates to the real implementation by
// default, so individual tests can override it (e.g. to simulate stdin reads
// from fd 0) without breaking unrelated reads.
jest.mock('node:fs', () => {
  const actual = jest.requireActual('node:fs');
  return { ...actual, readFileSync: jest.fn(actual.readFileSync) };
});

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { CliError, run, USAGE } from '../lib/cli';

const FIXTURE = join(__dirname, 'mocks', 'ddd-example.graph.json');
const SIMPLE_DEMO = join(__dirname, 'mocks', 'simple-demo.graph.json');
const realReadFileSync = jest.requireActual('node:fs').readFileSync as typeof readFileSync;
const FIXTURE_CONTENT = realReadFileSync(FIXTURE, 'utf-8') as string;
const mockedReadFileSync = readFileSync as unknown as jest.MockedFunction<typeof readFileSync>;

/** Have any read of fd 0 (stdin) return the bundled fixture content. */
function withStdinFixture<T>(fn: () => T): T {
  mockedReadFileSync.mockImplementation(((path: unknown, ...args: unknown[]) => {
    if (path === 0) return FIXTURE_CONTENT;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (realReadFileSync as any)(path, ...args);
  }) as typeof readFileSync);
  try {
    return fn();
  } finally {
    mockedReadFileSync.mockImplementation(realReadFileSync);
  }
}

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

  it('honours --projects (repeatable) by keeping only the specified libs', () => {
    const out = run(['-f', FIXTURE, '-p', 'lending-infrastructure', '-p', 'lending-application']);

    expect(out).toContain('lending-infrastructure --> lending-application');
    expect(out).not.toContain('lending-domain');
    expect(out).not.toContain('catalogue');
    expect(out).not.toContain('library');
  });

  it('honours --transitive by including full transitive closure', () => {
    const out = run(['-f', FIXTURE, '-p', 'lending-domain', '--transitive']);

    // Should include the full chain up to roots and down to leaves.
    expect(out).toContain('lending-application --> lending-domain');
    expect(out).toContain('lending-infrastructure --> lending-application');
  });

  it('honours -t (short flag for --transitive)', () => {
    const out = run(['-f', FIXTURE, '-p', 'lending-domain', '-t']);

    // Should work the same as --transitive
    expect(out).toContain('lending-application --> lending-domain');
    expect(out).toContain('lending-infrastructure --> lending-application');
  });

  it('--impact is deprecated and prints a warning', () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    const out = run(['-f', FIXTURE, '-p', 'lending-domain', '--impact']);

    // Should still work functionally
    expect(out).toContain('lending-application --> lending-domain');
    // Should print deprecation warning to stderr
    expect(consoleErrorSpy).toHaveBeenCalledWith('warning: --impact is deprecated. Use --transitive instead.');
    consoleErrorSpy.mockRestore();
  });

  it('returns USAGE for --help', () => {
    expect(run(['--help'])).toBe(USAGE);
    expect(run(['-h'])).toBe(USAGE);
  });

  it('returns the package version for --version', () => {
    const out = run(['--version']);
    expect(out).toMatch(/^\d+\.\d+\.\d+/);
  });

  it('throws CliError when neither -f nor --stdin is given', () => {
    expect(() => run([])).toThrow(CliError);
    expect(() => run([])).toThrow(/missing required option.*--stdin/i);
  });

  it('throws CliError when --stdin and -f are combined', () => {
    expect(() => run(['--stdin', '-f', FIXTURE])).toThrow(/mutually exclusive/i);
  });

  describe('stdin input', () => {
    it('reads the graph from stdin when --stdin is passed', () => {
      const out = withStdinFixture(() => run(['--stdin']));
      expect(out).toContain('graph LR\n');
      expect(out).toContain('lending-infrastructure --> lending-application');
    });

    it('also accepts the idiomatic `-f -` form', () => {
      const out = withStdinFixture(() => run(['-f', '-', '-o', 'edges']));
      expect(out).toContain('lending-infrastructure lending-application');
    });
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

describe('CLI run() with SIMPLE_DEMO fixture', () => {
  it('renders the full graph for the simple demo', () => {
    const out = run(['-f', SIMPLE_DEMO]);

    expect(out).toContain('graph LR\n');
    expect(out).toContain('data --> shared');
    expect(out).toContain('api --> utils');
    expect(out).toContain('api --> data');
    expect(out).toContain('web --> ui');
    expect(out).toContain('web --> utils');
    expect(out).toContain('ui --> shared');
  });

  it('filters by --projects to show only selected libs', () => {
    const out = run(['-f', SIMPLE_DEMO, '-p', 'web', '-p', 'ui']);

    expect(out).toContain('web --> ui');
    // ui --> shared is filtered out because shared is not in selected projects
    expect(out).not.toContain('ui --> shared');
    expect(out).not.toContain('api');
    expect(out).not.toContain('data');
    expect(out).not.toContain('utils');
  });

  it('--transitive with single seed includes downstream dependencies', () => {
    const out = run(['-f', SIMPLE_DEMO, '-p', 'web', '--transitive']);

    // web is a root seed (doesn't depend on any other seed)
    // Forward BFS: web --> ui --> shared, web --> utils
    expect(out).toContain('web --> ui');
    expect(out).toContain('web --> utils');
    expect(out).toContain('ui --> shared');
  });

  it('--transitive with multiple seeds uses root-seeds logic', () => {
    const out = run(['-f', SIMPLE_DEMO, '-p', 'web', '-p', 'ui', '--transitive']);

    // web depends on ui (another seed), so web is NOT a root
    // ui is a root seed (doesn't depend on any other seed)
    // Forward BFS from ui only: ui --> shared
    // utils should NOT be included (unrelated sibling of web)
    expect(out).toContain('web --> ui');
    expect(out).toContain('ui --> shared');
    expect(out).not.toContain('utils');
  });

  it('--exclude removes specified libraries', () => {
    const out = run(['-f', SIMPLE_DEMO, '-e', 'utils']);

    expect(out).not.toContain('utils');
    expect(out).not.toContain('api --> utils');
    expect(out).not.toContain('web --> utils');
    expect(out).toContain('data --> shared');
    expect(out).toContain('web --> ui');
  });

  it('--format edges emits plain edge list', () => {
    const out = run(['-f', SIMPLE_DEMO, '-o', 'edges']);

    expect(out).not.toContain('```');
    expect(out).toContain('data shared');
    expect(out).toContain('api utils');
    expect(out).toContain('api data');
  });

  it('--format stats emits graph summary', () => {
    const out = run(['-f', SIMPLE_DEMO, '-o', 'stats']);

    expect(out).toMatch(/nodes:\s+6/);
    expect(out).toMatch(/edges:\s+6/);
  });
});
