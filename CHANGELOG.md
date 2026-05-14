# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.1.0] - 2026-05-15

### Added

- **`-p, --projects <lib>` CLI flag** (repeatable) to render only the specified
  libraries and edges between them. Ideal for affected-project subgraphs when
  you already know which projects changed (e.g. from `nx show projects --affected`).
  Composes with `-e` / `--exclude` — exclusion runs first, then the allowlist.
- Public export `selectLibs(graph, selected)` from `lib/formatters`. Lifts the
  allowlist filtering logic so programmatic callers can compose it with
  `formatGraph` and `computeStats` (e.g. `formatGraph(selectLibs(graph, affected), 'mermaid')`).

### Deprecated

- `NxMermaidGrapher.getGraphSnippet()` parameter order. The current signature
  places `selectedLibraries` after `format`, forcing callers to always pass
  `format` when they only want to filter by selected libraries.

### Fixed

- Rewrote affected-project recipe. Corrects the false claim that
  `nx graph --affected --file=...` outputs an affected-only JSON. The proper
  workflow is: `nx graph --file=...` + `nx show projects --affected --json`
  piped through `jq` to build `-p` flags.
- Updated GitHub Actions workflow example to use the same correct approach.

## [2.0.0] - 2026-05-14

### Added

- `SECURITY.md` and `PRIVACY.md`.
- `build:dev` script (source maps for local debugging).
- New CLI exports `run(argv)` and `CliError` from `lib/cli` for programmatic use
  and testing.
- **Multiple output formats** via `-o, --format <mermaid|edges|json|dot|stats>`
  (default `mermaid`). The new formats are aimed at scripts and AI agents that
  need cheap, structured access to the workspace topology without re-parsing
  the much larger raw Nx graph JSON:
  - `edges` — minimal `source target` lines.
  - `json` — compact `{ "nodes": [...], "edges": [[src, dst], ...] }`.
  - `dot` — Graphviz `digraph` declaration, pipe into `dot -Tsvg`.
  - `stats` — plain-text summary: counts, roots/leaves, cycle detection,
    max depth + an example longest path, and per-project fan-in/fan-out
    sorted by most depended-on first.
- New `--raw` flag to emit Mermaid without the surrounding
  `` ```mermaid `` markdown fence.
- **Read from stdin** via `--stdin` (or the idiomatic `-f -`). Lets agents
  and CI steps pipe `nx graph --file=/dev/stdout` straight into the tool
  without round-tripping through a temp file. Mutually exclusive with `-f`.
- Public exports `formatGraph`, `isOutputFormat`, `OUTPUT_FORMATS`, and the
  `OutputFormat` type from `lib/formatters` for programmatic use.
- Public exports `computeStats`, `GraphStats`, and `ProjectStats` from
  `lib/stats` for callers that want the structured stats data instead of the
  rendered text summary.
- New `excludeLibs(graph, excluded)` export. Lifts the previously-private
  filtering logic out of `NxMermaidGrapher` so programmatic callers can
  compose it with `formatGraph` and `computeStats`
  (e.g. `computeStats(excludeLibs(graph, ['noisy-lib']))`).
- `NXGraphFileLoader.readNXGraph` now validates the parsed JSON and throws a
  descriptive error if the file is not a recognisable Nx graph dump (missing
  `graph`, `graph.nodes`, or `graph.dependencies`).

### Changed

- **BREAKING:** require Node.js `>=22`.
- Migrated ESLint to v10 flat config (`eslint.config.js`).
- Upgraded TypeScript to 6, ESLint to 10, Jest/ts-jest to 30, Stryker to 9, and other dev dependencies to latest.
- `build` no longer emits source maps; published tarball is ~21% smaller.
- Refactored `lib/cli.ts` to expose a pure `run(argv): string` entry point and a
  `CliError` class; the script is now executed only when invoked directly
  (`require.main === module`). Test coverage on `cli.ts` went from 0% to 100%.
- `NxMermaidGrapher.getGraphSnippet` now takes an optional second argument
  `format: OutputFormat = 'mermaid'`. Existing callers are unaffected.
- Internal cleanup of `core.ts` and `di-graph.ds.ts`: linear-time
  `getGraphSnippet` (was quadratic in shape due to array spreading), `Set`-based
  exclusion lookup in `filterOutLibs`, and a properly typed `Map<string, string[]>`
  in `DiGraph`. No user-visible behavior change.

### Removed

- `prettier-eslint` dev dependency.
- `class-transformer` runtime dependency. The previous `plainToClass` call was a
  no-op (the target class had no decorators); replaced with a plain
  `JSON.parse(...) as GraphJsonResponse` cast and removed the unused
  `GraphJsonResponseCls` class.
- `yargs` runtime dependency. CLI argument parsing now uses Node's built-in
  `util.parseArgs` (stable since Node 18, available on our Node `>=22` floor).
  The published package now has **zero runtime dependencies**.

### Security

- Enabled GitHub Private Vulnerability Reporting.
- `npm audit`: 0 vulnerabilities.

## [1.1.0] - 2023-08-17

### Added

- `-e` / `--exclude` CLI option to exclude one or more libraries from the
  generated graph ([#1]).
- Contributing guide.

## [1.0.1] - 2023-08-14

### Fixed

- Enumerate runtime dependencies (`class-transformer`, `yargs`) in
  `package.json` so the package installs cleanly from npm.

## [1.0.0] - 2023-08-12

### Added

- Initial public release of `nx-mermaid-grapher`.
- CLI (`nx-mermaid-grapher -f <path>`) that converts an Nx dependency graph
  JSON file into a Mermaid `graph LR` snippet.
- Programmatic API exposing `NxMermaidGrapher`, `NXGraphFileLoader`, and
  `DiGraph` for embedding or extending the tool.

[#1]: https://github.com/Fcmam5/nx-mermaid-grapher/issues/1

[Unreleased]: https://github.com/Fcmam5/nx-mermaid-grapher/compare/2.0.0...HEAD
[2.0.0]: https://github.com/Fcmam5/nx-mermaid-grapher/compare/1.1.0...2.0.0
[1.1.0]: https://github.com/Fcmam5/nx-mermaid-grapher/compare/1.0.1...1.1.0
[1.0.1]: https://github.com/Fcmam5/nx-mermaid-grapher/compare/1.0.0...1.0.1
[1.0.0]: https://github.com/Fcmam5/nx-mermaid-grapher/releases/tag/1.0.0
