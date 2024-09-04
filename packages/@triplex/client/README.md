# @triplex/client

This package contains code that runs the scene and userland code. It's built
on-top of the Vite bundler.

## Notes

- The client supports multiple renderes (react-three-fiber / react-dom / ...)
  via a
  [consistent API](https://github.com/try-triplex/triplex-monorepo/blob/fbcd188bd1fe3a96e56402045aef891f89c773f3/packages/@triplex/client/src/templates.ts#L95)
- The [babel plugin](./src/babel-plugin.ts) wraps all user land JSX elements and
  is used for scene selection in conjunction with the SceneObject component
  defined via the
  [render API](https://github.com/try-triplex/triplex-monorepo/blob/fbcd188bd1fe3a96e56402045aef891f89c773f3/packages/@triplex/client/src/templates.ts#L95).
- The [node modules plugin](./src/node-modules-plugin.ts) forces all JSX
  elements found in node modules to be transformed into a scene object to power
  scene selection.
- The [remote module plugin](./src/remote-module-plugin.ts) forces Vite to pick
  up user land code from the [backend](../server/README.md) instead of the file
  system so we can flush intermediate changes to the client before they've been
  persisted to the file system.
