---
"@triplex/renderer": minor
---

Add Grid toggle feature to scene controls

Implements a "Toggle Visibility" option in the scene controls settings menu that allows users to conditionally show/hide the grid in the 3D scene. The grid maintains its existing behavior of being hidden during play mode while adding the new toggle functionality for edit mode.

Features:
- Added "Toggle Visibility" option under a new "Grid" group in scene controls
- Grid component now includes state management for visibility control
- Event handling for `toggle_grid` action with scope "scene"
- Grid defaults to visible to maintain existing behavior
- Uses the `visible` prop for better performance instead of conditional rendering

Fixes #235.
