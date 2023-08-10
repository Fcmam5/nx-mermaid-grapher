jest.mock('fs');
import mockGraphExample from '../mocks/ddd-example.graph.json';
import { NXGraphFileLoader } from '../../lib/nx/load-nx-graph';
import { readFileSync } from 'fs';

describe('NXGraphFileLoader', () => {
  let loader: NXGraphFileLoader;

  beforeEach(() => {
    loader = new NXGraphFileLoader();
  });

  it('should work', () => {
    (readFileSync as jest.Mock).mockReturnValue(JSON.stringify(mockGraphExample));

    expect(loader.readNXGraph('path')).toBeTruthy();

    expect(readFileSync).toHaveBeenCalled();
  });
});
