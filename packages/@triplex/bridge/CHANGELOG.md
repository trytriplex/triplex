# @triplex/bridge

## 0.68.6

## 0.68.5

## 0.68.4

## 0.68.3

## 0.68.2

## 0.68.1

## 0.68.0

### Minor Changes

- 60ee4011: Add none transform option. The renderer now defaults to this.

## 0.67.9

## 0.67.8

### Patch Changes

- 3952a1c8: Fix hotkeys with modifiers (shift/cmd/etc) not functioning on Windows.

## 0.67.7

## 0.67.6

## 0.67.5

## 0.67.4

## 0.67.3

### Patch Changes

- c9c2bd90: Fix response message not being sent inside vsce.
- b8b97458: Forward keypress events to the parent document.

## 0.67.2

## 0.67.1

## 0.67.0

### Minor Changes

- 55ecc10: Add camera switcher for play state.
- b4886f6: Add play/pause scene states.

### Patch Changes

- 3343fad: Hard refresh now reloads the entire editor.

## 0.66.0

### Minor Changes

- 625e23a: The selection system has been reimplemented, removing the need for
  intermediate group elements powering scene lookups.

## 0.65.2

## 0.65.1

## 0.65.0

### Minor Changes

- 29c9d95: Add support for local/world transforms.

## 0.64.4

## 0.64.3

## 0.64.2

## 0.64.1

## 0.64.0

### Minor Changes

- 8712a12: Add renderer attributes. Refer to docs.

## 0.63.0

### Patch Changes

- 480866f: Upgrade TypeScript.

## 0.62.0

### Minor Changes

- 3612434: Add thumbnail support for renderers.

### Patch Changes

- cea76c2: Simplify bridge event names.
- 99b97cf: Remove need for router inside the r3f renderer.
- cdbdc16: Remove redundant bridge events for element props.
- 7313788: Internal refactor.
- fe7c5f9: Config now passed to renderer func.

## 0.61.2

## 0.61.1

## 0.61.0

### Minor Changes

- b407820: Add file tabs.

## 0.60.1

## 0.60.0

### Patch Changes

- 0cce596: Error overlay no longer closers after a HMR event.

## 0.59.1

## 0.59.0

### Patch Changes

- f6e068c: Packages have been moved into namedspaced folders.

## 0.58.2

### Patch Changes

- b5247c2: Apply lint and prettier fixes.

## 0.58.1

## 0.58.0

### Minor Changes

- 3e1e081: Separate soft refresh from hard refresh.

## 0.57.2

## 0.57.1

## 0.57.0

### Minor Changes

- 5c1fc3d: Add editing child jsx elements through the Triplex UI.
- 2b61384: Adding an asset is now contextual, the original button adds to the
  open component, while the add buttons on each element in the left scene panel
  add to it as a child.

## 0.56.1

## 0.56.0

### Minor Changes

- 32a110f: Add top-level scene component to the scene panel. When selected users
  can modify the props during their seession to see what happens.

### Patch Changes

- 2e53a2e: Turn off type declaration maps.

## 0.55.3

## 0.55.2

## 0.55.1

### Patch Changes

- ea86fdc: Add license banner.

## 0.55.0

## 0.54.2

## 0.54.1

## 0.54.0

### Minor Changes

- 8fad65a: Adds camera type to controls menu, allowing you to switch between
  perspective and orthographic camera.
- e0038f6: Add support for viewing through a user land camera.

## 0.53.1

## 0.53.0

### Minor Changes

- c71412b: Adds refresh scene action available in the File menubar and through
  cmd/ctrl + r.

## 0.52.0

### Minor Changes

- 8d532f5: Editor now shows build time and runtime errors in an error overlay.

## 0.51.1

## 0.51.0

## 0.50.1

## 0.50.0

### Minor Changes

- 8ea575b: Built output is now mangled.

## 0.49.0

## 0.48.0

## 0.47.0

## 0.46.4

## 0.46.3

## 0.46.2

## 0.46.1

## 0.46.0

## 0.45.1

## 0.45.0

## 0.44.0

### Minor Changes

- 0242833: Scene now removes intermediate state when resetting.
- 4d8d9cc: Builds are now minified.
- 557648e: Editor has been extracted out of the client dev server and now is
  bundled when published to npm.

## 0.43.0

### Minor Changes

- b7bbeba: When adding a new element to the scene if you have a selection it
  will be added as a child. If you have no selection it will be added to the
  root component.

## 0.42.0

## 0.41.0

## 0.40.0

## 0.39.0

## 0.38.0

## 0.37.0

### Minor Changes

- 23fe64a: Adds delete scene object. Access through the context panel when
  focusing on a scene object.
- 1a2ecea: Iframe client bridge can now wait for a response from host.

## 0.36.0

## 0.35.0

## 0.34.0

### Minor Changes

- 2a64658: The context panel now displays all available props on a component
  even if they aren't yet declared thanks to the TypeScript compiler and
  ts-morph. Not all prop types are supported currently, if you have one that you
  expected to be available but isn't please reach out.

## 0.33.0

### Minor Changes

- 1067d23: Adds transform controls to the ui.

## 0.32.0

### Minor Changes

- c87a5f3: Undo/redo now available. When manipulating the scene through
  transform controls or the context panel each persisted manipulation will be
  able to be undone (and redone) using hotkeys and the edit menu actions.

## 0.31.0

## 0.30.0

### Minor Changes

- 0bb6119: Adds support for updating scene objects through the context panel.

## 0.29.0

## 0.28.0

## 0.27.0

## 0.26.0

## 0.25.0

## 0.24.0

## 0.23.0

## 0.22.0

## 0.21.0

## 0.20.0

### Minor Changes

- 1c9771d: Focus events now only use line and column numbers.

## 0.19.0

## 0.18.0

## 0.17.0

## 0.16.0

### Minor Changes

- d8e1602: Fixed non-scene objects not being able to be selected through the UI.
- 7ff35f3: Upgrades @react-three/fiber to latest.
- 2fa7c45: Adds author field to package.json.

## 0.15.0

### Minor Changes

- e54e0f8: Bridge events now flow unidirectionally enabling the editor ui to
  initiate events to the scene, such as navigate and focus.

## 0.14.0

## 0.7.0

### Minor Changes

- a4d6882: Passes name during object focus.

## 0.6.0

### Minor Changes

- 3c725bc: Force release all packages.

## 0.5.0

### Minor Changes

- ac9624f: Fixes client/host race condition where host would send events before
  the client has connected.

## 0.4.0

### Minor Changes

- b144bb1: Package `build` now use `swc` and `tsc` directly.

## 0.3.0

### Minor Changes

- bbc457e: Fixes some bugs preventing triplex from being able to be ran via cli.

## 0.2.0

### Minor Changes

- 08a03af: Fixes publish to build before pushing.

## 0.1.0

### Minor Changes

- 9c120b4: Initial release.
