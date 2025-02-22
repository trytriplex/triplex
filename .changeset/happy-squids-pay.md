---
"@triplex/client": patch
"@triplex/editor": patch
"@triplex/renderer": patch
"@triplex/electron": patch
"@triplex/lib": patch
"triplex-vsce": patch
---

Testing a new camera system under a feature gate. This gives you more control over what Canvas camera to view through, while also changing the default behavior for React DOM components to view through the default camera instead of the editor camera when initially opening.
