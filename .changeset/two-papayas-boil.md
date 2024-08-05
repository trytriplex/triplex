---
"@triplex/ux": patch
---

Color input now uses blur event instead of native change event when confirming the changed value. This fixes the default value "" being considered the same as "#000".
