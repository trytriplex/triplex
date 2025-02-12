/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
const groups = /([a-z][A-Z])|([a-z]-[a-z])/g;

export function titleCase(string: string) {
  const result = string.replaceAll(groups, (match) => {
    const parsed = match.replace("-", "");
    return parsed[0] + " " + parsed[1].toUpperCase();
  });

  if (result.length <= 2) {
    return result.toUpperCase();
  }

  return result[0].toUpperCase() + result.slice(1);
}

export function sentenceCase(string: string) {
  const result = string.replaceAll(groups, (match) => {
    const parsed = match.replace("-", "");
    return parsed[0] + " " + parsed[1].toLowerCase();
  });

  return result[0].toUpperCase() + result.slice(1);
}

/** Converts an object to JSON while ensuring undefined values are preserved. */
export function stringifyJSON(value: unknown): string {
  const str = JSON.stringify(value, (_k, v) =>
    v === undefined ? "__UNDEFINED__" : v,
  );

  return str.replaceAll('"__UNDEFINED__"', "undefined");
}

export function filename(path: string): string {
  return path.split("/").at(-1)!;
}

export function normalize(str: string | undefined): string {
  if (!str) {
    return "";
  }

  return str.replaceAll("-", "").replaceAll(" ", "").toLowerCase();
}
