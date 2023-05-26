---
"@triplex/scene": minor
---

Scene components now better handle edge cases. When children as function the
function behavior is respected. When children end up being falsy we no longer
render the intermediate scene elements.
