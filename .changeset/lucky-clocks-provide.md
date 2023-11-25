---
"@triplex/server": patch
---

Source files now have events initialized when first explicitly loaded —
previously they would be skipped over when implicitly loaded.
