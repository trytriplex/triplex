---
"@triplex/server": patch
---

Fix initial undo ID being set to length - 1 instead of 0 resulting in unexpected behavior when undo/redoing.
