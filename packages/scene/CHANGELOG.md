# @triplex/scene

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

- d8e1602: Fixed non-scene objects not being able to be selected through the UI.
- 7ff35f3: Transform controls now longer continuously error when a scene object has been removed from the scene.
- 7ff35f3: Upgrades @react-three/fiber to latest.
- e7c026b: Selecting host scene objects now have the correct objects selected instead of the wrapping parent group
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

- e54e0f8: Bridge events now flow unidirectionally enabling the editor ui to initiate events to the scene, such as navigate and focus.

### Patch Changes

- Updated dependencies [e54e0f8]
  - @triplex/bridge@0.15.0
  - @triplex/ws-client@0.15.0

## 0.14.0

### Patch Changes

- @triplex/bridge@0.14.0
- @triplex/ws-client@0.14.0

## 0.12.0

### Minor Changes

- 99075ff: Transformed scene entrypoints now export the variable `triplexMeta` instead of `__r3fEditorMeta`.
- 99075ff: When being loaded for the first time scenes will now suspend. This means for any errors thrown during loaded are now propagated to the nearest error boundary.
- cfbd47b: When transitioning between scenes there is no longer a flash of hidden scene objects.
- 969feab: Removes unneeded fetch calls.
- cc917d7: Adds usage of ws-client pkg.
- a4d6882: Passes name during object focus.
- 99075ff: Adds error boundaries so the app doesn't blow up when a scene isn't found.
- 7bebe67: When transforming a selected scene object the intended object object3d is now modified instead of the parent group.
- 99075ff: Scene now loads updated triplex meta when the source file changes.
- cfbd47b: The hotkey check when navigating to a child scene now checks for shift usage instead of upper "f".

### Patch Changes

- Updated dependencies [a4d6882]
- Updated dependencies [cc917d7]
  - @triplex/bridge@0.7.0
  - @triplex/ws-client@0.1.0

## 0.11.0

### Minor Changes

- 55f0206: Scene components now appear nested when children of other components in the UI.

## 0.10.0

### Minor Changes

- 3c725bc: Force release all packages.

### Patch Changes

- Updated dependencies [3c725bc]
  - @triplex/bridge@0.6.0

## 0.9.0

### Minor Changes

- ac9624f: Fixes client/host race condition where host would send events before the client has connected.

### Patch Changes

- Updated dependencies [ac9624f]
  - @triplex/bridge@0.5.0

## 0.8.0

### Minor Changes

- 387f6cd: Adds a menu bar to the editor.

## 0.7.0

### Minor Changes

- c84a8ca: Package now declares the main field.

## 0.6.0

### Minor Changes

- 5498a39: Scene frame now correctly calls back to the react refresh registry on hmr.

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
