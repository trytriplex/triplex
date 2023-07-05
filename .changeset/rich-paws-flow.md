---
"@triplex/editor": patch
"@triplex/electron": patch
---

Number input no longer calls change and confirm handlers if the value is outside
the min/max range.
