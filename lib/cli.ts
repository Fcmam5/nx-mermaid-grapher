#!/usr/bin/env node

import { parseArgs } from 'node:util';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { DiGraph } from './data-structures/di-graph.ds';
import { NXGraphFileLoader } from './nx/load-nx-graph';
import { NxMermaidGrapher } from './core';

const USAGE = `Usage: nx-mermaid-grapher -f <path> [-e <lib>]...

Options:
  -f, --file <path>     NX graph output file
                        (see: https://nx.dev/packages/nx/documents/dep-graph#file)
  -e, --exclude <lib>   Exclude a library (repeatable)
  -h, --help            Show help
  -V, --version         Show version`;

function readVersion(): string {
  // dist/cli.js -> ../package.json
  const pkg = JSON.parse(readFileSync(join(__dirname, '..', 'package.json'), 'utf-8'));
  return pkg.version as string;
}

function fail(message: string): never {
  console.error(`error: ${message}\n\n${USAGE}`);
  process.exit(1);
}

(() => {
  let parsed;
  try {
    parsed = parseArgs({
      args: process.argv.slice(2),
      options: {
        file: { type: 'string', short: 'f' },
        exclude: { type: 'string', short: 'e', multiple: true },
        help: { type: 'boolean', short: 'h' },
        version: { type: 'boolean', short: 'V' },
      },
      strict: true,
      allowPositionals: false,
    });
  } catch (err) {
    fail((err as Error).message);
  }

  const { values } = parsed;

  if (values.help) {
    console.log(USAGE);
    return;
  }

  if (values.version) {
    console.log(readVersion());
    return;
  }

  const file = values.file;
  if (!file) {
    fail('missing required option: -f, --file');
  }

  const loader = new NXGraphFileLoader();
  const diGraph = new DiGraph();
  const core = new NxMermaidGrapher(loader, diGraph);

  core.init(file);

  const logMerMaidInMd = (str: string) => `\`\`\`mermaid\n${str}\`\`\``;

  console.log(logMerMaidInMd(core.getGraphSnippet(values.exclude)));
})();
