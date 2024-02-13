# @triplex/electron

## 0.65.1

### Patch Changes

- @triplex/client@0.65.1
- @triplex/editor@0.65.1
- @triplex/server@0.65.1
- create-triplex-project@0.65.1

## 0.65.0

### Patch Changes

- Updated dependencies [29c9d95]
  - @triplex/editor@0.65.0
  - @triplex/client@0.65.0
  - @triplex/server@0.65.0
  - create-triplex-project@0.65.0

## 0.64.4

### Patch Changes

- 0393817: Fix triplex folder passing config precondition with no config file.
- 50dc97a: Fix resolving union labels throwing unexpectedly for some elements.
- Updated dependencies [a66604b]
- Updated dependencies [1df7cc9]
- Updated dependencies [50dc97a]
- Updated dependencies [6ed3037]
  - @triplex/editor@0.64.4
  - @triplex/server@0.64.4
  - @triplex/client@0.64.4
  - create-triplex-project@0.64.4

## 0.64.3

### Patch Changes

- Updated dependencies [1d9c390]
  - @triplex/client@0.64.3
  - @triplex/editor@0.64.3
  - @triplex/server@0.64.3
  - create-triplex-project@0.64.3

## 0.64.2

### Patch Changes

- Updated dependencies [26ac612]
  - @triplex/client@0.64.2
  - @triplex/editor@0.64.2
  - @triplex/server@0.64.2
  - create-triplex-project@0.64.2

## 0.64.1

### Patch Changes

- Updated dependencies [835639f]
  - @triplex/client@0.64.1
  - @triplex/editor@0.64.1
  - @triplex/server@0.64.1
  - create-triplex-project@0.64.1

## 0.64.0

### Minor Changes

- 0868337: Add support for SharedBufferArray.
- 0868337: Add `define` variables support.

### Patch Changes

- 777b2f5: Improve UI/UX of error screen shown when loading a project fails, now
  showing the actual error message.
- Updated dependencies [f0444d6]
- Updated dependencies [777b2f5]
- Updated dependencies [8712a12]
- Updated dependencies [a153ee8]
- Updated dependencies [0868337]
- Updated dependencies [0868337]
- Updated dependencies [0868337]
- Updated dependencies [f0444d6]
- Updated dependencies [a153ee8]
- Updated dependencies [dca6003]
- Updated dependencies [f0444d6]
- Updated dependencies [6a65504]
- Updated dependencies [f0444d6]
- Updated dependencies [a153ee8]
- Updated dependencies [777b2f5]
- Updated dependencies [09d435f]
- Updated dependencies [9567579]
  - @triplex/editor@0.64.0
  - @triplex/client@0.64.0
  - @triplex/server@0.64.0
  - create-triplex-project@0.64.0

## 0.63.0

### Minor Changes

- 0b5fb14: Add manifest to renderers.
- 4c48d66: Add host element declarations to renderer manifest.

### Patch Changes

- 480866f: Upgrade TypeScript.
- Updated dependencies [8eddebb]
- Updated dependencies [8eddebb]
- Updated dependencies [0b5fb14]
- Updated dependencies [4c48d66]
- Updated dependencies [a81b79a]
- Updated dependencies [8eddebb]
- Updated dependencies [480866f]
  - @triplex/editor@0.63.0
  - @triplex/client@0.63.0
  - @triplex/server@0.63.0
  - create-triplex-project@0.63.0

## 0.62.0

### Minor Changes

- 273c586: Create / open project flow has had its UX changed to improve
  understanding what is actually happening.
- 0909731: Add Linux support.
- 3612434: Add thumbnail support for renderers.

### Patch Changes

- bad0a57: Triplex now finds random open ports every time a project is opened
  instead of using hardcoded ones.
- 0de7465: Saving files outside of the project folder is now presented with an
  error message instead of an exception.
- cea76c2: Simplify bridge event names.
- 547c72d: Finding Triplex config when opening a project now stops when getting
  to the root directory instead of going forever.
- 2ec38a1: Fix ide link not opening.
- 4e9e389: Open project modal is now tied to a browser window if available.
- 0909731: Fix hotkeys firing when they shouldn't.
- 0ab691d: Inputs no-longer fire accelerators when focused.
- Updated dependencies [bad0a57]
- Updated dependencies [cea76c2]
- Updated dependencies [11a548a]
- Updated dependencies [b629d57]
- Updated dependencies [e2608a8]
- Updated dependencies [273c586]
- Updated dependencies [0909731]
- Updated dependencies [99b97cf]
- Updated dependencies [490aaf1]
- Updated dependencies [b629d57]
- Updated dependencies [0909731]
- Updated dependencies [1d7e53f]
- Updated dependencies [cdbdc16]
- Updated dependencies [3612434]
- Updated dependencies [c2a0640]
- Updated dependencies [7313788]
- Updated dependencies [fe7c5f9]
  - @triplex/client@0.62.0
  - @triplex/editor@0.62.0
  - @triplex/server@0.62.0
  - create-triplex-project@0.62.0

## 0.61.2

### Patch Changes

- Updated dependencies [b8bd0e0]
- Updated dependencies [b8bd0e0]
- Updated dependencies [273b644]
- Updated dependencies [4a40243]
- Updated dependencies [4a40243]
- Updated dependencies [e522b42]
  - @triplex/editor@0.61.2
  - create-triplex-project@0.61.2
  - @triplex/client@0.61.2
  - @triplex/server@0.61.2

## 0.61.1

### Patch Changes

- Updated dependencies [6c887c4]
- Updated dependencies [8e565d9]
  - @triplex/editor@0.61.1
  - @triplex/server@0.61.1
  - @triplex/client@0.61.1
  - create-triplex-project@0.61.1

## 0.61.0

### Minor Changes

- 3920fd3: Scene elements can now be moved before/after/into other scene
  elements with drag and drop.
- 5299234: Add open file button to tabs.

### Patch Changes

- 5299234: Titlebar now goes partially transparent when inactive.
- 5ceb4de: Upgrade electron dependencies.
- 755e39a: Triplex now traverses up the folder path to see if it can open a
  project.
- 4664b3c: Fix initial open throwing when no exports were found.
- 5efeea0: Normalize paths using upath instead of node built-in.
- b407820: Add hotkeys for file tabs.
- 755e39a: Open project flow now allows you to create a project without going
  back to the welcome screen
- Updated dependencies [5299234]
- Updated dependencies [d583e42]
- Updated dependencies [d583e42]
- Updated dependencies [d583e42]
- Updated dependencies [3920fd3]
- Updated dependencies [d583e42]
- Updated dependencies [b407820]
- Updated dependencies [b407820]
- Updated dependencies [2f569d5]
- Updated dependencies [af8c06e]
- Updated dependencies [af8c06e]
- Updated dependencies [5299234]
- Updated dependencies [5efeea0]
- Updated dependencies [b407820]
- Updated dependencies [ab35f91]
- Updated dependencies [cba2b47]
- Updated dependencies [3091229]
  - @triplex/editor@0.61.0
  - @triplex/server@0.61.0
  - @triplex/client@0.61.0
  - create-triplex-project@0.61.0

## 0.60.1

### Patch Changes

- e2fc746: App now bundled into a single file.
- Updated dependencies [b82d12e]
- Updated dependencies [13964df]
  - @triplex/editor@0.60.1
  - @triplex/client@0.60.1
  - @triplex/server@0.60.1
  - create-triplex-project@0.60.1

## 0.60.0

### Patch Changes

- Updated dependencies [000008d]
- Updated dependencies [7a250ba]
- Updated dependencies [722ac20]
- Updated dependencies [b42550f]
- Updated dependencies [b42550f]
- Updated dependencies [eb37a51]
- Updated dependencies [0cce596]
- Updated dependencies [000008d]
- Updated dependencies [0cce596]
- Updated dependencies [000008d]
- Updated dependencies [7a250ba]
  - @triplex/client@0.60.0
  - @triplex/editor@0.60.0
  - @triplex/server@0.60.0
  - create-triplex-project@0.60.0

## 0.59.1

### Patch Changes

- Updated dependencies [f899ef0]
  - create-triplex-project@0.59.1
  - @triplex/client@0.59.1
  - @triplex/editor@0.59.1
  - @triplex/server@0.59.1

## 0.59.0

### Minor Changes

- 26bd068: Scene modules are now loaded remotely instead of from the fs. This is
  going to raise the ceiling on features we can implement as now everything
  becomes a mutation to the remote source instead of that AND also trying to
  handle the intermediate state in the scene prior to it being flushed to the
  fs. Super excited about this.

### Patch Changes

- 1d70f2b: An error screen is now presented to users when Triplex fails to start
  up a project.
- 75073e7: Editor now shows a loading screen prior to the project being
  successfully loaded.
- Updated dependencies [2194c85]
- Updated dependencies [ce8a108]
- Updated dependencies [ce8a108]
- Updated dependencies [26bd068]
- Updated dependencies [f2d612b]
- Updated dependencies [1d70f2b]
- Updated dependencies [8dd7cd1]
- Updated dependencies [75073e7]
- Updated dependencies [ce8a108]
- Updated dependencies [26bd068]
- Updated dependencies [f6e068c]
  - @triplex/editor@0.59.0
  - @triplex/server@0.59.0
  - @triplex/client@0.59.0
  - create-triplex-project@0.59.0

## 0.58.2

### Patch Changes

- b5247c2: Apply lint and prettier fixes.
- Updated dependencies [85447c2]
- Updated dependencies [85447c2]
- Updated dependencies [b5247c2]
- Updated dependencies [85447c2]
  - create-triplex-project@0.58.2
  - @triplex/editor@0.58.2
  - @triplex/server@0.58.2
  - @triplex/client@0.58.2

## 0.58.1

### Patch Changes

- Updated dependencies [e645e5c]
- Updated dependencies [f1656e0]
  - @triplex/editor@0.58.1
  - @triplex/server@0.58.1
  - @triplex/client@0.58.1
  - create-triplex-project@0.58.1

## 0.58.0

### Minor Changes

- 37bf36d: Add provider props as config to the ui.

### Patch Changes

- Updated dependencies [3e1e081]
- Updated dependencies [37bf36d]
- Updated dependencies [221e6a7]
- Updated dependencies [37849fe]
- Updated dependencies [3e1e081]
- Updated dependencies [3e1e081]
- Updated dependencies [3e1e081]
  - @triplex/server@0.58.0
  - @triplex/editor@0.58.0
  - @triplex/client@0.58.0
  - create-triplex-project@0.58.0

## 0.57.2

### Patch Changes

- Updated dependencies [f5bbeda]
- Updated dependencies [f5bbeda]
  - @triplex/editor@0.57.2
  - @triplex/server@0.57.2
  - @triplex/client@0.57.2
  - create-triplex-project@0.57.2

## 0.57.1

### Patch Changes

- Updated dependencies [d32cf94]
  - @triplex/client@0.57.1
  - @triplex/editor@0.57.1
  - @triplex/server@0.57.1
  - create-triplex-project@0.57.1

## 0.57.0

### Patch Changes

- 2b61384: The welcome screen is no longer resizable.
- Updated dependencies [5c1fc3d]
- Updated dependencies [046cf78]
- Updated dependencies [6da8bae]
- Updated dependencies [628646e]
- Updated dependencies [7673ae8]
- Updated dependencies [2b61384]
- Updated dependencies [bcf7cae]
- Updated dependencies [730fa7c]
- Updated dependencies [5c7ba21]
- Updated dependencies [2b61384]
- Updated dependencies [628646e]
  - @triplex/editor@0.57.0
  - @triplex/server@0.57.0
  - @triplex/client@0.57.0
  - create-triplex-project@0.57.0

## 0.56.1

### Patch Changes

- Updated dependencies [baf33b9]
  - @triplex/server@0.56.1
  - @triplex/client@0.56.1
  - @triplex/editor@0.56.1
  - create-triplex-project@0.56.1

## 0.56.0

### Patch Changes

- 2e53a2e: Turn off type declaration maps.
- Updated dependencies [3724bf9]
- Updated dependencies [463789f]
- Updated dependencies [d674f26]
- Updated dependencies [5f7e78f]
- Updated dependencies [47483b9]
- Updated dependencies [32a110f]
- Updated dependencies [2e53a2e]
- Updated dependencies [47483b9]
  - @triplex/server@0.56.0
  - @triplex/editor@0.56.0
  - @triplex/client@0.56.0
  - create-triplex-project@0.56.0

## 0.55.3

### Patch Changes

- Updated dependencies [cd3efc1]
  - create-triplex-project@0.55.3
  - @triplex/client@0.55.3
  - @triplex/editor@0.55.3
  - @triplex/server@0.55.3

## 0.55.2

### Patch Changes

- Updated dependencies [ed3ef0a]
  - @triplex/server@0.55.2
  - @triplex/client@0.55.2
  - @triplex/editor@0.55.2
  - create-triplex-project@0.55.2

## 0.55.1

### Patch Changes

- ea86fdc: Add license banner.
- b3d2fa9: Number input no longer calls change and confirm handlers if the value
  is outside the min/max range.
- Updated dependencies [ea86fdc]
- Updated dependencies [b3d2fa9]
  - create-triplex-project@0.55.1
  - @triplex/client@0.55.1
  - @triplex/editor@0.55.1
  - @triplex/server@0.55.1

## 0.55.0

### Patch Changes

- ab909b4: Consoldate config into a single module.
- 613cdd8: Stop copying unneeded files into the electron app.
- Updated dependencies [3be2782]
- Updated dependencies [3be2782]
- Updated dependencies [ab909b4]
- Updated dependencies [b6970aa]
- Updated dependencies [ab909b4]
- Updated dependencies [4fa9018]
- Updated dependencies [f7d2d9a]
- Updated dependencies [44faed1]
- Updated dependencies [b6970aa]
  - @triplex/editor@0.55.0
  - @triplex/server@0.55.0
  - @triplex/client@0.55.0
  - create-triplex-project@0.55.0

## 0.54.2

### Patch Changes

- Updated dependencies [a060d2c]
- Updated dependencies [9100a37]
  - @triplex/server@0.54.2
  - @triplex/editor@0.54.2
  - @triplex/client@0.54.2
  - create-triplex-project@0.54.2

## 0.54.1

### Patch Changes

- a2a8d1e: The welcome screen is now closed as early as possible instead of
  waiting for the scene to completly open.
- Updated dependencies [d58e0b0]
- Updated dependencies [8afea84]
- Updated dependencies [ad66cc8]
- Updated dependencies [76fd3f3]
- Updated dependencies [cdd6234]
- Updated dependencies [cdd6234]
- Updated dependencies [76fd3f3]
- Updated dependencies [f77c830]
  - @triplex/editor@0.54.1
  - @triplex/client@0.54.1
  - @triplex/server@0.54.1
  - create-triplex-project@0.54.1

## 0.54.0

### Minor Changes

- c9fcf24: Template used during project creation now decides how to configure
  based on app or node.

### Patch Changes

- Updated dependencies [e0038f6]
- Updated dependencies [8fad65a]
- Updated dependencies [e0038f6]
- Updated dependencies [c9fcf24]
  - @triplex/editor@0.54.0
  - create-triplex-project@0.54.0
  - @triplex/client@0.54.0
  - @triplex/server@0.54.0

## 0.53.1

### Patch Changes

- c891574: Replace hardcoded PATH environment variable with values from
  `shell-env`.
- Updated dependencies [c891574]
  - create-triplex-project@0.53.1
  - @triplex/client@0.53.1
  - @triplex/editor@0.53.1
  - @triplex/server@0.53.1

## 0.53.0

### Minor Changes

- b488d29: When installing dependencies a dialog is presented to select a
  package manager if it could not be inferred.

### Patch Changes

- 399953b: Adds homebrew to path for dependency installation.
- b488d29: Fix installing dependencies with yarn.
- Updated dependencies [aa3a982]
- Updated dependencies [399953b]
- Updated dependencies [aa3a982]
- Updated dependencies [aa3a982]
- Updated dependencies [bddac75]
- Updated dependencies [aa3a982]
- Updated dependencies [049ac2c]
- Updated dependencies [c71412b]
  - @triplex/editor@0.53.0
  - create-triplex-project@0.53.0
  - @triplex/server@0.53.0
  - @triplex/client@0.53.0

## 0.52.0

### Minor Changes

- fe90482: Logs are now accessible through the View > Logs menubar action.

### Patch Changes

- 8f73338: Windows notifications will now display the correct app name.
- fe90482: Errors during project creation now bubble up and are exposed to
  users.
- 16bf49e: When calling `exec` nvm's potential location is now accounted for.
- fe90482: Errors during dependency installation now bubble up and are exposed
  to users.
- fe90482: The `/usr/local/bin` folder is now forcibly exposed on the PATH
  environment variable when executing shell commands.
- Updated dependencies [48016ba]
- Updated dependencies [16d2c14]
- Updated dependencies [fe90482]
- Updated dependencies [8d532f5]
- Updated dependencies [120f9ef]
  - @triplex/editor@0.52.0
  - create-triplex-project@0.52.0
  - @triplex/client@0.52.0
  - @triplex/server@0.52.0

## 0.51.1

### Patch Changes

- @triplex/client@0.51.1
- @triplex/editor@0.51.1
- @triplex/server@0.51.1
- create-triplex-project@0.51.1

## 0.51.0

### Minor Changes

- b61dc2a: The editor menu bar is now displayed in the title bar for Windows and
  Node.js.

### Patch Changes

- b61dc2a: The title bar overlay now has a dark background and white text.
- b61dc2a: Menu bar events now originate from the editor source instead of being
  some in the electron app and some in the editor.
- Updated dependencies [c97e359]
- Updated dependencies [b61dc2a]
- Updated dependencies [b61dc2a]
- Updated dependencies [b61dc2a]
- Updated dependencies [c97e359]
  - @triplex/server@0.51.0
  - @triplex/editor@0.51.0
  - @triplex/client@0.51.0
  - create-triplex-project@0.51.0

## 0.50.1

### Patch Changes

- dfced86: Distributable now comes with an icon.
- Updated dependencies [a101545]
  - @triplex/server@0.50.1
  - @triplex/client@0.50.1
  - @triplex/editor@0.50.1
  - create-triplex-project@0.50.1

## 0.50.0

### Minor Changes

- 8ea575b: Built output is now mangled.

### Patch Changes

- Updated dependencies [8ea575b]
  - @triplex/client@0.50.0
  - create-triplex-project@0.50.0
  - @triplex/editor@0.50.0
  - @triplex/server@0.50.0

## 0.49.0

### Minor Changes

- 3eae131: When installing deps fails a learn more button is now available to
  help troubleshoot.
- f2be7c9: Windows now also targets 32 bit nsis installer.
- 3eae131: Welcome screen now shows a progress bar when installing node modules.
- 8c5611d: Adds create project action to the welcome screen.

### Patch Changes

- 3eae131: Dependency installation is now aborted when opening another project
- Updated dependencies [8c5611d]
- Updated dependencies [9f0fa17]
- Updated dependencies [9f0fa17]
- Updated dependencies [3eae131]
- Updated dependencies [8c5611d]
- Updated dependencies [3eae131]
  - create-triplex-project@0.49.0
  - @triplex/editor@0.49.0
  - @triplex/client@0.49.0
  - @triplex/server@0.49.0

## 0.48.0

### Minor Changes

- 6fe34af: Windows support is here. Now Triplex cli and electron can be ran on
  Windows, as well as the local dev loop now being functional.
- 5b189b2: When opening a project for the first time if node modules is missing
  Triplex will try to install missing dependencies.

### Patch Changes

- Updated dependencies [6fe34af]
  - @triplex/client@0.48.0
  - @triplex/editor@0.48.0
  - @triplex/server@0.48.0

## 0.47.0

### Minor Changes

- daa2697: Adds a welcome screen to the electron app.
- 1fc7657: Menu bar is now native when ran in the electron app.
- 1fc7657: Electron app now uses a custom title bar.
- 1fc7657: Menu bar now contains view, window, and help.
- e8cf76f: Adds native save dialog support.
- 4164026: Add support for the scene to know what environment it is running in
  (either web or electron).
- daa2697: When opening a project the first found file and export are now
  immediately opened.

### Patch Changes

- Updated dependencies [daa2697]
- Updated dependencies [1fc7657]
- Updated dependencies [1fc7657]
- Updated dependencies [1fc7657]
- Updated dependencies [4164026]
- Updated dependencies [1fc7657]
- Updated dependencies [e8cf76f]
- Updated dependencies [1fc7657]
- Updated dependencies [e8cf76f]
- Updated dependencies [4164026]
- Updated dependencies [4164026]
  - @triplex/editor@0.47.0
  - @triplex/client@0.47.0
  - @triplex/server@0.47.0

## 0.46.4

### Patch Changes

- 59301bf: The macOS target now is notarized during release.
  - @triplex/client@0.46.4
  - @triplex/editor@0.46.4
  - @triplex/server@0.46.4

## 0.46.3

### Patch Changes

- 275d931: Adds error reporting.
- d4c6ce4: Now builds missing x64 architecture.
  - @triplex/client@0.46.3
  - @triplex/editor@0.46.3
  - @triplex/server@0.46.3

## 0.46.2

### Patch Changes

- cab4585: Force version bump.
  - @triplex/client@0.46.2
  - @triplex/editor@0.46.2
  - @triplex/server@0.46.2

## 0.46.1

### Patch Changes

- 111fd6c: Release action now looks for the create tag event.
  - @triplex/client@0.46.1
  - @triplex/editor@0.46.1
  - @triplex/server@0.46.1

## 0.46.0

### Minor Changes

- d67f998: The built electron app now can actually be ran on macOS.
- d67f998: Replaced electron-forge with electron-builder.
- d6dedf5: Moves logger to electron-logger.

### Patch Changes

- Updated dependencies [d67f998]
- Updated dependencies [c808957]
  - @triplex/client@0.46.0
  - @triplex/editor@0.46.0
  - @triplex/server@0.46.0

## 0.45.1

### Patch Changes

- @triplex/client@0.45.1
- @triplex/server@0.45.1

## 0.45.0

### Minor Changes

- 1aadeb8: App now marked as private.

### Patch Changes

- @triplex/client@0.45.0
- @triplex/server@0.45.0

## 0.44.0

### Patch Changes

- Updated dependencies [0242833]
- Updated dependencies [5039e39]
- Updated dependencies [4d8d9cc]
- Updated dependencies [5039e39]
- Updated dependencies [557648e]
  - @triplex/client@0.44.0
  - @triplex/server@0.44.0
