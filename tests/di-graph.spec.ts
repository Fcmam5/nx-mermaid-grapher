import { DiGraph } from '../lib/data-structures/di-graph.ds';

describe('Directed graph', () => {
  let graph: DiGraph;

  beforeEach(() => {
    graph = new DiGraph();
  });

  it('should return empty graph', () => {
    expect(graph.getGraph()).toEqual({});
  });

  describe('.addNode', () => {
    it('should add a new node', () => {
      const edge = 'the root';

      graph.addNode(edge);

      expect(graph.getGraph()).toEqual({ [edge]: [] });
    });
  });

  describe('.addEdge', () => {
    it('should throw if the source node is not found', () => {
      expect(() => graph.addEdge('something', 'val')).toThrow('Source node not found!');
    });

    it('should throw if the destination node is not found', () => {
      graph.addNode('src');

      expect(() => graph.addEdge('src', 'not-dest')).toThrow('Destination node not found!');
    });

    it('should add the edges/links', () => {
      graph.addNode('src');
      graph.addNode('dest');

      graph.addEdge('src', 'dest');

      expect(graph.getGraph()).toEqual({
        dest: [],
        src: ['dest'],
      });
    });
  });
});
