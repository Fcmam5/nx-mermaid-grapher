import { IGraph } from './graph.ds.interface';

export class DiGraph implements IGraph<string> {
  private nodes = new Map<string, string[]>();

  addNode(nodeVal: string) {
    this.nodes.set(nodeVal, []);
  }

  addEdge(source: string, destination: string) {
    const sourceEdges = this.nodes.get(source);
    if (!sourceEdges) {
      throw new Error('Source node not found!');
    }

    if (!this.nodes.has(destination)) {
      throw new Error('Destination node not found!');
    }

    sourceEdges.push(destination);
  }

  getGraph() {
    return Object.fromEntries(this.nodes);
  }
}
