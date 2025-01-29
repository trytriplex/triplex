/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */

import { useScreenView } from "@triplex/ux";
import { VSCodeButton } from "@vscode/webview-ui-toolkit/react";
import { useState, type ReactNode } from "react";
import { preloadSubscription, useSubscription } from "../../hooks/ws";
import { sendVSCE } from "../../util/bridge";
import { ErrorIllustration } from "./error-illustration";

export function EnsureDependencies({ children }: { children: ReactNode }) {
  const project = useSubscription("/project/dependencies");
  const [installing, setInstalling] = useState(false);

  useScreenView(
    "missing_dependencies",
    "Screen",
    !!project.missingDependencies.length,
  );

  if (project.missingDependencies.length) {
    const command = `${project.pkgManager} i ${project.missingDependencies.join(" ")}`;

    return (
      <div className="fixed inset-0 mx-auto flex max-w-md select-none flex-col items-center justify-center gap-4 p-4 text-center">
        <ErrorIllustration />

        <span>
          Triplex for VS Code couldn't open as required dependencies are
          missing. Once installed please close and re-open the editor.
        </span>
        <VSCodeButton
          disabled={installing}
          onClick={() => {
            setInstalling(true);
            sendVSCE("terminal", { command });
          }}
        >
          Install Missing Dependencies
        </VSCodeButton>
        <div className="flex flex-col gap-1">
          <span>Alternatively install yourself through your terminal:</span>
          <code
            className="hover:bg-neutral-hovered text-subtle bg-neutral cursor-pointer"
            onClick={(e) => {
              const text =
                e.target instanceof HTMLElement ? e.target.innerText : "";
              navigator.clipboard.writeText(text);
            }}
            title="Copy to Clipboard"
          >
            {command}
          </code>
        </div>
      </div>
    );
  }

  return children;
}

preloadSubscription("/project/dependencies");
