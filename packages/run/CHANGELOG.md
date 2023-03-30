# @triplex/run

## 0.35.0

### Patch Changes

- Updated dependencies [e53a703]
- Updated dependencies [e53a703]
  - @triplex/server@0.35.0
  - @triplex/client@0.35.0

## 0.34.0

### Minor Changes

- 2a64658: The context panel now displays all available props on a component even if they aren't yet declared thanks to the TypeScript compiler and ts-morph. Not all prop types are supported currently, if you have one that you expected to be available but isn't please reach out.

### Patch Changes

- Updated dependencies [2a64658]
  - @triplex/client@0.34.0
  - @triplex/server@0.34.0

## 0.33.0

### Patch Changes

- @triplex/client@0.33.0
- @triplex/server@0.33.0

## 0.32.0

### Patch Changes

- Updated dependencies [c87a5f3]
- Updated dependencies [3a190f1]
- Updated dependencies [c87a5f3]
  - @triplex/server@0.32.0
  - @triplex/client@0.32.0

## 0.31.0

### Minor Changes

- 6e9b119: Paths passed to globs are now normalized to use POSIX separators.

### Patch Changes

- Updated dependencies [dad975f]
- Updated dependencies [6e9b119]
  - @triplex/server@0.31.0
  - @triplex/client@0.31.0

## 0.30.0

### Minor Changes

- c2a2a80: Installing dependencies now uses `install` instead of `i`.

### Patch Changes

- Updated dependencies [0bb6119]
- Updated dependencies [0bb6119]
  - @triplex/client@0.30.0
  - @triplex/server@0.30.0

## 0.29.0

### Patch Changes

- Updated dependencies [0d83ef2]
  - @triplex/client@0.29.0
  - @triplex/server@0.29.0

## 0.28.0

### Minor Changes

- aa1aa8c: Scene transformation using ts-morph has been replaced with Babel significantly speeding up initial load and saving. The need for the `.triplex/tmp` folder is now gone and thus no longer used.

### Patch Changes

- Updated dependencies [aa1aa8c]
- Updated dependencies [aa1aa8c]
  - @triplex/client@0.28.0
  - @triplex/server@0.28.0

## 0.27.0

### Patch Changes

- Updated dependencies [fa35cde]
- Updated dependencies [fa35cde]
- Updated dependencies [9b1d135]
- Updated dependencies [e5a3419]
  - @triplex/server@0.27.0
  - @triplex/client@0.27.0

## 0.26.0

### Patch Changes

- Updated dependencies [785050d]
- Updated dependencies [440d427]
- Updated dependencies [b77438d]
  - @triplex/server@0.26.0
  - @triplex/client@0.26.0

## 0.25.0

### Patch Changes

- Updated dependencies [9c807ac]
- Updated dependencies [1be56fe]
- Updated dependencies [ed6349b]
- Updated dependencies [aaac9cc]
- Updated dependencies [5736992]
- Updated dependencies [e694cf2]
  - @triplex/client@0.25.0
  - @triplex/server@0.25.0

## 0.24.0

### Patch Changes

- Updated dependencies [4f468f6]
  - @triplex/server@0.24.0
  - @triplex/client@0.24.0

## 0.23.0

### Minor Changes

- 0aa8b4a: Tsconfig template has been updated to include base url.

### Patch Changes

- Updated dependencies [0aa8b4a]
  - @triplex/client@0.23.0
  - @triplex/server@0.23.0

## 0.22.0

### Minor Changes

- b14f297: Adds config info to the readme.

### Patch Changes

- Updated dependencies [aa9c9ae]
- Updated dependencies [837ef90]
  - @triplex/server@0.22.0
  - @triplex/client@0.22.0

## 0.21.0

### Minor Changes

- 633e309: Adds export-name option to editor command.

### Patch Changes

- Updated dependencies [633e309]
  - @triplex/client@0.21.0
  - @triplex/server@0.21.0

## 0.20.0

### Minor Changes

- b51d977: Adds a README.
- a2c49d9: Template scene now uses more scene objects, lights, and shadows.

### Patch Changes

- Updated dependencies [1c9771d]
- Updated dependencies [1c9771d]
  - @triplex/server@0.20.0
  - @triplex/client@0.20.0

## 0.19.0

### Minor Changes

- 70b3365: Adds `publicDir` to config.
- 70b3365: Rename .gitignore template to gitignore as npm doesn't seem to want to install it.

### Patch Changes

- Updated dependencies [70b3365]
  - @triplex/client@0.19.0
  - @triplex/server@0.19.0

## 0.18.0

### Minor Changes

- 7e16516: Adds missing template file to npm dist.

### Patch Changes

- @triplex/client@0.18.0
- @triplex/server@0.18.0

## 0.17.0

### Minor Changes

- 8620560: Init now adds examples folder to packages if found.

### Patch Changes

- @triplex/client@0.17.0
- @triplex/server@0.17.0

## 0.16.0

### Minor Changes

- 926359a: Extracts templates from strings into their own folder.
- 2fa7c45: Adds triplex config and files option, an array of globs for triplex to find scenes with.
- 926359a: Server now gracefully exits when closed.
- 7ff35f3: Upgrades @react-three/fiber to latest.
- 2fa7c45: Adds author field to package.json.
- 926359a: Prompts have replaced cli args for the init command.

### Patch Changes

- Updated dependencies [7ff35f3]
- Updated dependencies [2fa7c45]
- Updated dependencies [926359a]
- Updated dependencies [c8ab78b]
- Updated dependencies [2fa7c45]
- Updated dependencies [926359a]
  - @triplex/server@0.16.0
  - @triplex/client@0.16.0

## 0.15.0

### Patch Changes

- @triplex/client@0.15.0
- @triplex/server@0.15.0

## 0.14.0

### Minor Changes

- 3a5d9cc: Primary packages now released and versioned together.

### Patch Changes

- Updated dependencies [7a8083c]
  - @triplex/server@0.14.0
  - @triplex/client@0.14.0

## 0.12.2

### Patch Changes

- Updated dependencies [a4d6882]
- Updated dependencies [a4d6882]
- Updated dependencies [969feab]
- Updated dependencies [cc917d7]
  - @triplex/server@0.9.0
  - @triplex/client@0.6.0

## 0.12.1

### Patch Changes

- Updated dependencies [55f0206]
  - @triplex/server@0.8.0
  - @triplex/client@0.5.1

## 0.12.0

### Minor Changes

- 3c725bc: Force release all packages.

### Patch Changes

- Updated dependencies [3c725bc]
  - @triplex/client@0.5.0
  - @triplex/server@0.7.0

## 0.11.0

### Minor Changes

- a32c72e: Fixed bin script missing a node shebang.

### Patch Changes

- Updated dependencies [a32c72e]
  - @triplex/client@0.4.0

## 0.10.0

### Minor Changes

- 0eecf88: Fixes missing dependency error.

## 0.9.0

### Minor Changes

- 7db42bd: Editor now runs on port 3333.
- 12ecbc4: Adds --open command to the editor command. Optionally pass in a filepath to open that file initially.
- 12ecbc4: Adds `init` command to the CLI. Run `triplex init` to setup your repository.
- 12ecbc4: When running from the CLI `triplex` now uses commands. Run `triplex editor` for the same behaviour as when running `triplex` before.

### Patch Changes

- Updated dependencies [55e8a52]
- Updated dependencies [12ecbc4]
- Updated dependencies [7db42bd]
- Updated dependencies [7db42bd]
  - @triplex/server@0.6.0
  - @triplex/client@0.3.0

## 0.8.0

### Minor Changes

- 387f6cd: Editor now able to use tailwindcss during dev, which is compiled away when packaged to npm.
- 387f6cd: Adds a menu bar to the editor.

### Patch Changes

- Updated dependencies [387f6cd]
  - @triplex/client@0.2.0

## 0.7.0

### Minor Changes

- c84a8ca: Frontend server is now extracted to the client package.

### Patch Changes

- Updated dependencies [c84a8ca]
  - @triplex/client@0.1.0

## 0.6.1

### Patch Changes

- Updated dependencies [dea65bf]
- Updated dependencies [5498a39]
  - @triplex/server@0.5.0
  - @triplex/scene@0.6.0

## 0.6.0

### Minor Changes

- c8c4a55: Fixes scene frame so it can hot module reload.

### Patch Changes

- Updated dependencies [c8c4a55]
  - @triplex/editor@0.5.0
  - @triplex/scene@0.5.0

## 0.5.0

### Minor Changes

- b144bb1: Package `build` now use `swc` and `tsc` directly.

### Patch Changes

- Updated dependencies [b144bb1]
  - @triplex/editor@0.4.0
  - @triplex/scene@0.4.0
  - @triplex/server@0.4.0

## 0.4.0

### Minor Changes

- 56c62a1: Fixed pre-bundling bugs.

## 0.3.0

### Minor Changes

- bbc457e: Fixes some bugs preventing triplex from being able to be ran via cli.

### Patch Changes

- Updated dependencies [bbc457e]
  - @triplex/editor@0.3.0
  - @triplex/scene@0.3.0
  - @triplex/server@0.3.0

## 0.2.0

### Minor Changes

- d0d3996: Scene loader will now hmr when new scenes are lazy loaded in.
- 08a03af: Fixes publish to build before pushing.

### Patch Changes

- Updated dependencies [08a03af]
  - @triplex/editor@0.2.0
  - @triplex/scene@0.2.0
  - @triplex/server@0.2.0

## 0.1.0

### Minor Changes

- 9c120b4: Initial release.

### Patch Changes

- Updated dependencies [9c120b4]
  - @triplex/editor@0.1.0
  - @triplex/scene@0.1.0
  - @triplex/server@0.1.0
