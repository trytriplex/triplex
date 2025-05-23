---
"@triplex/client": patch
---

Fix component environment check using `@react-three/drei` hooks to prevent accidentally loading a three fiber environment when a react dom environment should have been loaded.
