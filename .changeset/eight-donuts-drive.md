---
"@triplex/client": patch
---

Fixed a long standing bug where rotation transforms weren't correctly marked where statically used as the code analysis was looking for "rotate" instead of "rotation".
