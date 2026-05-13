# Privacy Policy

_Last updated: 2026-05-13_

`nx-mermaid-grapher` is an open-source command-line tool and library that converts [Nx](https://nx.dev/) dependency graph JSON files into [Mermaid](https://mermaid.js.org/) diagrams. This document explains what data the project does — and does not — handle.

## TL;DR

- The tool runs **entirely on your local machine**.
- It does **not** collect, transmit, or store any personal data, telemetry, analytics, or usage statistics.
- It does **not** make outbound network requests at runtime.

## Data the tool processes

When you run `nx-mermaid-grapher`, it reads the Nx graph JSON file you point it to (via `-f` / `--file`) and writes a Mermaid graph definition to standard output. The contents of that file (project names, dependency relationships, etc.) are processed **locally and in memory only**. Nothing is uploaded anywhere by this tool.

You remain solely responsible for any output you choose to publish (for example, by committing the generated Mermaid diagram to a public repository).

## Telemetry

There is **no telemetry**. The package contains no analytics SDK, crash reporter, or "phone home" mechanism. You can verify this by inspecting the source code in this repository or the published package on npm.

## Third-party services

Installing or using `nx-mermaid-grapher` may indirectly involve third parties that have their own privacy policies, for example:

- **npm / GitHub** when you install or clone the package.
- **Mermaid renderers** (GitHub, GitLab, Mermaid Live Editor, etc.) when you choose to render the generated diagram.

These services are outside the control of this project.

## Data we collect through GitHub

If you interact with this repository on GitHub (issues, pull requests, discussions, security advisories), GitHub will process the information you provide according to [GitHub's Privacy Statement](https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement). The maintainers only see what GitHub exposes to repository collaborators.

## Security reports

If you contact the maintainer privately to report a security issue (see [`SECURITY.md`](./SECURITY.md)), your email address and the contents of your report will be used solely to triage and fix the issue. Reports are not shared publicly without your consent, beyond any eventual GitHub Security Advisory acknowledgements.

## Children's privacy

The project is a developer tool and is not directed at children under 13. No personal data is knowingly collected from anyone.

## Changes to this policy

This policy may be updated as the project evolves. Material changes will be reflected in the commit history of this file and the "Last updated" date above.

## Contact

For privacy-related questions, contact: **au54vz9rk@mozmail.com**.
