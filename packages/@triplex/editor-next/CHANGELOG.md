# @triplex/editor-next

## 0.0.4

### Patch Changes

- 487e3fa: Components in the element panel can now be opened in another Triplex editor using the "Open in Triplex" action.
- 990cd9f: Elements returned from components now correctly highlight the parent relation line when selected.
- Updated dependencies [e736aab]
  - @triplex/ux@0.69.28

## 0.0.3

### Patch Changes

- c8cea68: The elements panel now has lines to aid in showing the relationship of their children.
- e1153b6: Fix provider data being preloaded when it hasn't been set by users yet.
- a7511d5: All elements that have children can now be expanded/collapsed in the elements panel instead of just custom components.
- e1153b6: Changes that result in no code change are no longer added to the undo/redo stack.

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
