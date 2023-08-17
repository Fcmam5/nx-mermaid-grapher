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

    it('should get a graph with all libraries if exclusion array is empty', () => {
      expect(coreCls.getGraphSnippet([])).toEqual(expectedGraph);
    });

    it('should get a graph without excluded libraries', () => {
      expect(coreCls.getGraphSnippet(['shared-infrastructure-nestjs-cqrs-events', 'catalogue'])).toEqual(
        expectedGraphWithExcludedLibs,
      );
    });

    it('should get a graph without excluded head library', () => {
      expect(coreCls.getGraphSnippet(['library'])).toEqual(expectedGraphWithoutHeadLib);
    });
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
  shared-infrastructure-nestjs-cqrs-events --> shared-domain
  lending-infrastructure --> lending-application
  lending-infrastructure --> shared-infrastructure-nestjs-cqrs-events
  lending-infrastructure --> lending-domain
  lending-infrastructure --> shared-domain
  lending-application --> lending-domain
  lending-application --> shared-domain
  lending-application --> catalogue
  lending-ui-rest --> lending-application
  lending-ui-rest --> lending-domain
  lending-ui-rest --> lending-infrastructure
  lending-domain --> shared-domain
  catalogue --> shared-domain
  catalogue --> shared-infrastructure-nestjs-cqrs-events
  library --> catalogue
  library --> lending-ui-rest
  library --> lending-domain
  library --> lending-infrastructure
`;

// Without: 'shared-infrastructure-nestjs-cqrs-events' and 'catalogue'
const expectedGraphWithExcludedLibs = `graph LR
  lending-infrastructure --> lending-application
  lending-infrastructure --> lending-domain
  lending-infrastructure --> shared-domain
  lending-application --> lending-domain
  lending-application --> shared-domain
  lending-ui-rest --> lending-application
  lending-ui-rest --> lending-domain
  lending-ui-rest --> lending-infrastructure
  lending-domain --> shared-domain
  library --> lending-ui-rest
  library --> lending-domain
  library --> lending-infrastructure
`;

const expectedGraphWithoutHeadLib = `graph LR
  shared-infrastructure-nestjs-cqrs-events --> shared-domain
  lending-infrastructure --> lending-application
  lending-infrastructure --> shared-infrastructure-nestjs-cqrs-events
  lending-infrastructure --> lending-domain
  lending-infrastructure --> shared-domain
  lending-application --> lending-domain
  lending-application --> shared-domain
  lending-application --> catalogue
  lending-ui-rest --> lending-application
  lending-ui-rest --> lending-domain
  lending-ui-rest --> lending-infrastructure
  lending-domain --> shared-domain
  catalogue --> shared-domain
  catalogue --> shared-infrastructure-nestjs-cqrs-events
`;
