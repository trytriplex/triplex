export async function showSaveDialog(filename: string) {
  if (__TRIPLEX_TARGET__ === "electron") {
    return window.triplex.showSaveDialog(filename);
  }

  return prompt("Filename") || undefined;
}
