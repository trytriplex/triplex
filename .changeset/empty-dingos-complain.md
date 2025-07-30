---
"@triplex/renderer": patch
"triplex-vsce": patch
"@triplex/electron": patch
---

Duplicate entries found in during hit testing for selecting elements in the scene are now removed, fixing an edge case where cycle selection would not work as expected.
