---
"@triplex/client": patch
"@triplex/server": patch
"@triplex/renderer": patch
"@triplex/bridge": patch
"triplex-vsce": patch
---

The default global provider has been deprecated and replaced with two named exports: CanvasProvider which is a 1:1 replacement, and GlobalProvider, which is placed at the root of the component tree.
