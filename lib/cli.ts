#!/usr/bin/env node

import yargs from 'yargs/yargs';
import { DiGraph } from './data-structures/di-graph.ds';
import { NXGraphFileLoader } from './nx/load-nx-graph';
import { NxMermaidGrapher } from './core';

(() => {
  const argv = yargs(process.argv.slice(2))
    .options({
      f: {
        type: 'string',
        alias: 'file',
        demandOption: true,
        describe: 'NX graph output file (see: https://nx.dev/packages/nx/documents/dep-graph#file)',
      },
      e: {
        type: 'string',
        array: true,
        alias: 'exclude',
        demandOption: false,
        describe: 'Exclude a library',
      },
    })
    .usage('Usage: nx-mermaid-grapher -f [path]')
    .parseSync();

  const loader = new NXGraphFileLoader();
  const diGraph = new DiGraph();
  const core = new NxMermaidGrapher(loader, diGraph);

  core.init(argv.f);

  const logMerMaidInMd = (str: string) => `\`\`\`mermaid\n${str}\`\`\``;

  console.log(logMerMaidInMd(core.getGraphSnippet(argv.e)));
})();
