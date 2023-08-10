// Source: https://github.com/nrwl/nx/blob/master/packages/nx/src/config/task-graph.ts

export interface Task {
  id: string;
  target: {
    project: string;
    target: string;
    configuration?: string;
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  overrides: any;
  projectRoot?: string;
  hash?: string;
  hashDetails?: {
    command: string;
    nodes: { [name: string]: string };
    implicitDeps?: { [fileName: string]: string };
    runtime?: { [input: string]: string };
  };
  startTime?: number;
  endTime?: number;
}

export interface TaskGraph {
  roots: string[];
  tasks: Record<string, Task>;
  dependencies: Record<string, string[]>;
}
