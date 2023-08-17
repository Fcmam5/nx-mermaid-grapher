# nx-mermaid-grapher

[![Mutation testing badge](https://img.shields.io/endpoint?style=flat&url=https%3A%2F%2Fbadge-api.stryker-mutator.io%2Fgithub.com%2FFcmam5%2Fnx-mermaid-grapher%2Fdevelop)](https://dashboard.stryker-mutator.io/reports/github.com/Fcmam5/nx-mermaid-grapher/develop) [![Known Vulnerabilities](https://snyk.io/test/github/Fcmam5/nx-mermaid-grapher/badge.svg)](https://snyk.io/test/github/Fcmam5/nx-mermaid-grapher) [![codecov](https://codecov.io/gh/Fcmam5/nx-mermaid-grapher/branch/develop/graph/badge.svg?token=QSBZLLE1L1)](https://codecov.io/gh/Fcmam5/nx-mermaid-grapher) [![npm](https://img.shields.io/npm/v/nx-mermaid-grapher)](https://www.npmjs.com/package/nx-mermaid-grapher)

A utility to create [`MermaidJS`](https://mermaid.js.org/) graphs for [NX dependency graphs](https://nx.dev/packages/nx/documents/dep-graph).


## Example

We can use [this example project](https://github.com/ddd-by-examples/library-nestjs) to try it out.

If you clone the project, and run [`nx dep-graph` (or `nx graph`)](https://nx.dev/packages/nx/documents/dep-graph) we'd get something similar to:

![Example Dep graph](./docs/assets/nx-13.example.png)

And below is the generated `mermaid.js` graph ([you can use controllers!](https://github.blog/2022-02-14-include-diagrams-markdown-files-mermaid/)):

```mermaid
    graph LR
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
```

Markdown:

<pre>
```mermaid
    graph LR
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
```
</pre>

## Usage

### CLI

To run this tool from your CLI, you need to install it globally with:

```bash
npm i -g nx-mermaid-grapher


# or using npx
npx nx-mermaid-grapher -f file.json
```

Then, run it with `-f [PATH]` or `--file [PATH]` parameter providing the path for your NX graph JSON output file.

```
Options:
      --help     Show help                                             [boolean]
      --version  Show version number                                   [boolean]
  -f, --file     NX graph output file (see:
                 https://nx.dev/packages/nx/documents/dep-graph#file)
                                                             [string] [required]
  -e, --exclude  Exclude a library                                       [array]
```

**Example**:

```bash
npx nx-mermaid-grapher -f tests/mocks/ddd-example.graph.json
```

Optionally you can exclude one, or multiple libraries. For example:

```bash
npx nx-mermaid-grapher -f tests/mocks/ddd-example.graph.json -e lending-infrastructure -e lending-ui-rest
```

### Code

If you want to extend this library, you may want to instantiate the exposed classes and use them, for example:

```ts
import { DiGraph, NXGraphFileLoader, NxMermaidGrapher } from 'nx-mermaid-grapher';

const loader = new NXGraphFileLoader();
const diGraph = new DiGraph();
const core = new NxMermaidGrapher(loader, diGraph);

core.init('path/to/file');

const logMerMaidInMd = (str: string) => `\`\`\`mermaid\n${str}\`\`\``;

console.log(logMerMaidInMd(core.getGraphSnippet()));
```

Or, if you wish to use a different graph than the default [DiGraph](./lib/data-structures/di-graph.ds.ts) (Directed graph), you may implement the `IGraph<T>` class and implement your own methods, for example:

```ts
import { IGraph } from "nx-mermaid-grapher/dist/data-structures/graph.ds.interface";

class SomeGraph implements IGraph<MyType> {
    addNode(nodeVal: MyType): void {
        throw new Error("Method not implemented.");
    }
    addEdge(source: MyType, destination: MyType): void {
        throw new Error("Method not implemented.");
    }
    getGraph(): { [key: string]: MyType[]; } {
        throw new Error("Method not implemented.");
    }
}
```

Then just pass it to `NxMermaidGrapher` constructor.

```ts
import {  NXGraphFileLoader, NxMermaidGrapher } from 'nx-mermaid-grapher';

const loader = new NXGraphFileLoader();
const myGraph = new SomeGraph();
const core = new NxMermaidGrapher(loader, myGraph);
```

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details