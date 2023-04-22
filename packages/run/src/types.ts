export interface TRIPLEXConfig {
  /**
   * A glob array of relative paths used to tell Triplex what files should be
   * available to add. You can define multiple roots.
   */
  components?: string[];
  /**
   * A glob array of relative paths used to tell Triplex what files it can open.
   * You can define multiple roots. These found files will be displayed in the
   * `File` > `Open` menu.
   */
  files: string[];
  /**
   * Used to expose files through the local dev server, such as images, videos,
   * and GLTF files. For example if the public directory includes a
   * `public/image.png` image it will be made available at
   * `http://localhost:3333/image.png`.
   */
  publicDir?: string;
}
