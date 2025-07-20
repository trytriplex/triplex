# @triplex/editor-next

## 0.0.2

### Patch Changes

- 196d5f8: The unexpected error splash screen now has a "reload webviews" action, use it to reload your session to get back to it as fast as possible.
- 4500a5f: Deno projects that are missing critical dependencies to run Triplex now have the install prompt set with the `--npm` arg.
- 0cbd424: Components that are no longer exported are now gracefully handled. Instead of an error being thrown the UI remains available prompting you to export the component again.
- Updated dependencies [0cbd424]
- Updated dependencies [1e2a753]
  - @triplex/websocks-client@0.0.9
  - @triplex/bridge@0.70.10
  - @triplex/ux@0.69.27

## 0.0.1

### Patch Changes

- 48d7e85: Add group element action in the element panel action menu.
- 77ebf08: Add error screen when Vite failed to load a module.
- 05006cf: Internal refactor.
