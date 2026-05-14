jest.mock('node:fs');
import mockGraphExample from '../mocks/ddd-example.graph.json';
import { NXGraphFileLoader } from '../../lib/nx/load-nx-graph';
import { readFileSync } from 'node:fs';

describe('NXGraphFileLoader', () => {
  let loader: NXGraphFileLoader;

  beforeEach(() => {
    loader = new NXGraphFileLoader();
  });

  it('should work', () => {
    (readFileSync as jest.Mock).mockReturnValue(JSON.stringify(mockGraphExample));

    expect(loader.readNXGraph('path')).toBeTruthy();

    expect(readFileSync).toHaveBeenCalledWith('path', 'utf-8');
  });

  it('reads from stdin (fd 0) when path is "-"', () => {
    (readFileSync as jest.Mock).mockReturnValue(JSON.stringify(mockGraphExample));

    expect(loader.readNXGraph('-')).toBeTruthy();

    expect(readFileSync).toHaveBeenCalledWith(0, 'utf-8');
  });

  it('labels stdin errors with "<stdin>" instead of "-"', () => {
    (readFileSync as jest.Mock).mockReturnValue('{}');
    expect(() => loader.readNXGraph('-')).toThrow(/^<stdin>:/);
  });

  it.each([
    ['null', 'null', /expected an Nx graph JSON object, got null/],
    ['a non-object', '"hello"', /expected an Nx graph JSON object, got string/],
    ['an array (no graph key)', '[]', /missing required "graph" object/],
    ['an object missing "graph"', '{}', /missing required "graph" object/],
    ['an object with non-object "graph"', '{"graph":1}', /missing required "graph" object/],
    ['a graph missing "nodes"', '{"graph":{"dependencies":{}}}', /missing required "graph\.nodes" object/],
    ['a graph missing "dependencies"', '{"graph":{"nodes":{}}}', /missing required "graph\.dependencies" object/],
  ])('throws a descriptive error when the JSON is %s', (_, json, expected) => {
    (readFileSync as jest.Mock).mockReturnValue(json);
    expect(() => loader.readNXGraph('bad.json')).toThrow(expected);
  });
});
