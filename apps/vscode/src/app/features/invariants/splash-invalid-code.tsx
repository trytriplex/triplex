/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */

import { ButtonLink } from "../../components/button";
import { createCodeLink } from "../../util/commands";
import { ErrorIllustration } from "./error-illustration";

interface Diagnostic {
  code: number;
  column: number;
  line: number;
  message: string;
}

export function InvalidCodeSplash({
  diagnostics,
  path,
}: {
  diagnostics: Diagnostic[];
  path: string;
}) {
  return (
    <div
      className="bg-editor fixed inset-0 select-none text-center"
      data-testid="InvalidCodeSplash"
    >
      <div className="mx-auto flex h-full flex-col items-center justify-center gap-4 p-4">
        <ErrorIllustration />

        <span className="max-w-xs">
          There was an error parsing this file. When fixed the editor will
          automatically reload.
        </span>

        <code>
          {diagnostics[0].message}{" "}
          <span className="opacity-70">ts({diagnostics[0].code})</span>
        </code>

        <ButtonLink
          actionId="scenepanel_element_createcta"
          href={createCodeLink(path, {
            column: diagnostics[0].column,
            line: diagnostics[0].line,
          })}
          variant="cta"
        >
          Go to Code
        </ButtonLink>
      </div>
    </div>
  );
}
