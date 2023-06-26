export interface TRIPLEXConfig {
  /**
   * Folder inside the `publicDir` folder where Triplex maintains static assets
   * such as GLTF and GLB files. Files inside this directory are made available
   * to be added to the open component as a `<primitive>` element.
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
}
