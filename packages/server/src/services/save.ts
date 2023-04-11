import { resolveConfig, resolveConfigFile, format } from "prettier";
import type { TRIPLEXProject } from "../ast";
import { deleteCommentComponents } from "./component";

export async function save({
  project,
  path,
}: {
  project: TRIPLEXProject;
  path: string;
}) {
  const { sourceFile } = project.getSourceFile(path);

  if (sourceFile) {
    deleteCommentComponents(sourceFile);

    const prettierConfigPath = await resolveConfigFile(process.cwd());
    if (prettierConfigPath) {
      const prettierConfig = await resolveConfig(prettierConfigPath);
      if (prettierConfig) {
        // A prettier config was found so we will use that to format.
        const source = format(sourceFile.getText(), {
          ...prettierConfig,
          filepath: sourceFile.getFilePath(),
        });
        sourceFile.replaceText(
          [sourceFile.getStart(true), sourceFile.getEnd()],
          source
        );
      } else {
        // No prettier config was found - so we'll use the default ts formatter.
        sourceFile.formatText({
          convertTabsToSpaces: true,
          indentSize: 2,
          trimTrailingWhitespace: true,
          ensureNewLineAtEndOfFile: true,
        });
      }
    }

    await sourceFile.save();
  }
}
