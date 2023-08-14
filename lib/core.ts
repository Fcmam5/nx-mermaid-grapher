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
      .filter((libName) => {
        return rs[libName].length;
      })
      .reduce((resultString, currLibName) => {
        const lines = rs[currLibName].reduce((acc: string[], dependency: string) => {
          return [...acc, `  ${currLibName} --> ${dependency}\n`];
        }, []);

        return `${resultString}${lines.join('')}`;
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
