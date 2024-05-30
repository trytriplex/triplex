/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { VSCodeButton } from "@vscode/webview-ui-toolkit/react";
import { useEffect } from "react";
import { onKeyDown } from "../util/keyboard";

export function IconButton({
  accelerator,
  icon: Icon,
  isSelected,
  label,
  onClick,
}: {
  accelerator?: string;
  icon: (_: { className?: string }) => JSX.Element;
  isSelected?: boolean;
  label: string;
  onClick: () => void;
}) {
  useEffect(() => {
    if (!accelerator) {
      return;
    }

    return onKeyDown(accelerator, onClick);
  }, [accelerator, onClick]);

  return (
    <VSCodeButton
      appearance="icon"
      aria-label={label + (isSelected ? " active" : "")}
      className={isSelected ? "bg-selected text-selected" : ""}
      onClick={onClick}
      title={label + (accelerator ? ` (${accelerator.toUpperCase()})` : "")}
    >
      <Icon className="pointer-events-none" />
    </VSCodeButton>
  );
}
