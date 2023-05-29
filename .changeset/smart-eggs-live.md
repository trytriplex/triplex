---
"@triplex/scene": patch
---

The scene traversal that takes place during a selection now stops at the first
found object instead of continuing until no children remain. Any odd scene
transforms should now be fixed.
