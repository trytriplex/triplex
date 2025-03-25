/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import * as nodePath from "node:path";

function toUnix(p: string): string {
  p = p.replaceAll("\\", "/");
  p = p.replaceAll(/(?<!^)\/+/g, "/"); // replace doubles except beginning for UNC path
  if (p.match(/^[A-z]:\//)) {
    // Normalize drive casing to uppercase so it's consistent with Vite.
    p = p[0].toUpperCase() + p.slice(1);
  }

  return p;
}

export const sep = "/";

export function resolve(...paths: string[]): string {
  return toUnix(nodePath.resolve(...paths.map(toUnix)));
}

export function join(...paths: string[]): string {
  return toUnix(nodePath.join(...paths.map(toUnix)));
}

export function basename(p: string, ext?: string): string {
  return nodePath.basename(p, ext);
}

export function dirname(p: string): string {
  return toUnix(nodePath.dirname(p));
}

export function normalize(p: string): string {
  return toUnix(nodePath.normalize(toUnix(p)));
}

export function extname(p: string): string {
  return nodePath.extname(p);
}

export function relative(from: string, to: string): string {
  return toUnix(nodePath.relative(toUnix(from), toUnix(to)));
}
