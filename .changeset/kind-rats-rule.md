---
"@triplex/scene": patch
---

Selecting scene objects now bails out from traversing the Three.js scene when it
is a host element inside the currently open file.
