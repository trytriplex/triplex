---
"@triplex/client": patch
---

Fix modules that have no React components being flagged as HMR boundaries breaking updates being flushed to owning components.
