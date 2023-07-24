# @triplex/client

## 0.55.3

### Patch Changes

- @triplex/scene@0.55.3

## 0.55.2

### Patch Changes

- @triplex/scene@0.55.2

## 0.55.1

### Patch Changes

- ea86fdc: Add license banner.
- Updated dependencies [ea86fdc]
  - @triplex/scene@0.55.1

## 0.55.0

### Minor Changes

- 3be2782: Add support for packages when adding components to scene.

### Patch Changes

- Updated dependencies [3be2782]
- Updated dependencies [111a1f2]
- Updated dependencies [44faed1]
  - @triplex/scene@0.55.0

## 0.54.2

### Patch Changes

- @triplex/scene@0.54.2

## 0.54.1

### Patch Changes

- ad66cc8: Add support for scene objects to be passed transform props
  (`position`, `rotation`, and `scale`) via spread props.
- Updated dependencies [3711009]
  - @triplex/scene@0.54.1

## 0.54.0

### Patch Changes

- Updated dependencies [36c2d9c]
- Updated dependencies [d2d40f6]
- Updated dependencies [36c2d9c]
- Updated dependencies [8fad65a]
- Updated dependencies [e0038f6]
  - @triplex/scene@0.54.0

## 0.53.1

### Patch Changes

- Updated dependencies [4ddb52e]
  - @triplex/scene@0.53.1

## 0.53.0

### Patch Changes

- Updated dependencies [aa3a982]
- Updated dependencies [c71412b]
  - @triplex/scene@0.53.0

## 0.52.0

### Minor Changes

- 8d532f5: Editor now shows build time and runtime errors in an error overlay.

### Patch Changes

- Updated dependencies [8d532f5]
  - @triplex/scene@0.52.0

## 0.51.1

### Patch Changes

- Updated dependencies [753dba5]
  - @triplex/scene@0.51.1

## 0.51.0

### Patch Changes

- Updated dependencies [6179fef]
  - @triplex/scene@0.51.0

## 0.50.1

### Patch Changes

- Updated dependencies [b7c966c]
- Updated dependencies [3c19632]
  - @triplex/scene@0.50.1

## 0.50.0

### Minor Changes

- 8ea575b: Built output is now mangled.

### Patch Changes

- Updated dependencies [8ea575b]
  - @triplex/scene@0.50.0

## 0.49.0

### Patch Changes

- @triplex/scene@0.49.0

## 0.48.0

### Minor Changes

- 6fe34af: Windows support is here. Now Triplex cli and electron can be ran on
  Windows, as well as the local dev loop now being functional.

### Patch Changes

- Updated dependencies [6fe34af]
  - @triplex/scene@0.48.0

## 0.47.0

### Minor Changes

- 4164026: Add support for the scene to know what environment it is running in
  (either web or electron).

### Patch Changes

- 1fc7657: The client has had its CSP removed.
- 1fc7657: Log level now set to error.
- Updated dependencies [4164026]
  - @triplex/scene@0.47.0

## 0.46.4

### Patch Changes

- @triplex/scene@0.46.4

## 0.46.3

### Patch Changes

- @triplex/scene@0.46.3

## 0.46.2

### Patch Changes

- @triplex/scene@0.46.2

## 0.46.1

### Patch Changes

- @triplex/scene@0.46.1

## 0.46.0

### Minor Changes

- d67f998: Three package resolutions in the client server now are forcibly
  resolved from the cwd.
- c808957: Removes redundant package alias for `three`.

### Patch Changes

- Updated dependencies [d67f998]
  - @triplex/scene@0.46.0

## 0.45.1

### Patch Changes

- @triplex/scene@0.45.1

## 0.45.0

### Patch Changes

- @triplex/scene@0.45.0

## 0.44.0

### Minor Changes

- 0242833: Scene now removes intermediate state when resetting.
- 5039e39: Adds `cwd` to servers to allow setting it to a new location.
- 4d8d9cc: Builds are now minified.
- 5039e39: Adds CSP meta tag to client HTML.
- 557648e: Editor has been extracted out of the client dev server and now is
  bundled when published to npm.

### Patch Changes

- Updated dependencies [0242833]
- Updated dependencies [4d8d9cc]
  - @triplex/scene@0.44.0

## 0.43.0

### Minor Changes

- 01cd388: Adds transparent checker bg to color picker when no value is defined.
- 01cd388: Editor is now flushed when a scene adds or removes lights.
- 6dfb22d: Fixes a HMR bug when a modules exports change and the editor wasn't
  being flushed with the new exports.

### Patch Changes

- Updated dependencies [6dfb22d]
- Updated dependencies [6dfb22d]
- Updated dependencies [6dfb22d]
- Updated dependencies [6dfb22d]
- Updated dependencies [de54812]
- Updated dependencies [b7bbeba]
- Updated dependencies [6dfb22d]
- Updated dependencies [6dfb22d]
- Updated dependencies [b7bbeba]
- Updated dependencies [6dfb22d]
- Updated dependencies [de54812]
- Updated dependencies [01cd388]
- Updated dependencies [de54812]
- Updated dependencies [de54812]
- Updated dependencies [b7bbeba]
- Updated dependencies [01cd388]
- Updated dependencies [facc6aa]
- Updated dependencies [de54812]
- Updated dependencies [01cd388]
  - @triplex/scene@0.43.0
  - @triplex/editor@0.43.0

## 0.42.0

### Patch Changes

- @triplex/editor@0.42.0
- @triplex/scene@0.42.0

## 0.41.0

### Minor Changes

- 5d161d8: Move to using system fonts.

### Patch Changes

- Updated dependencies [5d161d8]
  - @triplex/editor@0.41.0
  - @triplex/scene@0.41.0

## 0.40.0

### Minor Changes

- a2a2f4b: When unapplying a prop to a component such as performing an undo it
  is now applied as expected in the scene. Previously only the context panel
  would be updated with the new value.

### Patch Changes

- Updated dependencies [a2a2f4b]
- Updated dependencies [a2a2f4b]
- Updated dependencies [dac7c76]
- Updated dependencies [dac7c76]
- Updated dependencies [a2a2f4b]
- Updated dependencies [bfb0f7a]
- Updated dependencies [ee2494b]
  - @triplex/editor@0.40.0
  - @triplex/scene@0.40.0

## 0.39.0

### Patch Changes

- Updated dependencies [ca9807e]
- Updated dependencies [ca9807e]
- Updated dependencies [ca9807e]
  - @triplex/editor@0.39.0
  - @triplex/scene@0.39.0

## 0.38.0

### Minor Changes

- 06471f6: The components virtual module has been removed in favor of passing
  down as props instead.

### Patch Changes

- Updated dependencies [06471f6]
  - @triplex/scene@0.38.0
  - @triplex/editor@0.38.0

## 0.37.0

### Minor Changes

- 1a2ecea: Components can now be added to the scene through the add component
  button in the scene panel.
- 1a2ecea: The triplex config now has a new property called `components` - use
  to mark files that are able to be added to scenes.

### Patch Changes

- Updated dependencies [0e781ac]
- Updated dependencies [23fe64a]
- Updated dependencies [1a2ecea]
- Updated dependencies [1a2ecea]
  - @triplex/scene@0.37.0
  - @triplex/editor@0.37.0

## 0.36.0

### Patch Changes

- Updated dependencies [f24f2fd]
  - @triplex/scene@0.36.0
  - @triplex/editor@0.36.0

## 0.35.0

### Patch Changes

- Updated dependencies [e53a703]
- Updated dependencies [e53a703]
  - @triplex/editor@0.35.0
  - @triplex/scene@0.35.0

## 0.34.0

### Minor Changes

- 2a64658: The context panel now displays all available props on a component
  even if they aren't yet declared thanks to the TypeScript compiler and
  ts-morph. Not all prop types are supported currently, if you have one that you
  expected to be available but isn't please reach out.

### Patch Changes

- Updated dependencies [2a64658]
- Updated dependencies [2a64658]
  - @triplex/editor@0.34.0
  - @triplex/scene@0.34.0

## 0.33.0

### Patch Changes

- Updated dependencies [1067d23]
- Updated dependencies [1067d23]
  - @triplex/editor@0.33.0
  - @triplex/scene@0.33.0

## 0.32.0

### Patch Changes

- Updated dependencies [73d9e8c]
- Updated dependencies [c87a5f3]
- Updated dependencies [c87a5f3]
- Updated dependencies [c87a5f3]
  - @triplex/editor@0.32.0
  - @triplex/scene@0.32.0

## 0.31.0

### Patch Changes

- Updated dependencies [48002a7]
- Updated dependencies [5ac3a26]
- Updated dependencies [a1e3127]
- Updated dependencies [48002a7]
  - @triplex/scene@0.31.0
  - @triplex/editor@0.31.0

## 0.30.0

### Minor Changes

- 0bb6119: Adds support for updating scene objects through the context panel.

### Patch Changes

- Updated dependencies [0bb6119]
- Updated dependencies [0bb6119]
- Updated dependencies [0bb6119]
  - @triplex/editor@0.30.0
  - @triplex/scene@0.30.0

## 0.29.0

### Minor Changes

- 0d83ef2: The babel plugin now forwards key prop to the wrapping group element.

### Patch Changes

- Updated dependencies [0d83ef2]
- Updated dependencies [0d83ef2]
- Updated dependencies [0d83ef2]
  - @triplex/scene@0.29.0
  - @triplex/editor@0.29.0

## 0.28.0

### Minor Changes

- aa1aa8c: Scene transformation using ts-morph has been replaced with Babel
  significantly speeding up initial load and saving. The need for the
  `.triplex/tmp` folder is now gone and thus no longer used.

### Patch Changes

- Updated dependencies [aa1aa8c]
- Updated dependencies [aa1aa8c]
- Updated dependencies [aa1aa8c]
  - @triplex/editor@0.28.0
  - @triplex/scene@0.28.0

## 0.27.0

### Minor Changes

- 9b1d135: Adds out-of-the-box support for `.gtlf`, `.vert`, and `.frag` files.
- e5a3419: Context panel now supports more prop types.

### Patch Changes

- Updated dependencies [fa35cde]
- Updated dependencies [9b1d135]
- Updated dependencies [56f2b3e]
- Updated dependencies [fa35cde]
- Updated dependencies [246217f]
- Updated dependencies [1e405c3]
- Updated dependencies [fa35cde]
- Updated dependencies [e5a3419]
- Updated dependencies [9b1d135]
  - @triplex/editor@0.27.0
  - @triplex/scene@0.27.0

## 0.26.0

### Patch Changes

- Updated dependencies [785050d]
- Updated dependencies [71374c9]
- Updated dependencies [9d400e4]
- Updated dependencies [e532920]
  - @triplex/editor@0.26.0
  - @triplex/scene@0.26.0

## 0.25.0

### Minor Changes

- 9c807ac: When running r3f is now deduped and forced to
  [use the version from project root](https://vitejs.dev/config/shared-options.html#resolve-dedupe).

### Patch Changes

- Updated dependencies [aaac9cc]
  - @triplex/scene@0.25.0
  - @triplex/editor@0.25.0

## 0.24.0

### Patch Changes

- @triplex/editor@0.24.0
- @triplex/scene@0.24.0

## 0.23.0

### Minor Changes

- 0aa8b4a: Adds tsconfig-paths plugin to resolve absolute paths.

### Patch Changes

- @triplex/editor@0.23.0
- @triplex/scene@0.23.0

## 0.22.0

### Patch Changes

- Updated dependencies [aa9c9ae]
  - @triplex/editor@0.22.0
  - @triplex/scene@0.22.0

## 0.21.0

### Minor Changes

- 633e309: Adds export-name option to editor command.

### Patch Changes

- @triplex/editor@0.21.0
- @triplex/scene@0.21.0

## 0.20.0

### Patch Changes

- Updated dependencies [1c9771d]
- Updated dependencies [1c9771d]
- Updated dependencies [1c9771d]
  - @triplex/editor@0.20.0
  - @triplex/scene@0.20.0

## 0.19.0

### Minor Changes

- 70b3365: Adds `publicDir` to config.

### Patch Changes

- @triplex/editor@0.19.0
- @triplex/scene@0.19.0

## 0.18.0

### Patch Changes

- @triplex/editor@0.18.0
- @triplex/scene@0.18.0

## 0.17.0

### Patch Changes

- @triplex/editor@0.17.0
- @triplex/scene@0.17.0

## 0.16.0

### Minor Changes

- c8ab78b: Scene no longer uses its own copied HMR library and instead leans on
  the vite react plugin offering.
- 2fa7c45: Adds author field to package.json.
- 926359a: The temp folder is now located in .triplex/tmp.

### Patch Changes

- Updated dependencies [d8e1602]
- Updated dependencies [e7c026b]
- Updated dependencies [7ff35f3]
- Updated dependencies [7ff35f3]
- Updated dependencies [e7c026b]
- Updated dependencies [e7c026b]
- Updated dependencies [7ff35f3]
- Updated dependencies [e7c026b]
- Updated dependencies [7ff35f3]
- Updated dependencies [2fa7c45]
  - @triplex/scene@0.16.0
  - @triplex/editor@0.16.0

## 0.15.0

### Patch Changes

- Updated dependencies [e54e0f8]
- Updated dependencies [e54e0f8]
  - @triplex/editor@0.15.0
  - @triplex/scene@0.15.0

## 0.14.0

### Patch Changes

- Updated dependencies [7a8083c]
  - @triplex/editor@0.14.0
  - @triplex/scene@0.14.0

## 0.6.0

### Minor Changes

- a4d6882: Adds extra font weights for karla font.

### Patch Changes

- Updated dependencies [99075ff]
- Updated dependencies [99075ff]
- Updated dependencies [cfbd47b]
- Updated dependencies [969feab]
- Updated dependencies [cc917d7]
- Updated dependencies [969feab]
- Updated dependencies [a4d6882]
- Updated dependencies [a4d6882]
- Updated dependencies [99075ff]
- Updated dependencies [7bebe67]
- Updated dependencies [cfbd47b]
- Updated dependencies [969feab]
- Updated dependencies [99075ff]
- Updated dependencies [cfbd47b]
  - @triplex/scene@0.12.0
  - @triplex/editor@0.13.0

## 0.5.1

### Patch Changes

- Updated dependencies [55f0206]
- Updated dependencies [55f0206]
  - @triplex/editor@0.12.0
  - @triplex/scene@0.11.0

## 0.5.0

### Minor Changes

- 3c725bc: Force release all packages.

### Patch Changes

- Updated dependencies [3c725bc]
  - @triplex/editor@0.11.0
  - @triplex/scene@0.10.0

## 0.4.0

### Minor Changes

- a32c72e: Removes silent logging for now.

### Patch Changes

- Updated dependencies [a32c72e]
  - @triplex/editor@0.10.0

## 0.3.0

### Minor Changes

- 12ecbc4: Adds --open command to the editor command. Optionally pass in a
  filepath to open that file initially.
- 7db42bd: Adds slide in animation.

### Patch Changes

- Updated dependencies [ac9624f]
- Updated dependencies [7db42bd]
  - @triplex/editor@0.9.0
  - @triplex/scene@0.9.0

## 0.2.0

### Minor Changes

- 387f6cd: Adds a menu bar to the editor.

### Patch Changes

- Updated dependencies [387f6cd]
- Updated dependencies [387f6cd]
  - @triplex/editor@0.8.0
  - @triplex/scene@0.8.0

## 0.1.1

### Patch Changes

- Updated dependencies [56dde00]
  - @triplex/editor@0.7.0

## 0.1.0

### Minor Changes

- c84a8ca: Frontend server is now extracted to the client package.

### Patch Changes

- Updated dependencies [c84a8ca]
  - @triplex/editor@0.6.0
  - @triplex/scene@0.7.0
