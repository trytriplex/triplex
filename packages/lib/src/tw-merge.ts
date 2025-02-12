/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
type ClassNames = string | false | undefined | ClassNames[];

function collectDecls(
  classNames: ClassNames[],
  outDecls: Record<string, string>,
): void {
  for (let i = 0; i < classNames.length; i++) {
    const className = classNames[i];

    if (Array.isArray(className)) {
      collectDecls(className, outDecls);
    } else if (className) {
      const parts = className.split(" ");

      for (let x = 0; x < parts.length; x++) {
        const part = parts[x];
        outDecls[part] = part;
      }
    }
  }
}

export function cn(classNames: ClassNames[]): string | undefined {
  const decls: Record<string, string> = {};

  collectDecls(classNames, decls);

  const str = [];

  for (const key in decls) {
    const value = decls[key];
    str.push(value);
  }

  return str.join(" ");
}
