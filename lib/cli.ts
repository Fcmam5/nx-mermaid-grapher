#!/usr/bin/env node

import { parseArgs } from 'node:util';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { DiGraph } from './data-structures/di-graph.ds';
import { isOutputFormat, OUTPUT_FORMATS } from './formatters';
import { NXGraphFileLoader, STDIN_PATH } from './nx/load-nx-graph';
import { NxMermaidGrapher } from './core';

export const USAGE = `Usage: nx-mermaid-grapher (-f <path> | --stdin) [-o <format>] [-e <lib>]... [-p <lib>]... [--raw]

Options:
  -f, --file <path>      NX graph output file. Pass \`-\` to read from stdin
                         (see: https://nx.dev/packages/nx/documents/dep-graph#file)
      --stdin            Read the graph JSON from stdin (alias for \`-f -\`)
  -o, --format <format>  Output format (default: mermaid).
                         One of: ${OUTPUT_FORMATS.join(', ')}
  -e, --exclude <lib>    Exclude a library (repeatable)
  -p, --projects <lib>   Include only these libraries (repeatable).
                         Useful for rendering affected-project subgraphs.
      --raw              Emit raw Mermaid (no \`\`\`mermaid markdown fence)
  -h, --help             Show help
  -V, --version          Show version`;

/**
 * Thrown for expected, user-facing CLI errors (bad/missing args).
 * Callers should print `err.message` + USAGE and exit non-zero.
 */
export class CliError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CliError';
  }
}

function readVersion(): string {
  // dist/cli.js -> ../package.json (also works from lib/cli.ts in tests)
  const pkg = JSON.parse(readFileSync(join(__dirname, '..', 'package.json'), 'utf-8'));
  return pkg.version as string;
}

/**
 * Parse `argv` and return the string that would be printed to stdout.
 * Throws `CliError` for invalid input. Pure-ish: only side effect is reading
 * the user-supplied graph file (and `package.json` for `--version`).
 */
export function run(argv: string[]): string {
  let parsed;
  try {
    parsed = parseArgs({
      args: argv,
      options: {
        file: { type: 'string', short: 'f' },
        stdin: { type: 'boolean' },
        format: { type: 'string', short: 'o' },
        exclude: { type: 'string', short: 'e', multiple: true },
        projects: { type: 'string', short: 'p', multiple: true },
        raw: { type: 'boolean' },
        help: { type: 'boolean', short: 'h' },
        version: { type: 'boolean', short: 'V' },
      },
      strict: true,
      allowPositionals: false,
    });
  } catch (err) {
    throw new CliError((err as Error).message);
  }

  const { values } = parsed;

  if (values.help) return USAGE;
  if (values.version) return readVersion();

  const inputPath = values.stdin ? STDIN_PATH : values.file;
  if (!inputPath) {
    throw new CliError('missing required option: -f, --file (or --stdin)');
  }
  if (values.stdin && values.file) {
    throw new CliError('--stdin and -f/--file are mutually exclusive');
  }

  const format = values.format ?? 'mermaid';
  if (!isOutputFormat(format)) {
    throw new CliError(`invalid --format '${format}'. Choose one of: ${OUTPUT_FORMATS.join(', ')}`);
  }

  const core = new NxMermaidGrapher(new NXGraphFileLoader(), new DiGraph());
  core.init(inputPath);

  const selected = values.projects?.length ? values.projects : undefined;
  const body = core.getGraphSnippet(values.exclude, format, selected);

  // Wrap Mermaid output in a markdown code fence by default so users can paste
  // it straight into a PR description or README. Use --raw to opt out.
  if (format === 'mermaid' && !values.raw) {
    return `\`\`\`mermaid\n${body}\`\`\``;
  }
  return body;
}

/* istanbul ignore next -- entry point, exercised via the integration smoke test */
if (require.main === module) {
  try {
    console.log(run(process.argv.slice(2)));
  } catch (err) {
    if (err instanceof CliError) {
      console.error(`error: ${err.message}\n\n${USAGE}`);
      process.exit(1);
    }
    throw err;
  }
}
