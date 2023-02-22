# @triplex/editor

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
