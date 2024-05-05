/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { getConfig, inferExports, resolveProjectCwd } from "@triplex/server";
import anymatch from "anymatch";
import { dirname } from "upath";
import * as vscode from "vscode";

export class CodelensProvider implements vscode.CodeLensProvider {
  private regex = /(?:function|const|let) ([A-Z]\w+)/g;

  provideCodeLenses(
    doc: vscode.TextDocument,
    _token: vscode.CancellationToken
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

    let matchRegExp: RegExpExecArray | null;

    while ((matchRegExp = regex.exec(text)) !== null) {
      const componentName = matchRegExp[1];
      const foundExport = foundExports.find(
        (exp) => exp.name === componentName
      );

      if (!foundExport) {
        // This match isn't exported so we skip over it.
        continue;
      }

      const line = doc.lineAt(doc.positionAt(matchRegExp.index).line);
      const indexOf = line.text.indexOf(matchRegExp[0]);
      const position = new vscode.Position(line.lineNumber, indexOf);
      const range = doc.getWordRangeAtPosition(
        position,
        new RegExp(this.regex)
      );

      if (range) {
        codeLenses.push(
          new vscode.CodeLens(range, {
            arguments: [
              { exportName: foundExport.exportName, path: doc.fileName },
            ],
            command: "triplex.start",
            title: "Open in Triplex",
            tooltip: `Will open the ${foundExport.name} component in Triplex`,
          })
        );
      }
    }

    return codeLenses;
  }
}
