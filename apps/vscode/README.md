Triplex for VS Code turns [Visual Studio Code](https://code.visualstudio.com), [Cursor](https://www.cursor.com), [Windsurf](https://codeium.com/windsurf), and other forks into your visual workspace, bringing the best features of Triplex for you to stay in context while coding.

# Get Started

Get started by opening any React component by clicking the "Open in Triplex" CodeLens action shown on top of to components. Needing inspiration? Here's some things to start with:

- [Create a project from a template](https://triplex.dev/docs/get-started/starting-a-project/create-from-template)
- [Complete the Your First 3D Component guide](https://triplex.dev/docs/get-started/starting-a-project/your-first-3d-component)
- [Learn more about the scene](https://triplex.dev/docs/building-your-scene/scene)
- [Learn more about Triplex for VS Code](https://triplex.dev/docs/get-started/vscode)

# Community

There are a few online forums we recommend you join when building with Triplex.

- [Poimandres Collective Discord](https://discord.com/invite/poimandres) (focus: React Three Fiber ecosystem)
- [Triplex GitHub Repository](https://github.com/trytriplex/triplex) (focus: roadmap, issues, bugs)
- [Web Game Dev Discord](https://webgamedev.com/discord) (focus: building games)

# Common Questions

## Why is there a SharedArrayBuffer is not defined error?

Visual Studio Code by default doesn't run in a [secure context](https://developer.mozilla.org/en-US/docs/Web/Security/Secure_Contexts) which means certain APIs are unavailable, like SharedArrayBuffer. To enable these APIs you need to close all instances of Visual Studio Code and then re-open with the `--enable-coi` flag.

```bash filename="Terminal"
code --enable-coi
```

This flag was [introduced on September 2022 (version 1.72)](https://code.visualstudio.com/updates/v1_72#_towards-cross-origin-isolation).

### Why can't I open one of my components?

Only components that are exported can be opened in Triplex. If you're trying to open a component that isn't exported you'll need to export it first.

```diff
-function Component() {
+export function Component() {
```

### Why do I get an error opening one of my components?

Components are rendered by themselves alongside visual controls. This means if your components rely on global state or context there may be some work involved to get it rendering without an error.

To resolve you could:

- Refactor your component to be self contained
- Use a [provider component](https://triplex.dev/docs/building-your-scene/providers#global-provider) to provide the missing React context
- Declare the required context or state in another component and open that instead
- Set default props

## How do I reload the editor?

If there's a problem and the editor has been put into an invalid state you can reload the editor by accessing the command palette via <Kbd>Shift</Kbd> + <Kbd>Cmd</Kbd> + <Kbd>P</Kbd> then selecting "Developer: Reload Webviews".

If you think you've found a bug please [raise an issue on GitHub](https://github.com/trytriplex/triplex/issues/new).

## Why is Triplex slow?

You might have GPU acceleration disabled. To fix:

1. Press <Kbd>Cmd</Kbd> + <Kbd>Shift</Kbd> + <Kbd>P</Kbd>
2. Search for "Preferences: Configure Runtime Arguments"
3. Add the following line of code:
   ```json
   "disable-hardware-acceleration": false
   ```
