import { ProjectGraph } from './nx.interfaces';
import { TaskGraph } from './task-graph.nx.interface';

// Source https://github.com/nrwl/nx/blob/a7cf272d1f23545e96eff071f4286b59badbc786/packages/nx/src/command-line/graph/graph.ts#L723C1-L736C2
export interface GraphJsonResponse {
  tasks?: TaskGraph;
  graph: ProjectGraph;

  /**
   * @deprecated To see affected projects, use `nx show projects --affected`. This will be removed in Nx 18.
   */
  affectedProjects?: string[];

  /**
   * @deprecated To see affected projects, use `nx show projects --affected`. This will be removed in Nx 18.
   */
  criticalPath?: string[];
}

export class GraphJsonResponseCls implements GraphJsonResponse {
  tasks?: TaskGraph | undefined;
  graph: ProjectGraph = { nodes: {}, dependencies: {} };
  affectedProjects?: string[] | undefined;
  criticalPath?: string[] | undefined;
}
