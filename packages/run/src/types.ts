/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
export interface TRIPLEXConfig {
  /**
   * Folder inside the {@link publicDir} folder where Triplex maintains static
   * assets such as GLTF and GLB files. Files inside this directory are made
   * available to be added to the open component as a `<primitive>` element.
   *
   * Defaults to `"assets"`.
   */
  assetsDir?: string;
  /**
   * An array of relative glob paths to select what files can be added to other
   * components. You can define multiple roots.
   */
  components?: string[];
  /**
   * An array of relative path globs to select what files can be opened by
   * Triplex. You can define multiple roots. Found files will be available to
   * open in the `File` > `Open` menu.
   */
  files: string[];
  /**
   * Relative path to a folder used to expose files through the local dev
   * server, such as images, videos, and GLTF/GLB files. For example if the
   * public directory has a `image.png` file then it will be made available at
   * the `"/image.png"` URL.
   */
  publicDir?: string;
  /**
   * Path to a provider component that can hold all React providers needed
   * during runtime. The component must be the default export and return
   * children.
   *
   * ```ts
   * export default function Provider({ children }) {
   *   return children;
   * }
   * ```
   */
  provider?: string;
}
