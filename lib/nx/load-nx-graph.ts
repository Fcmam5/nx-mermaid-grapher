import { plainToClass } from 'class-transformer';
import { readFileSync } from 'fs';
import { GraphJsonResponse, GraphJsonResponseCls } from '../nx/interfaces/graph-json.nx.interface';

export class NXGraphFileLoader {
  private readFile(path: string) {
    // Stryker disable next-line StringLiteral
    const content = readFileSync(path, 'utf-8');
    return JSON.parse(content);
  }

  readNXGraph(path: string): GraphJsonResponse {
    const content = this.readFile(path);

    return plainToClass(GraphJsonResponseCls, content);
  }
}
