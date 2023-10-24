---
"@triplex/client": minor
"@triplex/editor": minor
"@triplex/server": minor
"@triplex/scene": minor
"@triplex/electron": minor
---

Scene modules are now loaded remotely instead of from the fs. This is going to
raise the ceiling on features we can implement as now everything becomes a
mutation to the remote source instead of that AND also trying to handle the
intermediate state in the scene prior to it being flushed to the fs. Super
excited about this.
