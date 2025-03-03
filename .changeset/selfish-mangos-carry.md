---
"@triplex/websocks-client": patch
"@triplex/websocks-server": patch
---

Support for optional params. E.g. the path "/scene/:path/:exportName{/:exportName1}{/:exportName2}/props" will have `path` and `exportName` as required params, and `exportName1` and `exportName2` as optional params.
