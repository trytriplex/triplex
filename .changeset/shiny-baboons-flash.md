---
"@triplex/server": patch
---

Changes to prop types are now correctly propagating to all referencing modules
that import them, previously you would have to restart triplex for the change to
be applied.
