# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- `SECURITY.md` and `PRIVACY.md`.
- `build:dev` script (source maps for local debugging).

### Changed

- **BREAKING:** require Node.js `>=22`.
- Migrated ESLint to v10 flat config (`eslint.config.js`).
- Upgraded TypeScript to 6, ESLint to 10, Jest/ts-jest to 30, Stryker to 9, yargs to 18, and other dev dependencies to latest.
- `build` no longer emits source maps; published tarball is ~21% smaller.

### Removed

- `prettier-eslint` dev dependency.

### Security

- Enabled GitHub Private Vulnerability Reporting.
- `npm audit`: 0 vulnerabilities.

## [1.1.0] - 2023-11-02

See git history for details of this and earlier releases.

## [1.0.1]

See git history.

## [1.0.0]

Initial public release.

[Unreleased]: https://github.com/Fcmam5/nx-mermaid-grapher/compare/1.1.0...HEAD
[1.1.0]: https://github.com/Fcmam5/nx-mermaid-grapher/compare/1.0.1...1.1.0
[1.0.1]: https://github.com/Fcmam5/nx-mermaid-grapher/compare/1.0.0...1.0.1
[1.0.0]: https://github.com/Fcmam5/nx-mermaid-grapher/releases/tag/1.0.0
