/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */

import { useLayoutEffect, useRef, type ReactNode } from "react";

export function Dialog({
  children,
  className,
  onDismiss,
}: {
  children: ReactNode;
  className?: string;
  onDismiss: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null!);

  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) {
      return;
    }

    element.showModal();

    function onEscapePressHandler(e: Event) {
      e.preventDefault();
      onDismiss();
    }

    function onClickBlanketHandler(e: MouseEvent) {
      if (e.target === ref.current) {
        ref.current.close();
        onDismiss();
      }
    }

    element.addEventListener("cancel", onEscapePressHandler);
    element.addEventListener("click", onClickBlanketHandler);

    return () => {
      element.removeEventListener("cancel", onEscapePressHandler);
      element.removeEventListener("click", onClickBlanketHandler);
    };
  }, [onDismiss]);

  return (
    <dialog className={className} ref={ref} style={{ padding: 0 }}>
      <div>{children}</div>
    </dialog>
  );
}
