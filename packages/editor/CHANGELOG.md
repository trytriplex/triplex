# @triplex/editor

## 0.37.0

### Minor Changes

- 23fe64a: Adds delete scene object. Access through the context panel when focusing on a scene object.

### Patch Changes

- Updated dependencies [23fe64a]
- Updated dependencies [1a2ecea]
  - @triplex/bridge@0.37.0
  - @triplex/ws-client@0.37.0

## 0.36.0

### Patch Changes

- @triplex/bridge@0.36.0
- @triplex/ws-client@0.36.0

## 0.35.0

### Minor Changes

- e53a703: Prop font size in the context panel has been reduced.
- e53a703: Emissive prop now considered a color.

### Patch Changes

- @triplex/bridge@0.35.0
- @triplex/ws-client@0.35.0

## 0.34.0

### Minor Changes

- 2a64658: Prop descriptions are now viewable in the context panel when hovering over prop names.
- 2a64658: The context panel now displays all available props on a component even if they aren't yet declared thanks to the TypeScript compiler and ts-morph. Not all prop types are supported currently, if you have one that you expected to be available but isn't please reach out.

### Patch Changes

- Updated dependencies [2a64658]
  - @triplex/ws-client@0.34.0
  - @triplex/bridge@0.34.0

## 0.33.0

### Minor Changes

- 1067d23: Adds transform controls to the ui.

### Patch Changes

- Updated dependencies [1067d23]
  - @triplex/bridge@0.33.0
  - @triplex/ws-client@0.33.0

## 0.32.0

### Minor Changes

- 73d9e8c: Inputs no longer trigger dirty scene state if their value hasn't changed.
- c87a5f3: Undo/redo now available. When manipulating the scene through transform controls or the context panel each persisted manipulation will be able to be undone (and redone) using hotkeys and the edit menu actions.
- c87a5f3: Saving with hotkey is now available when focus is on the ui.
- c87a5f3: Adds reset command. Use this to throw away all unsaved changes in the scene.

### Patch Changes

- Updated dependencies [c87a5f3]
  - @triplex/bridge@0.32.0
  - @triplex/ws-client@0.32.0

## 0.31.0

### Minor Changes

- 5ac3a26: UI has been darkened and borders have been deemphasized.
- a1e3127: When source changes ui now reflects the updated value.
- 48002a7: Array input no longer caches its value which resulted in unexpected bugs when transforming in scene and then through the ui.

### Patch Changes

- @triplex/bridge@0.31.0
- @triplex/ws-client@0.31.0

## 0.30.0

### Minor Changes

- 0bb6119: Adds support for updating scene objects through the context panel.
- 0bb6119: Extract inputs to their own custom components.
- 0bb6119: Fix color input not showing for various color inputs.

### Patch Changes

- Updated dependencies [0bb6119]
  - @triplex/bridge@0.30.0
  - @triplex/ws-client@0.30.0

## 0.29.0

### Minor Changes

- 0d83ef2: Scene drawer now has correct padding and is increased in width.
- 0d83ef2: The catch all prop field now has capped height stopping it from looking ridiculous.

### Patch Changes

- @triplex/bridge@0.29.0
- @triplex/ws-client@0.29.0

## 0.28.0

### Minor Changes

- aa1aa8c: Scene transformation using ts-morph has been replaced with Babel significantly speeding up initial load and saving. The need for the `.triplex/tmp` folder is now gone and thus no longer used.
- aa1aa8c: Line and column numbers for scene objects have been corrected and are now consistent across editor, scene, and server.
- aa1aa8c: Scene drawer now shows loading text when appropriate.

### Patch Changes

- @triplex/bridge@0.28.0
- @triplex/ws-client@0.28.0

## 0.27.0

### Minor Changes

- fa35cde: Fixes UI scrolling and contrast bugs.
- 9b1d135: Increased gutters in the scene panel list as well as fixing the variable width in the context panel.
- 246217f: Text contrast in the scene and context panel have been improved.
- e5a3419: Context panel now supports more prop types.

### Patch Changes

- @triplex/bridge@0.27.0
- @triplex/ws-client@0.27.0

## 0.26.0

### Minor Changes

- 785050d: Adds unsaved indicator to the editor.
- 71374c9: Scene, context, and open scene containers now scroll when overflowing with content.

### Patch Changes

- Updated dependencies [785050d]
  - @triplex/ws-client@0.26.0
  - @triplex/bridge@0.26.0

## 0.25.0

### Patch Changes

- @triplex/bridge@0.25.0
- @triplex/ws-client@0.25.0

## 0.24.0

### Patch Changes

- @triplex/bridge@0.24.0
- @triplex/ws-client@0.24.0

## 0.23.0

### Patch Changes

- @triplex/bridge@0.23.0
- @triplex/ws-client@0.23.0

## 0.22.0

### Minor Changes

- aa9c9ae: Lighten selected state.

### Patch Changes

- @triplex/bridge@0.22.0
- @triplex/ws-client@0.22.0

## 0.21.0

### Patch Changes

- @triplex/bridge@0.21.0
- @triplex/ws-client@0.21.0

## 0.20.0

### Minor Changes

- 1c9771d: Named exports are now able to be opened by the editor.
- 1c9771d: Scene drawer now shows named exports from scenes.
- 1c9771d: Focus events now only use line and column numbers.

### Patch Changes

- Updated dependencies [1c9771d]
  - @triplex/bridge@0.20.0
  - @triplex/ws-client@0.20.0

## 0.19.0

### Patch Changes

- @triplex/bridge@0.19.0
- @triplex/ws-client@0.19.0

## 0.18.0

### Patch Changes

- @triplex/bridge@0.18.0
- @triplex/ws-client@0.18.0

## 0.17.0

### Patch Changes

- @triplex/bridge@0.17.0
- @triplex/ws-client@0.17.0

## 0.16.0

### Minor Changes

- e7c026b: Scene drawer no-longer stays open when selecting a scene.
- 7ff35f3: Context panel no longer throws when navigating between scene and a scene object is selected.
- e7c026b: Scene panel now shows correctly nested jsx elements.
- e7c026b: Disabled menu items are now actually disabled.
- 7ff35f3: Upgrades @react-three/fiber to latest.
- 7ff35f3: Navigating to host elements is no longer possible (as there is nowhere to navigate to).
- 2fa7c45: Adds author field to package.json.

### Patch Changes

- Updated dependencies [d8e1602]
- Updated dependencies [7ff35f3]
- Updated dependencies [2fa7c45]
  - @triplex/bridge@0.16.0
  - @triplex/ws-client@0.16.0

## 0.15.0

### Minor Changes

- e54e0f8: Editor now has a select menu with useful actions when a scene object is selected.
- e54e0f8: Bridge events now flow unidirectionally enabling the editor ui to initiate events to the scene, such as navigate and focus.

### Patch Changes

- Updated dependencies [e54e0f8]
  - @triplex/bridge@0.15.0
  - @triplex/ws-client@0.15.0

## 0.14.0

### Minor Changes

- 7a8083c: The open rpc has been added back to prevent the "flash of no scene" when transitioning between scenes for the first time.

### Patch Changes

- @triplex/bridge@0.14.0
- @triplex/ws-client@0.14.0

## 0.13.0

### Minor Changes

- cfbd47b: When transitioning between scenes there is no longer a flash of hidden scene objects.
- 969feab: Removes unneeded fetch calls.
- cc917d7: Adds usage of ws-client pkg.
- 969feab: Adds react suspense powered websocket abstraction.
- a4d6882: Adds context panel for selected scene objects.
- 99075ff: Adds error boundaries so the app doesn't blow up when a scene isn't found.
- cfbd47b: Scene meta has been extrated into a common hook.
- 969feab: Scene list and scene components ui now fetch data using the websocket client.

### Patch Changes

- Updated dependencies [a4d6882]
- Updated dependencies [cc917d7]
  - @triplex/bridge@0.7.0
  - @triplex/ws-client@0.1.0

## 0.12.0

### Minor Changes

- 55f0206: Fixed focus and blur events between the scene and the editor.
- 55f0206: Scene components now appear nested when children of other components in the UI.

## 0.11.0

### Minor Changes

- 3c725bc: Force release all packages.

### Patch Changes

- Updated dependencies [3c725bc]
  - @triplex/bridge@0.6.0

## 0.10.0

### Minor Changes

- a32c72e: Adds the scene component list to the sidebar with the ability to focus scene objects on click.
  Scene components in this list are also selected when focusing scene objects in the scene.

## 0.9.0

### Minor Changes

- ac9624f: Fixes client/host race condition where host would send events before the client has connected.
- 7db42bd: Adds open scene drawer.

### Patch Changes

- Updated dependencies [ac9624f]
  - @triplex/bridge@0.5.0

## 0.8.0

### Minor Changes

- 387f6cd: Editor now able to use tailwindcss during dev, which is compiled away when packaged to npm.
- 387f6cd: Adds a menu bar to the editor.

## 0.7.0

### Minor Changes

- 56dde00: Fixes publish config main field to point to the correct location.

## 0.6.0

### Minor Changes

- c84a8ca: Package now declares the main field.

## 0.5.0

### Minor Changes

- c8c4a55: Fixes scene frame so it can hot module reload.

## 0.4.0

### Minor Changes

- b144bb1: Package `build` now use `swc` and `tsc` directly.

### Patch Changes

- Updated dependencies [b144bb1]
  - @triplex/bridge@0.4.0

## 0.3.0

### Minor Changes

- bbc457e: Fixes some bugs preventing triplex from being able to be ran via cli.

### Patch Changes

- Updated dependencies [bbc457e]
  - @triplex/bridge@0.3.0

## 0.2.0

### Minor Changes

- 08a03af: Fixes publish to build before pushing.

### Patch Changes

- Updated dependencies [08a03af]
  - @triplex/bridge@0.2.0

## 0.1.0

### Minor Changes

- 9c120b4: Initial release.

### Patch Changes

- Updated dependencies [9c120b4]
  - @triplex/bridge@0.1.0
