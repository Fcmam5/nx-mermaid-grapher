import { IGraph } from './data-structures/graph.ds.interface';
import { excludeLibs, formatGraph, OutputFormat } from './formatters';
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
    const rs = excludeLibs(this.graph.getGraph(), excludedLibs);
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
}
