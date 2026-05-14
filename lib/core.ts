import { IGraph } from './data-structures/graph.ds.interface';
import { excludeLibs, formatGraph, OutputFormat, selectLibs } from './formatters';
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

  /**
   * @deprecated Parameter order will be stabilized as `(excludedLibs, selectedLibraries, format)`
   * in the next major version.
   *
   * See: https://github.com/Fcmam5/nx-mermaid-grapher/issues/33
   */
  getGraphSnippet(excludedLibs: string[] = [], format: OutputFormat = 'mermaid', selectedLibraries?: string[]): string {
    let rs = excludeLibs(this.graph.getGraph(), excludedLibs);
    if (selectedLibraries) {
      rs = selectLibs(rs, selectedLibraries);
    }
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
