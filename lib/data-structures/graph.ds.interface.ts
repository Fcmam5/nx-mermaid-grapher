export interface IGraph<NodeType> {
  addNode(nodeVal: NodeType): void;

  addEdge(source: NodeType, destination: NodeType): void;

  getGraph(): { [key: string]: Array<NodeType> };
}
