# @triplex/server

## 0.32.0

### Minor Changes

- c87a5f3: Undo/redo now available. When manipulating the scene through transform controls or the context panel each persisted manipulation will be able to be undone (and redone) using hotkeys and the edit menu actions.
- 3a190f1: API response for prop types now returns an object and works with strict compiler option.
- c87a5f3: Adds reset command. Use this to throw away all unsaved changes in the scene.

## 0.31.0

### Minor Changes

- dad975f: Watchers have been replaced with ts-morph events where appropriate to prevent race conditions when changing from source.
- 6e9b119: Paths passed to globs are now normalized to use POSIX separators.

## 0.30.0

### Minor Changes

- 0bb6119: Fixed server errors not returning with status code 500.

## 0.29.0

## 0.28.0

### Minor Changes

- aa1aa8c: Scene transformation using ts-morph has been replaced with Babel significantly speeding up initial load and saving. The need for the `.triplex/tmp` folder is now gone and thus no longer used.
- aa1aa8c: Line and column numbers for scene objects have been corrected and are now consistent across editor, scene, and server.

## 0.27.0

### Minor Changes

- fa35cde: JSX element type inference has been re-written to be more resilient.
- fa35cde: JSX element type inference has been removed from the critical path of the scene transform.
- e5a3419: Context panel now supports more prop types.

## 0.26.0

### Minor Changes

- 785050d: Adds unsaved indicator to the editor.
- 440d427: Server now pings every 30s awaiting a pong from connected clients.
- b77438d: During transformation any leading trivia found is now stripped from cloned jsx elements.

## 0.25.0

### Minor Changes

- 1be56fe: Scene transform now correctly handles props with dashes.
- ed6349b: Extracting prop types now returns early instead of throwing for unhandled nodes.
- aaac9cc: Fix type extraction for jsx elements to handle arrow function components.
- 5736992: Server now throws when accessing files outside of cwd.
- e694cf2: Now override userland config for preserveSymlinks to false to prevent 100% CPU utilization.

## 0.24.0

### Minor Changes

- 4f468f6: The server project [ts-morph] now skips adding files from ts config on instantiation.

## 0.23.0

## 0.22.0

### Minor Changes

- aa9c9ae: Fixes scene transform to handle exported component edge cases.
- 837ef90: Consolidates `ts-morph` pkg into the `server` pkg.

## 0.21.0

### Patch Changes

- @triplex/ts-morph@0.21.0

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
