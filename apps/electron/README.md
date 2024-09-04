# @triplex/electron

This package contains the code for the standalone Electron app.

To run locally:

```sh
# Run from root
pnpm dev
```

Or in VS Code:

```
Run and Debug > Run Electron command
```

## Notes

- This package only contains the Node.js code that bootstraps everything.
- Want to modify the editor UI? See
  [@triplex/editor](../../packages/@triplex/editor/README.md) package.
- Want to modify the scene renderer? See
  [@triplex/renderer-r3f](../../packages/@triplex/renderer-r3f/README.md)
  package.
- Want to modify the scene backend? See
  [@triplex/server](../../packages/@triplex/client/README.md) package.
- Want to modify the server? See
  [@triplex/server](../../packages/@triplex/server/README.md) package.
