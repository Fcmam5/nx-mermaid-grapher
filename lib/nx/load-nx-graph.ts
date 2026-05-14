import { readFileSync } from 'node:fs';
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

/** Sentinel that tells `readNXGraph` to consume process.stdin instead of opening a file. */
export const STDIN_PATH = '-';

export class NXGraphFileLoader {
  private readFile(path: string): unknown {
    // Stryker disable next-line StringLiteral
    const content = path === STDIN_PATH ? readFileSync(0, 'utf-8') : readFileSync(path, 'utf-8');
    return JSON.parse(content);
  }

  readNXGraph(path: string): GraphJsonResponse {
    const value = this.readFile(path);
    const source = path === STDIN_PATH ? '<stdin>' : path;
    assertGraphJsonResponse(value, source);
    return value;
  }
}
