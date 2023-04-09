const groups = /([a-z][A-Z])|([a-z]-[a-z])/g;

export function camelToStartCase(string: string) {
  const result = string.replace(groups, (match) => {
    const parsed = match.replace("-", "");
    return parsed[0] + " " + parsed[1].toUpperCase();
  });

  return result[0].toUpperCase() + result.slice(1);
}
