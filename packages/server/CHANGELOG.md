# @triplex/server

## 0.20.0

### Minor Changes

- 1c9771d: Named exports are now able to be opened by the editor.
- 1c9771d: Scene drawer now shows named exports from scenes.

### Patch Changes

- Updated dependencies [1c9771d]
  - @triplex/ts-morph@0.20.0

## 0.19.0

### Patch Changes

- @triplex/ts-morph@0.19.0

## 0.18.0

### Patch Changes

- @triplex/ts-morph@0.18.0

## 0.17.0

### Patch Changes

- @triplex/ts-morph@0.17.0

## 0.16.0

### Minor Changes

- 7ff35f3: Context panel no longer throws when navigating between scene and a scene object is selected.
- 2fa7c45: Adds triplex config and files option, an array of globs for triplex to find scenes with.
- 926359a: Server now gracefully exits when closed.
- 2fa7c45: Adds author field to package.json.
- 926359a: The temp folder is now located in .triplex/tmp.

### Patch Changes

- Updated dependencies [e7c026b]
- Updated dependencies [7ff35f3]
- Updated dependencies [2fa7c45]
  - @triplex/ts-morph@0.16.0

## 0.15.0

### Patch Changes

- @triplex/ts-morph@0.15.0

## 0.14.0

### Minor Changes

- 7a8083c: The open rpc has been added back to prevent the "flash of no scene" when transitioning between scenes for the first time.

### Patch Changes

- @triplex/ts-morph@0.14.0

## 0.9.0

### Minor Changes

- a4d6882: Adds scene object ws request.
- 969feab: Adds websocket server and replaces scene and scene components endpoints with it.
- cc917d7: Removes unused apis.

### Patch Changes

- Updated dependencies [99075ff]
- Updated dependencies [969feab]
- Updated dependencies [a4d6882]
  - @triplex/ts-morph@0.8.0

## 0.8.0

### Minor Changes

- 55f0206: Scene components now appear nested when children of other components in the UI.

### Patch Changes

- Updated dependencies [55f0206]
  - @triplex/ts-morph@0.7.0

## 0.7.0

### Minor Changes

- 3c725bc: Force release all packages.

### Patch Changes

- Updated dependencies [3c725bc]
  - @triplex/ts-morph@0.6.0

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
