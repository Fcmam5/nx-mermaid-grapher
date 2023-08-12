import { NxMermaidGrapher } from '../lib/core';
import { IGraph } from '../lib/data-structures/graph.ds.interface';
import { NXGraphFileLoader } from '../lib/nx/load-nx-graph';
import mockGraphExample from './mocks/ddd-example.graph.json';

const readNXGraphMock = jest.fn();

jest.mock('../lib/nx/load-nx-graph', () => {
  return {
    NXGraphFileLoader: jest.fn().mockImplementation(() => {
      return { readNXGraph: readNXGraphMock };
    }),
  };
});

const mockAddNode = jest.fn();
const mockAddEge = jest.fn();
const mockGetGraph = jest.fn();

class MockGraph implements IGraph<string> {
  addNode(nodeVal: string): void {
    mockAddNode(nodeVal);
  }
  addEdge(source: string, destination: string): void {
    mockAddEge(source, destination);
  }
  getGraph(): { [key: string]: string[] } {
    return mockGetGraph();
  }
}

describe('Library core', () => {
  let mockLoader: NXGraphFileLoader;
  let mockGraph: IGraph<string>;
  let coreCls: NxMermaidGrapher;

  beforeEach(() => {
    mockLoader = new NXGraphFileLoader();
    mockGraph = new MockGraph();

    readNXGraphMock.mockReturnValue(mockGraphExample);

    coreCls = new NxMermaidGrapher(mockLoader, mockGraph);
  });

  describe('.init', () => {
    it('should read NX graph file', () => {
      const pathToNXFile = 'path/to/file';

      coreCls.init(pathToNXFile);

      expect(readNXGraphMock).toHaveBeenCalledWith(pathToNXFile);
      expect(mockAddNode).toHaveBeenCalledTimes(8);
      expect(mockAddEge).toHaveBeenCalledTimes(18);
    });
  });

  describe('.getGraphSnippet', () => {
    beforeEach(() => {
      const pathToNXFile = 'path/to/file';
      mockGetGraph.mockReturnValue(mockGraphAsObj);

      coreCls.init(pathToNXFile);
    });

    it('should get a graph with all libraries', () => {
      expect(coreCls.getGraphSnippet()).toEqual(expectedGraph);
    });

    it.todo('should get a graph without excluded libraries');
  });

  describe('.getGraphSnippetForLib', () => {
    it.todo('implement getGraphSnippetForLib(libName: string, excludeLibs: string[] = [])');
  });
});

const mockGraphAsObj = {
  'shared-infrastructure-nestjs-cqrs-events': ['shared-domain'],
  'lending-infrastructure': [
    'lending-application',
    'shared-infrastructure-nestjs-cqrs-events',
    'lending-domain',
    'shared-domain',
  ],
  'lending-application': ['lending-domain', 'shared-domain', 'catalogue'],
  'lending-ui-rest': ['lending-application', 'lending-domain', 'lending-infrastructure'],
  'lending-domain': ['shared-domain'],
  'shared-domain': [],
  catalogue: ['shared-domain', 'shared-infrastructure-nestjs-cqrs-events'],
  library: ['catalogue', 'lending-ui-rest', 'lending-domain', 'lending-infrastructure'],
};

const expectedGraph = `graph LR
  shared-infrastructure-nestjs-cqrs-events-->shared-domain
  lending-infrastructure-->lending-application-->shared-infrastructure-nestjs-cqrs-events-->lending-domain-->shared-domain
  lending-application-->lending-domain-->shared-domain-->catalogue
  lending-ui-rest-->lending-application-->lending-domain-->lending-infrastructure
  lending-domain-->shared-domain
  catalogue-->shared-domain-->shared-infrastructure-nestjs-cqrs-events
  library-->catalogue-->lending-ui-rest-->lending-domain-->lending-infrastructure
`;
