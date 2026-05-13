# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- `SECURITY.md` and `PRIVACY.md`.
- `build:dev` script (source maps for local debugging).
- New CLI exports `run(argv)` and `CliError` from `lib/cli` for programmatic use
  and testing.
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

[Unreleased]: https://github.com/Fcmam5/nx-mermaid-grapher/compare/1.1.0...HEAD
[1.1.0]: https://github.com/Fcmam5/nx-mermaid-grapher/compare/1.0.1...1.1.0
[1.0.1]: https://github.com/Fcmam5/nx-mermaid-grapher/compare/1.0.0...1.0.1
[1.0.0]: https://github.com/Fcmam5/nx-mermaid-grapher/releases/tag/1.0.0
