---
"@triplex/server": patch
---

The fs watcher used for the save indicator endpoint now uses polling to work
around a timing bug.
