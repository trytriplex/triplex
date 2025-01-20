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
        <svg
          fill="none"
          height="56"
          viewBox="0 0 16 16"
          width="56"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            clipRule="evenodd"
            d="M8.60012 0.999985C10.2001 1.09999 11.7001 1.89999 12.8001 2.99999C14.1001 4.39999 14.8001 6.09999 14.8001 8.09999C14.8001 9.69999 14.2001 11.2 13.2001 12.5C12.2001 13.7 10.8001 14.6 9.20012 14.9C7.60012 15.2 6.00012 15 4.60012 14.2C3.20012 13.4 2.10012 12.2 1.50012 10.7C0.900119 9.19999 0.80012 7.49999 1.30012 5.99999C1.80012 4.39999 2.70012 3.09999 4.10012 2.19999C5.40012 1.29999 7.00012 0.899985 8.60012 0.999985ZM9.10012 13.9C10.4001 13.6 11.6001 12.9 12.5001 11.8C13.3001 10.7 13.8001 9.39999 13.7001 7.99999C13.7001 6.39999 13.1001 4.79999 12.0001 3.69999C11.0001 2.69999 9.80012 2.09999 8.40012 1.99999C7.10012 1.89999 5.70012 2.19999 4.60012 2.99999C3.50012 3.79999 2.70012 4.89999 2.30012 6.29999C1.90012 7.59999 1.90012 8.99999 2.50012 10.3C3.10012 11.6 4.00012 12.6 5.20012 13.3C6.40012 14 7.80012 14.2 9.10012 13.9ZM7.90011 7.5L10.3001 5L11.0001 5.7L8.60011 8.2L11.0001 10.7L10.3001 11.4L7.90011 8.9L5.50011 11.4L4.80011 10.7L7.20011 8.2L4.80011 5.7L5.50011 5L7.90011 7.5Z"
            fill="var(--vscode-editorError-foreground)"
            fillRule="evenodd"
          />
        </svg>

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
