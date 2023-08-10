// it's ugly, untested and repetitive, I promise, I will clean it up
import { DiGraph } from './data-structures/di-graph.ds';
import { NXGraphFileLoader } from './nx/load-nx-graph';

const loader = new NXGraphFileLoader();
const content = loader.readNXGraph('./tests/mocks/ddd-example.graph.json');

const diGraph = new DiGraph();
// fill nodes
Object.keys(content.graph.nodes).forEach((n) => diGraph.addNode(n));

Object.values(content.graph.dependencies).forEach((dep) => {
  dep.forEach((d) => {
    diGraph.addEdge(d.source, d.target);
  });
});

// generate output
let output = `graph LR
`;

const rs = diGraph.getGraph();

Object.keys(rs).forEach((k) => {
  if (rs[k].length) {
    const line = [k, ...rs[k]].join('-->');

    output += `  ${line}\n`;
  }
});

console.log(output);
