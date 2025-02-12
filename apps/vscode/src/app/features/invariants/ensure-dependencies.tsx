/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */

import { useScreenView } from "@triplex/ux";
import { useState, type ReactNode } from "react";
import { Button } from "../../components/button";
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
        <Button
          actionId="errorsplash_project_installdeps"
          isDisabled={installing}
          onClick={() => {
            setInstalling(true);
            sendVSCE("terminal", { command });
          }}
          variant="cta"
        >
          Install Missing Dependencies
        </Button>
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
