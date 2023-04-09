export function inferExports(file: string) {
  const namedExports = file.matchAll(/export (function|const|let) ([A-Z]\w+)/g);
  const defaultExport = /export default.+([A-Z]\w+)/.exec(file);
  const foundExports: { name: string; exportName: string }[] = [];

  for (const match of namedExports) {
    const [, , exportName] = match;
    foundExports.push({ name: exportName, exportName });
  }

  if (defaultExport) {
    const name = defaultExport[1];
    foundExports.push({ exportName: "default", name });
  }

  return foundExports;
}
