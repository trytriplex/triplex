const groups = /([a-z][A-Z])/g;

export function camelToStartCase(string: string) {
  const result = string.replace(groups, (match) => {
    return match[0] + " " + match[1];
  });

  return result[0].toUpperCase() + result.slice(1);
}
