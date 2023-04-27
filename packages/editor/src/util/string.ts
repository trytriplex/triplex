const groups = /([a-z][A-Z])|([a-z]-[a-z])/g;

export function titleCase(string: string) {
  const result = string.replace(groups, (match) => {
    const parsed = match.replace("-", "");
    return parsed[0] + " " + parsed[1].toUpperCase();
  });

  return result[0].toUpperCase() + result.slice(1);
}

export function sentenceCase(string: string) {
  const result = string.replace(groups, (match) => {
    const parsed = match.replace("-", "");
    return parsed[0] + " " + parsed[1].toLowerCase();
  });

  return result[0].toUpperCase() + result.slice(1);
}

/**
 * Equivalent to JSON.stringify except it also persists `undefined` values
 * instead of replacing with `null`.
 */
export function stringify(value: unknown): string {
  const str = JSON.stringify(value, (_k, v) =>
    v === undefined ? "__UNDEFINED__" : v
  );

  return str.replaceAll('"__UNDEFINED__"', "undefined");
}
