import { readFileSync } from 'fs';
import { GraphJsonResponse } from '../nx/interfaces/graph-json.nx.interface';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function assertGraphJsonResponse(value: unknown, path: string): asserts value is GraphJsonResponse {
  if (!isRecord(value)) {
    throw new Error(`${path}: expected an Nx graph JSON object, got ${value === null ? 'null' : typeof value}`);
  }
  const graph = value.graph;
  if (!isRecord(graph)) {
    throw new Error(`${path}: missing required "graph" object (is this an Nx graph dump?)`);
  }
  if (!isRecord(graph.nodes)) {
    throw new Error(`${path}: missing required "graph.nodes" object`);
  }
  if (!isRecord(graph.dependencies)) {
    throw new Error(`${path}: missing required "graph.dependencies" object`);
  }
}

export class NXGraphFileLoader {
  private readFile(path: string): unknown {
    // Stryker disable next-line StringLiteral
    const content = readFileSync(path, 'utf-8');
    return JSON.parse(content);
  }

  readNXGraph(path: string): GraphJsonResponse {
    const value = this.readFile(path);
    assertGraphJsonResponse(value, path);
    return value;
  }
}
