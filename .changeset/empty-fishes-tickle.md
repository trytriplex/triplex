---
"@triplex/renderer-r3f": patch
"@triplex/bridge": patch
"@triplex/client": patch
"triplex-vsce": patch
---

Errors thrown when rendering, initializing modules, importing dependencies, interacting with scene objects, and GLSL compilation are now all captured and notifies you of the error. Where possible the errors are now also recoverable, meaning you can update your code, save, and continue right where you leftoff.
