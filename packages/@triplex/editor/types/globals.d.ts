/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
/// <reference types="vite/client" />

declare const __TRIPLEX_TARGET__: "web" | "electron";

interface ImportMetaEnv {
  VITE_TRIPLEX_ENV?: "test";
}
