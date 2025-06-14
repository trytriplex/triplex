---
"@triplex/api": patch
---

The koota helper `injectSystems` now doesn't require `@react-three/xr` on its critical path. The XR logic has been moved to a new entrypoint that has a 1:1 API: `@triplex/api/koota/xr`, use it when needing the XR store passed to your systems.
