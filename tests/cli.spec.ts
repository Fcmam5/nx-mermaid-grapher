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
});
