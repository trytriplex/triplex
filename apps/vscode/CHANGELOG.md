# @triplex/vscode

## 0.0.13

### Patch Changes

- f7fa4c78: Panel min/max size has been increased.
- 21a64166: Fix webview shifting 4px when selecting an element for the first time.
- f7fa4c78: Panel splitter resizing now uses initial DOM width instead of state width.
  - @triplex/client@0.68.2
  - @triplex/server@0.68.2

## 0.0.12

### Patch Changes

- 22164772: Add color input.
- c96826c8: Add resize to scene panel.
- a5df6744: Block input keydown event propagation to prevent unmodified keybindings from being fired.
- 22164772: Pass through description titles to prop inputs.
  - @triplex/client@0.68.1
  - @triplex/server@0.68.1

## 0.0.11

### Patch Changes

- dd99789a: App now runs with the React Compiler turned on.
- bfdfdc22: Expose jump to element command in the element actions menu.
- 2f68ff8f: Delete command now exposed via contributed keybinding.
- a52fead7: Expose duplicate command in the element actions menu.
- 37b4d9a0: Component switcher now correctly sets default value.
- dd99789a: Upgrade React Compiler.
- d083ff13: Add delete element action.
  - @triplex/client@0.68.0
  - @triplex/server@0.68.0

## 0.0.10

### Patch Changes

- d0f01ca5: Elements filter is now accessed behind a button in the editor panel.
- d0f01ca5: Prop controls now take up more space in the panel.
- d0f01ca5: There is now a control for quickly switching between components in the current
  file in the editor panel.
- d0f01ca5: Stabilise state changes using transitions.
- d0f01ca5: Remove usage of vsce inputs.
- f035ce9c: Add duplicate command, use via `CommandOrCtrl+D`.
  - @triplex/client@0.67.9
  - @triplex/server@0.67.9

## 0.0.9

### Patch Changes

- cd444563: Opening subsequent components with CodeLens in the same file now works as expected on Windows.
- 2c991e7b: Fix blur element regression.
  - @triplex/client@0.67.8
  - @triplex/server@0.67.8

## 0.0.8

### Patch Changes

- 23eaef8a: Fix compound hotkeys in electron not being functional.
- Updated dependencies [e958b697]
  - @triplex/server@0.67.7
  - @triplex/client@0.67.7

## 0.0.7

### Patch Changes

- e4081607: Prevent hotkeys double firing when modifier keys are pressed.
- a7862f3c: Strip meta.
- a7862f3c: Fix x-plat builds.
- Updated dependencies [050e5845]
  - @triplex/server@0.67.6
  - @triplex/client@0.67.6

## 0.0.6

### Patch Changes

- 1ba572ca: Undo/redo now are triggered using explicit ids.
- 8ec6f701: Add scene panel.
- a1121431: Vsce element controls.
- 8a399d50: Hide scene panel during play.
- f1c507e9: Fix input bugs.
- Updated dependencies [1ba572ca]
- Updated dependencies [a1121431]
  - @triplex/server@0.67.5
  - @triplex/client@0.67.5

## 0.0.5

### Patch Changes

- 04b96fde: Add readme.
- cba1c8db: Internal pkg refactor.
- 22b75f50: Dispose the project when closed prematurely during initialization.
- 0d2ae698: Reset control now shown always.
- 0d2ae698: Prevent controls being fired when saving.
- 08f3d647: Add error boundaries to the root elements.
- Updated dependencies [cde561dc]
  - @triplex/client@0.67.4
  - @triplex/server@0.67.4

## 0.0.4

### Patch Changes

- 9dc6a74d: Add play controls.
- 45b1c4d4: Refactor to use vsce custom editor.
- c9c2bd90: Add scene controls.
- b8b97458: Forward keypress events to the parent document.
- Updated dependencies [b8b97458]
  - @triplex/client@0.67.3
  - @triplex/server@0.67.3

## 0.0.3

### Patch Changes

- 19474be: Adds missing extension metadata.

## 0.0.2

### Patch Changes

- 4341736: Initial release of the extension. If you're reading this it means
  you're a _very early_ adopter! Please give feedback on
  [Discord](https://discord.gg/nBzRBUEs4b) or
  [Twitter](https://twitter.com/trytriplex).
- Updated dependencies [506ba7e]
- Updated dependencies [264dca9]
- Updated dependencies [264dca9]
  - @triplex/server@0.67.2
  - @triplex/client@0.67.2
