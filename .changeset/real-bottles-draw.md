---
"@triplex/client": patch
---

Fix root analysis using locally defined components sourced from inside components, which are now ignored. This is because the component isn't in the module scope and can't be statically used prior to the component rendering.
