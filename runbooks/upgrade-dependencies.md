# Upgrade Dependencies

Make sure to run `pnpm dedupe` after upgrading.

- Upgrade all `@react-three` dependencies:

  ```bash
  pnpm upgrade -r @react-three/drei@latest @react-three/fiber@latest @react-three/xr@latest @react-three/uikit@latest @react-three/postprocessing@latest @react-three/rapier@latest @react-three/test-renderer@latest @react-three/handle@latest koota@latest @pmndrs/xr@latest
  ```

- Upgrade all `vite` dependencies:

  ```bash
  pnpm upgrade -r vitest@latest vite@latest vite-plugin-glsl@latest vite-tsconfig-paths@latest @vitejs/plugin-react@latest msw@latest jsdom@latest @testing-library/react@latest @testing-library/dom@latest
  ```

- Upgrade all `react` dependencies:

  ```bash
  pnpm upgrade -r react@latest react-dom@latest @types/react@latest @types/react-dom@latest eslint-plugin-react-compiler@latest babel-plugin-react-compiler@latest react-compiler-runtime@latest
  ```

- Upgrade all `typescript` dependencies:

  ```bash
  pnpm upgrade -r typescript@latest ts-morph@latest
  ```
