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

## Changesets

We use `changesets` when making any production facing changes in Triplex apps (Standalone & Triplex for VS Code). If you're only making a change to a test, example, or documentation, then don't bother creating a changeset.

To create a changeset run the following:

```bash
pnpm changeset
```

New features should be `minor` and bug fixes / chores should be `patch`. The message you should write needs to be informative enough to end users that if they were to read it they can understand it will enough.

Don't worry about getting it 100% correct we can update the CHANGELOG.md after a release if we need.

**Note** — For Triplex Standalone releases we manually curate the CHANGELOG in the GitHub release by copying over the changes from this private monorepo to the public repo that has the releases.
