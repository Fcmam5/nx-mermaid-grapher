export type Edges<NodeType> = {
  [key: string]: Array<NodeType>;
};

export interface IGraph<NodeType> {
  addNode(nodeVal: NodeType): void;

  addEdge(source: NodeType, destination: NodeType): void;

  getGraph(): Edges<NodeType>;
}
