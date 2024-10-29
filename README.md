# Triplex Monorepo

This is an internal private monorepo for Triplex.

This repo uses `pnpm`.

## Repository Structure

### Apps

All the published apps including the documentation (`docs`), VS Code extension (`vscode`) and standalone Electron app (`electron`).

### Packages

Core packages that power Triplex. `@triplex` namespaces most of the business logic broken up in the following:

- `editor` - Main editor UI and functionality
- `server` - Backend for file operations and type inference
- `client` - Scene runner and userland code execution
- `lib` - Common UI-agnostic code shared between packages
- `ux` - Common UI components shared between packages
- `renderer-r3f` - React Three Fiber renderer implementation
- `renderer-react` - React DOM renderer implementation
- `bridge` - Communication layer between editor and renderers

### Examples

Collection of example projects showcasing Triplex usage.
