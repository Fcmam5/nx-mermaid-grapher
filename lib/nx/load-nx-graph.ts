import { readFileSync } from 'fs';
import { GraphJsonResponse } from '../nx/interfaces/graph-json.nx.interface';

export class NXGraphFileLoader {
  private readFile(path: string): unknown {
    // Stryker disable next-line StringLiteral
    const content = readFileSync(path, 'utf-8');
    return JSON.parse(content);
  }

  readNXGraph(path: string): GraphJsonResponse {
    return this.readFile(path) as GraphJsonResponse;
  }
}
