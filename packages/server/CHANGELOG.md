# @triplex/server

## 0.58.0

### Patch Changes

- 3e1e081: Modified marker is now reset when changes from the file system occur.
- 221e6a7: Fix default export module names not being inferred correctly when
  called in a function.
- 37849fe: Upsert prop no longer shifts sibling elements line numbers if the
  prop value was smaller than the current value.

## 0.57.2

### Patch Changes

- f5bbeda: Fix server throwing when symbols for jsx elements were not resolved.

## 0.57.1

## 0.57.0

### Minor Changes

- 5c1fc3d: Add editing child jsx elements through the Triplex UI.
- 6da8bae: Adds context provider support using the `provider` config property.
- 2b61384: Adding an asset is now contextual, the original button adds to the
  open component, while the add buttons on each element in the left scene panel
  add to it as a child.

### Patch Changes

- bcf7cae: Default export component names are now displayed correctly in the
  open component drawer.
- 730fa7c: Transform controls are now disabled when controlled by code.

## 0.56.1

### Patch Changes

- baf33b9: Exports that export a call expression now resolve correctly when
  opened.

## 0.56.0

### Minor Changes

- 3724bf9: Name props declared on host elements now take precedence over the
  element name.
- 463789f: Adds end-to-end typesafe ws router.
- 32a110f: Add top-level scene component to the scene panel. When selected users
  can modify the props during their seession to see what happens.
- 47483b9: The data that powers the context panel props is now sourced from
  types first instead of defined props first, resulting in tuple type data no
  longer being lost after a prop has been set.

### Patch Changes

- 5f7e78f: Undefined values are now preseved across the websocket server.
- 2e53a2e: Turn off type declaration maps.

## 0.55.3

## 0.55.2

### Patch Changes

- ed3ef0a: Fixes the editor losing track of an inserted jsx element as a child.

## 0.55.1

### Patch Changes

- ea86fdc: Add license banner.

## 0.55.0

### Minor Changes

- 3be2782: Add support for adding a gltf static asset to the scene.
- ab909b4: Static assets are now available through the assets drawer.
- 44faed1: Jsdoc tags are now returned in the jsx element type response.

### Patch Changes

- ab909b4: Consoldate config into a single module.
- f7d2d9a: Fix adding jsx elements to arrow function components.

## 0.54.2

### Patch Changes

- a060d2c: Fix websocket server connection listener being called on every router
  handler setup.
- 9100a37: Revert remove unused on save as it was causing issues.

## 0.54.1

### Patch Changes

- 76fd3f3: Fixes a bug on Windows where it would throw assuming you were opening
  a file out of the open project.
- cdd6234: On save unused identifiers are now removed.
- 76fd3f3: Adding custom components to a scene no longer results in mismatches
  causing the context panel to error.
- f77c830: Fix prop upsert affecting children jsx elements unexpectedly.

## 0.54.0

## 0.53.1

## 0.53.0

### Patch Changes

- 049ac2c: Changes to prop types are now correctly propagating to all
  referencing modules that import them, previously you would have to restart
  triplex for the change to be applied.

## 0.52.0

## 0.51.1

## 0.51.0

### Patch Changes

- c97e359: Fixes tuple types inside union types not being marked as required
  when declared as a prop on a component.

## 0.50.1

### Patch Changes

- a101545: The fs watcher used for the save indicator endpoint now uses polling
  to work around a timing bug.

## 0.50.0

### Minor Changes

- 8ea575b: Built output is now mangled.

## 0.49.0

## 0.48.0

### Minor Changes

- 6fe34af: Windows support is here. Now Triplex cli and electron can be ran on
  Windows, as well as the local dev loop now being functional.

## 0.47.0

### Minor Changes

- 1fc7657: Window title now uses both the folder name and file name if open.

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
- 5039e39: Adds `cwd` to servers to allow setting it to a new location.
- 4d8d9cc: Builds are now minified.

## 0.43.0

### Minor Changes

- 6dfb22d: Create a component in the current open file through the component
  switcher.
- 6dfb22d: A component switcher is now available in the left panel, use it to
  quickly switch between components in the open file.
- b7bbeba: String and numbers in props now can have undefined default values.
- 6dfb22d: Saving is now skipped if there are no changes to save.
- de54812: Context panel tuple props now show labels when available.
- b7bbeba: When adding a new element to the scene if you have a selection it
  will be added as a child. If you have no selection it will be added to the
  root component.
- 6dfb22d: The scene ws listener now pushes when the file its interested in is
  saved to source.
- b7bbeba: Geometry and material built-in elements are now exposed in the add
  component drawer.
- facc6aa: Saving a new component now prompts for a component name.
- 01cd388: Element pos returned after adding a child element is now correct.

## 0.42.0

## 0.41.0

### Minor Changes

- c399ed8: Fixes timing bug by using specific insert and set functions on the
  import declaration node instead of the generic set.

## 0.40.0

### Minor Changes

- bfb0f7a: When initializing a websocket loader it now catches any errors thrown
  and returns them to the client.
- 7aa2ead: Shadowed types, interfaces, and imports are now excluded when reading
  an exports name.

## 0.39.0

### Minor Changes

- ca9807e: Save now supports passing in an option arg to copy the file to
  another location.
- ca9807e: New files can now be created through the file menu.

## 0.38.0

## 0.37.0

### Minor Changes

- 23fe64a: Adds delete scene object. Access through the context panel when
  focusing on a scene object.
- e480446: Exclude isLight propeties from scene object context panel.
- 1a2ecea: Adds new endpoint for adding a component to a file.

## 0.36.0

### Minor Changes

- f24f2fd: Fixes conditional throwing when extracting types.

## 0.35.0

### Minor Changes

- e53a703: `isBufferGeometry` now excluded from the context panel.
- e53a703: Context panel now correctly orders props from a-z.

## 0.34.0

### Minor Changes

- 2a64658: The context panel now displays all available props on a component
  even if they aren't yet declared thanks to the TypeScript compiler and
  ts-morph. Not all prop types are supported currently, if you have one that you
  expected to be available but isn't please reach out.

## 0.33.0

## 0.32.0

### Minor Changes

- c87a5f3: Undo/redo now available. When manipulating the scene through
  transform controls or the context panel each persisted manipulation will be
  able to be undone (and redone) using hotkeys and the edit menu actions.
- 3a190f1: API response for prop types now returns an object and works with
  strict compiler option.
- c87a5f3: Adds reset command. Use this to throw away all unsaved changes in the
  scene.

## 0.31.0

### Minor Changes

- dad975f: Watchers have been replaced with ts-morph events where appropriate to
  prevent race conditions when changing from source.
- 6e9b119: Paths passed to globs are now normalized to use POSIX separators.

## 0.30.0

### Minor Changes

- 0bb6119: Fixed server errors not returning with status code 500.

## 0.29.0

## 0.28.0

### Minor Changes

- aa1aa8c: Scene transformation using ts-morph has been replaced with Babel
  significantly speeding up initial load and saving. The need for the
  `.triplex/tmp` folder is now gone and thus no longer used.
- aa1aa8c: Line and column numbers for scene objects have been corrected and are
  now consistent across editor, scene, and server.

## 0.27.0

### Minor Changes

- fa35cde: JSX element type inference has been re-written to be more resilient.
- fa35cde: JSX element type inference has been removed from the critical path of
  the scene transform.
- e5a3419: Context panel now supports more prop types.

## 0.26.0

### Minor Changes

- 785050d: Adds unsaved indicator to the editor.
- 440d427: Server now pings every 30s awaiting a pong from connected clients.
- b77438d: During transformation any leading trivia found is now stripped from
  cloned jsx elements.

## 0.25.0

### Minor Changes

- 1be56fe: Scene transform now correctly handles props with dashes.
- ed6349b: Extracting prop types now returns early instead of throwing for
  unhandled nodes.
- aaac9cc: Fix type extraction for jsx elements to handle arrow function
  components.
- 5736992: Server now throws when accessing files outside of cwd.
- e694cf2: Now override userland config for preserveSymlinks to false to prevent
  100% CPU utilization.

## 0.24.0

### Minor Changes

- 4f468f6: The server project [ts-morph] now skips adding files from ts config
  on instantiation.

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

- 7ff35f3: Context panel no longer throws when navigating between scene and a
  scene object is selected.
- 2fa7c45: Adds triplex config and files option, an array of globs for triplex
  to find scenes with.
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

- 7a8083c: The open rpc has been added back to prevent the "flash of no scene"
  when transitioning between scenes for the first time.

### Patch Changes

- @triplex/ts-morph@0.14.0

## 0.9.0

### Minor Changes

- a4d6882: Adds scene object ws request.
- 969feab: Adds websocket server and replaces scene and scene components
  endpoints with it.
- cc917d7: Removes unused apis.

### Patch Changes

- Updated dependencies [99075ff]
- Updated dependencies [969feab]
- Updated dependencies [a4d6882]
  - @triplex/ts-morph@0.8.0

## 0.8.0

### Minor Changes

- 55f0206: Scene components now appear nested when children of other components
  in the UI.

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

- 55e8a52: On save the source file will be formatted with prettier if a
  prettierrc file was found, else it will be formatted by the TypeScript
  compiler.
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
