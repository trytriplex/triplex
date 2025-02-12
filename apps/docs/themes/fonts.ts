/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
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
