---
"@triplex/server": patch
---

Props are now grouped or excluded depending on data collected when analyzing an elements props. This includes: the element name, and where the prop type declarations live. If any data points to Three.js the component will have its props grouped for a Three.js component, else if it points to React it will be grouped as a React component, otherwise the props will not be grouped.
