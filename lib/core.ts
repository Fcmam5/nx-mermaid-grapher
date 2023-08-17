import { Edges, IGraph } from './data-structures/graph.ds.interface';
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

  getGraphSnippet(excludedLibs: string[] = []) {
    const initStr = `graph LR\n`;
    const graphObj = this.graph.getGraph();
    const rs = this.filterOutLibs(graphObj, excludedLibs);

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

  private filterOutLibs(graphEdges: Edges<string>, excludedLibs: string[]) {
    if (!excludedLibs.length) {
      return graphEdges;
    }

    const _graphEdges = { ...graphEdges };

    excludedLibs.forEach((lib) => delete _graphEdges[lib]);

    Object.keys(_graphEdges).forEach((edge) => {
      _graphEdges[edge] = _graphEdges[edge].filter((node) => !excludedLibs.includes(node));
    });

    return _graphEdges;
  }
}
