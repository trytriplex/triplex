# @triplex/scene

## 0.43.0

### Minor Changes

- 6dfb22d: The add scene component now cleans up all intermediate state when a
  file has been saved.
- 6dfb22d: The scene loader nolonger holds onto a stale module reference if the
  module changes during HMR.
- 01cd388: Intermediate state when adding components to a scene is blown away
  when any hmr after event occurs.
- b7bbeba: When adding a new element to the scene if you have a selection it
  will be added as a child. If you have no selection it will be added to the
  root component.

### Patch Changes

- Updated dependencies [b7bbeba]
  - @triplex/bridge@0.43.0
  - @triplex/ws-client@0.43.0

## 0.42.0

### Patch Changes

- @triplex/bridge@0.42.0
- @triplex/ws-client@0.42.0

## 0.41.0

### Patch Changes

- @triplex/bridge@0.41.0
- @triplex/ws-client@0.41.0

## 0.40.0

### Minor Changes

- dac7c76: Selection for scene objects is now more resilient being able to be
  set before scene objects are actually available.
- dac7c76: When selecting a scene object that has disabled transforms the scene
  frame now tries to find a backup selection so the gizmo stays ontop of the
  object instead of being moved back to world [0,0,0].
- a2a2f4b: When unapplying a prop to a component such as performing an undo it
  is now applied as expected in the scene. Previously only the context panel
  would be updated with the new value.

### Patch Changes

- Updated dependencies [ee2494b]
  - @triplex/ws-client@0.40.0
  - @triplex/bridge@0.40.0

## 0.39.0

### Patch Changes

- @triplex/bridge@0.39.0
- @triplex/ws-client@0.39.0

## 0.38.0

### Minor Changes

- 06471f6: The components virtual module has been removed in favor of passing
  down as props instead.

### Patch Changes

- @triplex/bridge@0.38.0
- @triplex/ws-client@0.38.0

## 0.37.0

### Minor Changes

- 0e781ac: Scene no longer assumes `triplexMeta` is always available on the
  loaded scene component.
- 23fe64a: Adds delete scene object. Access through the context panel when
  focusing on a scene object.
- 1a2ecea: Components can now be added to the scene through the add component
  button in the scene panel.
- 1a2ecea: The triplex config now has a new property called `components` - use
  to mark files that are able to be added to scenes.

### Patch Changes

- Updated dependencies [23fe64a]
- Updated dependencies [1a2ecea]
  - @triplex/bridge@0.37.0
  - @triplex/ws-client@0.37.0

## 0.36.0

### Minor Changes

- f24f2fd: Attribute jsx elements are now excluded from scene objects.

### Patch Changes

- @triplex/bridge@0.36.0
- @triplex/ws-client@0.36.0

## 0.35.0

### Patch Changes

- @triplex/bridge@0.35.0
- @triplex/ws-client@0.35.0

## 0.34.0

### Minor Changes

- 2a64658: The context panel now displays all available props on a component
  even if they aren't yet declared thanks to the TypeScript compiler and
  ts-morph. Not all prop types are supported currently, if you have one that you
  expected to be available but isn't please reach out.

### Patch Changes

- Updated dependencies [2a64658]
  - @triplex/ws-client@0.34.0
  - @triplex/bridge@0.34.0

## 0.33.0

### Minor Changes

- 1067d23: Adds transform controls to the ui.
- 1067d23: Transform control hotkeys now continue to function even when there is
  no scene object currently selected.

### Patch Changes

- Updated dependencies [1067d23]
  - @triplex/bridge@0.33.0
  - @triplex/ws-client@0.33.0

## 0.32.0

### Minor Changes

- c87a5f3: Undo/redo now available. When manipulating the scene through
  transform controls or the context panel each persisted manipulation will be
  able to be undone (and redone) using hotkeys and the edit menu actions.

### Patch Changes

- Updated dependencies [c87a5f3]
  - @triplex/bridge@0.32.0
  - @triplex/ws-client@0.32.0

## 0.31.0

### Minor Changes

- 48002a7: When transitioning to a scene object any props that are jsx elements
  are now removed preventing serialization errors.

### Patch Changes

- @triplex/bridge@0.31.0
- @triplex/ws-client@0.31.0

## 0.30.0

### Minor Changes

- 0bb6119: Adds support for updating scene objects through the context panel.

### Patch Changes

- Updated dependencies [0bb6119]
  - @triplex/bridge@0.30.0
  - @triplex/ws-client@0.30.0

## 0.29.0

### Minor Changes

- 0d83ef2: When selecting a scene object triplex now continues traversing down
  the tree looking for the appropriate object to use rather than stopping at the
  first encountered triplex boundary.

### Patch Changes

- @triplex/bridge@0.29.0
- @triplex/ws-client@0.29.0

## 0.28.0

### Minor Changes

- aa1aa8c: Scene transformation using ts-morph has been replaced with Babel
  significantly speeding up initial load and saving. The need for the
  `.triplex/tmp` folder is now gone and thus no longer used.
- aa1aa8c: Line and column numbers for scene objects have been corrected and are
  now consistent across editor, scene, and server.

### Patch Changes

- @triplex/bridge@0.28.0
- @triplex/ws-client@0.28.0

## 0.27.0

### Minor Changes

- 56f2b3e: Scene objects that have no dimensions (such as lights) can now be
  focused.
- fa35cde: JSX element type inference has been removed from the critical path of
  the scene transform.
- 1e405c3: Scene object selection is now scoped to ensure only selecting objects
  from the current open scene.
- fa35cde: Fix unguarded three.js child check.
- 9b1d135: When transitioning to a scene and it has a position prop set it is
  replaced with the world position.

### Patch Changes

- @triplex/bridge@0.27.0
- @triplex/ws-client@0.27.0

## 0.26.0

### Minor Changes

- 9d400e4: Selected objects now operate in local space when a parent scene
  object is scaled.
- e532920: When traversing the Three.js scene to find the appropriate scene
  object to select it now stops traversal when reaching a triplex boundary.

### Patch Changes

- Updated dependencies [785050d]
  - @triplex/ws-client@0.26.0
  - @triplex/bridge@0.26.0

## 0.25.0

### Minor Changes

- aaac9cc: Scene navigation now guards against empty paths (meaning there's
  nowhere to navigate to).

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

- d8e1602: Fixed non-scene objects not being able to be selected through the UI.
- 7ff35f3: Transform controls now longer continuously error when a scene object
  has been removed from the scene.
- 7ff35f3: Upgrades @react-three/fiber to latest.
- e7c026b: Selecting host scene objects now have the correct objects selected
  instead of the wrapping parent group
- 7ff35f3: Navigating to host elements is no longer possible (as there is
  nowhere to navigate to).
- 2fa7c45: Adds author field to package.json.

### Patch Changes

- Updated dependencies [d8e1602]
- Updated dependencies [7ff35f3]
- Updated dependencies [2fa7c45]
  - @triplex/bridge@0.16.0
  - @triplex/ws-client@0.16.0

## 0.15.0

### Minor Changes

- e54e0f8: Bridge events now flow unidirectionally enabling the editor ui to
  initiate events to the scene, such as navigate and focus.

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

- 99075ff: Transformed scene entrypoints now export the variable `triplexMeta`
  instead of `__r3fEditorMeta`.
- 99075ff: When being loaded for the first time scenes will now suspend. This
  means for any errors thrown during loaded are now propagated to the nearest
  error boundary.
- cfbd47b: When transitioning between scenes there is no longer a flash of
  hidden scene objects.
- 969feab: Removes unneeded fetch calls.
- cc917d7: Adds usage of ws-client pkg.
- a4d6882: Passes name during object focus.
- 99075ff: Adds error boundaries so the app doesn't blow up when a scene isn't
  found.
- 7bebe67: When transforming a selected scene object the intended object
  object3d is now modified instead of the parent group.
- 99075ff: Scene now loads updated triplex meta when the source file changes.
- cfbd47b: The hotkey check when navigating to a child scene now checks for
  shift usage instead of upper "f".

### Patch Changes

- Updated dependencies [a4d6882]
- Updated dependencies [cc917d7]
  - @triplex/bridge@0.7.0
  - @triplex/ws-client@0.1.0

## 0.11.0

### Minor Changes

- 55f0206: Scene components now appear nested when children of other components
  in the UI.

## 0.10.0

### Minor Changes

- 3c725bc: Force release all packages.

### Patch Changes

- Updated dependencies [3c725bc]
  - @triplex/bridge@0.6.0

## 0.9.0

### Minor Changes

- ac9624f: Fixes client/host race condition where host would send events before
  the client has connected.

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

- 5498a39: Scene frame now correctly calls back to the react refresh registry on
  hmr.

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
