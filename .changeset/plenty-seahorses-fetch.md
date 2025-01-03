---
"@triplex/client": patch
---

Fixed an edge case where nested object3ds were being translated by transform controls in unexpected ways, caused by props being flagged as used when they weren't identifiers.
