export function addRefreshWrapper(code: string, id: string) {
  const runtimePublicPath = "/@react-refresh";
  const header = `
  import RefreshRuntime from "${runtimePublicPath}";
  
  let prevRefreshReg;
  let prevRefreshSig;
  
  if (import.meta.hot) {
    if (!window.__vite_plugin_react_preamble_installed__) {
      throw new Error(
        "@vitejs/plugin-react can't detect preamble. Something is wrong. " +
        "See https://github.com/vitejs/vite-plugin-react/pull/11#discussion_r430879201"
      );
    }
  
    prevRefreshReg = window.$RefreshReg$;
    prevRefreshSig = window.$RefreshSig$;
    window.$RefreshReg$ = (type, id) => {
      RefreshRuntime.register(type, __SOURCE__ + " " + id)
    };
    window.$RefreshSig$ = RefreshRuntime.createSignatureFunctionForTransform;
  }`.replace(/\n+/g, "");
  const timeout = `
    if (!window.__vite_plugin_react_timeout) {
      window.__vite_plugin_react_timeout = setTimeout(() => {
        window.__vite_plugin_react_timeout = 0;
        RefreshRuntime.performReactRefresh();
      }, 30);
    }
  `;
  const checkAndAccept = `
  function isReactRefreshBoundary(mod) {
    if (mod == null || typeof mod !== 'object') {
      return false;
    }
    let hasExports = false;
    let areAllExportsComponents = true;
    for (const exportName in mod) {
      hasExports = true;
      if (exportName === '__esModule') {
        continue;
      }
      const desc = Object.getOwnPropertyDescriptor(mod, exportName);
      if (desc && desc.get) {
        // Don't invoke getters as they may have side effects.
        return false;
      }
      const exportValue = mod[exportName];
      if (!RefreshRuntime.isLikelyComponentType(exportValue)) {
        areAllExportsComponents = false;
      }
    }
    return hasExports && areAllExportsComponents;
  }
  
  import.meta.hot.accept(mod => {
    if (!mod) return;
    if (isReactRefreshBoundary(mod)) {
      ${timeout}
    } else {
      import.meta.hot.invalidate();
    }
  });
  `;
  const footer = `
  if (import.meta.hot) {
    window.$RefreshReg$ = prevRefreshReg;
    window.$RefreshSig$ = prevRefreshSig;
  
    ${checkAndAccept}
  }`;

  return header.replace("__SOURCE__", JSON.stringify(id)) + code + footer;
}
