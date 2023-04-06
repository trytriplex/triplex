export interface TRIPLEXConfig {
  /**
   * Relative filepath globs used to mark files that are able to be added to scenes.
   */
  components?: string[];
  /**
   * Relative filepath globs used to mark files that can be opened by the editor.
   */
  files: string[];
  /**
   * Relative path to a folder which contains static assets such as gltf files.
   */
  publicDir?: string;
}
