export interface EditorLinkOptions {
  path: string;
  line?: number;
  column?: number;
  editor?: "sublime" | "phpstorm" | "atom" | "vscode-insiders" | "vscode";
}

export function getEditorLink({
  path,
  line = 0,
  column = 0,
  editor = "vscode",
}: EditorLinkOptions) {
  switch (editor) {
    case "sublime":
      return `subl://open?url=file://${path}&line=${line}&column=${column}`;
    // https://youtrack.jetbrains.com/issue/IDEA-65879
    case "phpstorm":
      return `phpstorm://open?file=${path}&line=${line}&column=${column}`;
    // https://flight-manual.atom.io/hacking-atom/sections/handling-uris/#core-uris
    case "atom":
      return `atom://core/open?url=file://${path}&line=${line}&column=${column}`;
    // https://code.visualstudio.com/docs/editor/command-line#_opening-vs-code-with-urls
    case "vscode-insiders":
    case "vscode":
      return `${editor}://file/${path}:${line}:${column}`;
  }
}
