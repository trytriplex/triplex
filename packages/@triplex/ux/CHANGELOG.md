# @triplex/ux

## 0.69.3

### Patch Changes

- Updated dependencies [6dca038]
  - @triplex/lib@0.69.3

## 0.69.2

### Patch Changes

- @triplex/bridge@0.69.2
- @triplex/lib@0.69.2

## 0.69.1

### Patch Changes

- 50c28c96: Upgrade tsc.
- Updated dependencies [50c28c96]
  - @triplex/bridge@0.69.1
  - @triplex/lib@0.69.1

## 0.69.0

### Minor Changes

- 740ff8f2: Default editor lights can now be turned on or off through the
  floating controls panel. Previously they would either be always on (if you had
  no lights in your component) or always off (if you did have lights). Now you
  can choose.

### Patch Changes

- fd4fa16f: Internal refactor to consolidate extension points to use a common
  implementation.
- Updated dependencies [fd4fa16f]
- Updated dependencies [740ff8f2]
  - @triplex/bridge@0.69.0
  - @triplex/lib@0.69.0

## 0.68.8

### Patch Changes

- 07acd338: Fix boolean input firing on change / on confirm events more than
  expected when the persisted value updates.
  - @triplex/bridge@0.68.8
  - @triplex/lib@0.68.8

## 0.68.7

### Patch Changes

- @triplex/bridge@0.68.7
- @triplex/lib@0.68.7

## 0.68.6

### Patch Changes

- 4cf3e526: Fix union inputs missing descriptions.
  - @triplex/bridge@0.68.6
  - @triplex/lib@0.68.6

## 0.68.5

### Patch Changes

- b6d89da7: The string and number inputs now default to string and number
  placeholders when labels are undefined, respectively.
  - @triplex/bridge@0.68.5
  - @triplex/lib@0.68.5

## 0.68.4

### Patch Changes

- @triplex/bridge@0.68.4
- @triplex/lib@0.68.4

## 0.68.3

### Patch Changes

- 4ab74c91: Support default values in string, number, boolean, and literal union
  inputs.
- 0d97596c: Add link to code for controlled props.
- Updated dependencies [1c9c343a]
  - @triplex/lib@0.68.3
  - @triplex/bridge@0.68.3

## 0.68.2

### Patch Changes

- 1ee10f79: Fix color input setting unparsed persisted values instead of the
  transformed hex value.
- 1ee10f79: Color input now uses blur event instead of native change event when
  confirming the changed value. This fixes the default value "" being considered
  the same as "#000".
  - @triplex/bridge@0.68.2
  - @triplex/lib@0.68.2

## 0.68.1

### Patch Changes

- 22164772: Color input now sets value when persisted value prop changes.
- 22164772: Union input now passes along name to children inputs.
- Updated dependencies [a5df6744]
  - @triplex/lib@0.68.1
  - @triplex/bridge@0.68.1

## 0.68.0

### Minor Changes

- 60ee4011: Add none transform option. The renderer now defaults to this.

### Patch Changes

- dd99789a: Upgrade React Compiler.
- Updated dependencies [5b6671c2]
- Updated dependencies [60ee4011]
  - @triplex/lib@0.68.0
  - @triplex/bridge@0.68.0

## 0.67.9

### Patch Changes

- @triplex/bridge@0.67.9
- @triplex/lib@0.67.9

## 0.67.8

### Patch Changes

- Updated dependencies [3952a1c8]
  - @triplex/bridge@0.67.8
  - @triplex/lib@0.67.8

## 0.67.7

### Patch Changes

- @triplex/bridge@0.67.7
- @triplex/lib@0.67.7

## 0.67.6

### Patch Changes

- @triplex/bridge@0.67.6
- @triplex/lib@0.67.6

## 0.67.5

### Patch Changes

- a1121431: Vsce element controls.
- f1c507e9: Fix input bugs.
- Updated dependencies [a1121431]
  - @triplex/lib@0.67.5
  - @triplex/bridge@0.67.5

## 0.67.4

### Patch Changes

- cba1c8db: Internal pkg refactor.
- Updated dependencies [cba1c8db]
  - @triplex/lib@0.67.4
  - @triplex/bridge@0.67.4

## 0.67.3

### Patch Changes

- c9c2bd90: Initial commit.
