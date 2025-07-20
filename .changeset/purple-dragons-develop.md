---
"@triplex/editor-next": patch
"@triplex/editor": patch
"@triplex/server": patch
"@triplex/websocks-client": patch
"@triplex/renderer": patch
"@triplex/bridge": patch
"triplex-vsce": patch
---

Components that are no longer exported are now gracefully handled. Instead of an error being thrown the UI remains available prompting you to export the component again.
