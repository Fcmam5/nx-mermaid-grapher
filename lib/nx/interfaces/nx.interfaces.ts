/* eslint-disable @typescript-eslint/no-explicit-any */
// Source: https://github.com/nrwl/nx/blob/master/packages/nx/src/config/project-graph.ts

export enum DependencyType {
  static = 'static',
  dynamic = 'dynamic',
  implicit = 'implicit',
}

export interface ProjectGraphDependency {
  type: DependencyType | string;
  target: string;
  source: string;
}

export interface ProjectGraphExternalNode {
  type: 'npm';
  name: `npm:${string}`;
  data: {
    version: string;
    packageName: string;
    hash?: string;
  };
}

export interface ProjectGraph {
  nodes: Record<string, ProjectGraphProjectNode>;
  externalNodes?: Record<string, ProjectGraphExternalNode>;
  dependencies: Record<string, ProjectGraphDependency[]>;
  version?: string;
}
export type ProjectType = 'library' | 'application';

export type InputDefinition =
  | { input: string; projects: string | string[] }
  | { input: string; dependencies: true }
  | { input: string }
  | { fileset: string }
  | { runtime: string }
  | { externalDependencies: string[] }
  | { dependentTasksOutputFiles: string; transitive?: boolean }
  | { env: string };

export interface ProjectConfiguration {
  name?: string;
  targets?: { [targetName: string]: TargetConfiguration };
  root: string;
  sourceRoot?: string;
  projectType?: ProjectType;
  generators?: { [collectionName: string]: { [generatorName: string]: any } };
  implicitDependencies?: string[];
  namedInputs?: { [inputName: string]: (string | InputDefinition)[] };
  tags?: string[];
}

export interface ProjectGraphProjectNode {
  type: 'app' | 'e2e' | 'lib';
  name: string;
  data: ProjectConfiguration & {
    description?: string;
  };
}

export interface TargetDependencyConfig {
  projects?: string[] | string;
  dependencies?: boolean;
  target: string;
  params?: 'ignore' | 'forward';
}

export interface TargetConfiguration<T = any> {
  executor?: string;
  command?: string;
  outputs?: string[];
  dependsOn?: (TargetDependencyConfig | string)[];
  inputs?: (InputDefinition | string)[];
  options?: T;
  configurations?: { [config: string]: any };
  defaultConfiguration?: string;
}
