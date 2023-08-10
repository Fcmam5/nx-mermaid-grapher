import { IGraph } from './graph.ds.interface';

export class DiGraph implements IGraph<string> {
  private nodes = new Map();

  addNode(nodeVal: string) {
    this.nodes.set(nodeVal, []);
  }

  addEdge(source: string, destination: string) {
    if (!this.nodes.has(source)) {
      throw new Error('Source node not found!');
    }

    if (!this.nodes.has(destination)) {
      throw new Error('Destination node not found!');
    }

    this.nodes.get(source).push(destination);
  }

  getGraph() {
    return Object.fromEntries(this.nodes);
  }
}
