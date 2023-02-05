# @triplex/server

## 0.6.0

### Minor Changes

- 55e8a52: On save the source file will be formatted with prettier if a prettierrc file was found, else it will be formatted by the TypeScript compiler.
- 7db42bd: Adds /scene route to return all available files in the cwd.

### Patch Changes

- Updated dependencies [55e8a52]
  - @triplex/ts-morph@0.5.0

## 0.5.0

### Minor Changes

- dea65bf: The temp folder is not outside of node_modules.

## 0.4.0

### Minor Changes

- b144bb1: Package `build` now use `swc` and `tsc` directly.

### Patch Changes

- Updated dependencies [b144bb1]
  - @triplex/ts-morph@0.4.0

## 0.3.0

### Minor Changes

- bbc457e: Fixes some bugs preventing triplex from being able to be ran via cli.

### Patch Changes

- Updated dependencies [bbc457e]
  - @triplex/ts-morph@0.3.0

## 0.2.0

### Minor Changes

- 08a03af: Fixes publish to build before pushing.

### Patch Changes

- Updated dependencies [08a03af]
  - @triplex/ts-morph@0.2.0

## 0.1.0

### Minor Changes

- 9c120b4: Initial release.

### Patch Changes

- Updated dependencies [9c120b4]
  - @triplex/ts-morph@0.1.0
