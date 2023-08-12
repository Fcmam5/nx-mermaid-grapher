import { IGraph } from './data-structures/graph.ds.interface';
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

  getGraphSnippet() {
    const initStr = `graph LR\n`;
    const rs = this.graph.getGraph();

    return Object.keys(rs)
      .filter((k) => {
        return rs[k].length;
      })
      .reduce((acc, curr) => {
        const line = [curr, ...rs[curr]].join('-->');

        return `${acc}  ${line}\n`;
      }, initStr);
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
