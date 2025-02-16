/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { getConfig, inferExports, resolveProjectCwd } from "@triplex/server";
import anymatch from "anymatch";
import { dirname } from "upath";
import * as vscode from "vscode";

export class TriplexCodelensProvider implements vscode.CodeLensProvider {
  private regex = /(?:function|const|let) ([A-Z]\w+)/g;

  private constructor() {}

  static register() {
    return vscode.languages.registerCodeLensProvider(
      [
        { language: "typescriptreact", scheme: "file" },
        { language: "javascriptreact", scheme: "file" },
      ],
      new TriplexCodelensProvider(),
    );
  }

  provideCodeLenses(
    doc: vscode.TextDocument,
    _token: vscode.CancellationToken,
  ): vscode.ProviderResult<vscode.CodeLens[]> {
    const cwd = resolveProjectCwd(dirname(doc.fileName));
    if (!cwd) {
      return null;
    }

    const config = getConfig(cwd);
    const matchFiles = anymatch(config.files);

    if (!matchFiles(doc.fileName)) {
      return null;
    }

    const codeLenses: vscode.CodeLens[] = [];
    const text = doc.getText();
    const regex = new RegExp(this.regex);
    const foundExports = inferExports(text);
    const matchedExports: string[] = [];

    let matchRegExp: RegExpExecArray | null;

    while ((matchRegExp = regex.exec(text)) !== null) {
      const componentName = matchRegExp[1];
      const foundExport = foundExports.find(
        (exp) => exp.name === componentName,
      );

      if (
        // This match isn't exported so we skip over it.
        !foundExport ||
        // This export has already been initialized so we skip it.
        // Doubling up looks hilariously broken!
        matchedExports.some((exp) => exp === foundExport.name)
      ) {
        continue;
      }

      const line = doc.lineAt(doc.positionAt(matchRegExp.index).line);
      const indexOf = line.text.indexOf(matchRegExp[0]);
      const position = new vscode.Position(line.lineNumber, indexOf);
      const range = doc.getWordRangeAtPosition(
        position,
        new RegExp(this.regex),
      );

      if (range) {
        matchedExports.push(foundExport.name);

        codeLenses.push(
          new vscode.CodeLens(range, {
            arguments: [
              { exportName: foundExport.exportName, path: doc.fileName },
            ],
            command: "triplex.start",
            title: "Open in Triplex",
            tooltip: `Will open the ${foundExport.name} component in Triplex`,
          }),
        );
      }
    }

    return codeLenses;
  }
}
