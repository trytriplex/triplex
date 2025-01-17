/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import Local from "next/font/local";

export const karla = Local({
  display: "swap",
  preload: true,
  src: "../public/font/karla-variable.ttf",
  variable: "--karla",
});

export const suse = Local({
  display: "swap",
  preload: true,
  src: "../public/font/suse-variable.ttf",
  variable: "--suse",
});
