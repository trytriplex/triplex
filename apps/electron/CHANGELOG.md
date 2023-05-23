# @triplex/electron

## 0.50.0

### Minor Changes

- 8ea575b: Built output is now mangled.

### Patch Changes

- Updated dependencies [8ea575b]
  - @triplex/client@0.50.0
  - create-triplex-project@0.50.0
  - @triplex/editor@0.50.0
  - @triplex/server@0.50.0

## 0.49.0

### Minor Changes

- 3eae131: When installing deps fails a learn more button is now available to
  help troubleshoot.
- f2be7c9: Windows now also targets 32 bit nsis installer.
- 3eae131: Welcome screen now shows a progress bar when installing node modules.
- 8c5611d: Adds create project action to the welcome screen.

### Patch Changes

- 3eae131: Dependency installation is now aborted when opening another project
- Updated dependencies [8c5611d]
- Updated dependencies [9f0fa17]
- Updated dependencies [9f0fa17]
- Updated dependencies [3eae131]
- Updated dependencies [8c5611d]
- Updated dependencies [3eae131]
  - create-triplex-project@0.49.0
  - @triplex/editor@0.49.0
  - @triplex/client@0.49.0
  - @triplex/server@0.49.0

## 0.48.0

### Minor Changes

- 6fe34af: Windows support is here. Now Triplex cli and electron can be ran on
  Windows, as well as the local dev loop now being functional.
- 5b189b2: When opening a project for the first time if node modules is missing
  Triplex will try to install missing dependencies.

### Patch Changes

- Updated dependencies [6fe34af]
  - @triplex/client@0.48.0
  - @triplex/editor@0.48.0
  - @triplex/server@0.48.0

## 0.47.0

### Minor Changes

- daa2697: Adds a welcome screen to the electron app.
- 1fc7657: Menu bar is now native when ran in the electron app.
- 1fc7657: Electron app now uses a custom title bar.
- 1fc7657: Menu bar now contains view, window, and help.
- e8cf76f: Adds native save dialog support.
- 4164026: Add support for the scene to know what environment it is running in
  (either web or electron).
- daa2697: When opening a project the first found file and export are now
  immediately opened.

### Patch Changes

- Updated dependencies [daa2697]
- Updated dependencies [1fc7657]
- Updated dependencies [1fc7657]
- Updated dependencies [1fc7657]
- Updated dependencies [4164026]
- Updated dependencies [1fc7657]
- Updated dependencies [e8cf76f]
- Updated dependencies [1fc7657]
- Updated dependencies [e8cf76f]
- Updated dependencies [4164026]
- Updated dependencies [4164026]
  - @triplex/editor@0.47.0
  - @triplex/client@0.47.0
  - @triplex/server@0.47.0

## 0.46.4

### Patch Changes

- 59301bf: The macOS target now is notarized during release.
  - @triplex/client@0.46.4
  - @triplex/editor@0.46.4
  - @triplex/server@0.46.4

## 0.46.3

### Patch Changes

- 275d931: Adds error reporting.
- d4c6ce4: Now builds missing x64 architecture.
  - @triplex/client@0.46.3
  - @triplex/editor@0.46.3
  - @triplex/server@0.46.3

## 0.46.2

### Patch Changes

- cab4585: Force version bump.
  - @triplex/client@0.46.2
  - @triplex/editor@0.46.2
  - @triplex/server@0.46.2

## 0.46.1

### Patch Changes

- 111fd6c: Release action now looks for the create tag event.
  - @triplex/client@0.46.1
  - @triplex/editor@0.46.1
  - @triplex/server@0.46.1

## 0.46.0

### Minor Changes

- d67f998: The built electron app now can actually be ran on macOS.
- d67f998: Replaced electron-forge with electron-builder.
- d6dedf5: Moves logger to electron-logger.

### Patch Changes

- Updated dependencies [d67f998]
- Updated dependencies [c808957]
  - @triplex/client@0.46.0
  - @triplex/editor@0.46.0
  - @triplex/server@0.46.0

## 0.45.1

### Patch Changes

- @triplex/client@0.45.1
- @triplex/server@0.45.1

## 0.45.0

### Minor Changes

- 1aadeb8: App now marked as private.

### Patch Changes

- @triplex/client@0.45.0
- @triplex/server@0.45.0

## 0.44.0

### Patch Changes

- Updated dependencies [0242833]
- Updated dependencies [5039e39]
- Updated dependencies [4d8d9cc]
- Updated dependencies [5039e39]
- Updated dependencies [557648e]
  - @triplex/client@0.44.0
  - @triplex/server@0.44.0
