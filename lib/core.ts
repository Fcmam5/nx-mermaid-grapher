import { Edges, IGraph } from './data-structures/graph.ds.interface';
import { formatGraph, OutputFormat } from './formatters';
import { GraphJsonResponse } from './nx/interfaces/graph-json.nx.interface';
import { NXGraphFileLoader } from './nx/load-nx-graph';

export class NxMermaidGrapher {
  private content!: GraphJsonResponse;

  constructor(
    private readonly loader: NXGraphFileLoader,
    private readonly graph: IGraph<string>,
  ) {}

  init(nxGraphPath: string) {
    this.content = this.loader.readNXGraph(nxGraphPath);
    this.toDiGraph();
  }

  getGraphSnippet(excludedLibs: string[] = [], format: OutputFormat = 'mermaid'): string {
    const rs = this.filterOutLibs(this.graph.getGraph(), excludedLibs);
    return formatGraph(rs, format);
  }

  private toDiGraph(): void {
    // Add nodes
    Object.keys(this.content.graph.nodes).forEach((n) => this.graph.addNode(n));

    // Add edges
    Object.values(this.content.graph.dependencies).forEach((dep) => {
      dep.forEach((d) => {
        this.graph.addEdge(d.source, d.target);
      });
    });
  }

  private filterOutLibs(graphEdges: Edges<string>, excludedLibs: string[]) {
    if (!excludedLibs.length) {
      return graphEdges;
    }

    const excluded = new Set(excludedLibs);
    const result: Edges<string> = {};

    for (const [lib, deps] of Object.entries(graphEdges)) {
      if (excluded.has(lib)) continue;
      result[lib] = deps.filter((dep) => !excluded.has(dep));
    }

    return result;
  }
}
