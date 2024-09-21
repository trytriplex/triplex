# @triplex/vscode

## 0.0.23

### Patch Changes

- 967bfbd0: Upgrade vite to v5.
- Updated dependencies [967bfbd0]
  - @triplex/client@0.69.2
  - @triplex/server@0.69.2

## 0.0.22

### Patch Changes

- 50c28c96: Upgrade tsc.
- 060f66ac: Upgrade react-compiler to latest.
- Updated dependencies [50c28c96]
  - @triplex/client@0.69.1
  - @triplex/server@0.69.1

## 0.0.21

### Patch Changes

- 740ff8f2: Default editor lights can now be turned on or off through the floating controls panel. Previously they would either be always on (if you had no lights in your component) or always off (if you did have lights). Now you can choose.
  - @triplex/client@0.69.0
  - @triplex/server@0.69.0

## 0.0.20

### Patch Changes

- 592aa63f: Prop tags are now passed to number and union inputs.
- a92281f3: Fix external changes affecting all documents instead of the one it originated from.
- a92281f3: Listeners are now disposed of when the panel is disposed.

## 0.0.19

### Patch Changes

- 54a59b63: Changes originating from outside of Triplex for VS Code are now added to the undo/redo stack in the editor.
- e74bf3c4: Modifying elements that live in another file now have their changes persisted
  when saving.
- Updated dependencies [54a59b63]
  - @triplex/server@0.68.8
  - @triplex/client@0.68.8

## 0.0.18

### Patch Changes

- 3157221e: Fix inconsistent spacing between prop inputs in the context panel.
  - @triplex/client@0.68.7
  - @triplex/server@0.68.7

## 0.0.17

### Patch Changes

- 4cf3e526: Color input no longer has a clear button.
- 4cf3e526: Fix union inputs missing descriptions.
  - @triplex/client@0.68.6
  - @triplex/server@0.68.6

## 0.0.16

### Patch Changes

- b6d89da7: The input panel layout has been refactored to keep the type toggle button always aligned with the first input.
  - @triplex/client@0.68.5
  - @triplex/server@0.68.5

## 0.0.15

### Patch Changes

- 35920ba3: Add component controls.
- Updated dependencies [d78010e0]
- Updated dependencies [d78010e0]
  - @triplex/server@0.68.4
  - @triplex/client@0.68.4

## 0.0.14

### Patch Changes

- 4ab74c91: Fix error splash screen having a huge stack trace unexpectedly.
- 4ab74c91: Add provider controls to the scene panel.
- 4ab74c91: Support default values in string, number, boolean, and literal union inputs.
- 0d97596c: Add link to code for controlled props.
- 0d97596c: Fix borders flashing between two different colors on initial load.
  - @triplex/client@0.68.3
  - @triplex/server@0.68.3

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
